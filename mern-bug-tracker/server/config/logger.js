const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: format,
  }),

  // Combined log file
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: format,
  }),

  // HTTP log file
  new DailyRotateFile({
    filename: path.join('logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d',
    format: format,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for structured logging
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logRequest = (req, statusCode, responseTime) => {
  logger.http({
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress,
  });
};

logger.logWarning = (message, context = {}) => {
  logger.warn({
    message,
    ...context,
  });
};

logger.logInfo = (message, context = {}) => {
  logger.info({
    message,
    ...context,
  });
};

logger.logDebug = (message, context = {}) => {
  logger.debug({
    message,
    ...context,
  });
};

module.exports = logger;
