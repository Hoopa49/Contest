<!--
  Компонент формы регистрации
  Использует composables для управления состоянием и логикой
-->
<template>
  <div class="auth-form-wrapper">
    <form @submit.prevent="handleRegister" class="auth-form">
      <!-- Поле имени пользователя -->
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="registerForm.username"
            type="text"
            id="username"
            :class="{ 'error': error?.username }"
            @focus="focusedField = 'username'"
            @blur="focusedField = null"
            autocomplete="username"
            placeholder=" "
            required
          />
          <label
            for="username"
            :class="{ 'float': registerForm.username || focusedField === 'username' }"
          >
            Имя пользователя
          </label>
        </div>
        <span v-if="error?.username" class="error-message">{{ error.username }}</span>
      </div>

      <!-- Поле email -->
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="registerForm.email"
            type="email"
            id="email"
            :class="{ 'error': error?.email }"
            @focus="focusedField = 'email'"
            @blur="focusedField = null"
            autocomplete="email"
            placeholder=" "
            required
          />
          <label
            for="email"
            :class="{ 'float': registerForm.email || focusedField === 'email' }"
          >
            Email
          </label>
        </div>
        <span v-if="error?.email" class="error-message">{{ error.email }}</span>
      </div>

      <!-- Поле пароля -->
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            :class="{ 'error': error?.password }"
            @focus="focusedField = 'password'"
            @blur="focusedField = null"
            autocomplete="new-password"
            placeholder=" "
            required
          />
          <label
            for="password"
            :class="{ 'float': registerForm.password || focusedField === 'password' }"
          >
            Пароль
          </label>
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
            :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
          >
            <font-awesome-icon :icon="showPassword ? faEyeSlash : faEye" />
          </button>
        </div>
        <span v-if="error?.password" class="error-message">{{ error.password }}</span>
      </div>

      <!-- Поле подтверждения пароля -->
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            :class="{ 'error': error?.confirmPassword }"
            @focus="focusedField = 'confirmPassword'"
            @blur="focusedField = null"
            autocomplete="new-password"
            placeholder=" "
            required
          />
          <label
            for="confirmPassword"
            :class="{ 'float': registerForm.confirmPassword || focusedField === 'confirmPassword' }"
          >
            Подтвердите пароль
          </label>
          <button
            type="button"
            class="password-toggle"
            @click="toggleConfirmPasswordVisibility"
            :title="showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'"
          >
            <font-awesome-icon :icon="showConfirmPassword ? faEyeSlash : faEye" />
          </button>
        </div>
        <span v-if="error?.confirmPassword" class="error-message">{{ error.confirmPassword }}</span>
      </div>

      <!-- Принятие условий -->
      <div class="toggle-group">
        <label class="toggle">
          <input
            type="checkbox"
            v-model="acceptTerms"
            required
          />
          <span class="toggle-slider">
            <span class="toggle-knob"></span>
          </span>
          <span class="toggle-label">
            Я принимаю <a href="/terms" target="_blank">условия использования</a> и <a href="/privacy" target="_blank">политику конфиденциальности</a>
          </span>
        </label>
      </div>

      <!-- Кнопка регистрации -->
      <div class="actions">
        <button
          type="submit"
          class="submit-button"
          :disabled="loading || !acceptTerms"
        >
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else class="loader"></span>
        </button>
      </div>

      <!-- Разделитель -->
      <div class="divider">
        <span>или войдите через</span>
      </div>

      <!-- Социальные сети -->
      <div class="social-auth">
        <SocialAuthButtons @auth="handleSocialAuth" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useRegister } from '@/composables/auth/useRegister'
import { usePasswordVisibility } from '@/composables/auth/usePasswordVisibility'
import SocialAuthButtons from '../../components/SocialAuthButtons.vue'

// Состояния и composables
const { registerForm, loading, error, handleRegister } = useRegister()
const { 
  showPassword, 
  showConfirmPassword, 
  togglePasswordVisibility, 
  toggleConfirmPasswordVisibility 
} = usePasswordVisibility()

// Локальные состояния
const focusedField = ref(null)
const acceptTerms = ref(false)

// Обработчик входа через соц. сети
const handleSocialAuth = (provider) => {
  console.log('Social auth with:', provider)
  // Реализация входа через соц. сети
}
</script>

<style lang="scss">
@use '@/styles/components/auth';
</style> 