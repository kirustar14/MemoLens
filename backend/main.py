from fastapi import FastAPI, UploadFile, File, Form, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from fastapi import HTTPException
import os
import uuid
import face_recognition
import pickle
import whisper  
import spacy
import dateparser
import tempfile
import os
from pydantic import BaseModel



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONTACTS_DIR = "contacts"
MODELS_DIR = "models"

os.makedirs(CONTACTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Face Upload → Add Contact (associate image)
@app.post("/face/upload")
async def upload_face(name: str = Form(...), file: UploadFile = File(...)):
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

# Face Recognize → Match image against contacts
@app.post("/face/recognize")
async def recognize_face(file: UploadFile = File(...)):
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

# Get face encodings for a contact
@app.get("/face/contact/{id}")
def get_face_data(id: str):
    model_path = f"{MODELS_DIR}/{id}.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Contact not found")

    with open(model_path, "rb") as f:
        encoding = pickle.load(f)

    images = [f for f in os.listdir(CONTACTS_DIR) if f.startswith(id)]
    return {"encodings": encoding.tolist(), "images": images}

# Create new contact
@app.post("/contacts")
async def create_contact(name: str = Form(...), file: UploadFile = File(...)):
    return await upload_face(name, file)

# Get all contacts
@app.get("/contacts")
def get_contacts():
    files = os.listdir(MODELS_DIR)
    names = [f.replace(".pkl", "") for f in files if f.endswith(".pkl")]
    return {"contacts": names}

# Get specific contact
@app.get("/contacts/{id}")
def get_contact(id: str):
    return get_face_data(id)

# Edit contact — reupload face
@app.put("/contacts/{id}")
async def edit_contact(id: str, file: UploadFile = File(...)):
    return await upload_face(id, file)

# Delete contact
@app.delete("/contacts/{id}")
def delete_contact(id: str):
    model_path = f"{MODELS_DIR}/{id}.pkl"
    for file in os.listdir(CONTACTS_DIR):
        if file.startswith(id):
            os.remove(os.path.join(CONTACTS_DIR, file))
    if os.path.exists(model_path):
        os.remove(model_path)
        return {"message": f"{id} deleted"}
    else:
        return JSONResponse(content={"error": "Contact not found"}, status_code=404)


# Create a new router for voice recognition
router = APIRouter()

# Initialize Whisper model for transcription
whisper_model = whisper.load_model("base")

# NLP setup
nlp = spacy.load("en_core_web_sm")

class TranscriptionResult(BaseModel):
    transcription: str
    parsed_date: str

# Endpoint to record and transcribe audio
@app.post("/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(contents)
        temp_file_path = temp_file.name
    
    result = whisper_model.transcribe(temp_file_path)
    transcription = result['text']
    os.remove(temp_file_path)
    
    return {"transcription": transcription}

# Endpoint to parse the transcription for dates
@app.post("/audio/parse")
async def parse_audio(input_data: dict):
    transcription = input_data.get("transcription", "")
    doc = nlp(transcription)
    dates = [ent.text for ent in doc.ents if ent.label_ == "DATE"]
    
    parsed_dates = []
    for date in dates:
        parsed = dateparser.parse(date)
        if parsed:
            parsed_dates.append(parsed.isoformat())
    
    return {"parsed_dates": parsed_dates}


# Include the new router
app.include_router(router)