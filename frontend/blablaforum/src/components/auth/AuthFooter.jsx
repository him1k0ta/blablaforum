import { Link } from 'react-router-dom';
import '../../style/auth/AuthFooter.css';

const AuthFooter = () => {
  return (
    <div className="auth-footer">
      <div className="registration">
        <Link to="/register" className="registration-link">
          Не зарегистрированы?
        </Link>
      </div>
      
      <Link to="/" className="home-btn">
        На главную
      </Link>
    </div>
  );
};

export default AuthFooter;