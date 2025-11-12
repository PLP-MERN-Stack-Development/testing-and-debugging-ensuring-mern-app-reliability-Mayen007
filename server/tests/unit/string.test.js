/**
 * Unit tests for string utilities
 */
const {
  sanitizeInput,
  formatFullName,
  normalizeEmail,
  truncateText,
} = require('../../src/utils/string');

describe('String Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizeInput('test>value')).not.toContain('>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\n\ttest\t\n')).toBe('test');
    });

    it('should limit input length to 1000 characters', () => {
      const longInput = 'a'.repeat(2000);
      expect(sanitizeInput(longInput).length).toBe(1000);
    });

    it('should handle edge cases', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });
  });

  describe('formatFullName', () => {
    it('should format full name correctly', () => {
      expect(formatFullName('john', 'doe')).toBe('John Doe');
      expect(formatFullName('JANE', 'SMITH')).toBe('Jane Smith');
    });

    it('should handle lowercase input', () => {
      expect(formatFullName('john', 'doe')).toBe('John Doe');
    });

    it('should handle mixed case input', () => {
      expect(formatFullName('jOHN', 'dOE')).toBe('John Doe');
    });

    it('should trim whitespace', () => {
      expect(formatFullName('  john  ', '  doe  ')).toBe('John Doe');
    });

    it('should handle empty or missing input', () => {
      expect(formatFullName('', 'doe')).toBe('');
      expect(formatFullName('john', '')).toBe('');
      expect(formatFullName(null, 'doe')).toBe('');
    });
  });

  describe('normalizeEmail', () => {
    it('should convert email to lowercase', () => {
      expect(normalizeEmail('Test@Example.COM')).toBe('test@example.com');
      expect(normalizeEmail('JOHN@DOMAIN.ORG')).toBe('john@domain.org');
    });

    it('should trim whitespace', () => {
      expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
      expect(normalizeEmail('\n\temail@test.com\t\n')).toBe('email@test.com');
    });

    it('should handle edge cases', () => {
      expect(normalizeEmail('')).toBe('');
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than limit', () => {
      const text = 'This is a long text that should be truncated';
      expect(truncateText(text, 10)).toBe('This is a ...');
    });

    it('should not truncate text shorter than limit', () => {
      const text = 'Short text';
      expect(truncateText(text, 50)).toBe('Short text');
    });

    it('should use default length of 100', () => {
      const text = 'a'.repeat(150);
      expect(truncateText(text)).toBe('a'.repeat(100) + '...');
    });

    it('should handle exact length match', () => {
      const text = 'Exactly 50 characters long but not really exact';
      expect(truncateText(text, 50)).toBe(text);
    });

    it('should handle edge cases', () => {
      expect(truncateText('')).toBe('');
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });
  });
});
