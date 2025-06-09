import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [sizeResults, setSizeResults] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

const handleModeSelect = async (mode: string) => {
  setSelectedMode(mode);
  setSizeResults([]);

  if (mode === 'size' || mode === 'tool') {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } else {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
};


  const handleCaptureAndDetect = async () => {

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      const endpoint =
        selectedMode === "size"
          ? "http://localhost:8000/detect/size"
          : selectedMode === "tool"
          ? "http://localhost:8000/detect/tool"
          : ""; // add face later

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: selectedMode === "tool" ? {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        } : {}
      });

      const data = await response.json();
      setSizeResults(data.results || []);
    }, "image/jpeg");
  };


  return (
    <div className="object-detection">
      <div className="detection-header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1>Detection</h1>
      </div>

      <div className="mode-buttons">
        <button 
          className={selectedMode === 'size' ? 'active' : ''} 
          onClick={() => handleModeSelect('size')}
        >
          Size Detection
        </button>
        <button 
          className={selectedMode === 'tool' ? 'active' : ''} 
          onClick={() => handleModeSelect('tool')}
        >
          Tool Manual
        </button>
        <button 
          className={selectedMode === 'face' ? 'active' : ''} 
          onClick={() => handleModeSelect('face')}
        >
          Face Detection
        </button>
      </div>

      <div className="detection-content">
        {selectedMode === null && <p>Select a detection mode above to begin.</p>}

        {selectedMode === 'size' && (
          <div>
            <p>📏 Size detection mode active — use webcam to capture object frame.</p>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            <button onClick={handleCaptureAndDetect} style={{ marginTop: '10px' }}>
              📸 Capture & Detect
            </button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {sizeResults.length > 0 && (
              <div>
                <h3>Detected Objects:</h3>
                <ul>
                  {sizeResults.map((obj, index) => (
                    <li key={index}>
                      <strong>{obj.label}</strong> — {obj.bounding_box.width}px × {obj.bounding_box.height}px ({(obj.confidence * 100).toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedMode === 'tool' && (
        <div>
          <p>🔧 Tool manual mode active — capture tool to get safety and usage info.</p>
          <video ref={videoRef} autoPlay muted style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }} />
          <button onClick={handleCaptureAndDetect} style={{ marginTop: '10px' }}>
            📸 Capture & Identify Tool
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {sizeResults.length > 0 && (
            <div>
              {sizeResults.map((res, index) => (
                <div key={index} style={{ marginTop: '10px' }}>
                  <h3>Detected: {res.label}</h3>
                  {res.match ? (
                    <>
                      <p><strong>Tool:</strong> {res.tool_info.name}</p>
                      <p><strong>Category:</strong> {res.tool_info.category}</p>
                      <p><strong>Safety:</strong> {res.tool_info.safety_level}</p>
                      <p><strong>Instructions:</strong></p>
                      <ul>
                        {res.tool_info.instructions.map((i, idx) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>No matching tool in your database. Try adding it manually or consult default safety protocols.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {selectedMode === 'face' && <p>Face detection mode active — recognize workers and pull contact data.</p>}
      </div>
    </div>
  );
};

export default ObjectDetection;
