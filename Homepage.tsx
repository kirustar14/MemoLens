import React from 'react';
import './App.css';

const Homepage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="homepage">
      <h1>Welcome to MemoLens</h1>
      <p className="tagline">
        Smart glasses + web app to help you remember the people and moments that matter.
      </p>
      <div className="homepage-description">
        <p>
          Ever struggled to remember someone's name, or what you last talked about? 
          MemoLens solves this by combining wearable technology and facial recognition to manage your contacts effortlessly.
        </p>
        <p>
          Upload a photo to your private contact manager, or use MemoLens glasses to automatically recognize and recall past interactions.
        </p>
      </div>
      <button className="start-btn" onClick={onStart}>
        Get Started
      </button>
    </div>
  );
};

export default Homepage;