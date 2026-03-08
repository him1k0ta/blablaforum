import PropTypes from 'prop-types';
import '../../style/inputs/Input.css';

const TextInput = ({ label, name, type = 'text', placeholder, register, errors }) => {
  return (
    <div className="form-group">
      <input
        type={type}
        placeholder=" "
        id={name}
        {...register(name)}
        className={errors[name] ? 'input-error' : ''}
      />
      <label htmlFor={name}>{label}</label>
      {errors[name] && <p className="error-message">{errors[name].message}</p>}
    </div>
  );
};

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default TextInput;