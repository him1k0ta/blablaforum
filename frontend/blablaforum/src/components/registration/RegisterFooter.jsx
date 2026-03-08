import React from 'react';
import { Link } from 'react-router-dom';
import '../../style/registration/RegisterFooter.css';

const RegisterFooter = () => {
  return (
    <div className="rules-footer">
      <div className="help">
        <a href="../pages/poddejka.html" className="support-link">Поддержка</a>
      </div>
      
      <Link to="/" className="agree-btn home-btn">
        На главную
      </Link>
      
      <p className="footer-note">
        Возникли вопросы? Обратитесь в нашу поддержку
      </p>
    </div>
  );
};

export default RegisterFooter;