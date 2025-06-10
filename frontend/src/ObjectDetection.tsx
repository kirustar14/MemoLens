import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [streamURL, setStreamURL] = useState<string>('');
  const [capturedImageURL, setCapturedImageURL] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const capturedBlobRef = useRef<Blob | null>(null);

  const handleModeSelect = async (mode: string) => {
    setSelectedMode(mode);
    setCapturedImageURL(null);
    setDetectionResults([]);

    if (mode === 'site') {
      try {
        const res = await fetch('http://localhost:8000/camera/stream_url/');
        const data = await res.json();
        setStreamURL(data.stream_url); // no ?t here
      } catch (err) {
        alert('Failed to load ESP32 stream');
        console.error(err);
      }
    }
  };

const handleCaptureImage = async () => {
  if (!imageRef.current || !canvasRef.current) return;

  const image = imageRef.current;
  const canvas = canvasRef.current;

  if (!image.complete || image.naturalWidth === 0) {
    alert("Image not loaded yet. Try again in a moment.");
    return;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw the image to canvas
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const imageURL = URL.createObjectURL(blob);
    setCapturedImageURL(imageURL);
    capturedBlobRef.current = blob;
  }, "image/jpeg");
};


const handleRunDetection = async () => {
  if (!capturedBlobRef.current) {
    alert("Please capture an image first.");
    return;
  }

  setLoading(true);
  setDetectionResults([]); // clear old results

  try {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result?.toString().split(',')[1];
      if (!base64data) {
        alert("Failed to convert image.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://serverless.roboflow.com/construction-dataset-6xih3/2?api_key=eemZDg711SO5VE4BOnBp", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: base64data
        });

        const data = await response.json();
        console.log("Detection results:", data);
        setDetectionResults(data.predictions || []);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        alert("Failed to get detection results.");
      }

      setLoading(false);
    };

    reader.readAsDataURL(capturedBlobRef.current);
  } catch (err) {
    console.error("Detection failed:", err);
    alert("Something went wrong during detection.");
    setLoading(false);
  }
};



  return (
    <div className="object-detection">
      <div className="detection-header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1>Detection</h1>
      </div>

      <div className="mode-buttons">
        <button
          className={selectedMode === 'site' ? 'active' : ''}
          onClick={() => handleModeSelect('site')}
        >
          🏗️ Site Detection
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

          {selectedMode === 'site' && (
            <div>
              <p>🏗️ Site detection active — pulling live feed from ESP32.</p>
              <img
                ref={imageRef}
                src={streamURL}
                alt="ESP32 Stream"
                crossOrigin="anonymous"
                onLoad={() => console.log("ESP32 image loaded")}
                style={{ width: '700px', maxHeight: '700px', borderRadius: '8px' }}
              />


              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={handleCaptureImage}>📸 Capture Image</button>
                <button onClick={handleRunDetection}>🧠 Run Detection</button>
                {loading && <p style={{ marginTop: '10px' }}>🔍 Running detection...</p>}
              </div>

              {capturedImageURL && (
                <div style={{ marginTop: '1rem' }}>
                  <h3>Captured Image:</h3>
                  <img
                    src={capturedImageURL}
                    alt="Captured"
                    style={{
                      width: '700px',
                      maxHeight: '700px',
                      borderRadius: '8px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />

            {detectionResults.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Detected Tools:</h3>
                <ul>
                  {detectionResults.map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item.class}</strong> — Confidence: {Math.round(item.confidence * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

  {loading && (
    <p style={{ marginTop: '1rem' }}>🧠 Detecting tools, please wait...</p>
  )}

  {!loading && detectionResults.length === 0 && capturedImageURL && (
    <p style={{ marginTop: '1rem', color: 'gray' }}>⚠️ No tools detected in the captured image.</p>
  )}

  {detectionResults.length > 0 && (
    <div style={{ marginTop: '1rem' }}>
      <h3>Detected Tools:</h3>
      <ul>
        {detectionResults.map((item: any, index: number) => (
          <li key={index}>
            <strong>{item.class}</strong> — Confidence: {Math.round(item.confidence * 100)}%
          </li>
        ))}
      </ul>
    </div>
  )}


        {selectedMode === 'face' && (
          <p>Face detection mode active — recognize workers and pull contact data.</p>
        )}
      </div>
    </div>
  );
};

export default ObjectDetection;
