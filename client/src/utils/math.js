/**
 * Math utility functions
 * Provides common mathematical operations
 */

/**
 * Adds two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
export const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
};

/**
 * Subtracts two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Difference of a and b
 */
export const subtract = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a - b;
};

/**
 * Multiplies two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
export const multiply = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a * b;
};

/**
 * Divides two numbers
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @returns {number} Quotient of a and b
 */
export const divide = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
};

/**
 * Calculates percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage as a decimal
 */
export const calculatePercentage = (value, total) => {
  if (typeof value !== 'number' || typeof total !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  if (total === 0) {
    throw new Error('Total cannot be zero');
  }
  return (value / total) * 100;
};

/**
 * Rounds a number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
export const roundToDecimals = (num, decimals = 2) => {
  if (typeof num !== 'number' || typeof decimals !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
