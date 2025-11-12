/**
 * Test utilities for server-side testing
 * Helper functions for creating test data and mocking
 */
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for testing
 */
const generateTestToken = (userId, expiresIn = '1h') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn }
  );
};

/**
 * Create a mock user object
 */
const createMockUser = (overrides = {}) => {
  return {
    _id: require('mongoose').Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Create a mock post object
 */
const createMockPost = (overrides = {}) => {
  return {
    _id: require('mongoose').Types.ObjectId(),
    title: 'Test Post',
    content: 'Test content',
    author: require('mongoose').Types.ObjectId(),
    category: require('mongoose').Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

module.exports = {
  generateTestToken,
  createMockUser,
  createMockPost,
};
