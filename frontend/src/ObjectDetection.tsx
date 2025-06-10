import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [streamURL, setStreamURL] = useState<string>('');
  const [capturedImageURL, setCapturedImageURL] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [workerInfo, setWorkerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const capturedBlobRef = useRef<Blob | null>(null);

  const handleModeSelect = async (mode: string) => {
    setSelectedMode(mode);
    setCapturedImageURL(null);
    setDetectionResults([]);
    setWorkerInfo(null);

    if (mode === 'site' || mode === 'face') {
      try {
        const res = await fetch('http://localhost:8000/camera/stream_url/');
        const data = await res.json();
        setStreamURL(data.stream_url);
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
    setDetectionResults([]);
    setWorkerInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", capturedBlobRef.current);

      const response = await fetch("http://localhost:8000/recognize/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.result === "Unknown" || data.result === "No face found") {
        alert("Face not recognized.");
      } else {
        setWorkerInfo(data);
      }
    } catch (err) {
      console.error("Recognition failed", err);
      alert("Recognition error");
    }

    setLoading(false);
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

        {(selectedMode === 'site' || selectedMode === 'face') && (
          <div>
            <p>{selectedMode === 'site' ? '🏗️ Site detection active — pulling live feed from ESP32.' : '🧑‍🔧 Face detection mode active — recognize workers and pull contact data.'}</p>
            <img
              ref={imageRef}
              src={streamURL}
              alt="ESP32 Stream"
              crossOrigin="anonymous"
              style={{ width: '700px', maxHeight: '700px', borderRadius: '8px' }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button onClick={handleCaptureImage}>📸 Capture Image</button>
              <button onClick={handleRunDetection}>🧠 Run Detection</button>
              {loading && <p style={{ marginTop: '10px' }}>🔍 Detecting...</p>}
            </div>

            {capturedImageURL && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Captured Image:</h3>
                <img
                  src={capturedImageURL}
                  alt="Captured"
                  style={{ width: '700px', maxHeight: '700px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {selectedMode === 'site' && detectionResults.length > 0 && (
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

            {selectedMode === 'face' && workerInfo && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Recognized Worker</h3>
                <p><strong>Name:</strong> {workerInfo.result}</p>
                <p><strong>Project:</strong> {workerInfo.project}</p>
                {workerInfo.image && <img src={`http://localhost:8000/${workerInfo.image}`} alt="Worker" style={{ maxWidth: '300px', borderRadius: '8px' }} />}
              </div>
            )}

            {!loading && selectedMode === 'face' && !workerInfo && capturedImageURL && (
              <p style={{ marginTop: '1rem', color: 'gray' }}>⚠️ No worker recognized.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetection;
