const logger = require('../config/logger');

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error with context
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl || req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user._id : 'unauthenticated',
    ip: req.ip || req.connection.remoteAddress,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files. Maximum is 1 file.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Express-validator errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    const errors = err.array();
    message = errors.map(e => e.msg).join(', ');
  }

  // Prepare error response
  const errorResponse = {
    error: message,
    statusCode,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      isOperational: err.isOperational,
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Unhandled Rejection Handler
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
      promise,
      reason: reason.stack || reason,
    });
    // Optional: Exit process with failure
    // process.exit(1);
  });
};

/**
 * Uncaught Exception Handler
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });
    // Exit process - uncaught exceptions require restart
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  // Export error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
};
