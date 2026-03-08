import React from 'react';
import '../../style/buttons/Button.css';

const Button = ({ children, className, ...props }) => {
  return (
    <button className={`button ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;