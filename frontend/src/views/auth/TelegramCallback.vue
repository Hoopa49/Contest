<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center">
            <v-icon color="light-blue" size="36" class="mr-2">mdi-telegram</v-icon>
            Авторизация через Telegram
          </v-card-title>

          <v-card-text class="text-center">
            <div v-if="loading">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="mt-4">Выполняется авторизация...</div>
            </div>

            <div v-if="error" class="error--text">
              {{ error }}
              <v-btn
                color="primary"
                class="mt-4"
                @click="$router.push('/login')"
              >
                Вернуться на страницу входа
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'TelegramCallback',
  
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)

    // Обработка callback при загрузке компонента
    onMounted(async () => {
      try {
        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search)
        const authString = urlParams.get('auth_string')
        const userData = JSON.parse(urlParams.get('user_data'))

        if (!authString || !userData) {
          throw new Error('Отсутствуют необходимые параметры авторизации')
        }

        // Обрабатываем callback
        await authStore.handleTelegramCallback({ auth_string: authString, user_data: userData })
        
        // Перенаправляем на главную страницу
        router.push('/')
      } catch (err) {
        console.error('Error handling Telegram callback:', err)
        error.value = 'Ошибка при авторизации через Telegram'
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      error
    }
  }
}
</script> 