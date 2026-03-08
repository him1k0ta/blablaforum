import PropTypes from 'prop-types';
import '../../style/inputs/Input.css';

const CheckboxInput = ({ label, name, register, errors }) => {
  return (
    <div className="form-group checkbox-group">
      <label className="checkbox-label">
        <input type="checkbox" {...register(name)} />
        {label}
      </label>
      {errors[name] && <p className="error-message">{errors[name].message}</p>}
    </div>
  );
};

CheckboxInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default CheckboxInput;