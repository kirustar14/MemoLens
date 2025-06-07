import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './reminders.css';

interface ScannedTool {
  id: string;
  name: string;
  category: string;
  safety_level: string;
  instructions: string[];
  maintenance: string;
  last_scanned: string;
  image: string;
}

export default function ToolGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scannedTools, setScannedTools] = useState<ScannedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function getToken() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
  }

  useEffect(() => {
    async function fetchScannedTools() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/tools/scanned', {
          headers: { Authorization: getToken() }
        });
        setScannedTools(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load scanned tools');
        setLoading(false);
      }
    }

    fetchScannedTools();
  }, []);

  const filteredTools = scannedTools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading your scanned tools...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="reminders-container">
      <div className="reminders-topbar">
        <span className="reminders-appicon">🛠️</span>
        <span className="reminders-appname">Scanned Tools</span>
        <button className="sync-btn" onClick={() => window.location.reload()}>
          <span className="sync-text">Refresh</span>
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search your tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="reminder-list">
        <div className="reminders-title">Your Scanned Tools</div>
        {filteredTools.length === 0 ? (
          <div className="no-tools">
            <p>No tools scanned yet.</p>
            <p>Use the MemoLens glasses to scan tools and view their instructions here!</p>
          </div>
        ) : (
          filteredTools.map(tool => (
            <div className="tool-card outline" key={tool.id}>
              <div className="tool-header">
                <span className="tool-icon">{tool.image}</span>
                <div className="tool-title-section">
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-category">{tool.category}</div>
                </div>
                <span className={`safety-level ${tool.safety_level.toLowerCase()}`}>
                  {tool.safety_level}
                </span>
              </div>
              
              <div className="tool-instructions">
                <h4>Usage Instructions:</h4>
                <ul>
                  {tool.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
              
              <div className="tool-maintenance">
                <h4>Maintenance:</h4>
                <p>{tool.maintenance}</p>
              </div>

              <div className="tool-footer">
                <span className="last-scanned">Last scanned: {tool.last_scanned}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

