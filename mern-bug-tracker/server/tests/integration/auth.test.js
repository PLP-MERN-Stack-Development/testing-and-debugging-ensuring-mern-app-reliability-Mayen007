// auth.test.js - Integration tests for authentication endpoints
const request = require('supertest');
const app = require('../../server');
const { connect, closeDatabase, clearDatabase } = require('../testDb');
const User = require('../../models/User');

describe('Authentication API Integration Tests', () => {
  // Setup test database before all tests
  beforeAll(async () => {
    await connect();
  });

  // Clear database after each test
  afterEach(async () => {
    await clearDatabase();
  });

  // Close database connection after all tests
  afterAll(async () => {
    await closeDatabase();
    // Give time for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', validUser.name);
      expect(response.body.data).toHaveProperty('email', validUser.email);
      expect(response.body.data).not.toHaveProperty('password');

      // Verify user was saved to database
      const userInDb = await User.findOne({ email: validUser.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe(validUser.name);
      expect(userInDb.email).toBe(validUser.email);
      // Verify password is hashed
      expect(userInDb.password).not.toBe(validUser.password);
    });

    it('should return 409 if user with email already exists', async () => {
      // Create user first
      await request(app).post('/api/auth/register').send(validUser);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User with this email already exists');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        ...validUser,
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0]).toHaveProperty('path', 'email');
    });

    it('should return 400 for password shorter than 6 characters', async () => {
      const invalidUser = {
        ...validUser,
        password: '12345',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('path', 'password');
    });

    it('should return 400 for missing name', async () => {
      const invalidUser = {
        email: validUser.email,
        password: validUser.password,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('path', 'name');
    });

    it('should return 400 for name shorter than 2 characters', async () => {
      const invalidUser = {
        ...validUser,
        name: 'J',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('path', 'name');
    });

    it('should normalize and lowercase email', async () => {
      const userWithUppercase = {
        name: 'John Smith',
        email: 'JOHN.SMITH@EXAMPLE.COM',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userWithUppercase)
        .expect(201);

      expect(response.body.data.email).toBe('john.smith@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    const userCredentials = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/auth/register').send(userCredentials);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email', userCredentials.email);
      expect(response.body.data).toHaveProperty('name', userCredentials.name);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('path', 'email');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should normalize email during login (case insensitive)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'JANE@EXAMPLE.COM',
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data.email).toBe('jane@example.com');
    });
  });

  describe('Authentication Flow', () => {
    it('should allow user to register and then login', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
      };

      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      const registerToken = registerResponse.body.token;
      expect(registerToken).toBeTruthy();

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      const loginToken = loginResponse.body.token;
      expect(loginToken).toBeTruthy();

      // Both tokens should be valid JWT tokens
      expect(typeof registerToken).toBe('string');
      expect(typeof loginToken).toBe('string');
    });
  });
});
