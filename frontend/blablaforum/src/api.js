import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/', // Убрали /api/ из базового URL
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

api.interceptors.request.use(config => {
  // Добавляем /api/ ко всем запросам к API
  if (!config.url.startsWith('api/') && !config.url.startsWith('/api/')) {
    config.url = `api/${config.url}`;
  }
  
  // Удаляем дублирующиеся слэши
  config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
  
  // Для не-GET запросов добавляем завершающий слэш
  if (!['get', 'head'].includes(config.method?.toLowerCase()) && !config.url.endsWith('/')) {
    config.url += '/';
  }

  // Добавляем токен авторизации
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
}, error => Promise.reject(error));

export default api;