/**
 * Unit tests for validation utilities
 */
const {
  isValidEmail,
  validatePassword,
  isValidUsername,
  validateRequiredFields,
} = require('../../src/utils/validation');

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('email+tag@test.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 6 characters');
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('PasswordAbc');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('numbers');
    });

    it('should handle empty or invalid input', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate correct usernames', () => {
      expect(isValidUsername('john_doe')).toBe(true);
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('abc')).toBe(true);
    });

    it('should reject short usernames', () => {
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('a')).toBe(false);
    });

    it('should reject long usernames', () => {
      expect(isValidUsername('a'.repeat(21))).toBe(false);
    });

    it('should reject usernames with invalid characters', () => {
      expect(isValidUsername('user-name')).toBe(false);
      expect(isValidUsername('user@123')).toBe(false);
      expect(isValidUsername('user name')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername(null)).toBe(false);
      expect(isValidUsername(123)).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com', password: 'Pass123' };
      const result = validateRequiredFields(data, ['name', 'email', 'password']);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should identify missing required fields', () => {
      const data = { name: 'John', email: '' };
      const result = validateRequiredFields(data, ['name', 'email', 'password']);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('email');
      expect(result.missing).toContain('password');
    });

    it('should handle null or undefined data', () => {
      const result = validateRequiredFields(null, ['name', 'email']);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['name', 'email']);
    });

    it('should handle empty fields array', () => {
      const data = { name: 'John' };
      const result = validateRequiredFields(data, []);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });
});
