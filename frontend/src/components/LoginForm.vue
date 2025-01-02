<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">
            Вход
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
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

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(false);
    const error = ref('');
    const formData = ref({
      email: '',
      password: ''
    });

    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        await authStore.login(formData.value);
        router.push('/'); // Перенаправление после успешного входа
      } catch (err) {
        console.error('Login failed:', err);
        error.value = err.response?.data?.error || 'Ошибка при входе';
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      error,
      handleLogin
    };
  }
};
</script>