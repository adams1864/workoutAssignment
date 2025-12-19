const app = require('./app');
const { config, validateEnv } = require('./config/env');
const logger = require('./config/logger');

// Validate environment variables on startup
try {
  validateEnv();
  logger.info('Environment variables validated successfully');
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
  logger.info(`📊 Health check available at http://localhost:${config.port}/health`);
  logger.info(`🔐 JWT token expiration: ${config.jwt.expiresIn}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
