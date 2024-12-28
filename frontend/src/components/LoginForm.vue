<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">
            Вход
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="loginUser">
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
                Войти
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
import { useAuthStore } from '../stores/auth';
import api from '../services/backendApi';

export default {
  name: 'LoginForm',
  
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const error = ref('');
    const loading = ref(false);
    const formData = ref({
      email: '',
      password: ''
    });

    const loginUser = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await api.post('/api/auth/login', {
          email: formData.value.email,
          password: formData.value.password
        });

        await authStore.setToken(response.data.token);
        await authStore.fetchUser();
        await router.push('/contests');
      } catch (err) {
        console.error('Login error:', err);
        error.value = err.response?.data?.error || 'Ошибка при входе';
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      error,
      loading,
      loginUser
    };
  }
};
</script>