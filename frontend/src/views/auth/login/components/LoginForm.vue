<!--
  Компонент формы входа
  Использует composables для управления состоянием и логикой
-->
<template>
  <form @submit.prevent="handleLogin" class="auth-form">
    <!-- Email поле -->
    <div class="input-group">
      <div class="input-wrapper">
        <input
          v-model="loginForm.email"
          type="email"
          id="email"
          :class="{ 'error': error?.email }"
          @focus="focusedField = 'email'"
          @blur="focusedField = null"
          autocomplete="email"
          required
        />
        <label
          for="email"
          :class="{ 'float': loginForm.email || focusedField === 'email' }"
        >
          E-mail
        </label>
        <div class="toggle">
          <input
            type="checkbox"
            id="remember"
            v-model="loginForm.remember"
          />
          <span class="toggle-slider">
            <span class="toggle-knob"></span>
          </span>
          <span class="toggle-label">Запомнить</span>
        </div>
      </div>
      <span v-if="error?.email" class="error-message">{{ error.email }}</span>
    </div>

    <!-- Пароль поле -->
    <div class="input-group">
      <div class="input-wrapper">
        <input
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          id="password"
          :class="{ 'error': error?.password, 'has-forgot-link': true }"
          @focus="focusedField = 'password'"
          @blur="focusedField = null"
          autocomplete="current-password"
          required
        />
        <label
          for="password"
          :class="{ 'float': loginForm.password || focusedField === 'password' }"
        >
          Пароль
        </label>
        <div class="password-controls">
          <button
            type="button"
            class="password-toggle"
            :class="{ 'active': showPassword }"
            @click="togglePasswordVisibility"
          >
            <font-awesome-icon
              :icon="showPassword ? faEye : faEyeSlash"
              class="eye-icon"
            />
          </button>
          <router-link to="/auth/forgot-password" class="forgot-link">
            Забыли пароль?
          </router-link>
        </div>
      </div>
      <span v-if="error?.password" class="error-message">{{ error.password }}</span>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error?.message" class="error-alert" role="alert">
      {{ error.message }}
    </div>

    <!-- Кнопка входа -->
    <button
      type="submit"
      class="submit-button"
      :disabled="loading"
    >
      <span v-if="!loading">Войти</span>
      <font-awesome-icon
        v-else
        :icon="faSpinner"
        class="spinner"
        spin
      />
    </button>

    <!-- Социальные сети -->
    <div class="social-auth">
      <div class="divider">
        <span>или войдите через</span>
      </div>
      <social-auth-buttons
        @auth="handleSocialAuth"
      />
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useLogin } from '@/composables/auth/useLogin'
import { usePasswordVisibility } from '@/composables/auth/usePasswordVisibility'
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons'
import SocialAuthButtons from '../../components/SocialAuthButtons.vue'

const { loginForm, loading, error, handleLogin, handleSocialAuth } = useLogin()
const { showPassword, togglePasswordVisibility } = usePasswordVisibility()

const focusedField = ref(null)
</script>

<style lang="scss">
@use '@/styles/components/auth';
</style> 