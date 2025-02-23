<!--
  Корневой компонент приложения
  Определяет основную структуру и layout
  Управляет инициализацией авторизации и состоянием приложения
-->
<template>
  <v-app :theme="isDarkTheme ? 'dark' : 'light'">
    <app-navigation v-if="isInitialized && !error && !isAuthPage" />
    
    <v-main>
      <v-container fluid>
        <template v-if="error">
          <v-row align="center" justify="center" style="height: 100vh">
            <v-col cols="12" sm="8" md="6" class="text-center">
              <v-alert type="error" title="Ошибка инициализации" class="mb-4">
                {{ error }}
                <template v-if="errorDetails">
                  <div class="text-caption mt-2">{{ errorDetails }}</div>
                </template>
              </v-alert>
              <v-btn color="primary" @click="retryInitialization" :loading="isRetrying">
                {{ isRetrying ? 'Повторная попытка...' : 'Повторить' }}
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <template v-else-if="isInitialized">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </template>
        <template v-else>
          <v-row align="center" justify="center" style="height: 100vh">
            <v-col cols="12" class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="mt-4">
                <div class="text-h6">{{ loadingMessage }}</div>
                <div class="text-caption text-medium-emphasis">{{ loadingDetails }}</div>
              </div>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-main>

    <!-- Футер временно отключен
    <app-footer v-if="isInitialized && !error" />
    -->

    <!-- Системные уведомления -->
    <system-modal />
    <system-toasts />
  </v-app>
</template>

<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useError } from '@/composables/useError'
import { useRoute } from 'vue-router'
import AppNavigation from './layouts/default/AppNavigation.vue'
// import AppFooter from './layouts/default/AppFooter.vue' // Временно отключен
import SystemModal from './components/features/notifications/SystemModal.vue'
import SystemToasts from './components/features/notifications/SystemToasts.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const { error, handleError } = useError()

// Состояние загрузки
const isLoading = ref(true)
const isRetrying = ref(false)
const errorDetails = ref(null)
const loadingMessage = ref('Инициализация приложения')
const loadingDetails = ref('Подготовка к запуску...')

// Вычисляемые свойства
const isDarkTheme = computed(() => uiStore.isDarkTheme)
const isInitialized = computed(() => authStore.isInitialized)
const isAuthPage = computed(() => route.path.includes('/auth'))

/**
 * Инициализация приложения
 */
const initializeApp = async () => {
  try {
    loadingMessage.value = 'Проверка авторизации'
    loadingDetails.value = 'Получение данных пользователя...'
    
    await authStore.init()
  } catch (err) {
    console.error('Ошибка при инициализации:', err)
    handleError(err)
    errorDetails.value = err.details || err.message
  } finally {
    isLoading.value = false
  }
}

/**
 * Повторная попытка инициализации
 */
const retryInitialization = async () => {
  try {
    isRetrying.value = true
    error.value = null
    errorDetails.value = null
    loadingMessage.value = 'Повторная инициализация'
    loadingDetails.value = 'Очистка состояния и повторная попытка...'
    
    await initializeApp()
  } finally {
    isRetrying.value = false
  }
}

// Запускаем инициализацию при монтировании
onBeforeMount(() => {
  initializeApp()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
