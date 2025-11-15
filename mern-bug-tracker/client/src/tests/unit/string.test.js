/* eslint-env jest */
import { describe, it, expect } from '@jest/globals';
import {
  capitalizeFirst,
  truncate,
  slugify,
  formatDate,
  getTimeAgo,
  highlightText,
} from '../../utils/string';

describe('String Utilities', () => {
  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello');
    });

    it('should handle empty and null strings', () => {
      expect(capitalizeFirst('')).toBe('');
      expect(capitalizeFirst(null)).toBe('');
      expect(capitalizeFirst(undefined)).toBe('');
    });

    it('should preserve rest of string case', () => {
      expect(capitalizeFirst('hELLO')).toBe('HELLO');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longText = 'a'.repeat(150);
      const result = truncate(longText, 100);
      expect(result).toBe('a'.repeat(100) + '...');
      expect(result.length).toBe(103);
    });

    it('should not truncate short strings', () => {
      expect(truncate('short text')).toBe('short text');
    });

    it('should use default length of 100', () => {
      const text = 'a'.repeat(101);
      expect(truncate(text)).toContain('...');
    });

    it('should handle custom length', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('should handle null or empty strings', () => {
      expect(truncate('')).toBe('');
      expect(truncate(null)).toBe('');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('HELLO WORLD')).toContain('hello');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should remove multiple hyphens', () => {
      expect(slugify('Hello  -  World')).toBe('hello-world');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15T10:30:00';
      const result = formatDate(date);
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('');
    });

    it('should handle null or empty strings', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('getTimeAgo', () => {
    it('should return "Just now" for recent times', () => {
      const now = new Date();
      expect(getTimeAgo(now.toISOString())).toBe('Just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getTimeAgo(fiveMinutesAgo.toISOString())).toContain('m ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getTimeAgo(twoHoursAgo.toISOString())).toContain('h ago');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getTimeAgo(threeDaysAgo.toISOString())).toContain('d ago');
    });

    it('should return formatted date for old times', () => {
      const longAgo = new Date('2020-01-01');
      const result = getTimeAgo(longAgo.toISOString());
      expect(result).toContain('2020');
    });
  });

  describe('highlightText', () => {
    it('should highlight matching text', () => {
      const result = highlightText('hello world', 'world');
      expect(result).toContain('<mark>');
    });

    it('should handle case-insensitive search', () => {
      const result = highlightText('Hello World', 'hello');
      expect(result).toContain('<mark>');
    });

    it('should handle null or empty inputs', () => {
      expect(highlightText('', 'term')).toBe('');
      expect(highlightText('text', '')).toBe('text');
      expect(highlightText(null, 'term')).toBe('');
    });
  });
});
