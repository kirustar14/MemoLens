// ✅ Updated AddTool.tsx
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTool.css';

const AddTool: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [safetyLevel, setSafetyLevel] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [imageData, setImageData] = useState<Blob | null>(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (blob) setImageData(blob);
    }, 'image/jpeg');
  };

  const autoDetectLabel = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async blob => {
      if (!blob) return;
      setImageData(blob);
      const formData = new FormData();
      formData.append("file", blob);
      const res = await fetch("http://localhost:8000/detect/size", { method: "POST", body: formData });
      const data = await res.json();
      if (data.results?.length > 0) {
        setName(data.results[0].label);
      }
    }, 'image/jpeg');
  };

  const handleSubmit = async () => {
    if (!name || !category || !imageData) return alert('Fill all fields and capture an image.');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString().split(',')[1];

      const res = await fetch('http://localhost:8000/tools/scanned', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          label: name.toLowerCase(), // explicitly save label
          category,
          safety_level: safetyLevel,
          instructions: instructions.split('\n'),
          maintenance,
          image: base64Image
        })
      });

      if (res.ok) {
        alert('Tool added successfully!');
        navigate('/detection');
      } else {
        alert('Failed to add tool.');
      }
    };
    reader.readAsDataURL(imageData);
  };

  return (
    <div className="add-tool">
      <div className="detection-header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1>Add Tool</h1>
      </div>

      <div className="form-group">
        <label>Tool Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>Safety Level</label>
        <input value={safetyLevel} onChange={(e) => setSafetyLevel(e.target.value)} />

        <label>Instructions (one per line)</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} />

        <label>Maintenance Notes</label>
        <textarea value={maintenance} onChange={(e) => setMaintenance(e.target.value)} rows={3} />
      </div>

      <div className="camera-section">
        <video ref={videoRef} autoPlay muted style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="view-controls">
          <button onClick={startCamera}>🎥 Start Camera</button>
          <button onClick={capturePhoto}>📸 Capture Tool Photo</button>
          <button onClick={autoDetectLabel}>🔍 Auto-Detect Tool Name</button>
        </div>
        {imageData && (
          <div className="preview-section">
            <p>📷 Preview:</p>
            <img src={URL.createObjectURL(imageData)} alt="Captured" style={{ maxWidth: "100%", borderRadius: "8px" }} />
          </div>
        )}
      </div>

      <button className="submit-button" onClick={handleSubmit}>Add Tool to Manual</button>
    </div>
  );
};

export default AddTool;