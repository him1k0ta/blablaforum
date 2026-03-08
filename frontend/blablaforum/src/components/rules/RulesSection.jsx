import React from 'react';
import RulesList from './RulesList';
import '../../style/rules/RulesSection.css';

const RulesSection = ({ title, items }) => (
  <section className="rules-section">
    <h2 className="section-title">{title}</h2>
    <RulesList items={items} />
  </section>
);

export default RulesSection;