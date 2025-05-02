from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
import os
import shutil
import uuid
#import face_recognition 
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

    image = face_recognition.load_image_file(img_path)
    encodings = face_recognition.face_encodings(image)

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

