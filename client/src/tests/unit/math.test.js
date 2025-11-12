/**
 * Unit tests for math utility functions
 */
import {
  add,
  subtract,
  multiply,
  divide,
  calculatePercentage,
  roundToDecimals,
} from '../../utils/math';

describe('Math Utilities', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(10, 20)).toBe(30);
      expect(add(0.5, 0.5)).toBe(1);
    });

    it('should add negative numbers', () => {
      expect(add(-5, 3)).toBe(-2);
      expect(add(-10, -20)).toBe(-30);
    });

    it('should throw error for non-numbers', () => {
      expect(() => add('5', 3)).toThrow('Both arguments must be numbers');
      expect(() => add(5, null)).toThrow('Both arguments must be numbers');
      expect(() => add(undefined, 3)).toThrow('Both arguments must be numbers');
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(10, 5)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(-10, -5)).toBe(-5);
    });

    it('should throw error for non-numbers', () => {
      expect(() => subtract('10', 5)).toThrow('Both arguments must be numbers');
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
      expect(multiply(0, 100)).toBe(0);
      expect(multiply(-5, 4)).toBe(-20);
    });

    it('should multiply decimals', () => {
      expect(multiply(2.5, 2)).toBe(5);
      expect(multiply(0.1, 0.1)).toBe(0.01);
    });

    it('should throw error for non-numbers', () => {
      expect(() => multiply('3', 4)).toThrow('Both arguments must be numbers');
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(15, 3)).toBe(5);
      expect(divide(10, 4)).toBe(2.5);
    });

    it('should divide with negative numbers', () => {
      expect(divide(-10, 2)).toBe(-5);
      expect(divide(10, -2)).toBe(-5);
    });

    it('should throw error for division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not allowed');
    });

    it('should throw error for non-numbers', () => {
      expect(() => divide('10', 2)).toThrow('Both arguments must be numbers');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(1, 4)).toBe(25);
    });

    it('should calculate percentages greater than 100', () => {
      expect(calculatePercentage(150, 100)).toBe(150);
      expect(calculatePercentage(200, 100)).toBe(200);
    });

    it('should throw error for zero total', () => {
      expect(() => calculatePercentage(50, 0)).toThrow('Total cannot be zero');
    });

    it('should throw error for non-numbers', () => {
      expect(() => calculatePercentage('50', 100)).toThrow('Both arguments must be numbers');
    });
  });

  describe('roundToDecimals', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimals(3.14159, 2)).toBe(3.14);
      expect(roundToDecimals(10.567, 1)).toBe(10.6);
      expect(roundToDecimals(5.12345, 3)).toBe(5.123);
    });

    it('should use default of 2 decimal places', () => {
      expect(roundToDecimals(3.14159)).toBe(3.14);
      expect(roundToDecimals(10.567)).toBe(10.57);
    });

    it('should round to whole numbers', () => {
      expect(roundToDecimals(3.6, 0)).toBe(4);
      expect(roundToDecimals(3.4, 0)).toBe(3);
    });

    it('should throw error for non-numbers', () => {
      expect(() => roundToDecimals('3.14', 2)).toThrow('Both arguments must be numbers');
      expect(() => roundToDecimals(3.14, '2')).toThrow('Both arguments must be numbers');
    });
  });
});
