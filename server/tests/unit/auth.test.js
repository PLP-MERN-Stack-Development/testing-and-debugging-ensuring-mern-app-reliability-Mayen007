/**
 * Unit tests for authentication middleware
 */
const {
  authenticateToken,
  optionalAuth,
  verifyToken,
} = require('../../src/middleware/auth');

describe('Authentication Middleware', () => {
  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = 'Bearer_user123';
      const result = verifyToken(token);

      expect(result).not.toBeNull();
      expect(result.id).toBe('user123');
    });

    it('should return null for invalid token', () => {
      expect(verifyToken('invalid')).toBeNull();
      expect(verifyToken('Bearer user123')).toBeNull();
    });

    it('should return null for missing token', () => {
      expect(verifyToken(null)).toBeNull();
      expect(verifyToken(undefined)).toBeNull();
      expect(verifyToken('')).toBeNull();
    });
  });

  describe('authenticateToken', () => {
    it('should allow request with valid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer Bearer_user123',
        },
      };
      const res = {};
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'No token provided',
          statusCode: 401,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Invalid token',
          statusCode: 403,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer Bearer_user456',
        },
      };
      const res = {};
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(req.user.id).toBe('user456');
    });
  });

  describe('optionalAuth', () => {
    it('should add user to request if valid token provided', () => {
      const req = {
        headers: {
          authorization: 'Bearer Bearer_user123',
        },
      };
      const res = {};
      const next = jest.fn();

      optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should allow request without token', () => {
      const req = {
        headers: {},
      };
      const res = {};
      const next = jest.fn();

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should not add user if invalid token provided', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid',
        },
      };
      const res = {};
      const next = jest.fn();

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should always call next middleware', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
