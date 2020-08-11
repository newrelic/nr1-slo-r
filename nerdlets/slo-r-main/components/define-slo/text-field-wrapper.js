import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'nr1';

const TextFieldWrapper = ({
  label,
  onChange,
  value,
  validationText,
  placeholder
}) => {
  return (
    <div>
      <TextField
        label={label}
        style={{ marginBottom: '16px' }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {validationText && (
        <span className="text-field__validation">{validationText}</span>
      )}
    </div>
  );
};

TextFieldWrapper.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  validationText: PropTypes.string,
  placeholder: PropTypes.string
};

export default TextFieldWrapper;
