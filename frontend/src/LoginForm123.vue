<template>
  <div class="auth-page">
    <div class="auth-container" :class="{ 'register-mode': isRegister }">
      <!-- Левая часть (40%) -->
      <div class="auth-banner">
        <div class="banner-content">
          <div class="logo">🎲</div>
          <h1>{{ isRegister ? 'Создайте аккаунт!' : 'Добро пожаловать!' }}</h1>
          <p class="subtitle">{{ isRegister ? 'Присоединяйтесь к нашему сообществу и начните выигрывать прямо сейчас!' : 'Безграничные возможности испытать удачу и поверить в судьбу!' }}</p>
          
          <div class="features">
            <div v-if="!isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🎯</span>
                <h3>Участвуйте во всех конкурсах одновременно</h3>
              </div>
              <p>Количество конкурсов не ограничено</p>
            </div>
            <div v-if="!isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🎮</span>
                <h3>Выполняйте условия в два клика</h3>
              </div>
              <p>Позвольте удаче сделать все за вас</p>
            </div>
            <div v-if="!isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">⚙️</span>
                <h3>Настройте свои интересы и предпочтения</h3>
              </div>
              <p>Платформа подстраивается под вас</p>
            </div>
            <div v-if="!isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🎁</span>
                <h3>Убедитесь в честности и прозрачности конкурса</h3>
              </div>
              <p>Подробная статистика и отчеты</p>
            </div>
            
            <!-- Фичи для регистрации -->
            <div v-if="isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🚀</span>
                <h3>Быстрая регистрация</h3>
              </div>
              <p>Всего несколько шагов для начала</p>
            </div>
            <div v-if="isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🎨</span>
                <h3>Персонализация профиля</h3>
              </div>
              <p>Настройте профиль под себя</p>
            </div>
            <div v-if="isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🔒</span>
                <h3>Безопасность данных</h3>
              </div>
              <p>Ваши данные под надежной защитой</p>
            </div>
            <div v-if="isRegister" class="feature-item">
              <div class="feature-text">
                <span class="feature-emoji">🎉</span>
                <h3>Бонусы новым участникам</h3>
              </div>
              <p>Специальные предложения для новичков</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая часть (60%) -->
      <div class="auth-form-container">
        <div class="auth-form-wrapper">
          <font-awesome-icon
            :icon="isDarkTheme ? faMoon : faSun"
            class="theme-toggle"
            @click="toggleTheme()"
            :title="isDarkTheme ? 'Включить светлую тему' : 'Включить темную тему'"
          />
          <!-- Переключатель -->
          <div class="auth-switcher">
            <button 
              :class="{ 'primary': !isRegister }" 
              @click="isRegister = false"
            >
              Вход
            </button>
            <button 
              :class="{ 'secondary': isRegister }" 
              @click="isRegister = true"
            >
              Регистрация
            </button>
          </div>

          <!-- Форма -->
          <form @submit.prevent="handleSubmit" class="auth-form">
            <div v-if="isRegister" class="input-group">
              <div class="input-wrapper">
                <input
                  v-model="registerForm.username"
                  type="text"
                  id="username"
                  :class="{ 'error': errors.username }"
                  @focus="focusedField = 'username'"
                  @blur="focusedField = null"
                  autocomplete="username"
                  required
                />
                <label
                  for="username"
                  :class="{ 'float': registerForm.username || focusedField === 'username' }"
                >
                  Имя пользователя
                </label>
              </div>
              <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
            </div>

            <div class="input-group">
              <div class="input-wrapper">
                <input
                  v-model="currentEmail"
                  type="email"
                  id="email"
                  :class="{ 'error': errors.email }"
                  @focus="focusedField = 'email'"
                  @blur="focusedField = null"
                  autocomplete="email"
                  required
                />
                <label
                  for="email"
                  :class="{ 'float': currentEmail || focusedField === 'email' }"
                >
                  Email
                </label>
                <div v-if="!isRegister" class="toggle">
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
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="input-group">
              <div class="input-wrapper">
                <input
                  v-model="currentPassword"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  :class="{ 'error': errors.password, 'has-forgot-link': !isRegister }"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = null"
                  autocomplete="current-password"
                  required
                />
                <label
                  for="password"
                  :class="{ 'float': currentPassword || focusedField === 'password' }"
                >
                  Пароль
                </label>
                <div class="password-controls">
                  <button
                    type="button"
                    class="password-toggle"
                    :class="{ 'active': showPassword }"
                    @click="showPassword = !showPassword"
                  >
                    <font-awesome-icon
                      :icon="showPassword ? faEye : faEyeSlash"
                      class="eye-icon"
                    />
                  </button>
                  <router-link v-if="!isRegister" to="/auth/forgot-password" class="forgot-link">
                    Забыли пароль?
                  </router-link>
                </div>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <div v-if="isRegister" class="input-group">
              <div class="input-wrapper">
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  :class="{ 'error': errors.confirmPassword }"
                  @focus="focusedField = 'confirmPassword'"
                  @blur="focusedField = null"
                  autocomplete="new-password"
                  required
                />
                <label
                  for="confirmPassword"
                  :class="{ 'float': registerForm.confirmPassword || focusedField === 'confirmPassword' }"
                >
                  Подтвердите пароль
                </label>
                <div class="password-controls">
                  <button
                    v-if="isRegister"
                    type="button"
                    class="password-toggle"
                    :class="{ 'active': showConfirmPassword }"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <font-awesome-icon
                      :icon="showConfirmPassword ? faEye : faEyeSlash"
                      class="eye-icon"
                    />
                  </button>
                </div>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>

            <div v-if="error" class="error-alert" role="alert">
              {{ error }}
            </div>

            <button
              type="submit"
              class="submit-button"
              :disabled="loading"
            >
              <span v-if="!loading">{{ isRegister ? 'Зарегистрироваться' : 'Войти' }}</span>
              <span v-else class="loader"></span>
            </button>

            <div class="social-auth">
              <div class="divider">
                <span>или {{ isRegister ? 'зарегистрируйтесь' : 'войдите' }} через</span>
              </div>
              <social-auth-buttons
                @auth="handleSocialAuth"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faEye, 
  faEyeSlash,
  faTrophy,
  faUsers,
  faChartLine,
  faGift,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

export default {
  name: 'LoginForm',
  
  components: {
    SocialAuthButtons,
    FontAwesomeIcon
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const uiStore = useUiStore()
    const isRegister = ref(false)

    // Отдельные формы для входа и регистрации
    const loginForm = reactive({
      email: '',
      password: '',
      remember: false
    })

    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    // Используем вычисляемое свойство для текущей формы
    const form = computed(() => isRegister.value ? registerForm : loginForm)

    const focusedField = ref(null)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const errors = reactive({})
    const { isDarkTheme } = storeToRefs(uiStore)

    // В setup() после объявления form
    const currentEmail = computed({
      get: () => isRegister.value ? registerForm.email : loginForm.email,
      set: (value) => {
        if (isRegister.value) {
          registerForm.email = value
        } else {
          loginForm.email = value
        }
      }
    })

    const currentPassword = computed({
      get: () => isRegister.value ? registerForm.password : loginForm.password,
      set: (value) => {
        if (isRegister.value) {
          registerForm.password = value
        } else {
          loginForm.password = value
        }
      }
    })

    // Очистка форм при переключении
    watch(isRegister, () => {
      // Очищаем ошибки
      Object.keys(errors).forEach(key => errors[key] = '')
      error.value = null
      
      // Очищаем поля формы, которую покидаем
      if (isRegister.value) {
        // Очищаем форму входа
        loginForm.email = ''
        loginForm.password = ''
        loginForm.remember = false
      } else {
        // Очищаем форму регистрации
        registerForm.username = ''
        registerForm.email = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
      }
      
      // Сбрасываем состояния полей
      showPassword.value = false
      showConfirmPassword.value = false
      focusedField.value = null
    })

    const validateForm = () => {
      if (isRegister.value) {
        errors.username = !registerForm.username ? 'Имя пользователя обязательно' : 
          registerForm.username.length < 3 ? 'Минимальная длина имени - 3 символа' : ''
        
        errors.email = !registerForm.email ? 'Email обязателен' : 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) ? 'Некорректный email' : ''
        
        errors.password = !registerForm.password ? 'Пароль обязателен' : 
          registerForm.password.length < 6 ? 'Минимальная длина пароля - 6 символов' : ''

        errors.confirmPassword = !registerForm.confirmPassword ? 'Подтвердите пароль' :
          registerForm.password !== registerForm.confirmPassword ? 'Пароли не совпадают' : ''
      } else {
        errors.email = !loginForm.email ? 'Email обязателен' : 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email) ? 'Некорректный email' : ''
        
        errors.password = !loginForm.password ? 'Пароль обязателен' : 
          loginForm.password.length < 6 ? 'Минимальная длина пароля - 6 символов' : ''
      }

      return !Object.values(errors).some(error => error)
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        loading.value = true
        error.value = null
        
        if (isRegister.value) {
          await authStore.register({
            username: registerForm.username,
            email: registerForm.email,
            password: registerForm.password
          })
        } else {
          await authStore.login({
            email: loginForm.email,
            password: loginForm.password,
            remember: loginForm.remember
          })
        }

        router.push({ name: 'contests' })
      } catch (err) {
        if (err.response) {
          // Ошибки от сервера (есть ответ)
          const { status, data } = err.response
          
          switch (status) {
            case 400:
              if (data?.error?.code === 'VALIDATION_ERROR') {
                error.value = data.error.message || 'Неверный email или пароль'
              } else {
                error.value = data?.error?.message || 'Ошибка валидации данных'
              }
              break
            case 401:
              error.value = 'Неверный email или пароль'
              break
            case 404:
              error.value = 'Пользователь не найден'
              break
            case 429:
              error.value = 'Слишком много попыток входа. Пожалуйста, подождите'
              break
            case 500:
              error.value = 'Внутренняя ошибка сервера. Попробуйте позже'
              break
            default:
              error.value = data?.error?.message || 'Произошла ошибка при авторизации'
          }
        } else if (err.request) {
          // Ошибки сети (нет ответа)
          error.value = 'Сервер недоступен. Пожалуйста, проверьте подключение к интернету'
        } else {
          // Другие ошибки
          error.value = 'Произошла неизвестная ошибка'
        }
      } finally {
        loading.value = false
      }
    }

    const handleSocialAuth = async (provider) => {
      try {
        loading.value = true
        error.value = null
        await authStore.socialLogin(provider)
      } catch (err) {
        error.value = err.message || 'Произошла ошибка при авторизации через социальную сеть'
        console.error('Ошибка при авторизации через соцсеть:', {
          message: err.message,
          response: err.response?.data,
          stack: err.stack
        })
        // Не делаем редирект при ошибке
        return
      } finally {
        loading.value = false
      }
      
      // Делаем редирект только при успешной авторизации
      router.push({ name: 'home' })
    }

    const toggleTheme = () => {
      uiStore.toggleTheme()
    }

    return {
      form,
      loginForm,
      registerForm,
      currentEmail,
      currentPassword,
      focusedField,
      showPassword,
      showConfirmPassword,
      loading,
      error,
      errors,
      isRegister,
      handleSubmit,
      handleSocialAuth,
      faEye,
      faEyeSlash,
      faTrophy,
      faUsers,
      faChartLine,
      faGift,
      isDarkTheme,
      toggleTheme,
      faSun,
      faMoon
    }
  }
}
</script>

<style lang="scss">
// Импортируем только необходимые абстракции
@use '@/styles/abstracts/_variables' as *;
@use '@/styles/abstracts/_mixins' as *;
@use '@/styles/abstracts/_functions' as *;

// Импортируем темы
@use '@/styles/themes/_light' as *;
@use '@/styles/themes/_dark' as *;

// Импортируем компоненты
@use '@/styles/components/_forms' as *;
@use '@/styles/components/_buttons' as *;
@use '@/styles/components/_inputs' as *;
@use '@/styles/components/_auth' as *;
</style>

