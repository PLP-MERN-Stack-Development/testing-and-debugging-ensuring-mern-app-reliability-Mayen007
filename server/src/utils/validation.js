/**
 * Server-side validation utilities
 * Common validation functions for data validation
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with message
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  
  return { valid: true, message: 'Password is strong' };
};

/**
 * Validates username
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  // Username: 3-20 chars, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validates required fields
 * @param {object} data - Object to validate
 * @param {array} fields - Required field names
 * @returns {object} Validation result
 */
const validateRequiredFields = (data, fields) => {
  const missing = [];
  
  for (const field of fields) {
    if (!data || !data[field]) {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidUsername,
  validateRequiredFields,
};
