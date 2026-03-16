import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false
  });

  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        const response = await api.get('auth/verify/');
        
        if (response.status === 200) {
          const user = JSON.parse(userData);
          // Обновляем данные пользователя с сервера
          const updatedUser = {
            ...user,
            is_superuser: response.data.is_admin
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setAuthState({
            token,
            user: updatedUser,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: response.data.is_admin
          });
          return;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Если токен невалидный, очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false
    });
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    setAuthState({
      token,
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: userData.is_superuser
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};