import React from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function that wraps components with necessary providers
 * Can be extended to include Redux Provider, Router, etc.
 */
export const renderWithProviders = (component, options = {}) => {
  return render(component, { ...options });
};

/**
 * Utility to create mock API responses
 */
export const createMockResponse = (data, status = 200) => {
  return Promise.resolve({
    status,
    data,
  });
};

/**
 * Utility to create mock errors
 */
export const createMockError = (message, status = 500) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };
  return Promise.reject(error);
};

export * from '@testing-library/react';
