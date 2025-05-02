import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [contacts, setContacts] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [recognizeImage, setRecognizeImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [parsedDates, setParsedDates] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const file = new File([audioBlob], "audio.wav", { type: "audio/wav" });
        setAudioFile(file);
      };

      mediaRecorder.start();
    }).catch((err) => {
      console.error("Error accessing audio", err);
    });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      const transcriptionRes = await axios.post("http://127.0.0.1:8000/audio/transcribe", formData);
      setTranscription(transcriptionRes.data.transcription);

      const parseRes = await axios.post("http://127.0.0.1:8000/audio/parse", {
        transcription: transcriptionRes.data.transcription,
      });
      setParsedDates(parseRes.data.parsed_dates);
    } catch (err) {
      console.error("Transcription failed", err);
    }
  };

  const handleDeleteRecording = () => {
    setAudioFile(null);
    setTranscription(null);
    setParsedDates([]);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/contacts");
      setContacts(res.data.contacts);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  const handleAddContact = async () => {
    if (!name || !addImage) return alert("Name and image required");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", addImage);

    try {
      const res = await axios.post("http://127.0.0.1:8000/contacts", formData);
      if (res.data.message === "Contact added successfully") {
        setName("");
        setAddImage(null);
        fetchContacts();
      } else {
        alert(res.data.error || "Failed to add contact");
      }
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRecognize = async () => {
    if (!recognizeImage) return alert("Select an image");

    const formData = new FormData();
    formData.append("file", recognizeImage);

    try {
      const res = await axios.post("http://127.0.0.1:8000/face/recognize", formData);
      setResult(res.data.result);
    } catch (err) {
      alert("Recognition failed");
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/contacts/${name}`);
      fetchContacts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="app">
      <h1>Face Contact Manager</h1>

      <div className="grid">
        {/* Left Side */}
        <div className="space-y">
          {/* Add Contact */}
          <div className="card">
            <h2 style={{ color: "#26A69A" }}>Add New Contact</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAddImage(e.target.files?.[0] || null)}
            />
            <button onClick={handleAddContact} className="submit">
              Submit
            </button>
          </div>

          {/* Contact List */}
          <div className="card">
            <h2 style={{ color: "#555" }}>Contacts</h2>
            <ul className="contact-list">
              {contacts.length === 0 ? (
                <li className="contact-empty">No contacts yet</li>
              ) : (
                contacts.map((c) => (
                  <li key={c} className="contact-card">
                    <span>{c}</span>
                    <button onClick={() => handleDelete(c)} className="delete">
                      Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Right Side */}
        <div className="card">
          <h2 style={{ color: "#2196f3" }}>Recognize Face</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRecognizeImage(e.target.files?.[0] || null)}
          />
          <button onClick={handleRecognize} className="recognize">
            Recognize
          </button>
          {result && (
            <div className="result">
              <strong>Result:</strong> {result}
            </div>
          )}
        </div>
      </div>

      {/* Voice Section */}
      <h1>Voice Recognition</h1>
      <div className="card">
        <div className="button-row">
          <button onClick={handleStartRecording} className="start">
            Start Recording
          </button>
          <button onClick={handleStopRecording} className="stop">
            Stop Recording
          </button>
          <button onClick={handleTranscribe} className="transcribe" disabled={!audioFile}>
            Transcribe
          </button>
          <button onClick={handleDeleteRecording} className="delete">
            Clear
          </button>
        </div>

        {transcription && (
          <div className="result">
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </div>
        )}
        {parsedDates.length > 0 && (
          <div className="result">
            <h3>Parsed Dates:</h3>
            <ul>
              {parsedDates.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
