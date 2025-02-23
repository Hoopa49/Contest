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
        {{ currentTitle }}
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <!-- Десктопное меню -->
    <div class="d-none d-lg-flex align-center">
      <UiButton
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        variant="ghost"
        :disabled="isLoading"
        class="nav-button"
        @click="$router.push(item.path)"
      >
        <template #icon>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        {{ item.title }}
      </UiButton>
    </div>

    <UiButton
      variant="ghost"
      @click="toggleTheme"
      class="mx-2 nav-button"
      :disabled="isLoading"
    >
      <template #icon>
        <v-icon>
          {{ isDarkTheme ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
        </v-icon>
      </template>
    </UiButton>

    <v-menu v-if="isAuthenticated">
      <template v-slot:activator="{ props }">
        <UiButton
          variant="ghost"
          v-bind="props"
          :disabled="isLoading"
        >
          <template #icon>
            <v-badge
              :content="unreadNotificationsCount"
              :value="unreadNotificationsCount > 0"
              color="error"
              overlap
            >
              <UserAvatar
                :src="userAvatar"
                :name="userName"
                :size="32"
              />
            </v-badge>
          </template>
        </UiButton>
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

    <UiButton
      v-else
      to="/auth/login"
      variant="ghost"
      :disabled="isLoading"
    >
      <template #icon>
        <v-icon>mdi-login-variant</v-icon>
      </template>
      Войти
    </UiButton>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useNotificationStore } from '@/stores/notification'
import { useError } from '@/composables/useError'
import UiButton from '@/components/ui/buttons/UiButton.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

export default {
  name: 'AppNavigation',
  components: {
    UiButton,
    UserAvatar
  },
  setup() {
    const authStore = useAuthStore()
    const uiStore = useUiStore()
    const notificationStore = useNotificationStore()
    const router = useRouter()
    const route = useRoute()
    const { handleError } = useError()
    
    const isLoading = ref(false)
    const siteName = ref('Contest Platform')

    const currentTitle = computed(() => {
      // Если мы на главной странице, показываем название сайта
      if (route.path === '/') {
        return siteName.value
      }
      // Иначе показываем заголовок страницы из meta
      return route.meta.title || siteName.value
    })

    const menuItems = computed(() => {
      const items = [
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
      ]

      return items
    })

    // Computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const isDarkTheme = computed(() => uiStore.isDarkTheme)
    const isSidebarOpen = computed({
      get: () => uiStore.isSidebarOpen,
      set: (value) => uiStore.setSidebar(value)
    })
    const unreadNotificationsCount = computed(() => Number(notificationStore.totalUnreadCount()) || 0)
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
      currentTitle,
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

.nav-button {
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
  }
}

.nav-button :deep(.ui-button__content) {
  text-decoration: none;
}
</style> 