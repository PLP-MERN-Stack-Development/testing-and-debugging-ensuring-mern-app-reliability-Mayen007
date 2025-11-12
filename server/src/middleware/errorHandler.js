/**
 * Error handling middleware
 */

/**
 * Global error handler middleware
 * Catches errors and returns proper error responses
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
};

/**
 * Validation error middleware
 * Handles validation errors specifically
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.message,
      },
    });
  }
  next(err);
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  validationErrorHandler,
  notFoundHandler,
  requestLogger,
};
