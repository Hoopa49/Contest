/**
 * Компонент страницы регистрации
 * Форма регистрации с валидацией и обработкой ошибок
 */
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <!-- Заголовок -->
          <v-card-title class="text-center py-4 primary">
            <h2 class="text-h4 white--text font-weight-medium">
              Регистрация
            </h2>
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Форма регистрации -->
            <v-form
              ref="form"
              v-model="formValid"
              @submit.prevent="handleSubmit"
              lazy-validation
            >
              <!-- Email -->
              <v-text-field
                v-model="formData.email"
                :rules="rules.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                required
                outlined
                dense
                :error-messages="getFieldError('email')"
              />

              <!-- Имя -->
              <v-text-field
                v-model="formData.first_name"
                :rules="rules.required"
                label="Имя"
                prepend-inner-icon="mdi-account"
                required
                outlined
                dense
                :error-messages="getFieldError('first_name')"
              />

              <!-- Фамилия -->
              <v-text-field
                v-model="formData.last_name"
                :rules="rules.required"
                label="Фамилия"
                prepend-inner-icon="mdi-account"
                required
                outlined
                dense
                :error-messages="getFieldError('last_name')"
              />

              <!-- Пароль -->
              <v-text-field
                v-model="formData.password"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                label="Пароль"
                prepend-inner-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                outlined
                dense
                :error-messages="getFieldError('password')"
              />

              <!-- Подтверждение пароля -->
              <v-text-field
                v-model="formData.password_confirmation"
                :rules="rules.passwordConfirm"
                :type="showPassword ? 'text' : 'password'"
                label="Подтверждение пароля"
                prepend-inner-icon="mdi-lock-check"
                required
                outlined
                dense
                :error-messages="getFieldError('passwordConfirm')"
              />

              <!-- Согласие с условиями -->
              <v-checkbox
                v-model="formData.terms"
                :rules="[v => !!v || 'Необходимо принять условия']"
                label="Я согласен с условиями использования"
                required
              >
                <template v-slot:label>
                  <div>
                    Я согласен с
                    <v-btn
                      text
                      small
                      color="primary"
                      href="/terms"
                      target="_blank"
                    >
                      условиями использования
                    </v-btn>
                  </div>
                </template>
              </v-checkbox>

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

              <!-- Кнопка регистрации -->
              <v-btn
                type="submit"
                color="primary"
                block
                large
                :loading="loading"
                :disabled="!formValid || loading"
              >
                Зарегистрироваться
              </v-btn>

              <!-- Ссылка на вход -->
              <div class="text-center mt-4">
                <span class="text-body-2">Уже есть аккаунт?</span>
                <v-btn
                  text
                  small
                  color="primary"
                  to="/auth/login"
                  class="ml-2"
                >
                  Войти
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useError } from '@/composables/useError'

export default {
  name: 'RegisterView',
  
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const form = ref(null)
    const { error, getFieldError, clearErrors } = useError()
    
    const formValid = ref(false)
    const loading = ref(false)
    const showPassword = ref(false)

    const formData = reactive({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirmation: '',
      terms: false
    })

    const rules = {
      required: [v => !!v || 'Обязательное поле'],
      email: [
        v => !!v || 'Email обязателен',
        v => /.+@.+\..+/.test(v) || 'Введите корректный email'
      ],
      password: [
        v => !!v || 'Пароль обязателен',
        v => v.length >= 6 || 'Минимальная длина пароля - 6 символов'
      ],
      passwordConfirm: [
        v => !!v || 'Подтверждение пароля обязательно',
        v => v === formData.password || 'Пароли не совпадают'
      ]
    }

    async function handleSubmit() {
      try {
        if (!form.value.validate()) return
        
        loading.value = true
        error.value = null
        
        const result = await authStore.register({
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        
        // Если успешно, перенаправляем на главную
        router.push('/')
      } catch (err) {
        console.error('Registration error:', err)
        error.value = err.message || 'Ошибка при регистрации'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      formData,
      formValid,
      loading,
      showPassword,
      rules,
      error,
      getFieldError,
      handleSubmit
    }
  }
}
</script> 