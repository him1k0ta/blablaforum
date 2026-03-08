import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/buttons/Button';
import '../../style/layout/Navbar.css';
import logo from '../../assets/imagesm/logo.png';
import logoHover from '../../assets/imagesm/logo-hover.png';
import addIcon from '../../assets/imagesm/add.png';
import { useAuth } from '../../AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isThreadsPage, setIsThreadsPage] = useState(false);

  useEffect(() => {
    setIsThreadsPage(location.pathname.includes('/threads'));
  }, [location.pathname]);

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar2">
      <div className="nav-left2">
        <button className="create-btn" onClick={handleCreateClick}>
          СОЗДАТЬ <img src={addIcon} alt="Добавить" />
        </button>
      </div>
      <div className="nav-center2">
        <img 
          className={`logo2 ${isThreadsPage ? 'logo-small' : ''}`} 
          src={isLogoHovered ? logoHover : logo} 
          alt="logo"
          onClick={handleLogoClick}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        />
      </div>
      <div className="nav-right2">
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