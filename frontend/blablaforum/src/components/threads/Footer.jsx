import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/buttons/Button';
import '../../style/threads/Footer.css';
import telegramm from '../../assets/imagesm/telegramm.png';
const Footer = () => {
  const navigate = useNavigate();

  const handleAboutClick = () => {
    navigate('/about');
  };

  const handleRulesClick = () => {
    navigate('/rules');
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/yourchannel', '_blank');
  };

  return (
    <footer>
      <div className="footer-left">
        <Button className="info-btn2" onClick={handleAboutClick}>
          О форуме
        </Button>
        <Button className="info-btn2" onClick={handleRulesClick}>
          Правила
        </Button>
      </div>
      <div className="footer-center">
        <Button className="thread-btn" onClick={handleCreateClick}>
          Создать тред
        </Button>
      </div>
      <div className="footer-right">
          <a 
            href="https://t.me/yourchannel" 
            onClick={handleTelegramClick}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img src={telegramm} alt="Telegram" />
          </a>
        </div>
    </footer>
  );
};

export default Footer;