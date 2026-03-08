import React from 'react';
import '../../style/rules/RulesList.css';

const RulesList = ({ items }) => (
  <ul className="rules-list">
    {items.map((item, index) => (
      <li key={index} className="rules-list-item">
        {item}
      </li>
    ))}
  </ul>
);

export default RulesList;