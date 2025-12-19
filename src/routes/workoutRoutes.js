const express = require('express');
const workoutController = require('../controllers/workoutController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  createWorkoutSchema,
  assignWorkoutSchema,
  workoutQuerySchema
} = require('../validators/workoutValidator');

const router = express.Router();

/**
 * @route   POST /workouts
 * @desc    Create a new workout
 * @access  Private (Trainer only)
 */
router.post(
  '/',
  authenticate,
  requireRole('TRAINER'),
  validate(createWorkoutSchema),
  workoutController.createWorkout
);

/**
 * @route   GET /workouts
 * @desc    Get all workouts for logged-in trainer (with pagination and search)
 * @access  Private (Trainer only)
 */
router.get(
  '/',
  authenticate,
  requireRole('TRAINER'),
  validate(workoutQuerySchema, 'query'),
  workoutController.getWorkouts
);

/**
 * @route   POST /workouts/:id/assign
 * @desc    Assign workout to a client
 * @access  Private (Trainer only)
 */
router.post(
  '/:id/assign',
  authenticate,
  requireRole('TRAINER'),
  validate(assignWorkoutSchema),
  workoutController.assignWorkout
);

/**
 * @route   GET /my-workouts
 * @desc    Get all workouts assigned to logged-in client
 * @access  Private (Client only)
 */
router.get(
  '/my-workouts',
  authenticate,
  requireRole('CLIENT'),
  workoutController.getMyWorkouts
);

module.exports = router;
