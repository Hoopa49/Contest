import api from './backendApi';

export const schedulerService = {
  async getStatus() {
    const response = await api.get('/api/scheduler/status');
    return response.data;
  },

  async startScheduler() {
    const response = await api.post('/api/scheduler/start');
    return response.data;
  }
};