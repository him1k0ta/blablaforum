import React from 'react';
import '../../style/about/TimeLineItem.css';
const TimelineItem = ({ year, title, description }) => {
  return (
    <div className="timeline-item">
      <div className="timeline-year">{year}</div>
      <div className="timeline-content">
        <h3 className="content-title">{title}</h3>
        <p className="content-description">{description}</p>
      </div>
    </div>
  );
};

export default TimelineItem;