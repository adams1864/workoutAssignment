const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user (trainer or client)
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login and receive JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
