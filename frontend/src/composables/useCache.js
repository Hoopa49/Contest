/**
 * Composable для кеширования данных с поддержкой TTL
 */
import { ref } from 'vue'

export function useCache(namespace = 'default', ttl = 3600000) {
  const CACHE_PREFIX = 'app_cache_'
  const cacheKey = `${CACHE_PREFIX}${namespace}`
  
  // Загрузка кеша из localStorage
  const loadCache = () => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        
        // Проверяем TTL
        if (Date.now() - timestamp <= ttl) {
          return new Map(data)
        }
        
        // Если кеш устарел, удаляем его
        localStorage.removeItem(cacheKey)
      }
    } catch (error) {
      console.warn(`Failed to load cache for ${namespace}:`, error)
    }
    return new Map()
  }
  
  // Сохранение кеша в localStorage
  const saveCache = (cache) => {
    try {
      const cacheData = {
        data: Array.from(cache.entries()),
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn(`Failed to save cache for ${namespace}:`, error)
    }
  }
  
  const cache = ref(loadCache())
  
  // Добавление элемента в кеш
  const addToCache = (key, value = true) => {
    cache.value.set(key, value)
    saveCache(cache.value)
  }
  
  // Получение элемента из кеша
  const getFromCache = (key) => {
    return cache.value.get(key)
  }
  
  // Удаление элемента из кеша
  const removeFromCache = (key) => {
    cache.value.delete(key)
    saveCache(cache.value)
  }
  
  // Очистка кеша
  const clearCache = () => {
    cache.value.clear()
    localStorage.removeItem(cacheKey)
  }
  
  return {
    cache: cache.value,
    addToCache,
    getFromCache,
    removeFromCache,
    clearCache
  }
} 