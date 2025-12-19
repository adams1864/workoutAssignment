const authService = require('../services/authService');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user info to req.user for downstream use
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token and get payload
    const decoded = authService.verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
