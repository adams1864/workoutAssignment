const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');
const bcrypt = require('bcryptjs');

describe('Workout Integration Tests', () => {
  let trainerToken;
  let trainerId;
  let clientToken;
  let clientId;

  beforeEach(async () => {
    // Clean database
    await prisma.workoutAssignment.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.user.deleteMany();

    // Create trainer
    const trainer = await prisma.user.create({
      data: {
        email: 'trainer@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'TRAINER'
      }
    });
    trainerId = trainer.id;

    // Create client
    const client = await prisma.user.create({
      data: {
        email: 'client@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'CLIENT'
      }
    });
    clientId = client.id;

    // Login to get tokens
    const trainerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'trainer@example.com', password: 'password123' });
    trainerToken = trainerLogin.body.data.token;

    const clientLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@example.com', password: 'password123' });
    clientToken = clientLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/workouts', () => {
    it('should allow trainer to create workout', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'Full Body Workout',
          description: 'A complete body workout'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.workout.name).toBe('Full Body Workout');
    });

    it('should return 403 when client tries to create workout', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Test Workout',
          description: 'Test'
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .send({
          name: 'Test Workout',
          description: 'Test'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid workout data', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'AB', // Too short
          description: 'Test'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      // Create test workouts
      await prisma.workout.createMany({
        data: [
          { name: 'Cardio HIIT', description: 'High intensity', trainerId },
          { name: 'Strength Training', description: 'Muscle building', trainerId },
          { name: 'Yoga Session', description: 'Flexibility', trainerId }
        ]
      });
    });

    it('should return all workouts for trainer with pagination', async () => {
      const response = await request(app)
        .get('/api/workouts?page=1&limit=10')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.workouts).toHaveLength(3);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter workouts by search query', async () => {
      const response = await request(app)
        .get('/api/workouts?search=cardio')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.workouts).toHaveLength(1);
      expect(response.body.data.workouts[0].name).toContain('Cardio');
    });

    it('should return 403 when client tries to access trainer workouts', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/workouts/:id/assign', () => {
    let workoutId;

    beforeEach(async () => {
      const workout = await prisma.workout.create({
        data: {
          name: 'Test Workout',
          description: 'Test',
          trainerId
        }
      });
      workoutId = workout.id;
    });

    it('should allow trainer to assign workout to client', async () => {
      const response = await request(app)
        .post(`/api/workouts/${workoutId}/assign`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ clientId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignment.status).toBe('PENDING');
    });

    it('should return 409 for duplicate assignment', async () => {
      // First assignment
      await request(app)
        .post(`/api/workouts/${workoutId}/assign`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ clientId });

      // Duplicate assignment
      const response = await request(app)
        .post(`/api/workouts/${workoutId}/assign`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ clientId });

      expect(response.status).toBe(409);
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .post('/api/workouts/00000000-0000-0000-0000-000000000000/assign')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ clientId });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/workouts/my-workouts', () => {
    beforeEach(async () => {
      // Create workout and assign to client
      const workout = await prisma.workout.create({
        data: {
          name: 'Assigned Workout',
          description: 'Test',
          trainerId
        }
      });

      await prisma.workoutAssignment.create({
        data: {
          workoutId: workout.id,
          clientId,
          status: 'PENDING'
        }
      });
    });

    it('should return assigned workouts for client', async () => {
      const response = await request(app)
        .get('/api/workouts/my-workouts')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignments).toHaveLength(1);
      expect(response.body.data.assignments[0].workout.name).toBe('Assigned Workout');
    });

    it('should return 403 when trainer tries to access client workouts', async () => {
      const response = await request(app)
        .get('/api/workouts/my-workouts')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/workouts/my-workouts');

      expect(response.status).toBe(401);
    });
  });
});
