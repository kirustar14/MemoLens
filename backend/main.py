from fastapi import FastAPI, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from fastapi import HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import uuid4
import os
import shutil
import uuid
# import face_recognition  
import pickle

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONTACTS_DIR = "contacts"
MODELS_DIR = "models"

os.makedirs(CONTACTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

@app.post("/add_contact/")
async def add_contact(name: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    img_path = f"{CONTACTS_DIR}/{name}_{uuid.uuid4().hex}.jpg"

    with open(img_path, "wb") as f:
        f.write(contents)

    # image = face_recognition.load_image_file(img_path)
    # encodings = face_recognition.face_encodings(image)

    if not encodings:
        os.remove(img_path)
        return JSONResponse(content={"error": "No face found in image"}, status_code=400)

    face_encoding = encodings[0]
    with open(f"{MODELS_DIR}/{name}.pkl", "wb") as f:
        pickle.dump(face_encoding, f)

    return {"message": "Contact added successfully"}

@app.get("/contacts/")
def list_contacts():
    files = os.listdir(MODELS_DIR)
    names = [f.replace(".pkl", "") for f in files if f.endswith(".pkl")]
    return {"contacts": names}

@app.post("/recognize/")
async def recognize(file: UploadFile = File(...)):
    contents = await file.read()
    temp_file = f"temp_{uuid.uuid4().hex}.jpg"
    with open(temp_file, "wb") as f:
        f.write(contents)

    unknown_img = face_recognition.load_image_file(temp_file)
    unknown_encodings = face_recognition.face_encodings(unknown_img)

    os.remove(temp_file)

    if not unknown_encodings:
        return {"result": "No face found"}

    unknown_encoding = unknown_encodings[0]

    for model_file in os.listdir(MODELS_DIR):
        with open(f"{MODELS_DIR}/{model_file}", "rb") as f:
            known_encoding = pickle.load(f)

        matches = face_recognition.compare_faces([known_encoding], unknown_encoding)
        if matches[0]:
            return {"result": model_file.replace(".pkl", "")}

    return {"result": "Unknown"}


users = {}  

@app.post("/signup/")
async def signup(username: str = Form(...), password: str = Form(...)):
    if username in users:
        return JSONResponse(content={"error": "User already exists"}, status_code=400)
    users[username] = password
    return {"message": "User created successfully"}



@app.post("/login/")
async def login(username: str = Form(...), password: str = Form(...)):
    if users.get(username) == password:
        return {"access_token": "dummy-token-for-" + username}
    return JSONResponse(content={"error": "Invalid credentials"}, status_code=401)


@app.delete("/contacts/{name}")
def delete_contact(name: str):
    model_path = f"{MODELS_DIR}/{name}.pkl"
    for file in os.listdir(CONTACTS_DIR):
        if file.startswith(name):
            os.remove(os.path.join(CONTACTS_DIR, file))
    if os.path.exists(model_path):
        os.remove(model_path)
        return {"message": f"{name} deleted"}
    else:
        return JSONResponse(content={"error": "Contact not found"}, status_code=404)

reminders_db = {}

class Reminder(BaseModel):
    id: str
    user: str
    title: str
    datetime: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    attendees: Optional[List[str]] = []
    details: Optional[str] = ""
    source: Optional[str] = ""
    sync_to_calendar: Optional[bool] = False

class ReminderCreate(BaseModel):
    title: str
    datetime: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    attendees: Optional[List[str]] = []
    details: Optional[str] = ""
    source: Optional[str] = ""
    sync_to_calendar: Optional[bool] = False

def get_current_user(token: str = ""):
    # Dummy user extraction from token for demo
    if token.startswith("dummy-token-for-"):
        return token.replace("dummy-token-for-", "")
    raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/reminders/", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    reminder_id = str(uuid4())
    reminder_obj = Reminder(
        id=reminder_id,
        user=user,
        **reminder.dict()
    )
    reminders_db[reminder_id] = reminder_obj
    return reminder_obj

@app.get("/reminders/", response_model=List[Reminder])
def get_reminders(Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    return [r for r in reminders_db.values() if r.user == user]

@app.get("/reminders/{id}", response_model=Reminder)
def get_reminder(id: str, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    reminder = reminders_db.get(id)
    if not reminder or reminder.user != user:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder

@app.put("/reminders/{id}", response_model=Reminder)
def update_reminder(id: str, updated: Reminder, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    reminder = reminders_db.get(id)
    if not reminder or reminder.user != user:
        raise HTTPException(status_code=404, detail="Reminder not found")
    updated.id = id
    updated.user = user
    reminders_db[id] = updated
    return updated

@app.delete("/reminders/{id}")
def delete_reminder(id: str, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    reminder = reminders_db.get(id)
    if not reminder or reminder.user != user:
        raise HTTPException(status_code=404, detail="Reminder not found")
    del reminders_db[id]
    return {"message": "Reminder deleted"}

# Contact Management

contacts_db = {}

class Contact(BaseModel):
    id: str
    user: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

@app.post("/contacts", response_model=Contact)
def create_contact(contact: ContactCreate, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    contact_id = str(uuid4())
    contact_obj = Contact(id=contact_id, user=user, **contact.dict())
    contacts_db[contact_id] = contact_obj
    return contact_obj

@app.get("/contacts", response_model=List[Contact])
def get_contacts(Authorization: str = Header("")):
    return list(contacts_db.values())

@app.get("/contacts/{id}", response_model=Contact)
def get_contact(id: str, Authorization: str = Header("")):
    contact = contacts_db.get(id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@app.put("/contacts/{id}", response_model=Contact)
def update_contact(id: str, updated: ContactCreate, Authorization: str = Header("")):
    contact = contacts_db.get(id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    updated_contact = Contact(id=id, user=contact.user, **updated.dict())
    contacts_db[id] = updated_contact
    return updated_contact

@app.delete("/contacts/{id}")
def delete_contact(id: str, Authorization: str = Header("")):
    print("All contact IDs:", list(contacts_db.keys()))
    print("Trying to delete:", id)
    contact = contacts_db.get(id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    del contacts_db[id]
    return {"message": "Contact deleted"}

