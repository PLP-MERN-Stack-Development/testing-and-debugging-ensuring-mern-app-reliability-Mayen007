// server.js - Main server file for the MERN blog application

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// Import logger and error handlers
const logger = require('./config/logger');
const {
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException
} = require('./middleware/errorHandler');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : [];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging with Morgan and Winston
app.use(morgan('combined', { stream: logger.stream }));

// Request timing middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res.statusCode, responseTime);
  });

  next();
});

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', express.json(), express.urlencoded({ extended: true }), categoryRoutes);
app.use('/api/auth', express.json(), express.urlencoded({ extended: true }), authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MERN Blog API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', { error: err.message, stack: err.stack });
    process.exit(1);
  });
process.exit(1);
});

module.exports = app;