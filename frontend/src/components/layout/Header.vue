<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="uiStore.toggleDrawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title>{{ currentTitle }}</v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Поиск -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Поиск"
      single-line
      hide-details
      density="compact"
      class="hidden-sm-and-down mx-4"
      style="max-width: 300px"
    ></v-text-field>

    <!-- Уведомления -->
    <notification-list />

    <!-- Профиль -->
    <v-menu location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <user-avatar
            :src="userStore.avatar"
            :alt="userStore.username"
            size="32"
          />
        </v-btn>
      </template>

      <user-menu />
    </v-menu>
  </v-app-bar>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import NotificationList from '@/components/notifications/NotificationList.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

export default {
  name: 'Header',

  components: {
    NotificationList,
    UserMenu,
    UserAvatar
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const uiStore = useUiStore()

    const searchQuery = ref('')
    
    const currentTitle = computed(() => route.meta.title || 'Главная')

    const logout = async () => {
      try {
        await userStore.logout()
        router.push('/auth')
      } catch (error) {
        console.error('Failed to logout:', error)
      }
    }

    return {
      currentTitle,
      searchQuery,
      userStore,
      uiStore,
      logout
    }
  }
}
</script>