// src/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/login/', new URLSearchParams({
        username,
        password,
      }));
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="welcome-section">
        <h1>Welcome!</h1>
        <p>Log in to continue using MemoLens</p>
      </div>

      <div className="login-card">
        <div className="icon-circle">
          <img src="/src/assets/user_icon.webp" alt="User Icon" className="user-image" />
        </div>
        <h2>Member Login</h2>

        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <span className="forgot">Forgot Password?</span>
        </div>

        <button onClick={handleLogin} className="login-button">Log In</button>

        <div className="signup-redirect">
          Not a member? <span className="create-account" onClick={() => navigate('/signup')}>Create an account</span>
        </div>
      </div>
    </div>
  );
}

