<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <!-- Заголовок -->
          <v-card-title class="text-center py-4 primary">
            <h2 class="text-h4 white--text font-weight-medium">
              Вход в систему
            </h2>
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Форма входа -->
            <v-form
              ref="form"
              v-model="form.valid"
              @submit.prevent="handleSubmit"
              lazy-validation
            >
              <!-- Email -->
              <v-text-field
                v-model="form.email"
                :rules="rules.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                required
                outlined
                dense
                :disabled="loading"
              />

              <!-- Пароль -->
              <v-text-field
                v-model="form.password"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                label="Пароль"
                prepend-inner-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                outlined
                dense
                :disabled="loading"
              />

              <!-- Запомнить меня -->
              <v-checkbox
                v-model="form.remember"
                label="Запомнить меня"
                :disabled="loading"
                class="mt-0"
              />

              <!-- Ошибка -->
              <v-alert
                v-if="error"
                type="error"
                text
                dense
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <!-- Кнопка входа -->
              <v-btn
                type="submit"
                color="primary"
                block
                large
                :loading="loading"
                :disabled="!form.valid || loading"
              >
                Войти
              </v-btn>
            </v-form>

            <!-- Ссылки -->
            <div class="d-flex justify-space-between mt-4">
              <v-btn
                text
                small
                color="primary"
                to="/auth/forgot-password"
              >
                Забыли пароль?
              </v-btn>

              <v-btn
                text
                small
                color="primary"
                to="/auth/register"
              >
                Создать аккаунт
              </v-btn>
            </div>

            <!-- Разделитель -->
            <v-divider class="my-6">
              <span class="text-caption grey--text">или войдите через</span>
            </v-divider>

            <!-- Социальные сети -->
            <div class="d-flex flex-column gap-2">
              <!-- Google -->
              <v-btn
                block
                outlined
                color="#DB4437"
                class="mb-2"
                :loading="loading"
                @click="handleSocialLogin('google')"
              >
                <v-icon left>mdi-google</v-icon>
                Google
              </v-btn>

              <!-- VK -->
              <v-btn
                block
                color="primary"
                variant="outlined"
                class="mb-3"
                @click="loginWithVK"
              >
                <VKIcon class="mr-2" color="currentColor" />
                Войти через VK
              </v-btn>

              <!-- Instagram -->
              <v-btn
                block
                color="primary"
                variant="outlined"
                class="mb-3"
                @click="loginWithInstagram"
              >
                <InstagramIcon class="mr-2" color="currentColor" />
                Войти через Instagram
              </v-btn>

              <!-- Telegram -->
              <v-btn
                block
                color="primary"
                variant="outlined"
                class="mb-3"
                @click="loginWithTelegram"
              >
                <TelegramIcon class="mr-2" color="currentColor" />
                Войти через Telegram
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import VKIcon from '@/components/icons/VKIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import InstagramIcon from '@/components/icons/InstagramIcon.vue'

export default {
  name: 'LoginForm',
  components: {
    VKIcon,
    TelegramIcon,
    InstagramIcon
  },

  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false,
        valid: false
      },
      showPassword: false,
      loading: false,
      error: null,
      rules: {
        email: [
          v => !!v || 'Email обязателен',
          v => /.+@.+\..+/.test(v) || 'Введите корректный email'
        ],
        password: [
          v => !!v || 'Пароль обязателен',
          v => v.length >= 6 || 'Минимальная длина пароля - 6 символов'
        ]
      }
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    }
  },

  methods: {
    async handleSubmit() {
      if (!this.form.valid) return
      
      try {
        this.loading = true
        this.error = null
        await this.authStore.login({
          email: this.form.email,
          password: this.form.password,
          remember: this.form.remember
        })
        this.$router.push({ name: 'home' })
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async handleSocialLogin(provider) {
      try {
        this.loading = true
        this.error = null
        await this.authStore.socialLogin(provider)
        this.$router.push({ name: 'home' })
      } catch (error) {
        if (error.message === 'Окно авторизации было закрыто') {
          this.error = 'Авторизация была отменена'
        } else if (error.message === 'Время ожидания авторизации истекло') {
          this.error = 'Превышено время ожидания авторизации'
        } else {
          this.error = 'Ошибка при входе через соцсеть'
        }
      } finally {
        this.loading = false
      }
    },

    async loginWithVK() {
      try {
        this.loading = true
        this.error = null
        const authUrl = await this.authStore.getSocialAuthUrl('vk')
        window.location.href = authUrl
      } catch (error) {
        this.error = 'Ошибка при подключении к VK'
        console.error('Failed to initiate VK login:', error)
      } finally {
        this.loading = false
      }
    },

    async loginWithInstagram() {
      try {
        this.loading = true
        this.error = null
        const authUrl = await this.authStore.getSocialAuthUrl('instagram')
        window.location.href = authUrl
      } catch (error) {
        this.error = 'Ошибка при подключении к Instagram'
        console.error('Failed to initiate Instagram login:', error)
      } finally {
        this.loading = false
      }
    },

    async loginWithTelegram() {
      try {
        this.loading = true
        this.error = null

        // Получаем URL для авторизации
        const { url } = await this.authStore.getTelegramAuthUrl()
        
        // Перенаправляем пользователя на страницу авторизации Telegram
        window.location.href = url
      } catch (error) {
        this.error = 'Ошибка при подключении к Telegram'
        console.error('Failed to initiate Telegram login:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
