import React from 'react';
import '../../style/rules/RulesCard.css';

const RulesCard = ({ icon, title, items, color }) => (
  <div className="rules-card" style={{ borderTop: `4px solid #211d6775` }}> {/* Единый голубой цвет */}
    <div className="card-header">
      <span className="card-icon" style={{ color: '#211d6775' }}>{icon}</span> {/* Единый голубой цвет */}
      <h3 className="card-title" style={{ color: '#211d6775' }}>{title}</h3> {/* Единый голубой цвет */}
    </div>
    <ul className="card-list">
      {items.map((item, index) => (
        <li key={index} className="card-item">
          <span className="item-bullet" style={{ backgroundColor: '#211d6775' }}></span> {/* Единый голубой цвет */}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default RulesCard;