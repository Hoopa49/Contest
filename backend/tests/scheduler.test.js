const request = require('supertest');
const app = require('../index');
const { state } = require('../services/schedulerState');

describe('Scheduler API', () => {
  test('Should start scheduler', async () => {
    const response = await request(app)
      .post('/api/scheduler/start')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(state.isRunning).toBe(true);
  });

  test('Should stop scheduler', async () => {
    const response = await request(app)
      .post('/api/scheduler/stop')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(state.isRunning).toBe(false);
  });
}); 