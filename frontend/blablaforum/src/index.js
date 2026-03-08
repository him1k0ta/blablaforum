import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faComment, faHeart, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faEye as farEye, faComment as farComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { configureAxios } from './axiosConfig';

library.add(faEye, faComment, faHeart, faChevronLeft, faChevronRight, farEye, farComment, farHeart);

const root = ReactDOM.createRoot(document.getElementById('root'));

const AppWithAxios = () => {
  configureAxios();
  return <App />;
};

root.render(
  <BrowserRouter>
    <AuthProvider>
      <React.StrictMode>
        <AppWithAxios />
      </React.StrictMode>
    </AuthProvider>
  </BrowserRouter>
);

reportWebVitals();