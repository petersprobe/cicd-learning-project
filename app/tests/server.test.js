const request = require('supertest');
const app = require('../server');

describe('Server API Tests', () => {

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome to CI/CD Learning App!');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.status).toBe('running');
    });

    it('should have correct content type', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return valid JSON structure', async () => {
      const response = await request(app).get('/');
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp instanceof Date).toBe(true);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return recent timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      const now = new Date();
      const diffInSeconds = Math.abs((now - timestamp) / 1000);
      expect(diffInSeconds).toBeLessThan(5); // Should be within 5 seconds
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

    it('should return correct user structure', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      
      users.forEach(user => {
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(user.name.length).toBeGreaterThan(0);
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Basic email validation
      });
    });

    it('should return specific users', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      
      const johnDoe = users.find(user => user.name === 'John Doe');
      const janeSmith = users.find(user => user.name === 'Jane Smith');
      
      expect(johnDoe).toBeDefined();
      expect(janeSmith).toBeDefined();
      expect(johnDoe.email).toBe('john@example.com');
      expect(janeSmith.email).toBe('jane@example.com');
    });

    it('should have unique user IDs', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      const userIds = users.map(user => user.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(userIds.length);
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
      expect(typeof response.body.id).toBe('number');
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

    it('should return 400 for empty name', async () => {
      const userData = {
        name: '',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 for empty email', async () => {
      const userData = {
        name: 'Test User',
        email: ''
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 for null values', async () => {
      const userData = {
        name: null,
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 for undefined values', async () => {
      const userData = {
        name: undefined,
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 for empty object', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should handle whitespace in name', async () => {
      const userData = {
        name: '  Test User  ',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(userData.name);
    });

    it('should handle special characters in name', async () => {
      const userData = {
        name: 'José María O\'Connor',
        email: 'jose@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(userData.name);
    });

    it('should handle various email formats', async () => {
      const testEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com'
      ];

      for (const email of testEmails) {
        const userData = {
          name: 'Test User',
          email: email
        };

        const response = await request(app)
          .post('/api/users')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.email).toBe(email);
      }
    });

    it('should generate unique IDs for multiple users', async () => {
      const userData1 = { name: 'User 1', email: 'user1@example.com' };
      const userData2 = { name: 'User 2', email: 'user2@example.com' };

      const response1 = await request(app).post('/api/users').send(userData1);
      const response2 = await request(app).post('/api/users').send(userData2);

      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });

  describe('Request Validation', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"name": "Test", "email": "test@example.com"');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Something went wrong!');
    });

    it('should handle non-JSON content type', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'text/plain')
        .send('name=Test&email=test@example.com');

      expect(response.status).toBe(400);
    });

    it('should handle large payloads', async () => {
      const largeName = 'A'.repeat(1000);
      const userData = {
        name: largeName,
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(largeName);
    });
  });

  describe('HTTP Methods', () => {
    it('should reject PUT requests to /api/users', async () => {
      const response = await request(app)
        .put('/api/users')
        .send({ name: 'Test', email: 'test@example.com' });

      expect(response.status).toBe(404);
    });

    it('should reject DELETE requests to /api/users', async () => {
      const response = await request(app).delete('/api/users');

      expect(response.status).toBe(404);
    });

    it('should reject PATCH requests to /api/users', async () => {
      const response = await request(app)
        .patch('/api/users')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should return 404 for nested non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should return 404 for POST to non-existent routes', async () => {
      const response = await request(app)
        .post('/non-existent')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });

    it('should respond quickly to health check', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Test that the error handler responds correctly
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Something went wrong!');
    });
  });
});
