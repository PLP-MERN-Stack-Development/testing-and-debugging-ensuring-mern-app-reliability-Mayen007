/**
 * Unit tests for date utility functions
 */
import {
  formatDate,
  isPastDate,
  isFutureDate,
  daysBetween,
  addDays,
} from '../../utils/date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('01/15/2024');
    });

    it('should format date string', () => {
      expect(formatDate('2024-12-25')).toBe('12/25/2024');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('01/05/2024');
    });

    it('should handle edge cases', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('isPastDate', () => {
    it('should identify past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should identify non-past dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPastDate(null)).toBe(false);
      expect(isPastDate(undefined)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should identify future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should identify non-future dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isFutureDate(null)).toBe(false);
      expect(isFutureDate(undefined)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-10');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should calculate days regardless of order', () => {
      const date1 = new Date('2024-01-10');
      const date2 = new Date('2024-01-01');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-01-01');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle invalid dates', () => {
      expect(daysBetween('invalid', 'date')).toBe(0);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    it('should handle negative days (subtracting)', () => {
      const date = new Date('2024-01-10');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(5);
    });

    it('should handle month wraparound', () => {
      const date = new Date('2024-01-25');
      const result = addDays(date, 10);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should return a new Date object', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 1);
      expect(result).not.toBe(date);
      expect(result.getTime()).not.toBe(date.getTime());
    });
  });
});
