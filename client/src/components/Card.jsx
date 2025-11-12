/**
 * Card Component
 * A simple card container component
 */
import React from 'react';

const Card = ({ title, children, className = '', footer = null }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="card-title">{title}</h2>}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
