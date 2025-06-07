import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

interface AuthProps {
  mode: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/${mode}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Trigger a page reload to refresh all data
          window.location.href = '/';
        } else {
          navigate('/');
        }
      } else {
        setError(data.detail || 'An error occurred');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo.png" alt="MemoLens Logo" className="auth-logo" />
        <h1 className="auth-title">Join MemoLens</h1>
        <p className="auth-subtitle">Your Smart Safety Assistant</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button">
            {mode === 'signup' ? 'CREATE ACCOUNT' : 'LOG IN'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Log in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 