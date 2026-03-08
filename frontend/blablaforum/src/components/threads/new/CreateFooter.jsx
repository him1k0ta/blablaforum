import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/buttons/Button';
import '../../../style/threads/Footer.css';
import telegramm from '../../../assets/imagesm/telegramm.png';

const Footer = () => {
  const navigate = useNavigate();

  const handleAboutClick = () => {
    navigate('/about');
  };
  const handleThreadsClick = () => {
    navigate('/threads');
  };
  const handleMainClick = () => {
    navigate('/'); // Изменено с '/main' на '/'
  };

  const handleTelegramClick = (e) => {
    e.preventDefault();
    window.open('https://t.me/yourchannel', '_blank');
  };

  return (
    <footer>
      <div className="footer-left">
        <Button 
          className="info-btn2" 
          onClick={handleAboutClick}
        >
          О форуме
        </Button>
        <Button 
          className="info-btn2" 
          onClick={handleMainClick}
        >
          Главная
        </Button>
        <Button 
          className="thread-btn" 
          onClick={handleThreadsClick}
        >
          Все треды
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