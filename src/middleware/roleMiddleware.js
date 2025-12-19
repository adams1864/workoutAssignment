const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware factory to check if user has required role
 * Usage: requireRole('TRAINER') or requireRole(['TRAINER', 'CLIENT'])
 */
const requireRole = (roles) => {
  // Normalize to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    try {
      // User should be attached by authenticate middleware
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = requireRole;
