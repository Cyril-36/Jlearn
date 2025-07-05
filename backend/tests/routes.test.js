const request = require('supertest');
const express = require('express');
const challengesRouter = require('../routes/challenges');

const app = express();
app.use(express.json());
app.use('/api', challengesRouter);

describe('Challenge Routes', () => {
  test('GET /api/challenges returns list', async () => {
    const res = await request(app).get('/api/challenges');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/challenge/:id returns single challenge', async () => {
    const res = await request(app).get('/api/challenge/U1T1P001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'U1T1P001');
  });
});
