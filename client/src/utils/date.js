/**
 * Date utility functions
 * Provides common date operations and formatting
 */

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (MM/DD/YYYY)
 */
export const formatDate = (date) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Checks if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) {
    return false;
  }
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
 * Checks if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) {
    return false;
  }
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

/**
 * Calculates days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days between dates
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0;
  }
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Adds days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
