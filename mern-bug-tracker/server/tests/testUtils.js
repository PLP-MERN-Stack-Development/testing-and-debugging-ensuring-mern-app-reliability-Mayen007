/**
 * Test utility functions for server-side testing
 */

/**
 * Mock next middleware function
 */
export const mockNext = jest.fn();

/**
 * Create mock request object
 */
export const createMockRequest = (overrides = {}) => {
  const mockReq = {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  };
  return mockReq;
};

/**
 * Create mock response object
 */
export const createMockResponse = (overrides = {}) => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    statusCode: 200,
    ...overrides,
  };
  return mockRes;
};

/**
 * Create mock error object
 */
export const createMockError = (message = 'Test error', status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();
};
