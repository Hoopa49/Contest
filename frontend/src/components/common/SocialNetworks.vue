<template>
  <v-card>
    <v-card-title>Социальные сети</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="platform in availablePlatforms" :key="platform.id">
          <template v-slot:prepend>
            <v-icon :color="platform.color">{{ platform.icon }}</v-icon>
          </template>
          
          <v-list-item-title>{{ platform.name }}</v-list-item-title>
          
          <template v-slot:append>
            <v-btn
              v-if="connectedPlatforms.includes(platform.id)"
              color="error"
              variant="text"
              @click="unlinkSocial(platform.id)"
              :loading="loading[platform.id]"
            >
              Отключить
            </v-btn>
            <v-btn
              v-else
              color="primary"
              variant="text"
              @click="connectSocial(platform.id)"
              :loading="loading[platform.id]"
            >
              Подключить
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'SocialNetworks',

  props: {
    connectedPlatforms: {
      type: Array,
      default: () => []
    }
  },

  setup(props, { emit }) {
    const userStore = useUserStore()
    const loading = ref({})

    const availablePlatforms = [
      { id: 'youtube', name: 'YouTube', icon: 'mdi-youtube', color: 'red' },
      { id: 'instagram', name: 'Instagram', icon: 'mdi-instagram', color: 'purple' },
      { id: 'vk', name: 'VKontakte', icon: 'mdi-vk', color: 'blue' },
      { id: 'telegram', name: 'Telegram', icon: 'mdi-telegram', color: 'light-blue' }
    ]

    const connectSocial = async (platform) => {
      loading.value[platform] = true
      try {
        const authUrl = await userStore.getSocialAuthUrl(platform)
        window.location.href = authUrl
      } catch (error) {
        console.error('Failed to initiate social connection:', error)
      } finally {
        loading.value[platform] = false
      }
    }

    const unlinkSocial = async (platform) => {
      loading.value[platform] = true
      try {
        await userStore.unlinkSocial(platform)
        emit('update:connectedPlatforms', 
          props.connectedPlatforms.filter(p => p !== platform)
        )
      } catch (error) {
        console.error('Failed to unlink social platform:', error)
      } finally {
        loading.value[platform] = false
      }
    }

    return {
      availablePlatforms,
      loading,
      connectSocial,
      unlinkSocial
    }
  }
}
</script> 