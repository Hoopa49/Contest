import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/axios'

export const useIntegrationsStore = defineStore('integrations', () => {
  // Состояние
  const loading = ref(false)
  const error = ref(null)
  
  // YouTube
  const youtubeSettings = ref(null)
  const youtubeStats = ref(null)
  
  // Instagram
  const instagramSettings = ref(null)
  const instagramStats = ref(null)
  
  // VK
  const vkSettings = ref(null)
  const vkStats = ref(null)
  
  // Telegram
  const telegramSettings = ref(null)
  const telegramStats = ref(null)

  // Общая статистика
  const totalStats = ref(null)

  // Геттеры
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  
  const getYouTubeStats = computed(() => youtubeStats.value)
  const getInstagramStats = computed(() => instagramStats.value)
  const getVKStats = computed(() => vkStats.value)
  const getTelegramStats = computed(() => telegramStats.value)
  const getTotalStats = computed(() => totalStats.value)

  // Действия
  // YouTube
  const getYouTubeSettings = async () => {
    loading.value = true
    try {
      const response = await http.get('/admin/integrations/youtube/settings')
      youtubeSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateYouTubeSettings = async (settings) => {
    loading.value = true
    try {
      const response = await http.put('/admin/integrations/youtube/settings', settings)
      youtubeSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleYouTubeIntegration = async (enabled) => {
    loading.value = true
    try {
      const response = await http.post('/admin/integrations/youtube/toggle', { enabled })
      youtubeSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Instagram
  const getInstagramSettings = async () => {
    loading.value = true
    try {
      const response = await http.get('/admin/integrations/instagram/settings')
      instagramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInstagramSettings = async (settings) => {
    loading.value = true
    try {
      const response = await http.put('/admin/integrations/instagram/settings', settings)
      instagramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleInstagramIntegration = async (enabled) => {
    loading.value = true
    try {
      const response = await http.post('/admin/integrations/instagram/toggle', { enabled })
      instagramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // VK
  const getVKSettings = async () => {
    loading.value = true
    try {
      const response = await http.get('/admin/integrations/vk/settings')
      vkSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVKSettings = async (settings) => {
    loading.value = true
    try {
      const response = await http.put('/admin/integrations/vk/settings', settings)
      vkSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleVKIntegration = async (enabled) => {
    loading.value = true
    try {
      const response = await http.post('/admin/integrations/vk/toggle', { enabled })
      vkSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Telegram
  const getTelegramSettings = async () => {
    loading.value = true
    try {
      const response = await http.get('/admin/integrations/telegram/settings')
      telegramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTelegramSettings = async (settings) => {
    loading.value = true
    try {
      const response = await http.put('/admin/integrations/telegram/settings', settings)
      telegramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleTelegramIntegration = async (enabled) => {
    loading.value = true
    try {
      const response = await http.post('/admin/integrations/telegram/toggle', { enabled })
      telegramSettings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Общая статистика
  const fetchTotalStats = async () => {
    loading.value = true
    try {
      const response = await http.get('/admin/integrations/stats')
      totalStats.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Состояние
    loading,
    error,
    youtubeSettings,
    youtubeStats,
    instagramSettings,
    instagramStats,
    vkSettings,
    vkStats,
    telegramSettings,
    telegramStats,
    totalStats,

    // Геттеры
    isLoading,
    getError,
    getYouTubeStats,
    getInstagramStats,
    getVKStats,
    getTelegramStats,
    getTotalStats,

    // Действия
    // YouTube
    getYouTubeSettings,
    updateYouTubeSettings,
    toggleYouTubeIntegration,

    // Instagram
    getInstagramSettings,
    updateInstagramSettings,
    toggleInstagramIntegration,

    // VK
    getVKSettings,
    updateVKSettings,
    toggleVKIntegration,

    // Telegram
    getTelegramSettings,
    updateTelegramSettings,
    toggleTelegramIntegration,

    // Общее
    fetchTotalStats
  }
}) 