import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/main/Header.css';
import addIcon from '../../assets/imagesm/add.png';
import logo from '../../assets/imagesm/logo.png';
import logoHover from '../../assets/imagesm/logo-hover.png';
import { useAuth } from '../../AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="create-btn" onClick={handleCreateClick}>
          СОЗДАТЬ <img src={addIcon} alt="Добавить" />
        </button>
      </div>
      <div className="nav-center">
        <img 
          className="logo" 
          src={isLogoHovered ? logoHover : logo} 
          alt="logo"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        />
        <div className="typing-container">
          <span className="typing-text">Добро пожаловать снова!</span>
          <span className="cursor1">|</span>
        </div>
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <button className="logout-btn" onClick={handleLogout}>ВЫЙТИ</button>
        ) : (
          <>
            <button className="auth-btn" onClick={handleAuthClick}>ВХОД</button>
            <button className="register-btn" onClick={handleRegisterClick}>РЕГИСТРАЦИЯ</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;