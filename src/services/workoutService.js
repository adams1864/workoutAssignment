const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

class WorkoutService {
  /**
   * Create a new workout (trainer only)
   * Associates workout with the trainer who created it
   */
  async createWorkout(name, description, trainerId) {
    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        trainerId
      },
      include: {
        trainer: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    return workout;
  }

  /**
   * Get all workouts for a specific trainer with pagination and search
   * Supports filtering by workout name
   */
  async getTrainerWorkouts(trainerId, page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      trainerId
    };

    // Add search filter if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive' // Case-insensitive search
      };
    }

    // Get workouts with pagination
    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { assignments: true }
          }
        }
      }),
      prisma.workout.count({ where })
    ]);

    return {
      workouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Assign a workout to a client (trainer only)
   * Prevents duplicate assignments
   */
  async assignWorkout(workoutId, clientId, trainerId) {
    // Verify workout exists and belongs to this trainer
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    if (workout.trainerId !== trainerId) {
      throw new ForbiddenError('You can only assign your own workouts');
    }

    // Verify client exists and is actually a client
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    if (client.role !== 'CLIENT') {
      throw new ForbiddenError('Can only assign workouts to clients');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.workoutAssignment.findUnique({
      where: {
        workoutId_clientId: {
          workoutId,
          clientId
        }
      }
    });

    if (existingAssignment) {
      throw new ConflictError('Workout already assigned to this client');
    }

    // Create assignment
    const assignment = await prisma.workoutAssignment.create({
      data: {
        workoutId,
        clientId,
        status: 'PENDING'
      },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        client: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return assignment;
  }

  /**
   * Get all workouts assigned to a specific client
   * Returns assignments with workout details
   */
  async getClientWorkouts(clientId) {
    const assignments = await prisma.workoutAssignment.findMany({
      where: { clientId },
      orderBy: { assignedDate: 'desc' },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            description: true,
            trainer: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    return assignments;
  }
}

module.exports = new WorkoutService();
