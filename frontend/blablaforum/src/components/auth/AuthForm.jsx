import React from 'react';
import '../../style/auth/AuthForm.css';

const AuthForm = ({ onSubmit, register, errors, serverError, isLoading, isValid }) => {
  return (
    <form onSubmit={onSubmit}>
      {serverError && (
        <div className="server-error">
          {serverError}
        </div>
      )}
      
      <div className="form-group">
        <input
          type="text"
          placeholder=" "
          id="username"
          name="username"
          {...register('username')}
        />
        <label htmlFor="username">введите логин</label>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder=" "
          id="password"
          name="password"
          {...register('password')}
        />
        <label htmlFor="password">введите пароль</label>
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="button-container">
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !isValid}
        >
          {isLoading ? '...' : '>'}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;