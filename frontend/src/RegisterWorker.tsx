// src/RegisterWorker.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import './contacts.css';

export default function RegisterWorker() {
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);


  const streamURL = 'http://100.65.13.57:81/stream';

  const handleCapture = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        setImageBlob(blob);
        // Show captured image on screen for confirmation
        const previewURL = URL.createObjectURL(blob);
        setCapturedPreview(previewURL); // <- Add useState for preview
      }
    }, 'image/jpeg');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageBlob) {
      alert('Please enter a name and capture image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('project', project);
    formData.append('file', imageBlob);

    try {
      const res = await fetch('http://localhost:8000/add_contact/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.message) {
        alert('Worker added!');
        navigate('/contacts');
      } else {
        alert(data.error || 'Error adding worker');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <form className="add-edit-contact-form" onSubmit={handleSubmit}>
      <h2>Register Worker</h2>
      <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Assigned Project" value={project} onChange={e => setProject(e.target.value)} />
      <div style={{ marginTop: '1rem' }}>
        <img ref={imageRef} src={streamURL} alt="ESP32 Stream" crossOrigin="anonymous" style={{ width: '100%', maxWidth: 500 }} />
        <button type="button" onClick={handleCapture} style={{ marginTop: 10 }}>📸 Capture Face</button>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      {capturedPreview && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Captured Preview:</h4>
          <img src={capturedPreview} alt="Captured" style={{ width: '300px', border: '1px solid #ccc' }} />
        </div>
      )}
      <button type="submit">Save Worker</button>
      <button type="button" onClick={() => navigate('/contacts')}>Cancel</button>
    </form>
  );
}
