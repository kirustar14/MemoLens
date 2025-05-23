import { useState } from 'react';
import axios from 'axios';
import './Signup.css'; // Use the dedicated signup CSS

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
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create Account</h2>
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
        <button onClick={handleSignup} className="signup-button">Sign Up</button>
        <div className="login-redirect">
          Already have an account?
          <span onClick={() => window.location.href = '/login'}> Log in</span>
        </div>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}

