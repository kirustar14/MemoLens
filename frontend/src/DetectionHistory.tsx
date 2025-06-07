import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetectionHistory.css';

interface Detection {
  id: string;
  timestamp: string;
  type: 'hazard' | 'tool';
  label: string;
  imageUrl: string;
  confidence: number;
}

const DetectionHistory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'hazard' | 'tool'>('all');
  const navigate = useNavigate();

  // This would be replaced with actual data from your backend
  const detections: Detection[] = [
    {
      id: '1',
      timestamp: '2024-04-24 19:30:45',
      type: 'hazard',
      label: 'Nail',
      imageUrl: '/sample-nail.jpg',
      confidence: 0.95
    },
    {
      id: '2',
      timestamp: '2024-04-24 19:33:12',
      type: 'tool',
      label: 'Power Drill',
      imageUrl: '/sample-drill.jpg',
      confidence: 0.98
    },
    {
      id: '3',
      timestamp: '2024-04-24 19:35:22',
      type: 'hazard',
      label: 'Sharp Object',
      imageUrl: '/sample-sharp.jpg',
      confidence: 0.92
    },
  ];

  const filteredDetections = filter === 'all' 
    ? detections 
    : detections.filter(d => d.type === filter);

  return (
    <div className="detection-history">
      <div className="history-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/')}>←</button>
          <h2>Detection History</h2>
        </div>
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'hazard' ? 'active' : ''} 
            onClick={() => setFilter('hazard')}
          >
            Hazards
          </button>
          <button 
            className={filter === 'tool' ? 'active' : ''} 
            onClick={() => setFilter('tool')}
          >
            Tools
          </button>
        </div>
      </div>

      <div className="history-table">
        <div className="table-header">
          <div>Time</div>
          <div>Type</div>
          <div>Object</div>
          <div>Confidence</div>
          <div>Image</div>
        </div>
        
        {filteredDetections.map((detection) => (
          <div key={detection.id} className={`history-row ${detection.type}`}>
            <div className="timestamp">{detection.timestamp}</div>
            <div className="type">
              <span className={`type-badge ${detection.type}`}>
                {detection.type === 'hazard' ? '⚠️ Hazard' : '🔧 Tool'}
              </span>
            </div>
            <div className="object-type">{detection.label}</div>
            <div className="confidence">
              {(detection.confidence * 100).toFixed(0)}%
            </div>
            <div className="thumbnail">
              <img src={detection.imageUrl} alt={detection.label} />
            </div>
          </div>
        ))}
      </div>

      {filteredDetections.length === 0 && (
        <div className="no-results">
          No {filter !== 'all' ? filter : ''} detections found
        </div>
      )}
    </div>
  );
};

export default DetectionHistory; 