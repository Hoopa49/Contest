<template>
  <v-app-bar>
    <v-app-bar-title>Contest Manager</v-app-bar-title>
    
    <v-spacer></v-spacer>
    
    <template v-if="isAuthenticated">
      <v-btn to="/contests">
        <v-icon left>mdi-trophy</v-icon>
        Конкурсы
      </v-btn>
      <v-btn to="/tracking">
        <v-icon left>mdi-radar</v-icon>
        Отслеживание
      </v-btn>
      <v-btn to="/profile">
        <v-icon left>mdi-account</v-icon>
        Профиль
      </v-btn>
      <v-btn @click="handleLogout">
        <v-icon left>mdi-logout</v-icon>
        Выйти
      </v-btn>
    </template>
    
    <template v-else>
      <v-btn to="/login">
        <v-icon left>mdi-login</v-icon>
        Войти
      </v-btn>
      <v-btn to="/register">
        <v-icon left>mdi-account-plus</v-icon>
        Регистрация
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

export default {
  name: 'AppNavigation',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const { isAuthenticated } = storeToRefs(authStore)

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    return {
      isAuthenticated,
      handleLogout
    }
  }
}
</script> 