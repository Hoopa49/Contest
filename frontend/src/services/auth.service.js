import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

async function telegramAuth() {
  try {
    // Получаем URL и код авторизации
    const { data } = await api.get('/auth/telegram/url')
    if (!data.success || !data.data.url || !data.data.authCode) {
      throw new Error('Не удалось получить URL для авторизации')
    }

    // Открываем окно с ботом
    const telegramWindow = window.open(data.data.url, 'TelegramAuth', 'width=600,height=600')
    if (!telegramWindow) {
      throw new Error('Не удалось открыть окно авторизации')
    }

    // Начинаем опрос сервера на предмет завершения авторизации
    return new Promise((resolve, reject) => {
      const pollInterval = 2000 // 2 секунды
      const maxAttempts = 150 // 5 минут максимум
      let attempts = 0
      
      const checkAuth = async () => {
        try {
          const response = await api.post('/auth/telegram/callback', {
            authCode: data.data.authCode
          })
          
          if (response.data.success) {
            // Сохраняем токены
            const { user, tokens } = response.data.data
            const authStore = useAuthStore()
            
            // Обновляем состояние в store
            await authStore.updateAuthState(user, tokens)
            
            clearInterval(intervalId)
            telegramWindow.close()
            resolve(response.data.data)
            return
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Сессия не найдена, продолжаем опрос
            return
          }
          clearInterval(intervalId)
          telegramWindow.close()
          reject(error)
        }
        
        attempts++
        if (attempts >= maxAttempts) {
          clearInterval(intervalId)
          telegramWindow.close()
          reject(new Error('Время авторизации истекло'))
        }
      }

      const intervalId = setInterval(checkAuth, pollInterval)
      
      // Очищаем интервал если окно закрыто
      const checkWindow = setInterval(() => {
        if (telegramWindow.closed) {
          clearInterval(intervalId)
          clearInterval(checkWindow)
          reject(new Error('Окно авторизации было закрыто'))
        }
      }, 1000)
    })
  } catch (error) {
    console.error('Ошибка при авторизации через Telegram:', error)
    throw error
  }
} 