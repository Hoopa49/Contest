<!--
  Компонент навигации приложения
  Включает адаптивное меню, управление темой и профилем пользователя
-->
<template>
  <v-app-bar>
    <v-app-bar-nav-icon 
      @click="toggleSidebar"
      class="d-lg-none"
      :disabled="isLoading"
    />
    
    <v-toolbar-title>
      <router-link 
        to="/" 
        class="text-decoration-none"
      >
        {{ siteName }}
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <!-- Десктопное меню -->
    <div class="d-none d-lg-flex align-center">
      <v-btn
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        variant="text"
        :prepend-icon="item.icon"
        :disabled="isLoading"
      >
        {{ item.title }}
      </v-btn>
    </div>

    <v-btn
      icon
      @click="toggleTheme"
      class="mx-2"
      :disabled="isLoading"
    >
      <v-icon>
        {{ isDarkTheme ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
      </v-icon>
    </v-btn>

    <v-menu v-if="isAuthenticated">
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          :disabled="isLoading"
        >
          <v-badge
            :content="unreadNotificationsCount"
            :value="unreadNotificationsCount > 0"
            color="error"
            overlap
          >
            <v-avatar size="32">
              <v-img
                v-if="userAvatar"
                :src="userAvatar"
                :alt="userName"
              />
              <v-icon v-else>
                mdi-account-circle
              </v-icon>
            </v-avatar>
          </v-badge>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          to="/profile"
          prepend-icon="mdi-account-settings"
          :disabled="isLoading"
        >
          <v-list-item-title>{{ userName }}</v-list-item-title>
          <v-list-item-subtitle>Профиль</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item
          v-if="isAdmin"
          to="/admin"
          prepend-icon="mdi-shield-crown"
          :disabled="isLoading"
        >
          Админ панель
        </v-list-item>

        <v-list-item
          to="/notifications"
          prepend-icon="mdi-bell"
          :disabled="isLoading"
        >
          <v-list-item-title>
            Уведомления
            <v-badge
              :content="unreadNotificationsCount"
              :value="unreadNotificationsCount > 0"
              color="error"
              inline
            />
          </v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="logout"
          prepend-icon="mdi-logout-variant"
          :disabled="isLoading"
        >
          Выйти
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn
      v-else
      to="/auth/login"
      variant="text"
      prepend-icon="mdi-login-variant"
      :disabled="isLoading"
    >
      Войти
    </v-btn>
  </v-app-bar>

  <!-- Мобильное меню -->
  <v-navigation-drawer
    v-model="isSidebarOpen"
    temporary
    class="d-lg-none"
  >
    <v-list>
      <v-list-item
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :prepend-icon="item.icon"
        :disabled="isLoading"
      >
        {{ item.title }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useNotificationStore } from '@/stores/notification'
import { useError } from '@/composables/useError'

export default {
  name: 'AppNavigation',
  
  setup() {
    const authStore = useAuthStore()
    const uiStore = useUiStore()
    const notificationStore = useNotificationStore()
    const router = useRouter()
    const { handleError } = useError()
    
    const isLoading = ref(false)
    const siteName = ref('Contest Platform')

    const menuItems = ref([
      { 
        title: 'Главная',
        path: '/',
        icon: 'mdi-home'
      },
      {
        title: 'Конкурсы',
        path: '/contests',
        icon: 'mdi-trophy-variant'
      },
      {
        title: 'О проекте',
        path: '/about',
        icon: 'mdi-information'
      }
    ])

    // Computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const isDarkTheme = computed(() => uiStore.isDarkTheme)
    const isSidebarOpen = computed({
      get: () => uiStore.isSidebarOpen,
      set: (value) => uiStore.setSidebar(value)
    })
    const unreadNotificationsCount = computed(() => notificationStore.totalUnreadCount)
    const userName = computed(() => authStore.user?.name || 'Пользователь')
    const userAvatar = computed(() => authStore.user?.avatar)

    // Methods
    const toggleTheme = () => {
      uiStore.toggleTheme()
    }

    const toggleSidebar = () => {
      uiStore.toggleSidebar()
    }

    const logout = async () => {
      try {
        isLoading.value = true
        await authStore.logout()
        // После успешного выхода перенаправляем на страницу входа
        router.push({ name: 'login' })
      } catch (error) {
        handleError(error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      menuItems,
      isAuthenticated,
      isAdmin,
      isDarkTheme,
      isSidebarOpen,
      isLoading,
      siteName,
      unreadNotificationsCount,
      userName,
      userAvatar,
      toggleTheme,
      toggleSidebar,
      logout
    }
  }
}
</script>

<style scoped>
.v-toolbar-title a {
  color: inherit;
}

.v-badge__badge {
  font-size: 12px;
  height: 18px;
  min-width: 18px;
  padding: 2px 4px;
}
</style> 