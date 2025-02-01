<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon color="red" class="mr-2">mdi-youtube</v-icon>
      YouTube Интеграция
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        class="mr-2"
        :loading="searching"
        :disabled="!isEnabled"
        prepend-icon="mdi-magnify"
        @click="runManualSearch"
      >
        Запустить поиск
      </v-btn>
      <v-btn
        :color="isEnabled ? 'success' : 'grey'"
        :variant="isEnabled ? 'elevated' : 'outlined'"
        class="px-4"
        @click="toggleIntegration"
        :loading="saving"
      >
        <v-icon :icon="isEnabled ? 'mdi-check-circle' : 'mdi-circle-outline'" class="mr-2"></v-icon>
        {{ isEnabled ? 'Активно' : 'Отключено' }}
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-tabs v-model="activeTab" @update:modelValue="handleTabChange">
        <v-tab value="stats">
          <v-icon start>mdi-chart-bar</v-icon>
          Статистика
        </v-tab>
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
        <v-tab value="quota">
          <v-icon start>mdi-chart-line</v-icon>
          Квота API
        </v-tab>
        <v-tab value="settings">
          <v-icon start>mdi-cog</v-icon>
          Настройки
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="stats">
          <youtube-stats :stats="stats" />
        </v-window-item>
        <v-window-item value="search">
          <youtube-search
            :loading="searching"
            :results="searchResults"
            @search="handleSearch"
          />
        </v-window-item>
        <v-window-item value="videos">
          <youtube-videos
            :loading="loadingVideos"
            :videos="contestVideos"
            :pagination="pagination"
            @update:pagination="handleVideosPagination"
          />
        </v-window-item>
        <v-window-item value="channels">
          <youtube-channels
            :loading="loadingChannels"
            :channels="contestChannels"
            :pagination="pagination"
            @update:pagination="handleChannelsPagination"
          />
        </v-window-item>
        <v-window-item value="quota">
          <youtube-quota />
        </v-window-item>
        <v-window-item value="settings">
          <youtube-settings
            v-model="settings"
            :saving="saving"
            @save="handleSaveSettings"
          />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, reactive, onMounted, watch, inject } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useYoutubeStore } from '@/stores/youtube'
import { useRoute, useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import YoutubeStats from '@/components/youtube/YoutubeStats.vue'
import YoutubeSearch from '@/components/youtube/YoutubeSearch.vue'
import YoutubeVideos from '@/components/youtube/YoutubeVideos.vue'
import YoutubeChannels from '@/components/youtube/YoutubeChannels.vue'
import YoutubeQuota from '@/components/youtube/YoutubeQuota.vue'
import YoutubeSettings from '@/components/youtube/YoutubeSettings.vue'

export default {
  name: 'YouTubeIntegration',
  components: {
    YoutubeStats,
    YoutubeSearch,
    YoutubeVideos,
    YoutubeChannels,
    YoutubeQuota,
    YoutubeSettings
  },
  setup() {
    const adminStore = useAdminStore()
    const youtubeStore = useYoutubeStore()
    const notify = inject('notify')
    const route = useRoute()
    const router = useRouter()
    const isEnabled = ref(false)
    const activeTab = ref(route.query.tab || 'stats')
    const searching = ref(false)
    const loadingVideos = ref(false)
    const loadingChannels = ref(false)
    const saving = ref(false)

    // Состояния
    const searchQuery = ref('')
    const searchResults = ref([])
    const contestVideos = ref([])
    const contestChannels = ref([])
    const pagination = reactive({
      videosPage: 1,
      videosLimit: 10,
      channelsPage: 1,
      channelsLimit: 10
    })

    const videoHeaders = [
      { text: 'Превью', value: 'thumbnail', sortable: false },
      { text: 'Название', value: 'title' },
      { text: 'Статистика', value: 'stats', sortable: false },
      { text: 'Действия', value: 'actions', sortable: false }
    ]

    const contestVideoHeaders = [
      { text: 'Превью', value: 'thumbnail', sortable: false },
      { text: 'Название', value: 'title' },
      { text: 'Конкурс', value: 'contest', sortable: false },
      { text: 'Действия', value: 'actions', sortable: false }
    ]

    const channelHeaders = [
      { text: 'Канал', value: 'thumbnail', sortable: false },
      { text: 'Название', value: 'title' },
      { text: 'Конкурсы', value: 'contests', sortable: false },
      { text: 'Действия', value: 'actions', sortable: false }
    ]

    const settings = reactive({
      quotaLimit: 10000,
      searchInterval: 30,
      channelCheckInterval: 60,
      maxResults: 50,
      region: 'RU',
      language: 'ru',
      contestProbabilityThreshold: 0.7,
      minContestVideosForChannel: 3,
      videoOrder: 'date',
      videoDuration: 'any',
      videoDefinition: 'any',
      videoType: 'video',
      minSubscriberCount: 0,
      minViewCount: 0,
      minVideoAge: 0,
      maxVideoAge: 30
    })

    const stats = reactive({
      total_contests: 0,
      active_contests: 0,
      channels_count: 0,
      avg_prize_value: 0,
      contest_types: [],
      daily_stats: []
    })

    // Методы
    const toggleIntegration = async () => {
      saving.value = true
      try {
        const response = await youtubeStore.toggleIntegration(!isEnabled.value)
        console.log('Toggle response:', response)
        
        // Проверяем структуру ответа
        if (response && response.success && response.data && typeof response.data.enabled === 'boolean') {
          isEnabled.value = response.data.enabled
          notify.success(isEnabled.value ? 'Интеграция активирована' : 'Интеграция отключена')
          
          // Обновляем статистику в родительском компоненте
          const event = new CustomEvent('integration-toggled', {
            detail: { platform: 'youtube', enabled: isEnabled.value }
          })
          window.dispatchEvent(event)
        } else {
          console.error('Некорректная структура ответа:', response)
          throw new Error('Некорректный ответ от сервера')
        }
      } catch (error) {
        console.error('Ошибка при переключении интеграции:', error)
        notify.error('Не удалось изменить статус интеграции')
      } finally {
        saving.value = false
      }
    }

    const updateSettings = async (newSettings) => {
      try {
        console.log('Обновление настроек:', newSettings)
        const settingsToUpdate = {
          quota_limit: parseInt(newSettings.quotaLimit),
          search_interval: parseInt(newSettings.searchInterval),
          channel_check_interval: parseInt(newSettings.channelCheckInterval),
          max_results: parseInt(newSettings.maxResults),
          region: newSettings.region,
          language: newSettings.language,
          contest_probability_threshold: parseFloat(newSettings.contestProbabilityThreshold),
          min_contest_videos_for_channel: parseInt(newSettings.minContestVideosForChannel),
          video_order: newSettings.videoOrder,
          video_duration: newSettings.videoDuration,
          video_definition: newSettings.videoDefinition,
          video_type: newSettings.videoType,
          min_subscriber_count: parseInt(newSettings.minSubscriberCount),
          min_view_count: parseInt(newSettings.minViewCount),
          min_video_age: parseInt(newSettings.minVideoAge),
          max_video_age: parseInt(newSettings.maxVideoAge)
        }
        
        const response = await youtubeStore.updateSettings(settingsToUpdate)
        if (response && response.success) {
          Object.assign(settings, newSettings)
          notify.success('Настройки успешно сохранены')
        }
      } catch (error) {
        console.error('Ошибка при обновлении настроек:', error)
        notify.error('Не удалось обновить настройки')
      }
    }

    const handleSaveSettings = async (newSettings) => {
      saving.value = true
      try {
        await updateSettings(newSettings)
      } finally {
        saving.value = false
      }
    }

    const runManualSearch = async () => {
      searching.value = true
      try {
        const searchParams = {
          maxResults: settings.maxResults,
          region: settings.region,
          language: settings.language,
          videoOrder: settings.videoOrder,
          videoDuration: settings.videoDuration,
          videoDefinition: settings.videoDefinition,
          videoType: settings.videoType,
          minSubscriberCount: settings.minSubscriberCount,
          minViewCount: settings.minViewCount,
          minVideoAge: settings.minVideoAge,
          maxVideoAge: settings.maxVideoAge,
          contestProbabilityThreshold: settings.contestProbabilityThreshold
        }
        
        const results = await youtubeStore.runSearch(searchParams)
        searchResults.value = results
        notify.success('Поиск успешно выполнен')
      } catch (error) {
        console.error('Ошибка при выполнении поиска:', error)
        notify.error('Не удалось выполнить поиск')
      } finally {
        searching.value = false
      }
    }

    const searchVideos = async () => {
      searching.value = true
      try {
        const searchParams = {
          query: searchQuery.value,
          maxResults: settings.maxResults,
          region: settings.region,
          language: settings.language,
          videoOrder: settings.videoOrder,
          videoDuration: settings.videoDuration,
          videoDefinition: settings.videoDefinition,
          videoType: settings.videoType,
          minSubscriberCount: settings.minSubscriberCount,
          minViewCount: settings.minViewCount,
          minVideoAge: settings.minVideoAge,
          maxVideoAge: settings.maxVideoAge
        }
        
        const results = await youtubeStore.searchVideos(searchParams)
        searchResults.value = results
      } catch (error) {
        console.error('Failed to search videos:', error)
      } finally {
        searching.value = false
      }
    }

    const handleSearch = async (query) => {
      searchQuery.value = query
      await searchVideos()
    }

    const loadContestVideos = async () => {
      loadingVideos.value = true
      try {
        const result = await youtubeStore.getContestVideos({
          page: pagination.videosPage,
          limit: pagination.videosLimit
        })
        contestVideos.value = result.videos
      } catch (error) {
        console.error('Failed to load contest videos:', error)
      } finally {
        loadingVideos.value = false
      }
    }

    const handleVideosPagination = async (newPagination) => {
      pagination.videosPage = newPagination.page
      pagination.videosLimit = newPagination.itemsPerPage
      await loadContestVideos()
    }

    const loadContestChannels = async () => {
      loadingChannels.value = true
      try {
        const result = await youtubeStore.getContestChannels({
          page: pagination.channelsPage,
          limit: pagination.channelsLimit
        })
        contestChannels.value = result.channels
      } catch (error) {
        console.error('Failed to load contest channels:', error)
      } finally {
        loadingChannels.value = false
      }
    }

    const handleChannelsPagination = async (newPagination) => {
      pagination.channelsPage = newPagination.page
      pagination.channelsLimit = newPagination.itemsPerPage
      await loadContestChannels()
    }

    const loadStats = async () => {
      try {
        const response = await youtubeStore.getStats()
        console.log('Полученные данные:', response)
        
        // Проверяем наличие данных
        if (response?.success && response.data) {
          // Обновляем состояние статистики
          stats.total_contests = response.data.total_contests || 0
          stats.active_contests = response.data.active_contests || 0
          stats.channels_count = response.data.channels_count || 0
          stats.avg_prize_value = response.data.avg_prize_value || 0
          stats.contest_types = response.data.contest_types || []
          stats.daily_stats = response.data.daily_stats || []
          
          console.log('Обновленная статистика:', stats)
        } else {
          console.warn('Данные статистики отсутствуют')
          notify.warning('Не удалось загрузить статистику')
        }
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
        notify.error('Не удалось загрузить статистику')
      }
    }

    const showVideoDetails = (video) => {
      // Реализация показа деталей видео
    }

    const showChannelDetails = (channel) => {
      // Реализация показа деталей канала
    }

    const getQuotaColor = (quota) => {
      if (quota >= 90) return 'error'
      if (quota >= 70) return 'warning'
      return 'success'
    }

    const formatNumber = (num) => {
      if (!num) return '0'
      return new Intl.NumberFormat('ru-RU').format(num)
    }

    // Обработчик изменения вкладки
    const handleTabChange = (tab) => {
      router.push({ query: { ...route.query, tab } })
    }

    // Загрузка данных при монтировании
    onMounted(async () => {
      try {
        const status = await youtubeStore.getIntegrationStatus()
        isEnabled.value = status.enabled
        
        const response = await youtubeStore.getSettings()
        if (response && response.data) {
          const loadedSettings = {
            quotaLimit: parseInt(response.data.quota_limit),
            searchInterval: parseInt(response.data.search_interval),
            channelCheckInterval: parseInt(response.data.channel_check_interval),
            maxResults: parseInt(response.data.max_results),
            region: response.data.region,
            language: response.data.language,
            contestProbabilityThreshold: parseFloat(response.data.contest_probability_threshold),
            minContestVideosForChannel: parseInt(response.data.min_contest_videos_for_channel),
            videoOrder: response.data.video_order,
            videoDuration: response.data.video_duration,
            videoDefinition: response.data.video_definition,
            videoType: response.data.video_type,
            minSubscriberCount: parseInt(response.data.min_subscriber_count),
            minViewCount: parseInt(response.data.min_view_count),
            minVideoAge: parseInt(response.data.min_video_age),
            maxVideoAge: parseInt(response.data.max_video_age)
          }
          Object.assign(settings, loadedSettings)
        }

        // Загружаем данные для всех разделов
        await Promise.all([
          loadStats(),
          loadContestVideos(),
          loadContestChannels()
        ])

        // Восстанавливаем активную вкладку из URL
        if (route.query.tab) {
          activeTab.value = route.query.tab
        }
      } catch (error) {
        console.error('Ошибка при инициализации:', error)
        notify.error('Не удалось загрузить данные')
      }
    })

    // Обновляем статистику при изменении активной вкладки
    watch(activeTab, () => {
      if (activeTab.value === 'stats') {
        loadStats()
      }
    })

    return {
      isEnabled,
      activeTab,
      searching,
      loadingVideos,
      loadingChannels,
      saving,
      searchQuery,
      searchResults,
      contestVideos,
      contestChannels,
      pagination,
      videoHeaders,
      contestVideoHeaders,
      channelHeaders,
      settings,
      stats,
      searchVideos,
      handleSearch,
      showVideoDetails,
      showChannelDetails,
      getQuotaColor,
      formatNumber,
      toggleIntegration,
      runManualSearch,
      loadContestVideos,
      loadContestChannels,
      handleTabChange,
      handleVideosPagination,
      handleChannelsPagination,
      handleSaveSettings,
      updateSettings
    }
  }
}
</script>

<style scoped>
.v-card-text {
  padding-top: 16px;
}

.v-window-item {
  padding: 16px 0;
}

canvas {
  width: 100% !important;
  height: 400px !important;
}
</style> 