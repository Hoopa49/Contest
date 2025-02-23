<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Левая часть (40%) -->
      <div class="auth-banner">
        <div class="banner-content">
          <div class="logo">🔐</div>
          <h1>Восстановление пароля</h1>
          <p class="subtitle">Не волнуйтесь, мы поможем вам восстановить доступ к аккаунту</p>
          
          <div class="features">
            <div class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">📧</span>
                <h3>Проверьте почту</h3>
              </div>
              <p>Мы отправим вам инструкции по восстановлению</p>
            </div>
            <div class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🔒</span>
                <h3>Создайте новый пароль</h3>
              </div>
              <p>Следуйте инструкциям в письме</p>
            </div>
            <div class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">✨</span>
                <h3>Вернитесь к работе</h3>
              </div>
              <p>Продолжите пользоваться всеми возможностями платформы</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая часть (60%) -->
      <div class="auth-form-container">
        <div class="auth-form-wrapper">
          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="input-group">
              <div class="input-wrapper">
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  :class="{ 'error': emailError }"
                  @focus="focusedField = 'email'"
                  @blur="focusedField = null"
                  autocomplete="email"
                  required
                />
                <label
                  for="email"
                  :class="{ 'float': email || focusedField === 'email' }"
                >
                  Введите E-mail
                </label>
              </div>
              <span v-if="emailError" class="error-message">{{ emailError }}</span>
            </div>

            <div v-if="error" class="error-alert" role="alert">
              {{ error }}
            </div>

            <div v-if="isEmailSent" class="success-alert" role="alert">
              Инструкции по восстановлению пароля отправлены на ваш email
            </div>

            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading || isEmailSent"
            >
              <span v-if="!isLoading">Восстановить пароль</span>
              <span v-else class="loader"></span>
            </button>

            <router-link
              :to="{ name: 'login' }"
              class="back-link"
            >
              Вернуться к входу
            </router-link>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from 'vuetify'

const theme = useTheme()

// Инициализируем тему после монтирования компонента
onMounted(() => {
  theme.global.name.value = 'dark'
})

// Состояния
const email = ref('')
const error = ref('')
const emailError = ref('')
const isLoading = ref(false)
const isEmailSent = ref(false)
const focusedField = ref(null)

// Store
const authStore = useAuthStore()

// Правила валидации
const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

// Обработка отправки формы
const handleSubmit = async () => {
  if (!email.value) {
    emailError.value = 'Email обязателен'
    return
  }

  if (!validateEmail(email.value)) {
    emailError.value = 'Введите корректный email'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    emailError.value = ''
    
    await authStore.resetPassword(email.value)
    isEmailSent.value = true
  } catch (err) {
    error.value = err.response?.data?.message || 'Произошла ошибка при отправке'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss">
@use '@/styles/components/auth';
</style> 