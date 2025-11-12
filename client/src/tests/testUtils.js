/**
 * Custom render function for React Testing Library
 * Wraps components with common providers (context, redux, etc.)
 */
import React from 'react';
import { render as rtlRender } from '@testing-library/react';

// Custom render function that can wrap providers
function render(ui, options = {}) {
  return rtlRender(ui, { ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { render };
