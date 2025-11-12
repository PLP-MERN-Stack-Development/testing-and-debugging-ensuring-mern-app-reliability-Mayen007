/**
 * String utility functions
 * Provides common string manipulation and validation helpers
 */

/**
 * Validates if a string is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates if a password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is at least 6 characters
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= 6;
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Trims whitespace and converts string to lowercase
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export const normalizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.trim().toLowerCase();
};

/**
 * Truncates a string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string with ellipsis
 */
export const truncateString = (str, length = 50) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
};
