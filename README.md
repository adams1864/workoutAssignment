# Workout Assignment REST API

A production-ready REST API for managing workout assignments between trainers and clients, built with Node.js, Express, PostgreSQL, and Prisma ORM. Features JWT authentication, role-based access control, pagination, comprehensive testing, and full Docker support.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)

---

## ✨ Features

### Core Functionality
- **User Management**: Registration and authentication for trainers and clients
- **Workout Management**: Trainers can create and manage workout programs
- **Assignment System**: Trainers assign workouts to clients with status tracking
- **Role-Based Access Control**: Separate permissions for trainers and clients

### Professional Features
- **JWT Authentication**: Secure token-based authentication (30-minute expiration)
- **Input Validation**: Request validation using Joi schemas
- **Pagination & Search**: Efficient data retrieval with filtering capabilities
- **Rate Limiting**: Protection against API abuse (100 requests per 15 minutes)
- **Request Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling with custom error classes
- **CORS Configuration**: Cross-origin resource sharing support
- **Health Check Endpoint**: Container orchestration support
- **Graceful Shutdown**: Proper cleanup of database connections

---

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                  (Postman, Frontend App)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   CORS   │→ │  Rate    │→ │  Request │→ │   Auth   │  │
│  │          │  │  Limit   │  │  Logger  │  │  (JWT)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     ROUTES LAYER                            │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  /api/auth       │        │  /api/workouts   │          │
│  │  - register      │        │  - create        │          │
│  │  - login         │        │  - list          │          │
│  └──────────────────┘        │  - assign        │          │
│                              │  - my-workouts   │          │
│                              └──────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  VALIDATION LAYER (Joi)                     │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  Auth Schemas    │        │  Workout Schemas │          │
│  └──────────────────┘        └──────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                          │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ AuthController   │        │WorkoutController │          │
│  │ - Handle Request │        │ - Handle Request │          │
│  │ - Send Response  │        │ - Send Response  │          │
│  └──────────────────┘        └──────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│                   (Business Logic)                          │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  AuthService     │        │ WorkoutService   │          │
│  │  - register()    │        │ - createWorkout()│          │
│  │  - login()       │        │ - assignWorkout()│          │
│  │  - verifyToken() │        │ - getWorkouts()  │          │
│  └──────────────────┘        └──────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                PRISMA ORM (Data Access)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Models: User, Workout, WorkoutAssignment   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                        │
│  ┌─────────┐  ┌─────────┐  ┌────────────────────┐         │
│  │  users  │  │workouts │  │workout_assignments │         │
│  └─────────┘  └─────────┘  └────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Decisions

**Layered Architecture**: Separation of concerns with distinct layers (routes → controllers → services → database) improves maintainability and testability.

**Service Layer Pattern**: Business logic is isolated in service classes, making it reusable and easier to test independently of HTTP concerns.

**Custom Error Classes**: Extending the Error class provides consistent error handling and appropriate HTTP status codes throughout the application.

**JWT Strategy**: Stateless authentication with 30-minute token expiration balances security and user experience without requiring refresh token complexity.

**Prisma ORM**: Type-safe database access with automatic migrations and excellent developer experience compared to raw SQL or older ORMs.

---

## 📁 Project Structure

```
workout-assignment-api/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Prisma client instance
│   │   ├── env.js        # Environment validation
│   │   └── logger.js     # Winston logger setup
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   └── workoutController.js
│   ├── middleware/       # Express middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── roleMiddleware.js     # Role-based access
│   │   ├── validate.js           # Joi validation wrapper
│   │   ├── errorHandler.js       # Global error handler
│   │   └── requestLogger.js      # Request logging
│   ├── routes/           # Route definitions
│   │   ├── authRoutes.js
│   │   └── workoutRoutes.js
│   ├── services/         # Business logic
│   │   ├── authService.js
│   │   └── workoutService.js
│   ├── utils/            # Utility functions
│   │   └── errors.js     # Custom error classes
│   ├── validators/       # Joi schemas
│   │   ├── authValidator.js
│   │   └── workoutValidator.js
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data script
├── tests/
│   ├── unit/             # Unit tests
│   │   ├── authService.test.js
│   │   └── workoutService.test.js
│   └── integration/      # Integration tests
│       ├── auth.test.js
│       └── workout.test.js
├── logs/                 # Application logs
├── .env.example          # Environment template
├── .env.test             # Test environment
├── docker-compose.yml    # Docker services
├── Dockerfile            # App container image
├── .dockerignore         # Docker ignore rules
├── jest.config.js        # Jest configuration
├── .eslintrc.json        # ESLint rules
└── package.json          # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker Desktop installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd workoutAssign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configurations (default values work for local development).

4. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d postgres
   ```
   This starts only the database container. Your app runs locally for faster development.

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database** (optional - creates demo users)
   ```bash
   npm run prisma:seed
   ```
   Creates:
   - 2 trainers: `trainer1@example.com`, `trainer2@example.com`
   - 3 clients: `client1@example.com`, `client2@example.com`, `client3@example.com`
   - Password for all: `password123`

7. **Start the development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

8. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "CLIENT"  // or "TRAINER"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CLIENT",
      "createdAt": "2024-12-19T10:30:00.000Z"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CLIENT"
    }
  }
}
```

---

### Workout Endpoints

#### Create Workout (Trainer Only)
```http
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Full Body Strength Training",
  "description": "Complete body workout focusing on compound movements"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": {
    "workout": {
      "id": "uuid",
      "name": "Full Body Strength Training",
      "description": "Complete body workout...",
      "trainerId": "uuid",
      "createdAt": "2024-12-19T10:30:00.000Z"
    }
  }
}
```

#### Get All Workouts (Trainer Only)
```http
GET /api/workouts?page=1&limit=10&search=cardio
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `search`: Filter by workout name (case-insensitive)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Workouts retrieved successfully",
  "data": {
    "workouts": [
      {
        "id": "uuid",
        "name": "Cardio HIIT",
        "description": "High-intensity interval training",
        "trainerId": "uuid",
        "_count": {
          "assignments": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Assign Workout to Client (Trainer Only)
```http
POST /api/workouts/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "client-uuid"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Workout assigned successfully",
  "data": {
    "assignment": {
      "id": "uuid",
      "workoutId": "uuid",
      "clientId": "uuid",
      "status": "PENDING",
      "assignedDate": "2024-12-19T10:30:00.000Z"
    }
  }
}
```

#### Get My Workouts (Client Only)
```http
GET /api/workouts/my-workouts
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Assigned workouts retrieved successfully",
  "data": {
    "assignments": [
      {
        "id": "uuid",
        "status": "IN_PROGRESS",
        "assignedDate": "2024-12-19T10:30:00.000Z",
        "workout": {
          "id": "uuid",
          "name": "Full Body Strength Training",
          "description": "Complete body workout...",
          "trainer": {
            "id": "uuid",
            "email": "trainer@example.com"
          }
        }
      }
    ]
  }
}
```

---

### Health Check

```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "uptime": 3600.5
}
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm test -- --coverage
```

### Test Structure

**Unit Tests** (`tests/unit/`)
- Test individual services in isolation
- Mock Prisma database calls
- Fast execution (no real database)
- Cover: `authService.js`, `workoutService.js`

**Integration Tests** (`tests/integration/`)
- Test complete API endpoints
- Use real test database
- Verify full request/response cycle
- Cover: All API routes with authentication

**Coverage Goals**: 70%+ for branches, functions, lines, and statements

---

## 🐳 Docker Deployment

### Understanding Docker Concepts

**What is Docker?**
Docker packages your application with all its dependencies into a "container" - a lightweight, standalone executable package. This ensures your app runs the same way everywhere (your laptop, colleague's machine, production server).

**Key Docker Concepts**:

1. **Image**: Blueprint for your application (like a class in programming)
   - Created from a `Dockerfile`
   - Contains OS, Node.js, your code, dependencies

2. **Container**: Running instance of an image (like an object)
   - Isolated environment
   - Can start, stop, restart, remove

3. **Volume**: Persistent storage
   - Data survives when container restarts
   - Used for database files, logs

4. **Network**: Allows containers to communicate
   - `app` container talks to `postgres` container
   - Isolated from host network

5. **docker-compose**: Tool to manage multiple containers
   - Define all services in one YAML file
   - Start/stop entire stack with one command

### Development Workflow (Phase 1)

**Run only database in Docker, app locally:**

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate

# Start app locally (easier debugging)
npm run dev
```

**Why this approach?**
- Faster code changes (no rebuild)
- Direct access to logs
- Can use debugger
- Restart instantly

### Production Workflow (Phase 2)

**Run both database and app in Docker:**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

### Dockerfile Explained

```dockerfile
# Use lightweight Alpine Linux with Node.js
FROM node:18-alpine AS base

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl

# Set working directory in container
WORKDIR /app

# Copy package files first (Docker caching optimization)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Expose port 3000
EXPOSE 3000

# Run migrations and start app
CMD ["node", "src/server.js"]
```

**Multi-stage builds** (used in our Dockerfile):
- Reduces final image size
- Separates build dependencies from runtime
- Production image only contains what's needed to run

### Docker Commands Reference

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs for a service
docker-compose logs app
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f app

# Execute command in running container
docker-compose exec app sh

# Restart a service
docker-compose restart app

# Rebuild after code changes
docker-compose up -d --build

# Check database
docker-compose exec postgres psql -U workout_user -d workout_db

# View images
docker images

# Remove unused images
docker image prune
```

### Running Migrations in Docker

```bash
# Execute migration in running container
docker-compose exec app npx prisma migrate deploy

# Seed database in container
docker-compose exec app npm run prisma:seed
```

### Troubleshooting Docker

**Container won't start?**
```bash
docker-compose logs app
```

**Database connection issues?**
- Check DATABASE_URL uses `postgres` as host (not `localhost`)
- Verify postgres container is running: `docker ps`
- Check network: `docker network ls`

**Permission issues?**
```bash
# Reset ownership (Linux/Mac)
sudo chown -R $USER:$USER .
```

**Out of space?**
```bash
docker system prune -a
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://workout_user:workout_pass@localhost:5432/workout_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="30m"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window

# CORS (optional)
CORS_ORIGIN="*"  # In production, set specific domain
```

**Important Notes**:
- **Never commit `.env`** to version control
- Change `JWT_SECRET` in production to a strong random value
- In Docker, `DATABASE_URL` uses `postgres` as hostname (not `localhost`)

---

## 🎯 Demo Script

### Quick Test Workflow

```bash
# 1. Register a trainer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@demo.com","password":"pass123","role":"TRAINER"}'

# 2. Login as trainer (save the token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@demo.com","password":"pass123"}'

# 3. Create a workout (replace TOKEN)
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Morning Cardio","description":"30 min HIIT session"}'

# 4. Register a client
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.com","password":"pass123","role":"CLIENT"}'

# 5. Assign workout to client (replace TOKEN and CLIENT_ID)
curl -X POST http://localhost:3000/api/workouts/WORKOUT_ID/assign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_ID"}'

# 6. Login as client and view workouts
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.com","password":"pass123"}'

curl -X GET http://localhost:3000/api/workouts/my-workouts \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

---

## 🎨 Key Features Explained

### 1. Pagination
Efficiently handles large datasets by returning results in chunks. Prevents memory issues and improves performance.

### 2. Rate Limiting
Protects API from abuse by limiting requests per IP. Returns `429 Too Many Requests` when exceeded.

### 3. Request Logging
All requests logged with timestamp, method, URL, status code, duration, and user. Stored in `logs/` directory.

### 4. Error Handling
- Custom error classes with appropriate HTTP status codes
- Consistent error response format
- Stack traces in development only
- Prisma errors mapped to user-friendly messages

### 5. Role-Based Access Control
- Trainers: Create workouts, view their workouts, assign to clients
- Clients: View only their assigned workouts
- Enforced at middleware level before reaching controllers

---

## 🏆 What Makes This Project Stand Out

### For Hiring Managers

1. **Production-Ready Architecture**: Layered design with clear separation of concerns
2. **Comprehensive Testing**: Both unit and integration tests with 70%+ coverage
3. **Security Best Practices**: JWT authentication, input validation, rate limiting
4. **Scalability**: Pagination, database indexing, efficient queries
5. **DevOps Ready**: Full Docker support, health checks, graceful shutdown
6. **Code Quality**: ESLint configured, consistent error handling, JSDoc comments
7. **Real-World Patterns**: Service layer, custom errors, middleware composition

### Explanation Points for Interviews

**"Walk me through the authentication flow"**
1. User sends credentials to `/api/auth/login`
2. `authController` receives request, passes to `authService`
3. Service queries database via Prisma, verifies password with bcrypt
4. If valid, generates JWT containing user ID and role
5. Token returned to client, stored (localStorage/memory)
6. Subsequent requests include token in Authorization header
7. `authMiddleware` verifies token, attaches user data to `req.user`
8. `roleMiddleware` checks if user role matches required role
9. Request proceeds to controller if authorized

**"Why service layer vs putting logic in controllers?"**
- Controllers handle HTTP concerns (req/res)
- Services contain business logic, reusable across contexts
- Easier to test services independently
- Can call services from CLI scripts, jobs, etc.
- Follows single responsibility principle

**"How does pagination prevent issues?"**
- Without pagination, fetching 10,000 workouts loads all into memory
- Causes slow response times, potential crashes
- Pagination loads only requested page (e.g., 10 items)
- Database uses `SKIP` and `TAKE` for efficient queries
- Reduces bandwidth, improves user experience

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run all tests with coverage
npm run test:watch   # Run tests in watch mode
npm run test:unit    # Run only unit tests
npm run test:integration  # Run only integration tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with demo data
npm run prisma:studio    # Open Prisma Studio (GUI)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Created as a hiring task demonstration - showcasing production-ready REST API development with modern JavaScript, testing, and DevOps practices.

---

## 🙋 FAQ

**Q: Why 30-minute token expiration?**
A: Balances security (limits exposure if stolen) with UX (not too frequent re-login). For better UX, implement refresh tokens.

**Q: Why Prisma over TypeORM or Sequelize?**
A: Type-safe, excellent DX, automatic migrations, active development, great for modern Node.js projects.

**Q: How to deploy to production?**
A: Use Docker with docker-compose, deploy to AWS ECS, Azure Container Instances, DigitalOcean App Platform, or Kubernetes.

**Q: How to add email notifications?**
A: Create email service (Nodemailer/SendGrid), call from workout assignment flow, mock in tests.

**Q: Why no refresh tokens?**
A: Keeps implementation simple for hiring task. Production apps should implement refresh tokens for better UX.

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact [your-email@example.com].
