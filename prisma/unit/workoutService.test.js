const workoutService = require('../../../src/services/workoutService');
const prisma = require('../../../src/config/database');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../../src/utils/errors');

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  workout: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  workoutAssignment: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn()
  }
}));

describe('WorkoutService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkout', () => {
    it('should successfully create a workout', async () => {
      const mockWorkout = {
        id: '1',
        name: 'Test Workout',
        description: 'Test Description',
        trainerId: 'trainer123',
        trainer: {
          id: 'trainer123',
          email: 'trainer@example.com',
          role: 'TRAINER'
        }
      };

      prisma.workout.create.mockResolvedValue(mockWorkout);

      const result = await workoutService.createWorkout(
        'Test Workout',
        'Test Description',
        'trainer123'
      );

      expect(result).toEqual(mockWorkout);
      expect(prisma.workout.create).toHaveBeenCalled();
    });
  });

  describe('getTrainerWorkouts', () => {
    it('should return paginated workouts with search', async () => {
      const mockWorkouts = [
        { id: '1', name: 'Cardio HIIT', _count: { assignments: 2 } },
        { id: '2', name: 'Strength Training', _count: { assignments: 1 } }
      ];

      prisma.workout.findMany.mockResolvedValue(mockWorkouts);
      prisma.workout.count.mockResolvedValue(2);

      const result = await workoutService.getTrainerWorkouts('trainer123', 1, 10, 'cardio');

      expect(result.workouts).toEqual(mockWorkouts);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('assignWorkout', () => {
    it('should successfully assign workout to client', async () => {
      const mockWorkout = {
        id: 'workout123',
        trainerId: 'trainer123'
      };

      const mockClient = {
        id: 'client123',
        role: 'CLIENT'
      };

      const mockAssignment = {
        id: 'assignment123',
        workoutId: 'workout123',
        clientId: 'client123',
        status: 'PENDING'
      };

      prisma.workout.findUnique.mockResolvedValue(mockWorkout);
      prisma.user.findUnique.mockResolvedValue(mockClient);
      prisma.workoutAssignment.findUnique.mockResolvedValue(null);
      prisma.workoutAssignment.create.mockResolvedValue(mockAssignment);

      const result = await workoutService.assignWorkout(
        'workout123',
        'client123',
        'trainer123'
      );

      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundError if workout does not exist', async () => {
      prisma.workout.findUnique.mockResolvedValue(null);

      await expect(
        workoutService.assignWorkout('workout123', 'client123', 'trainer123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if trainer does not own workout', async () => {
      const mockWorkout = {
        id: 'workout123',
        trainerId: 'differentTrainer'
      };

      prisma.workout.findUnique.mockResolvedValue(mockWorkout);

      await expect(
        workoutService.assignWorkout('workout123', 'client123', 'trainer123')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ConflictError if workout already assigned', async () => {
      const mockWorkout = {
        id: 'workout123',
        trainerId: 'trainer123'
      };

      const mockClient = {
        id: 'client123',
        role: 'CLIENT'
      };

      const mockExistingAssignment = {
        id: 'existing123'
      };

      prisma.workout.findUnique.mockResolvedValue(mockWorkout);
      prisma.user.findUnique.mockResolvedValue(mockClient);
      prisma.workoutAssignment.findUnique.mockResolvedValue(mockExistingAssignment);

      await expect(
        workoutService.assignWorkout('workout123', 'client123', 'trainer123')
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getClientWorkouts', () => {
    it('should return all assignments for a client', async () => {
      const mockAssignments = [
        {
          id: '1',
          workout: {
            id: 'workout1',
            name: 'Cardio',
            trainer: { id: 'trainer1', email: 'trainer@example.com' }
          }
        }
      ];

      prisma.workoutAssignment.findMany.mockResolvedValue(mockAssignments);

      const result = await workoutService.getClientWorkouts('client123');

      expect(result).toEqual(mockAssignments);
      expect(prisma.workoutAssignment.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client123' },
        orderBy: { assignedDate: 'desc' },
        include: expect.any(Object)
      });
    });
  });
});
