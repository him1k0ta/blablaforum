import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../style/cursor/CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(null);
  const location = useLocation();

  useEffect(() => {
    document.body.style.cursor = 'none';
    
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
      
      const target = e.target.closest('a, button, input, textarea, [role="button"], [onclick]');
      setHovering(target?.tagName.toLowerCase() || null);
    };

    const handleLeave = () => setVisible(false);
    const handleDown = () => setClicked(true);
    const handleUp = () => setClicked(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 100);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      clearTimeout(timer);
    };
  }, [location.pathname, visible]);

  return (
    <div 
      className={`cursor 
        ${!visible ? 'hidden' : ''} 
        ${clicked ? 'clicked' : ''} 
        ${hovering ? 'hovering hovering-' + hovering : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
};

export default CustomCursor;