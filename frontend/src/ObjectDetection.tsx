import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ObjectDetection.css';

interface Detection {
  id: string;
  type: 'hazard' | 'tool';
  label: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

interface ToolInfo {
  name: string;
  description: string;
  usageInstructions: string[];
  safetyNotes: string[];
}

const ObjectDetection: React.FC = () => {
  const navigate = useNavigate();
  const [isLiveView, setIsLiveView] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolInfo | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
  fetch("http://localhost:8000/camera/stream_url/")  // replace with your FastAPI base URL
    .then(res => res.json())
    .then(data => {
      setStreamUrl(data.stream_url);
    })
    .catch(err => {
      console.error("Failed to fetch stream URL", err);
    });
}, []);


  // Example tool information - would come from your backend
  const toolInfo: ToolInfo = {
    name: "Power Drill",
    description: "Cordless power drill for construction and maintenance work",
    usageInstructions: [
      "Insert appropriate drill bit",
      "Ensure battery is charged",
      "Hold drill perpendicular to surface",
      "Apply steady pressure while drilling"
    ],
    safetyNotes: [
      "Wear safety glasses",
      "Keep fingers away from rotating parts",
      "Ensure work area is clear"
    ]
  };

  const handleCapture = () => {
    // This would trigger image capture from the glasses
    setIsLiveView(false);
    // Simulate tool detection
    setSelectedTool(toolInfo);
  };

  const handleResumeLive = () => {
    setIsLiveView(true);
    setSelectedTool(null);
  };

  return (
    <div className="object-detection">
      <div className="detection-header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1>Object Detection</h1>
      </div>
      <div className="camera-view">
        <div className="view-controls">
          <button 
            className={isLiveView ? 'active' : ''} 
            onClick={handleResumeLive}
          >
            Live View
          </button>
          <button 
            className={!isLiveView ? 'active' : ''} 
            onClick={handleCapture}
          >
            Capture Tool
          </button>
        </div>

        <div className="image-container">
          {isLiveView && streamUrl ? (
    <img
      src={streamUrl}
      alt="Live Stream"
      className="live-stream"
      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
    />
  ) : (
    <img 
      src="/captured-image.jpg" 
      alt="Captured image"
      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
    />
  )}

          
          {detections.map((detection) => (
            <div
              key={detection.id}
              className={`bounding-box ${detection.type}`}
              style={{
                left: `${detection.boundingBox.x}px`,
                top: `${detection.boundingBox.y}px`,
                width: `${detection.boundingBox.width}px`,
                height: `${detection.boundingBox.height}px`
              }}
            >
              <span className="label">
                {detection.label}
                <span className="confidence">
                  {(detection.confidence * 100).toFixed(0)}%
                </span>
              </span>
            </div>
          ))}

          {detections.some(d => d.type === 'hazard') && (
            <div className="danger-alert">HAZARD DETECTED!</div>
          )}
        </div>
      </div>

      {selectedTool && (
        <div className="tool-info">
          <h2>{selectedTool.name}</h2>
          <p className="description">{selectedTool.description}</p>
          
          <div className="info-section">
            <h3>Usage Instructions</h3>
            <ol>
              {selectedTool.usageInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="info-section">
            <h3>Safety Notes</h3>
            <ul>
              {selectedTool.safetyNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="connection-status">
        <span className="status-dot connected"></span>
        Glasses Connected
      </div>
    </div>
  );
};

export default ObjectDetection; 