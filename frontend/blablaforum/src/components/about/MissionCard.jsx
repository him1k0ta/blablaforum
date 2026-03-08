import React from 'react';
import '../../style/about/MissionCard.css';

const MissionCard = ({ icon, title, description }) => {
  return (
    <div className="mission-card">
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  );
};

export default MissionCard;