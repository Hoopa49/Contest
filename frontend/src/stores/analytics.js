import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/axios'

export const useAnalyticsStore = defineStore('analytics', () => {
  // Состояние
  const analyticsData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Вычисляемые свойства для трендов
  const calculateTrend = (currentValue, previousValue) => {
    if (typeof currentValue !== 'number' || typeof previousValue !== 'number') return 0
    if (previousValue === 0) return 0
    return Math.round(((currentValue - previousValue) / previousValue) * 100)
  }

  const trends = computed(() => {
    const metrics = analyticsData.value?.metrics?.data || []
    if (!Array.isArray(metrics) || metrics.length < 2) return {
      usersTrend: 0,
      activeUsersTrend: 0,
      contestsTrend: 0,
      conversionTrend: 0
    }

    // Сортируем по дате и фильтруем невалидные записи
    const sortedMetrics = [...metrics]
      .filter(m => m && m.metrics && typeof m.date === 'string')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    if (sortedMetrics.length < 2) return {
      usersTrend: 0,
      activeUsersTrend: 0,
      contestsTrend: 0,
      conversionTrend: 0
    }

    // Получаем текущие и предыдущие значения
    const current = sortedMetrics[0]?.metrics || {}
    const previous = sortedMetrics[1]?.metrics || {}

    // Вычисляем конверсию только если есть все необходимые данные
    const currentConversion = current.total > 0 ? (current.active / current.total) * 100 : 0
    const previousConversion = previous.total > 0 ? (previous.active / previous.total) * 100 : 0

    return {
      usersTrend: calculateTrend(current.total, previous.total),
      activeUsersTrend: calculateTrend(current.active, previous.active),
      contestsTrend: calculateTrend(current.contests, previous.contests),
      conversionTrend: calculateTrend(currentConversion, previousConversion)
    }
  })

  // Действия
  const fetchAnalytics = async ({ period, metric }) => {
    loading.value = true
    error.value = null

    try {
      // Форматируем даты в ISO формат
      const startDate = period.start.toISOString()
      const endDate = period.end.toISOString()

      // Создаем массив промисов
      const promises = [
        http.get(`/admin/analytics/${metric}`, {
          params: { startDate, endDate }
        }).catch(err => {
          console.error(`Error fetching ${metric} analytics:`, err)
          return { data: { data: [] } }
        }),
        http.get('/admin/stats').catch(err => {
          console.error('Error fetching stats:', err)
          return { data: { data: {} } }
        }),
        http.get('/admin/activity').catch(err => {
          console.error('Error fetching activity:', err)
          return { data: { data: [] } }
        })
      ]

      const [analyticsResponse, statsResponse, activityResponse] = await Promise.all(promises)

      const combinedData = {
        metrics: analyticsResponse.data,
        stats: statsResponse.data,
        activity: activityResponse.data
      }

      analyticsData.value = combinedData
      return combinedData
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке аналитики'
      console.error('Error in fetchAnalytics:', err)
      // Возвращаем пустые данные вместо выброса ошибки
      return {
        metrics: { data: [] },
        stats: { data: {} },
        activity: { data: [] }
      }
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
  const getAnalyticsData = () => ({
    ...analyticsData.value,
    ...trends.value
  })
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