import { useState, useEffect, useCallback } from 'react';

// Функция для очистки данных пользователя
const sanitizeUserData = (userData) => {
  if (!userData) return null;
  
  return {
    id: userData.id ? String(userData.id) : '',
    nickname: userData.nickname ? String(userData.nickname) : 'Пользователь',
    email: userData.email ? String(userData.email) : '',
  };
};

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      
      try {
        const parsed = JSON.parse(storedUser);
        const cleanUser = sanitizeUserData(parsed);
        if (cleanUser) setUser(cleanUser);
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
        localStorage.removeItem('user');
      }
    };
    
    loadUser();
  }, []);

  const login = useCallback((userData) => {
    const cleanUser = sanitizeUserData(userData);
    if (!cleanUser) return;
    
    setUser(cleanUser);
    localStorage.setItem('user', JSON.stringify(cleanUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return { user, login, logout };
};