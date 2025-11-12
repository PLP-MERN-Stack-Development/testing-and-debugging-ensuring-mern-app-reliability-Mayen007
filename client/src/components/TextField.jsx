/**
 * TextField Component
 * A reusable input field component with error handling
 */
import React from 'react';

const TextField = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`text-field ${className}`}>
      {label && (
        <label htmlFor={label}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={`textfield-${label}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TextField;
