import React, { useState } from 'react';
import './ImageViewer.css';

interface Detection {
  id: string;
  label: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ImageViewer: React.FC = () => {
  const [alerts, setAlerts] = useState(true);
  const [sensitivity, setSensitivity] = useState(50);
  const [esp32Status, setEsp32Status] = useState('Connected');

  // This would be replaced with actual detections from your backend
  const detections: Detection[] = [
    {
      id: '1',
      label: 'nail',
      boundingBox: { x: 20, y: 30, width: 100, height: 100 }
    },
    {
      id: '2',
      label: 'sharp object',
      boundingBox: { x: 200, y: 150, width: 120, height: 80 }
    }
  ];

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSensitivity(Number(e.target.value));
  };

  const handleAlertsToggle = () => {
    setAlerts(!alerts);
  };

  return (
    <div className="image-viewer">
      <div className="image-container">
        <img src="/sample-detection.jpg" alt="Detection view" />
        {detections.map((detection) => (
          <div
            key={detection.id}
            className="bounding-box"
            style={{
              left: `${detection.boundingBox.x}px`,
              top: `${detection.boundingBox.y}px`,
              width: `${detection.boundingBox.width}px`,
              height: `${detection.boundingBox.height}px`
            }}
          >
            <span className="label">{detection.label}</span>
          </div>
        ))}
        {detections.length > 0 && (
          <div className="danger-alert">DANGER DETECTED!</div>
        )}
      </div>

      <div className="controls">
        <div className="control-group">
          <label>Alerts</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={alerts}
              onChange={handleAlertsToggle}
            />
            <span className="slider"></span>
          </div>
        </div>

        <div className="control-group">
          <label>Sensitivity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity}
            onChange={handleSensitivityChange}
          />
          <div className="range-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div className="control-group">
          <label>ESP32 Status</label>
          <div className="status-indicator">
            <span className={`status-dot ${esp32Status.toLowerCase()}`}></span>
            {esp32Status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer; 