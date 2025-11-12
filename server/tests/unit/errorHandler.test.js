/**
 * Unit tests for error handling middleware
 */
const {
  errorHandler,
  validationErrorHandler,
  notFoundHandler,
  requestLogger,
} = require('../../src/middleware/errorHandler');

describe('Error Handling Middleware', () => {
  describe('errorHandler', () => {
    it('should handle errors with custom status code', () => {
      const err = new Error('Custom error');
      err.statusCode = 400;

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Custom error',
          statusCode: 400,
        },
      });
    });

    it('should default to 500 status code', () => {
      const err = new Error('Server error');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should use default message if not provided', () => {
      const err = {};
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
        },
      });
    });
  });

  describe('validationErrorHandler', () => {
    it('should handle validation errors', () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validationErrorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation failed',
          details: 'Validation failed',
        },
      });
    });

    it('should pass non-validation errors to next middleware', () => {
      const err = new Error('Other error');
      const req = {};
      const res = {};
      const next = jest.fn();

      validationErrorHandler(err, req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 response', () => {
      const req = { method: 'GET', url: '/invalid' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Route not found',
          statusCode: 404,
        },
      });
    });
  });

  describe('requestLogger', () => {
    it('should log request details', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const req = { method: 'GET', url: '/test' };
      const res = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        }),
        statusCode: 200,
      };
      const next = jest.fn();

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should call next middleware', () => {
      const req = {};
      const res = { on: jest.fn() };
      const next = jest.fn();

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
