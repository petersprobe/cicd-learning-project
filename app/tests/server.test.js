const request = require('supertest');
const app = require('../server');

describe('Server API Tests', () => {

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome to CI/CD Learning App!');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
    });

    it('should return 400 for missing name', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 for missing email', async () => {
      const userData = {
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});
