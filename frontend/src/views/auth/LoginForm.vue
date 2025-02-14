<template>
  <fortune-wheel
    :active="isTransitioning"
    :direction="transitionDirection"
    class="auth-container"
  >
    <div class="auth-form">
      <!-- Заголовок -->
      <h1>
        Добро пожаловать в мир конкурсов!
      </h1>

      <!-- Анимированная подарочная коробка -->
      <gift-box-animation
        :is-focused="focusedField === 'email' || focusedField === 'password'"
        :is-password="focusedField === 'password'"
        :has-error="!!error"
        :is-success="isSuccess"
        class="gift-box-animation"
      />

      <!-- Основная форма -->
      <div class="main-form">
        <form @submit.prevent="handleSubmit">
          <!-- Email -->
          <div class="input-group">
            <input
              v-model="form.email"
              type="email"
              id="email"
              :class="{ 'error': errors.email }"
              @focus="focusedField = 'email'"
              @blur="focusedField = null"
              required
            />
            <label
              for="email"
              :class="{ 'float': form.email || focusedField === 'email' }"
            >
              Email
            </label>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Пароль -->
          <div class="input-group">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              :class="{ 'error': errors.password }"
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
              required
            />
            <label
              for="password"
              :class="{ 'float': form.password || focusedField === 'password' }"
            >
              Пароль
            </label>
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'eye-open' : 'eye-closed'"></i>
            </button>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Запомнить меня -->
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="remember"
              v-model="form.remember"
            />
            <label for="remember">Запомнить меня</label>
          </div>

          <!-- Ошибка -->
          <div v-if="error" class="error-alert" role="alert">
            {{ error }}
          </div>

          <!-- Кнопка входа -->
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="!loading">Войти</span>
            <span v-else class="loader"></span>
          </button>

          <!-- Ссылки -->
          <div class="flex justify-between mt-4">
            <router-link to="/auth/forgot-password" class="link">
              Забыли пароль?
            </router-link>
            <router-link to="/auth/register" class="link" @click="startTransition('next')">
              Создать аккаунт
            </router-link>
          </div>
        </form>
      </div>

      <!-- Разделитель для мобильной версии -->
      <div class="mobile-divider"></div>

      <!-- Социальные сети -->
      <div class="social-auth">
        <div class="divider">
          <span>войти через</span>
        </div>
        <social-auth-buttons
          @auth="handleSocialAuth"
        />
      </div>
    </div>
  </fortune-wheel>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GiftBoxAnimation from '@/components/auth/GiftBoxAnimation.vue'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import FortuneWheel from '@/components/auth/FortuneWheel.vue'
import confetti from 'canvas-confetti'

export default {
  name: 'LoginForm',
  
  components: {
    GiftBoxAnimation,
    SocialAuthButtons,
    FortuneWheel
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
        email: '',
        password: '',
      remember: false
    })

    const focusedField = ref(null)
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const errors = reactive({})
    const isSuccess = ref(false)
    const isTransitioning = ref(false)
    const transitionDirection = ref('next')

    const validateForm = () => {
      errors.email = !form.email ? 'Email обязателен' : 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Некорректный email' : ''
      
      errors.password = !form.password ? 'Пароль обязателен' : 
        form.password.length < 6 ? 'Минимальная длина пароля - 6 символов' : ''

      return !errors.email && !errors.password
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        loading.value = true
        error.value = null
        
        await authStore.login({
          email: form.email,
          password: form.password,
          remember: form.remember
        })

        isSuccess.value = true
        celebrateSuccess()
        
        setTimeout(() => {
          router.push({ name: 'home' })
        }, 1500)
      } catch (err) {
        error.value = err.message
        isSuccess.value = false
      } finally {
        loading.value = false
      }
    }

    const handleSocialAuth = async (provider) => {
      try {
        loading.value = true
        error.value = null
        await authStore.socialLogin(provider)
        isSuccess.value = true
        celebrateSuccess()
        router.push({ name: 'home' })
      } catch (err) {
        error.value = err.message
        isSuccess.value = false
      } finally {
        loading.value = false
      }
    }

    const celebrateSuccess = () => {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
    }

    const startTransition = (direction) => {
      isTransitioning.value = true
      transitionDirection.value = direction
    }

    return {
      form,
      focusedField,
      showPassword,
      loading,
      error,
      errors,
      isSuccess,
      isTransitioning,
      transitionDirection,
      handleSubmit,
      handleSocialAuth,
      startTransition
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/auth-theme.scss';

.auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle at center, 
      var(--primary-glow) 0%,
      transparent 70%);
    opacity: 0.15;
    animation: pulse 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, var(--secondary-glow) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, var(--primary-glow) 0%, transparent 50%);
    opacity: 0.1;
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 640px) {
    padding: 1rem;
  }
}

.auth-form {
  width: 100%;
  max-width: 900px;
  min-width: 320px;
  margin: 0 auto;
  background: var(--form-bg);
  border-radius: 24px;
  padding: 2.5rem;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  box-shadow: 
    0 4px 24px -1px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  animation: formAppear 0.6s ease-out;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: 
    "header"
    "gift"
    "form"
    "social";
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    max-width: 420px;
  }

  h1 {
    grid-area: header;
    font-size: clamp(1.75rem, 5vw, 2.25rem);
    font-weight: 800;
    text-align: center;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, 
      var(--primary-color) 0%,
      var(--secondary-color) 50%,
      var(--primary-color) 100%);
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 3s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  // Горизонтальный разделитель для мобильной версии
  .mobile-divider {
    display: none;
    text-align: center;
    margin: 1.5rem 0;
    grid-column: 1 / -1;
    
    @media (max-width: 768px) {
      display: block;
      
      &::before {
        content: 'или';
        background: var(--form-bg);
        padding: 0.5rem 1rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
        position: relative;
        z-index: 1;
      }
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: var(--border-color);
        z-index: 0;
      }
    }
  }
}

// Обновляем стили для подарочной коробки
.gift-box-animation {
  grid-area: gift;
  margin: 0 auto;
  max-width: 120px;
  transform: scale(1.1);
  
  @media (max-width: 768px) {
    max-width: 100px;
    transform: scale(1);
  }
}

// Контейнер для основной формы
.main-form {
  grid-area: form;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

// Обновляем стили кнопки входа
.btn-primary {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: var(--primary-color);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: var(--primary-hover);
    box-shadow: 
      0 8px 20px var(--primary-glow),
      0 2px 4px rgba(0, 0, 0, 0.1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

// Обновляем стили для социальных кнопок
.social-auth {
  grid-area: social;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  
  .divider {
    margin: 1.5rem 0;
    text-align: center;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 3rem);
      height: 1px;
      background: var(--border-color);
    }
    
    &::before { left: 0; }
    &::after { right: 0; }
    
    span {
      background: var(--form-bg);
      padding: 0.5rem 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      border-radius: 1rem;
    }
  }
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.social-button {
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  .icon-wrapper {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  
  span {
    display: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--button-gradient);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--button-glow);
    
    &::before {
      opacity: 1;
    }
  }
  
  &.google {
    --button-gradient: linear-gradient(135deg, #4285f4, #34a853);
    --button-glow: rgba(66, 133, 244, 0.3);
    
    .icon-wrapper {
      color: #4285f4;
    }
    
    &:hover .icon-wrapper {
      color: white;
    }
  }
  
  &.vk {
    --button-gradient: linear-gradient(135deg, #4C75A3, #5181B8);
    --button-glow: rgba(76, 117, 163, 0.3);
    background: #4C75A3;
    
    .icon-wrapper {
      color: white;
    }
  }
  
  &.telegram {
    --button-gradient: linear-gradient(135deg, #0088cc, #00A3E1);
    --button-glow: rgba(0, 136, 204, 0.3);
    background: #0088cc;
    
    .icon-wrapper {
      color: white;
    }
  }
  
  &.instagram {
    --button-gradient: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    --button-glow: rgba(225, 48, 108, 0.3);
    
    .icon-wrapper {
      color: #E1306C;
    }
    
    &:hover .icon-wrapper {
      color: white;
    }
  }
}

.input-group {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
  
  input {
    width: 100%;
    padding: 1rem 1rem;
    font-size: 1rem;
    background: var(--input-bg);
    color: var(--text-primary);
    border: 2px solid var(--input-border);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    
    &::placeholder {
      color: transparent;
    }
    
    &:focus {
      border-color: var(--primary-color);
      background: var(--input-focus-bg);
      box-shadow: 
        0 0 0 4px var(--primary-glow),
        0 2px 4px rgba(0, 0, 0, 0.1);
      outline: none;
    }
    
    &.error {
      border-color: var(--error-color);
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      
      &:focus {
        box-shadow: 
          0 0 0 4px var(--error-glow),
          0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  label {
    position: absolute;
    left: 0.75rem;
    top: 1rem;
    padding: 0 0.5rem;
    color: var(--text-secondary);
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    background: var(--input-bg);
    border-radius: 8px;
    
    &.float {
      transform: translateY(-1.4rem) scale(0.85);
      background: var(--form-bg);
      color: var(--primary-color);
    }
  }
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0.5rem;
  background: var(--input-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--input-focus-bg);
    border-color: var(--primary-color);
  }
  
  input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    appearance: none;
    background: var(--input-bg);
    position: relative;
    transition: all 0.3s ease;
    
    &:checked {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-color: var(--primary-color);
      
      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(1.2);
        width: 0.75rem;
        height: 0.75rem;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        animation: checkmark 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    &:hover:not(:checked) {
      border-color: var(--primary-color);
      background: var(--input-focus-bg);
    }
  }
  
  label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: color 0.3s ease;

    &:hover {
      color: var(--text-primary);
    }
  }
}

.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  
  .link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
      color: var(--primary-color);
      background: var(--input-focus-bg);
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    
    &::before {
      font-size: 1.1em;
    }
    
    &[href*="forgot-password"]::before {
      content: '🔑';
    }
    
    &[href*="register"]::before {
      content: '✨';
    }
  }
}

.error-message {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  font-size: 0.75rem;
  color: var(--error-color);
  background: var(--error-glow);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.error-alert {
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: var(--error-glow);
  color: var(--error-color);
  margin: 1rem 0;
  font-size: 0.875rem;
  border: 1px solid var(--error-glow);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠️';
  }
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #fff;
    background-color: rgba(139, 92, 246, 0.1);
  }
}

.loader {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.eye-open,
.eye-closed {
  width: 1.25rem;
  height: 1.25rem;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  display: block;
  
  &:hover {
    opacity: 1;
  }
}

.eye-open {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/%3E%3C/svg%3E");
}

.eye-closed {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'/%3E%3C/svg%3E");
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

@keyframes formAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

@keyframes shine {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

@keyframes checkmark {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.4); }
  100% { transform: translate(-50%, -50%) scale(1.2); }
}

:root[theme="light"] {
  --bg-primary: #ffffff;
  --form-bg: rgba(255, 255, 255, 0.9);
  --input-bg: rgba(255, 255, 255, 0.9);
  --input-focus-bg: #ffffff;
  --input-border: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #8B5CF6;
  --secondary-color: #F59E0B;
  --primary-glow: rgba(139, 92, 246, 0.3);
  --secondary-glow: rgba(245, 158, 11, 0.3);
  --error-color: #EF4444;
  --error-glow: rgba(239, 68, 68, 0.2);
  --border-color: rgba(229, 231, 235, 0.5);
}

:root[theme="dark"] {
  --bg-primary: #0f172a;
  --form-bg: rgba(30, 41, 59, 0.8);
  --input-bg: rgba(30, 41, 59, 0.8);
  --input-focus-bg: rgba(30, 41, 59, 0.95);
  --input-border: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --primary-color: #6D28D9;
  --secondary-color: #D97706;
  --primary-glow: rgba(109, 40, 217, 0.2);
  --secondary-glow: rgba(217, 119, 6, 0.2);
  --error-color: #DC2626;
  --error-glow: rgba(220, 38, 38, 0.2);
  --border-color: rgba(51, 65, 85, 0.5);
}
</style>
