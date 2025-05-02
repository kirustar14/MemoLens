import { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Reuse login styles

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    if (!username || !password) return alert("Fill in all fields");
    try {
      const res = await axios.post('http://localhost:8000/signup/', new URLSearchParams({
        username,
        password
      }));
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <input
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignup} className="login-button">Sign Up</button>
        <p className="signup-switch">Already have an account? <a href="/login">Log in</a></p>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}

