<template>
  <v-navigation-drawer
    v-model="uiStore.navigationDrawer"
    :rail="uiStore.navigationRail"
    permanent
    @click="uiStore.navigationRail = false"
  >
    <v-list-item>
      <template v-slot:prepend>
        <user-avatar
          :src="userStore.avatar"
          :alt="userStore.username"
          size="40"
        />
      </template>
      <v-list-item-title>{{ userStore.username }}</v-list-item-title>
      <v-list-item-subtitle>{{ userStore.email }}</v-list-item-subtitle>
    </v-list-item>

    <v-divider></v-divider>

    <!-- Основное меню -->
    <navigation-menu :items="mainMenuItems" />

    <v-divider></v-divider>

    <!-- Меню профиля -->
    <navigation-menu :items="profileMenuItems" />

    <!-- Админ меню -->
    <template v-if="userStore.isAdmin">
      <v-divider></v-divider>
      <navigation-menu :items="adminMenuItems" />
    </template>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          color="error"
          @click="logout"
        >
          <v-icon start>mdi-logout</v-icon>
          Выйти
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useUiStore } from '@/stores/ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import NavigationMenu from './NavigationMenu.vue'
import UserAvatar from '../common/UserAvatar.vue'
import { mainMenuItems, profileMenuItems, adminMenuItems } from '@/config/navigation'

export default {
  name: 'NavigationDrawer',
  
  components: {
    NavigationMenu,
    UserAvatar
  },

  setup() {
    const uiStore = useUiStore()
    const userStore = useUserStore()
    const router = useRouter()

    const logout = async () => {
      try {
        await userStore.logout()
        router.push('/auth')
      } catch (error) {
        console.error('Failed to logout:', error)
      }
    }

    return {
      uiStore,
      userStore,
      mainMenuItems,
      profileMenuItems,
      adminMenuItems,
      logout
    }
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s ease-out;
}
</style> 