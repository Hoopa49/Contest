<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">
            Регистрация
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="registerUser">
              <v-text-field
                v-model="formData.email"
                label="Email"
                required
                type="email"
              ></v-text-field>

              <v-text-field
                v-model="formData.password"
                label="Пароль"
                required
                type="password"
              ></v-text-field>

              <v-text-field
                v-model="formData.confirmPassword"
                label="Подтвердите пароль"
                required
                type="password"
              ></v-text-field>

              <v-alert
                v-if="error"
                type="error"
                class="mt-3"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >
                Зарегистрироваться
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/backendApi';

export default {
  name: 'RegisterForm',
  
  setup() {
    const router = useRouter();
    const error = ref('');
    const loading = ref(false);
    const formData = ref({
      email: '',
      password: '',
      confirmPassword: ''
    });

    const registerUser = async () => {
      if (formData.value.password !== formData.value.confirmPassword) {
        error.value = 'Пароли не совпадают';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await api.post('/api/auth/register', {
          email: formData.value.email,
          password: formData.value.password
        });
        
        await router.push('/login');
      } catch (err) {
        console.error('Registration error:', err);
        error.value = err.response?.data?.error || 'Ошибка при регистрации';
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      error,
      loading,
      registerUser
    };
  }
};
</script>