<template>
  <v-card>
    <v-card-title>Статистика по платформам</v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          v-for="platform in platforms"
          :key="platform.id"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            :color="getPlatformColor(platform.id)"
            theme="dark"
            class="platform-card"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon :icon="getPlatformIcon(platform.id)" size="24" class="me-2" />
                <div class="text-subtitle-1">{{ platform.name }}</div>
              </div>
              
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-trophy</v-icon>
                  </template>
                  <v-list-item-title>{{ platform.stats.contests }} конкурсов</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-star</v-icon>
                  </template>
                  <v-list-item-title>{{ platform.stats.wins }} побед</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-chart-line</v-icon>
                  </template>
                  <v-list-item-title>{{ platform.stats.rating }} рейтинг</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'PlatformStats',

  setup() {
    const userStore = useUserStore()
    const platforms = ref([])

    const getPlatformIcon = (platform) => {
      const icons = {
        youtube: 'mdi-youtube',
        instagram: 'mdi-instagram',
        vk: 'mdi-vk',
        telegram: 'mdi-telegram'
      }
      return icons[platform.toLowerCase()] || 'mdi-account'
    }

    const getPlatformColor = (platform) => {
      const colors = {
        youtube: 'red-darken-1',
        instagram: 'purple-darken-1',
        vk: 'blue-darken-1',
        telegram: 'light-blue-darken-1'
      }
      return colors[platform.toLowerCase()] || 'grey'
    }

    const loadPlatformStats = async () => {
      try {
        platforms.value = await userStore.getPlatformStats()
      } catch (error) {
        
      }
    }

    onMounted(() => {
      loadPlatformStats()
    })

    return {
      platforms,
      getPlatformIcon,
      getPlatformColor
    }
  }
}
</script>

<style scoped>
.platform-card {
  transition: transform 0.2s;
}

.platform-card:hover {
  transform: translateY(-4px);
}
</style> 