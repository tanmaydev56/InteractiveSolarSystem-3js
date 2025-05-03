import { useState, useEffect } from 'react';

const EarthInfo = ({ visible, onClose }) => {
  const [showInfo, setShowInfo] = useState(visible);

  useEffect(() => {
    setShowInfo(visible);
  }, [visible]);

  const handleClose = () => {
    setShowInfo(false);
    onClose();
    // Return to solar system view
    if (window.returnToSolarSystemView) {
      window.returnToSolarSystemView();
    }
  };

  if (!showInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 30, 0.9)',
      color: 'white',
      padding: '2rem',
      borderRadius: '10px',
      maxWidth: '500px',
      zIndex: 1000,
      border: '1px solid #4fc3f7',
      boxShadow: '0 0 20px rgba(79, 195, 247, 0.5)'
    }}>
      <h2 style={{ color: '#4fc3f7', marginTop: 0 }}>🌍 Earth Information</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3>Planetary Characteristics</h3>
        <ul>
          <li><strong>Diameter:</strong> 12,742 km</li>
          <li><strong>Mass:</strong> 5.97 × 10²⁴ kg</li>
          <li><strong>Surface Area:</strong> 510 million km²</li>
          <li><strong>Orbital Period:</strong> 365.25 days</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Notable Features</h3>
        <ul>
          <li>Only known planet with liquid water on surface</li>
          <li>Home to millions of species including humans</li>
          <li>71% of surface covered by oceans</li>
          <li>Has one natural satellite (The Moon)</li>
        </ul>
      </div>

      <button 
        onClick={handleClose}
        style={{
          backgroundColor: '#4fc3f7',
          color: 'black',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Close
      </button>
    </div>
  );
};

export default EarthInfo;