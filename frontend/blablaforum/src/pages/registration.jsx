import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegisterHeader from '../components/registration/RegisterHeader';
import RegisterForm from '../components/registration/RegisterForm';
import RegisterFooter from '../components/registration/RegisterFooter';
import '../style/registration/RegisterPage.css';

const schema = yup.object().shape({
  username: yup  // Изменили login на username для согласованности с бэкендом
    .string()
    .required('Имя пользователя обязательно')
    .min(3, 'Минимум 3 символа'),
  email: yup
    .string()
    .required('Email обязателен')
    .email('Введите корректный email'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  password2: yup
    .string()
    .required('Подтверждение пароля обязательно')
    .oneOf([yup.ref('password')], 'Пароли должны совпадать'), // Убрали null из oneOf
});

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        username: data.username, 
        email: data.email,
        password: data.password,
        password2: data.password2
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
  
      if (response.status === 201) {
        alert(JSON.stringify(response.data, null, 2));
        navigate('/auth');
      }
    } catch (error) {
      console.error('Full error:', error);
      
      if (error.response) {
        const { data } = error.response;
        
        if (data.username) {
          alert(`Ошибка имени пользователя: ${data.username.join(', ')}`);
        } else if (data.email) {
          alert(`Ошибка email: ${data.email.join(', ')}`);
        } else if (data.password) {
          alert(`Ошибка пароля: ${data.password.join(', ')}`);
        } else if (data.password2) {
          alert(`Ошибка подтверждения пароля: ${data.password2.join(', ')}`);
        } else if (data.non_field_errors) {
          alert(data.non_field_errors.join('\n'));
        } else {
          alert(`Ошибка сервера: ${JSON.stringify(data, null, 2)}`);
        }
      } else {
        alert('Ошибка сети: ' + error.message);
      }
    }
  };
  return (
    <div className="register-page">
      <RegisterHeader />
      <main className="register-main">
        <div className="form-container">
          <RegisterForm
            onSubmit={handleSubmit(onSubmit)}
            register={register}
            errors={errors}
            fields={[
              { name: 'username', label: 'Имя пользователя', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Пароль', type: 'password' },
              { name: 'password2', label: 'Подтверждение пароля', type: 'password' }
            ]}
          />
        </div>
      </main>
      <RegisterFooter />
    </div>
  );
};

export default RegisterPage;