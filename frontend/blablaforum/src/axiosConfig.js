import axios from 'axios';
import { useAuth } from './AuthContext';

export const configureAxios = () => {
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        const { logout } = useAuth();
        logout();
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );
};