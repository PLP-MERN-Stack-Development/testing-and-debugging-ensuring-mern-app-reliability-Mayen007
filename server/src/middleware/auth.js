/**
 * Authentication middleware
 */

/**
 * Mock JWT verification (for testing purposes)
 * In production, use jsonwebtoken library
 */
const verifyToken = (token) => {
  if (!token) {
    return null;
  }
  
  // Simple mock: check if token starts with 'Bearer_'
  if (token.startsWith('Bearer_')) {
    const userId = token.replace('Bearer_', '');
    return { id: userId };
  }
  
  return null;
};

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'No token provided',
        statusCode: 401,
      },
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({
      error: {
        message: 'Invalid token',
        statusCode: 403,
      },
    });
  }

  req.user = user;
  next();
};

/**
 * Optional authentication middleware
 * Adds user if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  verifyToken,
};
