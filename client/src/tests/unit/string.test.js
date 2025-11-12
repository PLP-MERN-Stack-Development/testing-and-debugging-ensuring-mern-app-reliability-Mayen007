/**
 * Unit tests for string utility functions
 */
import {
  validateEmail,
  validatePassword,
  capitalize,
  normalizeString,
  truncateString,
} from '../../utils/string';

describe('String Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('email+tag@test.org')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
      expect(validateEmail(123)).toBe(false);
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6 or more characters', () => {
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('very long password')).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('pass')).toBe(false);
      expect(validatePassword('a')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
      expect(validatePassword(123456)).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
      expect(capitalize('a')).toBe('A');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should handle edge cases', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
      expect(capitalize(123)).toBe('');
    });

    it('should preserve the rest of the string', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
      expect(capitalize('tEST STRING')).toBe('TEST STRING');
    });
  });

  describe('normalizeString', () => {
    it('should trim whitespace and convert to lowercase', () => {
      expect(normalizeString('  HELLO  ')).toBe('hello');
      expect(normalizeString('\tWORLD\n')).toBe('world');
      expect(normalizeString('  Test String  ')).toBe('test string');
    });

    it('should handle edge cases', () => {
      expect(normalizeString('')).toBe('');
      expect(normalizeString(null)).toBe('');
      expect(normalizeString(undefined)).toBe('');
      expect(normalizeString(123)).toBe('');
    });
  });

  describe('truncateString', () => {
    it('should truncate strings longer than specified length', () => {
      expect(truncateString('This is a long string', 10)).toBe('This is a ...');
      expect(truncateString('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate strings shorter than specified length', () => {
      expect(truncateString('Short', 10)).toBe('Short');
      expect(truncateString('Hello', 5)).toBe('Hello');
    });

    it('should use default length of 50', () => {
      const longString = 'a'.repeat(51);
      expect(truncateString(longString)).toBe('a'.repeat(50) + '...');
    });

    it('should handle edge cases', () => {
      expect(truncateString('')).toBe('');
      expect(truncateString(null)).toBe('');
      expect(truncateString(undefined)).toBe('');
      expect(truncateString(123)).toBe('');
    });
  });
});
