<template>
  <v-list>
    <v-list-item
      v-for="item in menuItems"
      :key="item.title"
      :to="item.to"
      :prepend-icon="item.icon"
    >
      <v-list-item-title>{{ item.title }}</v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list-item
      prepend-icon="mdi-logout"
      @click="logout"
    >
      <v-list-item-title>Выйти</v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { profileMenuItems } from '@/config/navigation'

export default {
  name: 'UserMenu',

  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const logout = async () => {
      try {
        await userStore.logout()
        router.push('/auth')
      } catch (error) {
        console.error('Failed to logout:', error)
      }
    }

    return {
      menuItems: profileMenuItems,
      logout
    }
  }
}
</script> 