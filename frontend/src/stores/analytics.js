import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/utils/axios'

export const useAnalyticsStore = defineStore('analytics', () => {
  // Состояние
  const analyticsData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Действия
  const fetchAnalytics = async ({ period, metric }) => {
    loading.value = true
    error.value = null

    try {
      const [analyticsResponse, statsResponse, activityResponse] = await Promise.all([
        http.get(`/admin/analytics/${metric}`, {
          params: { startDate: period.start, endDate: period.end }
        }),
        http.get('/admin/stats'),
        http.get('/admin/activity')
      ])

      const combinedData = {
        metrics: analyticsResponse.data,
        stats: statsResponse.data,
        activity: activityResponse.data
      }

      analyticsData.value = combinedData
      return combinedData
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке аналитики'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMetrics = async (category, startDate, endDate, metrics) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get(`/admin/analytics/${category}/metrics`, {
        params: { startDate, endDate, metrics }
      })
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке метрик'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLatestAnalytics = async (category, limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get(`/admin/analytics/${category}`, {
        params: { limit }
      })
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке последней аналитики'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Геттеры
  const getAnalyticsData = () => analyticsData.value
  const isLoading = () => loading.value
  const getError = () => error.value

  // Геттеры для отдельных частей данных
  const getMetrics = () => analyticsData.value?.metrics || {}
  const getStats = () => analyticsData.value?.stats || {}
  const getActivity = () => analyticsData.value?.activity || []

  return {
    // Состояние
    analyticsData,
    loading,
    error,
    
    // Действия
    fetchAnalytics,
    fetchMetrics,
    fetchLatestAnalytics,
    
    // Геттеры
    getAnalyticsData,
    isLoading,
    getError,
    getMetrics,
    getStats,
    getActivity
  }
}) 