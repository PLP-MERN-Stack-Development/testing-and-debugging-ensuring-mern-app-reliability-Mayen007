/**
 * Validation utility functions for server-side validation
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePostTitle = (title) => {
  if (!title) return false;
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
};

const validatePostContent = (content) => {
  if (!content) return false;
  return content.trim().length >= 10;
};

const validateCategoryName = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePostTitle,
  validatePostContent,
  validateCategoryName,
  sanitizeInput,
};
