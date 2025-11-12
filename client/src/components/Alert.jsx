/**
 * Alert Component
 * Displays alert messages with different severity levels
 */
import React from 'react';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose = null,
  className = '' 
}) => {
  const alertTypes = ['success', 'error', 'warning', 'info'];
  const alertType = alertTypes.includes(type) ? type : 'info';

  return (
    <div 
      className={`alert alert-${alertType} ${className}`}
      role="alert"
      data-testid={`alert-${alertType}`}
    >
      <p className="alert-message">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="alert-close"
          aria-label="Close alert"
          data-testid="alert-close-button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
