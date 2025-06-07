import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  // Detection Settings
  const [hazardDetectionEnabled, setHazardDetectionEnabled] = useState(true);
  const [hazardSensitivity, setHazardSensitivity] = useState(75);
  const [toolRecognitionEnabled, setToolRecognitionEnabled] = useState(true);
  const [toolRecognitionSensitivity, setToolRecognitionSensitivity] = useState(65);
  
  // Notification Settings
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [dangerAlertDelay, setDangerAlertDelay] = useState(0);
  
  // Device Settings
  const [glassesConnected, setGlassesConnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [autoConnect, setAutoConnect] = useState(true);

  const handleSignOut = () => {
    // Clear user session/token
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1>Settings</h1>
      </div>
      <section className="settings-section">
        <h2>Detection Settings</h2>
        
        <div className="setting-group">
          <h3>Hazard Detection</h3>
          <div className="setting-item">
            <label>Enable Hazard Detection</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={hazardDetectionEnabled}
                onChange={(e) => setHazardDetectionEnabled(e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>
          <div className="setting-item">
            <label>Hazard Detection Sensitivity</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={hazardSensitivity}
                onChange={(e) => setHazardSensitivity(Number(e.target.value))}
                disabled={!hazardDetectionEnabled}
              />
              <div className="range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="setting-group">
          <h3>Tool Recognition</h3>
          <div className="setting-item">
            <label>Enable Tool Recognition</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={toolRecognitionEnabled}
                onChange={(e) => setToolRecognitionEnabled(e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>
          <div className="setting-item">
            <label>Tool Recognition Sensitivity</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={toolRecognitionSensitivity}
                onChange={(e) => setToolRecognitionSensitivity(Number(e.target.value))}
                disabled={!toolRecognitionEnabled}
              />
              <div className="range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Notification Settings</h2>
        <div className="setting-item">
          <label>Sound Alerts</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
            />
            <span className="slider"></span>
          </div>
        </div>
        <div className="setting-item">
          <label>Vibration Alerts</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={vibrationAlerts}
              onChange={(e) => setVibrationAlerts(e.target.checked)}
            />
            <span className="slider"></span>
          </div>
        </div>
        <div className="setting-item">
          <label>Danger Alert Delay (seconds)</label>
          <select 
            value={dangerAlertDelay} 
            onChange={(e) => setDangerAlertDelay(Number(e.target.value))}
          >
            <option value={0}>Immediate</option>
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={3}>3 seconds</option>
          </select>
        </div>
      </section>

      <section className="settings-section">
        <h2>Device Settings</h2>
        <div className="setting-item">
          <label>Smart Glasses Connection</label>
          <div className="connection-status">
            <span className={`status-dot ${glassesConnected ? 'connected' : 'disconnected'}`}></span>
            {glassesConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="setting-item">
          <label>Battery Level</label>
          <div className="battery-indicator">
            <div 
              className="battery-level" 
              style={{ width: `${batteryLevel}%` }}
            ></div>
            <span>{batteryLevel}%</span>
          </div>
        </div>
        <div className="setting-item">
          <label>Auto-Connect</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={autoConnect}
              onChange={(e) => setAutoConnect(e.target.checked)}
            />
            <span className="slider"></span>
          </div>
        </div>
      </section>

      {/* Sign Out Section */}
      <section className="settings-section sign-out-section">
        <h2>Account</h2>
        <div className="setting-item">
          <button 
            className="sign-out-button" 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;