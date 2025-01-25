<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-link-variant</v-icon>
      Социальные сети
    </v-card-title>

    <v-card-text>
      <v-list>
        <v-list-item
          v-for="network in socialNetworks"
          :key="network.id"
          :class="{ 'connected': network.connected }"
        >
          <template v-slot:prepend>
            <v-icon :color="network.color">{{ network.icon }}</v-icon>
          </template>

          <v-list-item-title>{{ network.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ network.connected ? network.username : 'Не подключено' }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex align-center">
              <v-chip
                v-if="network.connected"
                color="success"
                size="small"
                class="mr-2"
              >
                Подключено
              </v-chip>
              
              <v-btn
                :color="network.connected ? 'error' : 'primary'"
                variant="text"
                :loading="network.loading"
                @click="toggleConnection(network)"
              >
                {{ network.connected ? 'Отключить' : 'Подключить' }}
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <!-- Диалог подтверждения отключения -->
      <v-dialog v-model="showConfirmDialog" max-width="400">
        <v-card>
          <v-card-title>Подтверждение отключения</v-card-title>
          <v-card-text>
            Вы уверены, что хотите отключить {{ selectedNetwork?.name }}? 
            Это может повлиять на ваше участие в конкурсах, связанных с этой платформой.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showConfirmDialog = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="confirmDisconnect"
              :loading="disconnecting"
            >
              Отключить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const UserProfile = () => import('@/components/profile/UserProfile.vue')

export default {
  name: 'SocialNetworks',

  setup() {
    const userStore = useUserStore()
    const showConfirmDialog = ref(false)
    const disconnecting = ref(false)
    const selectedNetwork = ref(null)

    const socialNetworks = ref([
      {
        id: 'vk',
        name: 'ВКонтакте',
        icon: 'mdi-vk',
        color: 'blue',
        connected: false,
        username: null,
        loading: false
      },
      {
        id: 'telegram',
        name: 'Telegram',
        icon: 'mdi-telegram',
        color: 'info',
        connected: false,
        username: null,
        loading: false
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: 'mdi-instagram',
        color: 'purple',
        connected: false,
        username: null,
        loading: false
      }
    ])

    const toggleConnection = async (network) => {
      if (network.connected) {
        selectedNetwork.value = network
        showConfirmDialog.value = true
        return
      }

      network.loading = true
      try {
        const result = await userStore.connectSocialNetwork(network.id)
        network.connected = true
        network.username = result.username
      } catch (error) {
        console.error('Failed to connect social network:', error)
      } finally {
        network.loading = false
      }
    }

    const confirmDisconnect = async () => {
      if (!selectedNetwork.value) return

      disconnecting.value = true
      try {
        await userStore.disconnectSocialNetwork(selectedNetwork.value.id)
        const network = socialNetworks.value.find(n => n.id === selectedNetwork.value.id)
        if (network) {
          network.connected = false
          network.username = null
        }
      } catch (error) {
        console.error('Failed to disconnect social network:', error)
      } finally {
        disconnecting.value = false
        showConfirmDialog.value = false
        selectedNetwork.value = null
      }
    }

    // Загрузка начального состояния
    const loadConnectedNetworks = async () => {
      try {
        const connected = await userStore.getConnectedSocialNetworks()
        connected.forEach(conn => {
          const network = socialNetworks.value.find(n => n.id === conn.id)
          if (network) {
            network.connected = true
            network.username = conn.username
          }
        })
      } catch (error) {
        console.error('Failed to load connected networks:', error)
      }
    }

    loadConnectedNetworks()

    return {
      socialNetworks,
      showConfirmDialog,
      disconnecting,
      selectedNetwork,
      toggleConnection,
      confirmDisconnect
    }
  }
}
</script>

<style scoped>
.connected {
  background-color: rgba(var(--v-theme-success), 0.1);
}

.v-list-item {
  margin-bottom: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
</style> 