import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get('http://localhost:8000/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserName(res.data.name);
      } catch (err) {
        console.error('Failed to fetch user', err);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-arrow" onClick={goToDashboard}>
          ←
        </button>
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="username-row">
        <span className="username-label">Username:</span>
        <span className="username">{userName}</span>
      </div>

      <button className="sign-out-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default Settings;
