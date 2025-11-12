/**
 * String formatting utilities for server
 */

/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000); // Limit length
};

/**
 * Formats user display name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Formatted full name
 */
const formatFullName = (firstName, lastName) => {
  if (!firstName || !lastName) {
    return '';
  }
  
  const first = String(firstName).trim().charAt(0).toUpperCase() + String(firstName).slice(1).toLowerCase();
  const last = String(lastName).trim().charAt(0).toUpperCase() + String(lastName).slice(1).toLowerCase();
  
  return `${first} ${last}`;
};

/**
 * Normalizes email for storage
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email.trim().toLowerCase();
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, length = 100) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length) + '...';
};

module.exports = {
  sanitizeInput,
  formatFullName,
  normalizeEmail,
  truncateText,
};
