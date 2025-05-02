import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './Login';
import Signup from './Signup';

export default function App() {
  const [contacts, setContacts] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [addImage, setAddImage] = useState<File | null>(null);
  const [recognizeImage, setRecognizeImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/contacts/');
      setContacts(res.data.contacts);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
  };

  const handleAddContact = async () => {
    if (!name || !addImage) return alert('Name and image required');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', addImage);

    try {
      const res = await axios.post('http://127.0.0.1:8000/add_contact/', formData);
      if (res.data.message === 'Contact added successfully') {
        setName('');
        setAddImage(null);
        fetchContacts();
      } else {
        alert(res.data.error || 'Failed to add contact');
      }
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRecognize = async () => {
    if (!recognizeImage) return alert('Select an image');

    const formData = new FormData();
    formData.append('file', recognizeImage);

    try {
      const res = await axios.post('http://127.0.0.1:8000/recognize/', formData);
      setResult(res.data.result);
    } catch (err) {
      alert('Recognition failed');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/contacts/${name}`);
      fetchContacts();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const FaceContactManager = () => (
    <div className="app">
      <h1>Face Contact Manager</h1>

      <div className="grid">
        {/* Left Side */}
        <div className="space-y">
          {/* Add Contact */}
          <div className="card">
            <h2 style={{ color: '#26A69A' }}>Add New Contact</h2>
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
            <h2 style={{ color: '#555' }}>Contacts</h2>
            <ul className="contact-list">
              {contacts.length === 0 ? (
                <li className="contact-empty">No contacts yet</li>
              ) : (
                contacts.map((c) => (
                  <li key={c} className="contact-card">
                    <span>{c}</span>
                    <button
                      onClick={() => handleDelete(c)}
                      className="delete"
                    >
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
          <h2 style={{ color: '#2196f3' }}>Recognize Face</h2>
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
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FaceContactManager />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
