const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method
  });

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    error = new AppError('Duplicate field value entered', 409);
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    error = new AppError('Record not found', 404);
  }

  // Prisma validation error
  if (err.code === 'P2003') {
    error = new AppError('Invalid reference. Related record not found', 400);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.isOperational 
    ? error.message 
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
