import request from 'supertest';
import app, { server, closeDatabaseConnection } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const useApiKey = process.env.API_KEY;

afterAll((done) => {
    server.close(() => {
      console.log('Server closed after testing');
      closeDatabaseConnection().then(() => done());
    });
});

describe('Emergency Response API', () => {
  describe('POST /api/panic', () => {
    it('should receive and store a panic request', async () => {
      const res = await request(app)
        .post('/api/panic')
        .set('x-api-key', useApiKey)
        .send({
            user_reporter: "Robin Badakas",
            provider_name: "Internal System",
            severity: "low",
            location: "Potchefstroom",
            details: "Panic is a natural human response to danger, but it's one that severely compounds the risk.",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'success');
    });

    it('should return 403 for missing or invalid API key', async () => {
      const res = await request(app)
        .post('/api/panic')
        .send({
            user_reporter: "Robin Badakas",
            provider_name: "Internal System",
            severity: "low",
            location: "Potchefstroom",
            details: "Panic is a natural human response to danger, but it's one that severely compounds the risk.",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized request!');
    });
  });

  describe('GET /api/panics', () => {
    it('should fetch all panic requests', async () => {
      const res = await request(app).get('/api/panics');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/panic/:id', () => {
    const id = 1; // First record with reference id 1(must be exist)

    it('should fetch all panic requests', async () => {
      const res = await request(app).get(`/api/panic/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Object);
    });
  });

  describe('PUT /api/panic/:id/status', () => {
    const id = 1; // First record with reference id 1(must be exist)

    it('should update the status of a panic request', async () => {
      const res = await request(app)
        .put(`/api/panic/${id}/status`)
        .send({
          status: 'resolved'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Panic request status successfully updated!');
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put(`/api/panic/${id}/status`)
        .send({
          status: 'invalid_status'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid status! Request status must be in the list and have a valid status.');
    });
  });
});