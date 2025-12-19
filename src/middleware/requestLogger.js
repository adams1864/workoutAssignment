const logger = require('../config/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, status, and response time
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      user: req.user?.email || 'anonymous'
    });
  });

  next();
};

module.exports = requestLogger;
