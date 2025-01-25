import api from '@/config/axios'

export default class BaseService {
  constructor(resource) {
    this.resource = resource
  }

  async getAll(params = {}) {
    try {
      const response = await api.get(this.resource, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async get(id) {
    try {
      const response = await api.get(`${this.resource}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  handleError(error) {
    return {
      message: error.response?.data?.message || 'Произошла ошибка',
      status: error.response?.status,
      data: error.response?.data
    }
  }
} 