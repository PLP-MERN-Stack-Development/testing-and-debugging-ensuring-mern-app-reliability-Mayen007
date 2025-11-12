/**
 * Unit tests for useForm hook
 * Tests form state management and handlers
 */
import { renderHook, act } from '@testing-library/react';
import useForm from '../../hooks/useForm';

describe('useForm Hook', () => {
  describe('Initialization', () => {
    it('should initialize with provided values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(initialValues));

      expect(result.current.values).toEqual(initialValues);
    });

    it('should initialize with empty errors and touched', () => {
      const { result } = renderHook(() => useForm({ name: '' }));

      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });

    it('should initialize isSubmitting as false', () => {
      const { result } = renderHook(() => useForm({}));

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleChange', () => {
    it('should update values when field changes', () => {
      const { result } = renderHook(() => useForm({ name: '', email: '' }));

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John' },
        });
      });

      expect(result.current.values.name).toBe('John');
    });

    it('should handle multiple field changes', () => {
      const { result } = renderHook(() => useForm({ name: '', email: '' }));

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'john@example.com' },
        });
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.values.email).toBe('john@example.com');
    });
  });

  describe('handleBlur', () => {
    it('should mark field as touched', () => {
      const { result } = renderHook(() => useForm({ name: '' }));

      act(() => {
        result.current.handleBlur({ target: { name: 'name' } });
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('should handle multiple fields touched', () => {
      const { result } = renderHook(() => useForm({ name: '', email: '' }));

      act(() => {
        result.current.handleBlur({ target: { name: 'name' } });
        result.current.handleBlur({ target: { name: 'email' } });
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });
  });

  describe('setFieldValue', () => {
    it('should set specific field value', () => {
      const { result } = renderHook(() => useForm({ name: 'John', email: '' }));

      act(() => {
        result.current.setFieldValue('name', 'Jane');
      });

      expect(result.current.values.name).toBe('Jane');
      expect(result.current.values.email).toBe('');
    });
  });

  describe('setFieldError', () => {
    it('should set field error', () => {
      const { result } = renderHook(() => useForm({ name: '' }));

      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.errors.name).toBe('Name is required');
    });
  });

  describe('resetForm', () => {
    it('should reset values to initial state', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(initialValues));

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jane' },
        });
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
    });

    it('should clear errors and touched on reset', () => {
      const { result } = renderHook(() => useForm({ name: '' }));

      act(() => {
        result.current.setFieldError('name', 'Error');
        result.current.handleBlur({ target: { name: 'name' } });
        result.current.resetForm();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('handleSubmit', () => {
    it('should call onSubmit with form values', async () => {
      const onSubmit = jest.fn();
      const initialValues = { name: 'John' };
      const { result } = renderHook(() => useForm(initialValues, onSubmit));

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: jest.fn(),
        });
      });

      expect(onSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('should set isSubmitting during submission', async () => {
      const onSubmit = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );
      const { result } = renderHook(() => useForm({}, onSubmit));

      let isSubmittingDuringCall = false;

      await act(async () => {
        const submitPromise = result.current.handleSubmit({
          preventDefault: jest.fn(),
        });
        isSubmittingDuringCall = result.current.isSubmitting;
        await submitPromise;
      });

      expect(isSubmittingDuringCall).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const onSubmit = jest.fn(() => Promise.reject(error));
      const { result } = renderHook(() => useForm({}, onSubmit));

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: jest.fn(),
        });
      });

      expect(result.current.errors.submit).toBe('Submission failed');
    });
  });
});
