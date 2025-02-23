/**
 * Компонент страницы профиля пользователя
 * Отображает информацию о пользователе и навигацию по разделам профиля
 */
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <!-- Основной контент -->
        <v-card flat class="h-100" color="background">
          <v-row no-gutters>
            <!-- Боковая навигация -->
            <v-col cols="12" sm="3" class="border-r">
              <v-list color="background" class="pa-0">
                <v-list-item
                  v-for="link in navLinks"
                  :key="link.to"
                  :to="link.to"
                  :active="isActiveRoute(link.to)"
                  color="primary"
                  class="mb-1"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="link.icon"></v-icon>
                  </template>
                  <v-list-item-title>{{ link.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- Контент -->
            <v-col cols="12" sm="9" class="pa-6">
              <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              
              <v-alert
                v-else-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <template v-else>
                <!-- Шапка профиля -->
                <div class="d-flex align-center mb-6">
                  <UserAvatar
                    :src="user.avatar"
                    :name="user.name"
                    size="80"
                    class="mr-4"
                  />
                  <div>
                    <h1 class="text-h4 mb-1">{{ fullName }}</h1>
                    <p class="text-subtitle-1 text-medium-emphasis">{{ user?.email }}</p>
                  </div>
                </div>
               
                <!-- Роутер для вложенных компонентов -->
                <router-view v-if="!isLoading"></router-view>
              </template>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useError } from '@/composables/useError'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'ProfileView',
  
  setup() {
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()
    const { error, handleError } = useError()
    const isLoading = ref(true)

    // Состояния из хранилища
    const user = computed(() => authStore.user)
    const userStats = computed(() => userStore.getUserStats)
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // Вычисляемые свойства
    const fullName = computed(() => {
      if (!user.value) return 'Не указано'
      const firstName = user.value.first_name || ''
      const lastName = user.value.last_name || ''
      return [firstName, lastName].filter(Boolean).join(' ') || 'Не указано'
    })

    const initials = computed(() => {
      if (!user.value) return ''
      const first = user.value.first_name?.charAt(0) || ''
      const last = user.value.last_name?.charAt(0) || ''
      return (first + last).toUpperCase()
    })

    const lastActive = computed(() => {
      return user.value?.last_login || new Date()
    })

    // Навигационные ссылки
    const navLinks = [
      { to: { name: 'profile-overview' }, text: 'Обзор', icon: 'mdi-account' },
      { to: { name: 'profile-security' }, text: 'Безопасность', icon: 'mdi-shield-lock' },
      { to: { name: 'profile-contests' }, text: 'Мои конкурсы', icon: 'mdi-trophy' },
      { to: { name: 'profile-notifications' }, text: 'Уведомления', icon: 'mdi-bell' }
    ]

    // Проверка активного маршрута
    const isActiveRoute = (to) => {
      return route.name === to.name
    }

    // Форматирование даты
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU')
    }

    // Загрузка данных при монтировании
    onMounted(async () => {
      try {
        isLoading.value = true
        
        // Проверяем авторизацию
        if (!isAuthenticated.value) {
          router.push({ 
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
          return
        }

        // Загружаем статистику
        await userStore.fetchUserStats()
      } catch (err) {
        handleError(err)
      } finally {
        isLoading.value = false
      }
    })

    return {
      user,
      userStats,
      isLoading,
      error,
      fullName,
      initials,
      lastActive,
      navLinks,
      isActiveRoute,
      formatDate
    }
  }
}
</script>

<style scoped>
.border-r {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.transition-fast-in-fast-out {
  transition: all 0.2s ease-in-out;
}

@media (width <= 600px) {
  .border-r {
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style> 