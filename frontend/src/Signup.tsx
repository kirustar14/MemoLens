import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password) {
      setMessage("Please fill in all fields");
      setIsError(true);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await axios.post('http://localhost:8000/signup/', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setIsError(false);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setIsError(true);
      if (err.code === 'ERR_NETWORK') {
        setMessage('Network error: Please check if the server is running');
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Signup failed';
        setMessage(errorMsg);
      }
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="safety-icon">👷‍♂️</div>
        <h2>Join MemoLens</h2>
        <p className="subtitle">Your Smart Safety Assistant</p>
        <div className="input-group">
          <label>Username or Email</label>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleSignup} className="signup-button">
          Create Account
        </button>
        <div className="login-redirect">
          Already have an account?
          <span onClick={() => navigate('/login')}> Log in</span>
        </div>
        {message && (
          <p className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

