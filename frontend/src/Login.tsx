// src/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import safetyGlasses from './assets/Safety_Glasses_login.webp';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/login/', new URLSearchParams({
        username,
        password
      }));

      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/';
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="memolens-header">MemoLens</div>
      <div className="login-card">
        <div className="icon-circle">
          <img src={safetyGlasses} alt="Safety Glasses" className="user-image" />
        </div>
        <h2 style={{ color: "#009688", fontWeight: 700, marginBottom: 18 }}>Member Login</h2>
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
          <div>
            <input type="checkbox" className="login-checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <a href="#" className="forgot">Forgot Password?</a>
        </div>
        <button onClick={handleLogin} className="login-button">
          Log In
        </button>
        <div className="signup-redirect">
          Not a member?
          <a href="/signup" className="create-account">Create an account</a>
        </div>
      </div>
    </div>
  );
}

