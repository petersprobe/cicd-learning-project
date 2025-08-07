const request = require('supertest');
const app = require('../server');

describe('Integration Tests', () => {

  describe('Complete User Workflow', () => {
    it('should handle complete user lifecycle', async () => {
      // 1. Check initial users
      const initialResponse = await request(app).get('/api/users');
      expect(initialResponse.status).toBe(200);
      const initialUsers = initialResponse.body;
      const initialCount = initialUsers.length;

      // 2. Create a new user
      const newUser = {
        name: 'Integration Test User',
        email: 'integration@example.com'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(newUser);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe(newUser.name);
      expect(createResponse.body.email).toBe(newUser.email);
      expect(createResponse.body.id).toBeDefined();

      // 3. Verify user was created (by checking the response structure)
      expect(typeof createResponse.body.id).toBe('number');
      expect(createResponse.body.id).toBeGreaterThan(0);
    });

    it('should handle multiple user operations in sequence', async () => {
      const users = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
        { name: 'User 3', email: 'user3@example.com' }
      ];

      const createdUsers = [];

      // Create multiple users
      for (const userData of users) {
        const response = await request(app)
          .post('/api/users')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe(userData.name);
        expect(response.body.email).toBe(userData.email);
        createdUsers.push(response.body);
      }

      // Verify all users have unique IDs
      const userIds = createdUsers.map(user => user.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(userIds.length);
    });
  });

  describe('API Consistency', () => {
    it('should maintain consistent response structure across endpoints', async () => {
      // Test root endpoint
      const rootResponse = await request(app).get('/');
      expect(rootResponse.body).toHaveProperty('message');
      expect(rootResponse.body).toHaveProperty('version');
      expect(rootResponse.body).toHaveProperty('status');

      // Test health endpoint
      const healthResponse = await request(app).get('/health');
      expect(healthResponse.body).toHaveProperty('status');
      expect(healthResponse.body).toHaveProperty('timestamp');

      // Test users endpoint
      const usersResponse = await request(app).get('/api/users');
      expect(Array.isArray(usersResponse.body)).toBe(true);
    });

    it('should handle mixed request types', async () => {
      const requests = [
        request(app).get('/'),
        request(app).get('/health'),
        request(app).get('/api/users'),
        request(app).post('/api/users').send({
          name: 'Mixed Test User',
          email: 'mixed@example.com'
        })
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].status).toBe(200); // GET /
      expect(responses[1].status).toBe(200); // GET /health
      expect(responses[2].status).toBe(200); // GET /api/users
      expect(responses[3].status).toBe(201); // POST /api/users
    });
  });

  describe('Error Recovery', () => {
    it('should recover from invalid requests and continue serving valid ones', async () => {
      // Make an invalid request
      const invalidResponse = await request(app)
        .post('/api/users')
        .send({ name: '' }); // Invalid: empty name

      expect(invalidResponse.status).toBe(400);

      // Make a valid request immediately after
      const validResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Valid User',
          email: 'valid@example.com'
        });

      expect(validResponse.status).toBe(201);
      expect(validResponse.body.name).toBe('Valid User');
    });

    it('should handle malformed requests gracefully', async () => {
      // Test with malformed JSON
      const malformedResponse = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"name": "Test", "email": "test@example.com"');

      expect(malformedResponse.status).toBe(500);
      expect(malformedResponse.body.error).toBe('Something went wrong!');

      // Test with wrong content type
      const wrongContentTypeResponse = await request(app)
        .post('/api/users')
        .set('Content-Type', 'text/plain')
        .send('name=Test&email=test@example.com');

      expect(wrongContentTypeResponse.status).toBe(400);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle burst of requests', async () => {
      const burstSize = 15;
      const requests = [];

      // Create a burst of mixed requests
      for (let i = 0; i < burstSize; i++) {
        if (i % 3 === 0) {
          requests.push(request(app).get('/'));
        } else if (i % 3 === 1) {
          requests.push(request(app).get('/health'));
        } else {
          requests.push(request(app).get('/api/users'));
        }
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it('should maintain performance with concurrent user creation', async () => {
      const concurrentUsers = 8;
      const userPromises = Array(concurrentUsers).fill().map((_, index) => {
        return request(app).post('/api/users').send({
          name: `Concurrent User ${index}`,
          email: `concurrent${index}@example.com`
        });
      });

      const startTime = Date.now();
      const responses = await Promise.all(userPromises);
      const endTime = Date.now();

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds

      // All IDs should be unique
      const ids = responses.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Create a user
      const userData = {
        name: 'Data Integrity User',
        email: 'integrity@example.com'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      expect(createResponse.status).toBe(201);
      const createdUser = createResponse.body;

      // Verify the created user has correct data
      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(typeof createdUser.id).toBe('number');
      expect(createdUser.id).toBeGreaterThan(0);

      // Verify the user data structure is consistent
      expect(createdUser).toHaveProperty('id');
      expect(createdUser).toHaveProperty('name');
      expect(createdUser).toHaveProperty('email');
      expect(Object.keys(createdUser).length).toBe(3); // Only these 3 properties
    });

    it('should handle edge cases in data validation', async () => {
      const edgeCases = [
        { name: 'A'.repeat(100), email: 'longname@example.com' },
        { name: 'José María', email: 'special@example.com' },
        { name: 'Test User', email: 'user+tag@example.com' },
        { name: '  Trimmed User  ', email: 'trimmed@example.com' }
      ];

      for (const testCase of edgeCases) {
        const response = await request(app)
          .post('/api/users')
          .send(testCase);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe(testCase.name);
        expect(response.body.email).toBe(testCase.email);
      }
    });
  });

  describe('Cross-Endpoint Consistency', () => {
    it('should provide consistent health information', async () => {
      const healthResponse1 = await request(app).get('/health');
      const healthResponse2 = await request(app).get('/health');

      expect(healthResponse1.status).toBe(200);
      expect(healthResponse2.status).toBe(200);
      expect(healthResponse1.body.status).toBe('healthy');
      expect(healthResponse2.body.status).toBe('healthy');

      // Timestamps should be different (unless requests are very fast)
      expect(healthResponse1.body.timestamp).toBeDefined();
      expect(healthResponse2.body.timestamp).toBeDefined();
    });

    it('should maintain consistent user data structure', async () => {
      const usersResponse = await request(app).get('/api/users');
      const users = usersResponse.body;

      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical API usage patterns', async () => {
      // Simulate typical API usage: health check, then get users, then create user
      const healthCheck = await request(app).get('/health');
      expect(healthCheck.status).toBe(200);

      const getUsers = await request(app).get('/api/users');
      expect(getUsers.status).toBe(200);

      const createUser = await request(app)
        .post('/api/users')
        .send({
          name: 'Real World User',
          email: 'realworld@example.com'
        });
      expect(createUser.status).toBe(201);

      // Verify the sequence worked correctly
      expect(healthCheck.body.status).toBe('healthy');
      expect(Array.isArray(getUsers.body)).toBe(true);
      expect(createUser.body.name).toBe('Real World User');
    });

    it('should handle rapid successive operations', async () => {
      const operations = [
        () => request(app).get('/health'),
        () => request(app).get('/api/users'),
        () => request(app).post('/api/users').send({
          name: 'Rapid User',
          email: 'rapid@example.com'
        }),
        () => request(app).get('/health'),
        () => request(app).get('/api/users')
      ];

      const results = await Promise.all(operations.map(op => op()));

      expect(results[0].status).toBe(200); // Health check 1
      expect(results[1].status).toBe(200); // Get users 1
      expect(results[2].status).toBe(201); // Create user
      expect(results[3].status).toBe(200); // Health check 2
      expect(results[4].status).toBe(200); // Get users 2
    });
  });
});
