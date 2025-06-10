import React, { useState, useRef , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './ObjectDetection.css';

const ObjectDetection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [streamURL, setStreamURL] = useState<string>("");
  const [capturedImageURL, setCapturedImageURL] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const capturedBlobRef = useRef<Blob | null>(null); // store blob between steps

  const handleModeSelect = async (mode: string) => {
    setSelectedMode(mode);
    setCapturedImageURL(null);
    setDetectionResults([]);

    if (mode === 'site') {
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


    // inside component
    useEffect(() => {
      if (selectedMode === 'site') {
        const interval = setInterval(() => {
          setStreamURL(prev => {
            const base = prev.split('?')[0];
            return `${base}?t=${Date.now()}`; // force refresh
          });
        }, 500); // refresh every 500ms

        return () => clearInterval(interval);
      }
    }, [selectedMode]);


  const handleCaptureImage = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const image = imageRef.current;
    const canvas = canvasRef.current;

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

    setLoading(true); // start loading

    const formData = new FormData();
    formData.append("file", capturedBlobRef.current, "capture.jpg");

    try {
      // USE YOUR OWN BACKEND INSTEAD OF ROBOFLOW:
      const endpoint = "http://localhost:8000/detect/tool";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer dummy-token-for-demo" // update this
        },
        body: formData
      });

      const data = await response.json();
      setDetectionResults(data.results || []);
    } catch (err) {
      console.error("Detection failed:", err);
    }

    setLoading(false); // done
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
              src={streamURL + "?t=" + new Date().getTime()}
              alt="ESP32 Stream"
              crossOrigin="anonymous"
              style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
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
                    width: '100%',
                    maxHeight: '300px',
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
                  <strong>{item.label}</strong> — {item.match ? '✅ Found in DB' : '❌ Not Found'}
                  {item.match && (
                    <ul>
                      <li><strong>Name:</strong> {item.tool_info.name}</li>
                      <li><strong>Category:</strong> {item.tool_info.category}</li>
                      <li><strong>Safety:</strong> {item.tool_info.safety_level}</li>
                      <li><strong>Maintenance:</strong> {item.tool_info.maintenance}</li>
                      <li><strong>Instructions:</strong>
                        <ul>
                          {item.tool_info.instructions.map((inst: string, i: number) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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
