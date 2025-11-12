/**
 * Unit tests for useLocalStorage hook
 */
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with initial value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should read from localStorage if value exists', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('stored-value');
    });
  });

  describe('Setting Values', () => {
    it('should update state and localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
    });

    it('should handle complex objects', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', {}));
      const obj = { name: 'John', age: 30 };

      act(() => {
        result.current[1](obj);
      });

      expect(result.current[0]).toEqual(obj);
      expect(JSON.parse(localStorage.getItem('test-key'))).toEqual(obj);
    });

    it('should handle arrays', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', []));
      const arr = [1, 2, 3];

      act(() => {
        result.current[1](arr);
      });

      expect(result.current[0]).toEqual(arr);
    });

    it('should accept function as value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage to throw error
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(consoleSpy).toHaveBeenCalled();
      mockSetItem.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Multiple Hooks', () => {
    it('should maintain separate state for different keys', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

      expect(result1.current[0]).toBe('value1');
      expect(result2.current[0]).toBe('value2');

      act(() => {
        result1.current[1]('updated1');
      });

      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });
});
