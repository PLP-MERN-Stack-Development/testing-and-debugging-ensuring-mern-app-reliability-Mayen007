const { authenticateToken } = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', async () => {
      req.headers.authorization = '';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header is missing', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid (no Bearer prefix)', async () => {
      req.headers.authorization = 'InvalidToken123';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if JWT verification fails', async () => {
      const token = 'Bearer invalid.token.here';
      req.headers.authorization = token;
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      const token = 'Bearer expired.token.here';
      req.headers.authorization = token;
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found in database', async () => {
      const token = 'Bearer valid.token.here';
      const decoded = { userId: '507f1f77bcf86cd799439011' };
      req.headers.authorization = token;
      jwt.verify.mockReturnValue(decoded);
      User.findById.mockResolvedValue(null);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token - user not found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with authenticated user when token is valid', async () => {
      const token = 'Bearer valid.token.here';
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, username: 'testuser', email: 'test@example.com' };
      const decoded = { userId };

      req.headers.authorization = token;
      jwt.verify.mockReturnValue(decoded);
      User.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 500 if unexpected error occurs', async () => {
      const token = 'Bearer valid.token.here';
      req.headers.authorization = token;
      jwt.verify.mockReturnValue({ userId: '507f1f77bcf86cd799439011' });
      User.findById.mockRejectedValue(new Error('Database connection failed'));

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle multiple spaces in Authorization header', async () => {
      const token = 'Bearer  valid.token.here';
      req.headers.authorization = token;
      jwt.verify.mockReturnValue({ userId: '507f1f77bcf86cd799439011' });
      User.findById.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

      await authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
    });
  });
});
