const request = require('supertest');
const app = require('../server');

describe('Utility and Helper Tests', () => {

  describe('Server Configuration', () => {
    it('should have CORS middleware enabled', async () => {
      const response = await request(app).get('/');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should parse JSON requests', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(userData.name);
    });

    it('should serve static files', async () => {
      // Create a test static file
      const fs = require('fs');
      const path = require('path');
      const publicDir = path.join(__dirname, '../public');
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const testFile = path.join(publicDir, 'test.html');
      fs.writeFileSync(testFile, '<html><body>Test</body></html>');

      const response = await request(app).get('/test.html');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test');

      // Clean up
      fs.unlinkSync(testFile);
    });
  });

  describe('Data Validation', () => {
    it('should validate email format in user data', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      
      users.forEach(user => {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(user.email).toMatch(emailRegex);
      });
    });

    it('should ensure user names are not empty', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      
      users.forEach(user => {
        expect(user.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('should ensure user IDs are positive integers', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body;
      
      users.forEach(user => {
        expect(Number.isInteger(user.id)).toBe(true);
        expect(user.id).toBeGreaterThan(0);
      });
    });
  });

  describe('Response Headers', () => {
    it('should set correct content type for JSON responses', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should include CORS headers in all responses', async () => {
      const endpoints = ['/', '/health', '/api/users'];
      
      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['access-control-allow-origin']).toBeDefined();
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing request body gracefully', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toBe(400);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Something went wrong!');
    });

    it('should handle oversized payloads', async () => {
      const largePayload = {
        name: 'A'.repeat(10000),
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(largePayload);

      // Should either accept it or reject it gracefully
      expect([201, 400, 413]).toContain(response.status);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle multiple simultaneous user creations', async () => {
      const userPromises = Array(5).fill().map((_, index) => {
        const userData = {
          name: `User ${index}`,
          email: `user${index}@example.com`
        };
        return request(app).post('/api/users').send(userData);
      });

      const responses = await Promise.all(userPromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('email');
      });

      // All IDs should be unique
      const ids = responses.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should handle concurrent GET requests', async () => {
      const getPromises = Array(10).fill().map(() => 
        request(app).get('/api/users')
      );

      const responses = await Promise.all(getPromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'A'.repeat(1000);
      const userData = {
        name: longName,
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(longName);
    });

    it('should handle special characters in names', async () => {
      const specialNames = [
        'José María',
        'O\'Connor',
        'Jean-Pierre',
        'Müller',
        '李小明',
        'محمد أحمد'
      ];

      for (const name of specialNames) {
        const userData = {
          name: name,
          email: 'test@example.com'
        };

        const response = await request(app)
          .post('/api/users')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe(name);
      }
    });

    it('should handle various email formats', async () => {
      const emailFormats = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example-domain.com'
      ];

      for (const email of emailFormats) {
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
  });

  describe('Performance and Load', () => {
    it('should respond quickly to simple requests', async () => {
      const startTime = Date.now();
      await request(app).get('/health');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should respond within 500ms
    });

    it('should handle rapid successive requests', async () => {
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(request(app).get('/health'));
      }

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Considerations', () => {
    it('should not expose internal server information', async () => {
      const response = await request(app).get('/');
      
      // Should not expose server details
      expect(response.body).not.toHaveProperty('server');
      expect(response.body).not.toHaveProperty('internal');
      expect(response.body).not.toHaveProperty('debug');
    });

    it('should handle potential injection attempts', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(maliciousData);

      // Should either accept it (if properly sanitized) or reject it
      expect([201, 400]).toContain(response.status);
    });
  });
});
