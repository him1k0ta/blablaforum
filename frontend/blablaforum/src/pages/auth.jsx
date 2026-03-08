import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import AuthHeader from '../components/auth/AuthHeader';
import AuthForm from '../components/auth/AuthForm';
import AuthFooter from '../components/auth/AuthFooter';
import '../style/auth/AuthPage.css';

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Логин обязателен')
    .min(3, 'Минимум 3 символа')
    .max(30, 'Максимум 30 символов'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Минимум 6 символов')
    .max(50, 'Максимум 50 символов'),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async ({ username, password }) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await api.post('auth/login/', { 
        username, 
        password 
      });

      if (response.data?.token) {
        login(response.data.token, {
          userId: response.data.user_id,
          username: response.data.username,
          email: response.data.email
        });
        navigate(location.state?.from?.pathname || '/', { replace: true });
      } else {
        setServerError('Ошибка сервера: отсутствует токен в ответе');
      }
    } catch (error) {
      let errorMessage = 'Произошла ошибка при авторизации';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Неверный запрос. Проверьте введенные данные';
            break;
          case 401:
            errorMessage = 'Неверное имя пользователя или пароль';
            break;
          case 404:
            errorMessage = 'Сервер авторизации недоступен';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка сервера (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Не удалось соединиться с сервером';
      }

      setServerError(errorMessage);
      console.error('Ошибка авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader />
      <AuthForm
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        serverError={serverError}
        isLoading={isLoading}
        isValid={isValid}
      />
      <AuthFooter />
    </div>
  );
};

export default AuthPage;