const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');
const bcrypt = require('bcryptjs');

describe('Auth Integration Tests', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.workoutAssignment.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new client successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newclient@example.com',
          password: 'password123',
          role: 'CLIENT'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newclient@example.com');
      expect(response.body.data.user.role).toBe('CLIENT');
    });

    it('should register a new trainer successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newtrainer@example.com',
          password: 'password123',
          role: 'TRAINER'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe('TRAINER');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          role: 'CLIENT'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          role: 'CLIENT'
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'CLIENT'
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'CLIENT'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'CLIENT'
        }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('testuser@example.com');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com'
        });

      expect(response.status).toBe(400);
    });
  });
});
