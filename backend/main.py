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
import json
# import face_recognition  
import pickle
from datetime import datetime
import base64

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONTACTS_DIR = "contacts"
MODELS_DIR = "models"
USERS_FILE = "users.json"

os.makedirs(CONTACTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

users = load_users()

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

@app.post("/signup/")
async def signup(username: str = Form(...), password: str = Form(...)):
    if username in users:
        return JSONResponse(content={"error": "User already exists"}, status_code=400)
    users[username] = password
    save_users(users)
    return {"message": "User created successfully"}

@app.post("/login/")
async def login(username: str = Form(...), password: str = Form(...)):
    if users.get(username) == password:
        return {"access_token": "dummy-token-for-" + username}
    return JSONResponse(content={"error": "Invalid credentials"}, status_code=401)

@app.get("/user/")
async def get_user(Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    username = get_current_user(token)
    return {
        "name": username,
        "email": f"{username}@example.com",
        "lastLogin": datetime.now().isoformat()
    }

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

# Add new model for scanned tools
class ScannedTool(BaseModel):
    id: str
    user: str
    name: str
    category: str
    safety_level: str
    instructions: List[str]
    maintenance: str
    last_scanned: str
    image: str

# Database for scanned tools
scanned_tools_db: Dict[str, ScannedTool] = {}

# New endpoints for scanned tools
@app.post("/tools/scanned", response_model=ScannedTool)
def add_scanned_tool(tool_data: dict, Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    
    tool_id = str(uuid4())
    tool = ScannedTool(
        id=tool_id,
        user=user,
        name=tool_data["name"],
        category=tool_data["category"],
        safety_level=tool_data["safety_level"],
        instructions=tool_data["instructions"],
        maintenance=tool_data["maintenance"],
        last_scanned=datetime.now().strftime("%Y-%m-%d"),
        image=tool_data["image"]
    )
    
    scanned_tools_db[tool_id] = tool
    return tool

@app.get("/tools/scanned", response_model=List[ScannedTool])
def get_scanned_tools(Authorization: str = Header("")):
    token = Authorization.replace("Bearer ", "")
    user = get_current_user(token)
    return [tool for tool in scanned_tools_db.values() if tool.user == user]

# Tool information database
TOOL_INFO = {
    "power_drill": {
        "name": "Power Drill",
        "category": "Power Tools",
        "safety_level": "Intermediate",
        "instructions": [
            "Always wear safety glasses and ear protection",
            "Check the battery charge before use",
            "Select the appropriate drill bit for your task",
            "Start with low speed for precise control",
            "Keep drill perpendicular to the surface"
        ],
        "maintenance": "Clean after each use, lubricate moving parts monthly",
        "image": "🔧"
    },
    "circular_saw": {
        "name": "Circular Saw",
        "category": "Power Tools",
        "safety_level": "Advanced",
        "instructions": [
            "Ensure blade guard is functioning properly",
            "Check blade sharpness and condition",
            "Secure workpiece before cutting",
            "Allow blade to reach full speed before cutting",
            "Keep both hands on the saw during operation"
        ],
        "maintenance": "Replace blade when dull, check guard mechanism weekly",
        "image": "⚡"
    },
    "measuring_tape": {
        "name": "Measuring Tape",
        "category": "Hand Tools",
        "safety_level": "Beginner",
        "instructions": [
            "Pull tape out smoothly to prevent snapping",
            "Lock tape at desired length",
            "Mark measurement clearly",
            "Retract tape slowly to prevent damage",
            "Keep tape clean and dry"
        ],
        "maintenance": "Wipe clean after use, store in dry place",
        "image": "📏"
    }
}

@app.get("/tools/info/{tool_id}")
def get_tool_info(tool_id: str):
    if tool_id not in TOOL_INFO:
        raise HTTPException(status_code=404, detail="Tool not found")
    return TOOL_INFO[tool_id]

class CameraData(BaseModel):
    image: str  # Base64 encoded image
    timestamp: str
    device_id: str
    metadata: Optional[Dict] = {}

@app.post("/camera/upload/")
async def upload_camera_data(data: CameraData):
    try:
        # Decode base64 image
        image_data = base64.b64decode(data.image)
        
        # Generate unique filename
        filename = f"camera_{data.device_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        filepath = os.path.join("camera_uploads", filename)
        
        # Ensure directory exists
        os.makedirs("camera_uploads", exist_ok=True)
        
        # Save image
        with open(filepath, "wb") as f:
            f.write(image_data)
            
        return {
            "status": "success",
            "filename": filename,
            "timestamp": data.timestamp,
            "device_id": data.device_id
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": str(e)}
        )

