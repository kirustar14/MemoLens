import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import React from 'react';
import Reminders from './reminders';
import AddReminder from './AddReminder';
import { RemindersProvider } from './RemindersContext';
import Contacts from './Contacts';
import ContactProfile from './ContactProfile';
import AddEditContact from './AddEditContact';
import { ContactsProvider } from './ContactsContext';
import Settings from './Settings';
import ObjectDetection from './ObjectDetection';
import DetectionHistory from './DetectionHistory';

// Add a type for user data
interface UserData {
  name: string;
  email: string;
  lastLogin?: Date;
}

export default function App() {
  const [contacts, setContacts] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [addImage, setAddImage] = useState<File | null>(null);
  const [recognizeImage, setRecognizeImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchUserData(); // Fetch user data when component mounts
    generateGreeting(); // Generate appropriate greeting based on time of day
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData(null);
        return;
      }

      const response = await axios.get('http://localhost:8000/user/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserData(response.data);
      generateGreeting();
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setUserData(null);
    }
  };

  // Add useEffect to refetch user data when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    }
  }, []);

  const generateGreeting = () => {
    const hour = new Date().getHours();
    let timeBasedGreeting = '';
    
    if (hour < 12) {
      timeBasedGreeting = 'Good morning';
    } else if (hour < 17) {
      timeBasedGreeting = 'Good afternoon';
    } else {
      timeBasedGreeting = 'Good evening';
    }
    
    setGreeting(timeBasedGreeting);
  };

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
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>MemoLens Dashboard</h1>
          {userData && (
            <p className="welcome-message">
              {greeting}, {userData.name}! 
              <span className="last-visit">
                Last visit: {new Date(userData.lastLogin || '').toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
        <div className="header-right">
          <div className="glasses-status">
            <span className="status-dot connected"></span>
            Smart Glasses Connected
          </div>
          <Link to="/settings" className="settings-icon" aria-label="Settings">
            <div className="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </Link>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="quick-actions section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/detection" className="action-button primary">
              Start Detection
            </Link>
            <Link to="/history" className="action-button secondary">
              View History
            </Link>
            <Link to="/contacts" className="action-button">
              Manage Contacts
            </Link>
          </div>
        </div>

        {/* Recent Detections */}
        <div className="recent-detections section">
          <h2>Recent Detections</h2>
          <div className="detection-cards">
            <div className="detection-card hazard">
              <span className="type-badge">Warning</span>
              <p>Sharp object detected</p>
              <span className="time">2 mins ago</span>
            </div>
            <div className="detection-card tool">
              <span className="type-badge">Tool</span>
              <p>Power drill identified</p>
              <span className="time">5 mins ago</span>
            </div>
          </div>
          <Link to="/history" className="view-all">View All Detections →</Link>
        </div>

        {/* Contact Management */}
        <div className="contact-section section">
          <div className="section-header">
            <h2>Contact Management</h2>
            <Link to="/contacts/add" className="add-contact-btn">Add New Contact</Link>
          </div>
          
          <div className="contacts-list card">
            <h3>Recent Contacts</h3>
            {contacts.length === 0 ? (
              <p className="no-contacts">No contacts added yet</p>
            ) : (
              <ul className="contact-grid">
                {contacts.slice(0, 4).map((c) => (
                  <li key={c} className="contact-item">
                    <div className="contact-info">
                      <span className="contact-name">{c}</span>
                      <div className="contact-actions">
                        <Link to={`/contacts/${c}`} className="view-btn">View Profile</Link>
                        <button
                          onClick={() => handleDelete(c)}
                          className="delete-btn"
                          aria-label={`Delete ${c}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {contacts.length > 4 && (
              <Link to="/contacts" className="view-all">View All Contacts →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ContactsProvider>
      <RemindersProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FaceContactManager />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/add-reminder" element={<AddReminder />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/add" element={<AddEditContact />} />
            <Route path="/contacts/:id" element={<ContactProfile />} />
            <Route path="/contacts/:id/edit" element={<AddEditContact />} />
            <Route path="/settings" element={<Settings />} />
            {/* New MemoLens Routes */}
            <Route path="/detection" element={<ObjectDetection />} />
            <Route path="/history" element={<DetectionHistory />} />
          </Routes>
        </BrowserRouter>
      </RemindersProvider>
    </ContactsProvider>
  );
}
