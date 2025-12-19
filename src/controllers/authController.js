const authService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  /**
   * POST /auth/register
   * Register a new user (trainer or client)
   */
  async register(req, res, next) {
    try {
      const { email, password, role } = req.body;

      const user = await authService.register(email, password, role);

      logger.info(`New user registered: ${email} (${role})`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login user and receive JWT token
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
