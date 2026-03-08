import '../../style/registration/RegisterForm.css';
import TextInput from '../inputs/TextInput';

const RegisterForm = ({ onSubmit, register, errors }) => {
  return (
    <form onSubmit={onSubmit} className="register-form">
      <TextInput
        label="Имя пользователя"
        name="username"  // Изменили с login на username
        type="text"
        register={register}
        errors={errors}
        required
      />
      <TextInput
        label="Email"
        name="email"
        type="email"
        register={register}
        errors={errors}
        required
      />
      <TextInput
        label="Пароль"
        name="password"
        type="password"
        register={register}
        errors={errors}
        required
        minLength={6}
      />
      <TextInput
        label="Подтверждение пароля"
        name="password2"
        type="password"
        register={register}
        errors={errors}
        required
      />
      <div className="button-container">
        <button type="submit" className="send-button">
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;