import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/main/Footer.css';
import info from '../../assets/imagesm/info.png';
import telegramm from '../../assets/imagesm/telegramm.png';

const Footer = () => {
  const navigate = useNavigate();

  // Обработчики для кнопок
  const handleAboutClick = () => {
    navigate('/about'); // Переход на страницу информации
  };

  const handleAllThreadsClick = () => {
    navigate('/threads'); // Переход на страницу всех тредов
  };

  const handlePopularThreadsClick = () => {
    navigate('/threads'); // Переход на страницу популярных тредов
  };

  const handleTelegramClick = (e) => {
    e.preventDefault();
    window.open('https://t.me/yourchannel', '_blank'); // Открытие Telegram в новой вкладке
  };

  return (
    <footer>
      <div className="footer-left">
        <button 
          type="button" 
          className="info-btn"
          onClick={handleAboutClick}
        >
          <img src={info} alt="Информация" />
          Информация
        </button>
      </div>

      <div className="footer-center">
        <button 
          className="thread-btn"
          onClick={handleAllThreadsClick}
        >
          Все треды
        </button>
        <button 
          className="thread-btn"
          onClick={handlePopularThreadsClick}
        >
          Популярные
        </button>
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