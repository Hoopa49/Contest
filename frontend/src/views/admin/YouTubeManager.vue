<template>
  <div class="youtube-manager">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Управление YouTube</h1>
          
          <v-tabs v-model="activeTab" show-arrows>
            <v-tab value="search">
              <v-icon start>mdi-magnify</v-icon>
              Поиск видео
            </v-tab>
            
            <v-tab value="videos">
              <v-icon start>mdi-youtube</v-icon>
              Конкурсные видео
            </v-tab>
            
            <v-tab value="channels">
              <v-icon start>mdi-account-group</v-icon>
              Каналы
            </v-tab>
            
            <v-tab value="stats">
              <v-icon start>mdi-chart-bar</v-icon>
              Статистика
            </v-tab>
            
            <v-tab value="quota">
              <v-icon start>mdi-gauge</v-icon>
              Квоты API
            </v-tab>
            
            <v-tab value="settings">
              <v-icon start>mdi-cog</v-icon>
              Настройки
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-4">
            <v-window-item value="search">
              <youtube-search />
            </v-window-item>

            <v-window-item value="videos">
              <youtube-videos />
            </v-window-item>

            <v-window-item value="channels">
              <youtube-channels />
            </v-window-item>

            <v-window-item value="stats">
              <youtube-stats />
            </v-window-item>

            <v-window-item value="quota">
              <youtube-quota />
            </v-window-item>

            <v-window-item value="settings">
              <youtube-settings />
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import YoutubeSearch from '@/components/youtube/YoutubeSearch.vue'
import YoutubeVideos from '@/components/youtube/YoutubeVideos.vue'
import YoutubeChannels from '@/components/youtube/YoutubeChannels.vue'
import YoutubeStats from '@/components/youtube/YoutubeStats.vue'
import YoutubeQuota from '@/components/youtube/YoutubeQuota.vue'
import YoutubeSettings from '@/components/youtube/YoutubeSettings.vue'

export default {
  name: 'YouTubeManager',
  
  components: {
    YoutubeSearch,
    YoutubeVideos,
    YoutubeChannels,
    YoutubeStats,
    YoutubeQuota,
    YoutubeSettings
  },

  setup() {
    const activeTab = ref('search')

    return {
      activeTab
    }
  }
}
</script>

<style lang="scss" scoped>
.youtube-manager {
  .v-tabs {
    background-color: var(--v-surface-variant);
    border-radius: 8px;
    padding: 8px;
  }
}
</style> 