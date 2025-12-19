const workoutService = require('../services/workoutService');
const logger = require('../config/logger');

class WorkoutController {
  /**
   * POST /workouts
   * Create a new workout (trainer only)
   */
  async createWorkout(req, res, next) {
    try {
      const { name, description } = req.body;
      const trainerId = req.user.userId;

      const workout = await workoutService.createWorkout(name, description, trainerId);

      logger.info(`Workout created: ${workout.name} by trainer ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Workout created successfully',
        data: { workout }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /workouts
   * Get all workouts for logged-in trainer with pagination and search
   */
  async getWorkouts(req, res, next) {
    try {
      const trainerId = req.user.userId;
      const { page, limit, search } = req.query;

      const result = await workoutService.getTrainerWorkouts(
        trainerId,
        page,
        limit,
        search
      );

      res.status(200).json({
        success: true,
        message: 'Workouts retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /workouts/:id/assign
   * Assign a workout to a client (trainer only)
   */
  async assignWorkout(req, res, next) {
    try {
      const workoutId = req.params.id;
      const { clientId } = req.body;
      const trainerId = req.user.userId;

      const assignment = await workoutService.assignWorkout(
        workoutId,
        clientId,
        trainerId
      );

      logger.info(
        `Workout ${workoutId} assigned to client ${clientId} by trainer ${req.user.email}`
      );

      res.status(201).json({
        success: true,
        message: 'Workout assigned successfully',
        data: { assignment }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /my-workouts
   * Get all workouts assigned to logged-in client
   */
  async getMyWorkouts(req, res, next) {
    try {
      const clientId = req.user.userId;

      const assignments = await workoutService.getClientWorkouts(clientId);

      res.status(200).json({
        success: true,
        message: 'Assigned workouts retrieved successfully',
        data: { assignments }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkoutController();
