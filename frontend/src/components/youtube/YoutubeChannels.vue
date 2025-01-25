<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>Каналы с конкурсами</span>
      <v-spacer></v-spacer>
      <div class="d-flex align-center" style="min-width: 500px">
        <v-text-field
          v-model="searchQuery"
          label="Поиск по названию"
          append-icon="mdi-magnify"
          hide-details
          density="compact"
          class="mr-4"
          style="max-width: 300px"
        ></v-text-field>
        <v-btn
          color="primary"
          prepend-icon="mdi-filter-off"
          @click="showExcludedChannels"
        >
          Исключенные каналы
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="d-flex justify-end mb-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(totalItems / itemsPerPage)"
          :total-visible="7"
          density="compact"
          size="small"
        ></v-pagination>
      </div>

      <v-data-table
        :headers="headers"
        :items="channels"
        :loading="loading"
        :search="searchQuery"
        :items-per-page="10"
        :page="page"
        :server-items-length="totalItems"
        hover
        hide-default-footer
        @update:options="handleTableOptionsUpdate"
      >
        <template v-slot:item.channel="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img :src="item.raw.thumbnail_url || ''"></v-img>
            </v-avatar>
            <div class="d-flex flex-column">
              <div class="d-flex align-center">
                <a 
                  :href="'https://youtube.com/channel/' + item.raw.channel_id" 
                  target="_blank"
                  class="text-decoration-none"
                  :class="{ 'text-grey': isChannelExcluded(item.raw.title) }"
                >
                  {{ item.raw.title }}
                </a>
                <v-icon
                  v-if="isChannelExcluded(item.raw.title)"
                  color="error"
                  size="small"
                  class="ml-2"
                  title="Канал исключен"
                >
                  mdi-block-helper
                </v-icon>
              </div>
              <small class="text-grey">{{ formatNumber(item.raw.subscriber_count) }} подписчиков</small>
            </div>
          </div>
        </template>

        <template v-slot:item.total_videos="{ item }">
          <div class="text-center">
            {{ formatNumber(item.raw.total_videos) }}
          </div>
        </template>

        <template v-slot:item.subscriber_count="{ item }">
          <div class="text-center">
            {{ formatNumber(item.raw.subscriber_count) }}
          </div>
        </template>

        <template v-slot:item.contests="{ item }">
          <div class="text-center">
            <div>Всего: {{ item.raw.contest_videos_count || 0 }}</div>
            <div>Активных: {{ getActiveContestsCount(item.raw) }}</div>
          </div>
        </template>

        <template v-slot:item.activity="{ item }">
          <div class="text-center">
            <v-progress-linear
              :model-value="getActivityRate(item.raw) * 100"
              :color="getActivityColor(getActivityRate(item.raw))"
              height="20"
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
          </div>
        </template>

        <template v-slot:item.last_video="{ item }">
          <div class="text-center">
            {{ formatDate(item.raw.last_video_date) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="text-center">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  @click="showChannelDetails(item.raw)"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <v-list-item-title>Подробности</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="openChannelVideos(item.raw)"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-youtube</v-icon>
                  </template>
                  <v-list-item-title>Видео канала</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="!isChannelExcluded(item.raw.title)"
                  @click="excludeChannel(item.raw)"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-block-helper</v-icon>
                  </template>
                  <v-list-item-title>Исключить канал</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-else
                  @click="includeChannel(item.raw)"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Включить канал</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>

      <div class="d-flex justify-end mt-4">
        <v-pagination
          v-model="page"
          :length="Math.ceil(totalItems / itemsPerPage)"
          :total-visible="7"
          density="compact"
          size="small"
        ></v-pagination>
      </div>
    </v-card-text>

    <!-- Модальное окно с деталями канала -->
    <v-dialog
      v-model="showModal"
      max-width="800"
    >
      <v-card v-if="selectedChannel">
        <v-card-title class="text-h5">
          Информация о канале
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="showModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-img
                :src="selectedChannel.thumbnail_url"
                :aspect-ratio="1"
                class="rounded-lg"
              ></v-img>
            </v-col>
            <v-col cols="12" sm="8">
              <h3 class="text-h6 mb-4">{{ selectedChannel.title }}</h3>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>{{ formatNumber(selectedChannel.subscriber_count) }} подписчиков</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-youtube</v-icon>
                  </template>
                  <v-list-item-title>{{ formatNumber(selectedChannel.total_videos) }} видео</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-gift</v-icon>
                  </template>
                  <v-list-item-title>{{ selectedChannel.contest_videos_count }} конкурсов</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-chart-line</v-icon>
                  </template>
                  <v-list-item-title>
                    Активность: {{ Math.ceil(getActivityRate(selectedChannel) * 100) }}%
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>
                    Последнее видео: {{ formatDate(selectedChannel.last_video_date) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="openChannelVideos(selectedChannel)"
          >
            Видео канала
          </v-btn>
          <v-btn
            color="error"
            @click="excludeChannel(selectedChannel)"
          >
            Исключить канал
          </v-btn>
          <v-btn
            color="grey"
            @click="showModal = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог управления исключенными каналами -->
    <v-dialog
      v-model="showExcludedDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">
          Исключенные каналы
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="showExcludedDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-list v-if="excludedChannels.length">
            <v-list-item
              v-for="channel in excludedChannels"
              :key="channel"
            >
              <template v-slot:prepend>
                <v-icon color="error">mdi-block-helper</v-icon>
              </template>
              <v-list-item-title>{{ channel }}</v-list-item-title>
              <template v-slot:append>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="includeChannel({ title: channel })"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center pa-4">
            Нет исключенных каналов
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="clearExcludedChannels"
            :disabled="!excludedChannels.length"
          >
            Очистить список
          </v-btn>
          <v-btn
            color="grey"
            @click="showExcludedDialog = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar для уведомлений -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useYoutubeStore } from '@/stores/youtube'
import { useRouter } from 'vue-router'

const router = useRouter()
const youtubeStore = useYoutubeStore()
const searchQuery = ref('')
const loading = ref(false)
const channels = ref([])
const showModal = ref(false)
const selectedChannel = ref(null)

// Состояние для уведомлений
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Состояние пагинации
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Добавляем состояние для сортировки
const sortBy = ref(null)
const sortDesc = ref(false)

const headers = [
  { 
    title: 'Канал',
    key: 'channel',
    align: 'start',
    sortable: true
  },
  { 
    title: 'Всего видео',
    key: 'total_videos',
    align: 'center',
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Подписчиков',
    key: 'subscriber_count',
    align: 'center',
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Конкурсы',
    key: 'contests',
    align: 'center',
    sortable: false,
    width: '150px'
  },
  { 
    title: 'Активность',
    key: 'activity',
    align: 'center',
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Последнее видео',
    key: 'last_video',
    align: 'center',
    sortable: true,
    width: '150px'
  },
  { 
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '100px'
  }
]

const getActivityRate = (channel) => {
  if (!channel) return 0
  const contestCount = channel.contest_videos_count || 0
  const totalCount = channel.total_videos || channel.video_count || 1
  return contestCount / totalCount
}

const getActivityColor = (rate) => {
  if (rate >= 0.7) return 'success'
  if (rate >= 0.4) return 'warning'
  return 'error'
}

const getActiveContestsCount = (channel) => {
  if (!channel) return 0
  const contestCount = channel.contest_videos_count || 0
  return Math.round(contestCount * 0.3)
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('ru-RU').format(num)
}

const formatDate = (date) => {
  if (!date) return 'Нет данных'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Обновляем обработчик изменения опций таблицы
const handleTableOptionsUpdate = (options) => {
  // Обновляем только сортировку
  if (options.sortBy && options.sortBy.length) {
    const [sortItem] = options.sortBy
    sortBy.value = sortItem.key
    sortDesc.value = sortItem.order === 'desc'
  }
  loadChannels()
}

// Следим только за изменением страницы
watch(page, () => {
  loadChannels()
})

// Обновляем функцию загрузки каналов
const loadChannels = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const result = await youtubeStore.getContestChannels({
      page: page.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value
    })
    
    if (!result || !Array.isArray(result.channels)) {
      channels.value = []
      totalItems.value = 0
      return
    }
    
    channels.value = result.channels.map(channel => ({
      raw: channel,
      channel: {
        thumbnail: channel.thumbnail_url || '',
        title: channel.title || '',
        subscribers: channel.subscriber_count || 0
      },
      contests: {
        total: channel.contest_videos_count || 0,
        active: getActiveContestsCount(channel)
      },
      activity: getActivityRate(channel)
    }))
    
    totalItems.value = result.total || 0
  } catch (error) {
    console.error('Ошибка при загрузке каналов:', error?.response?.data || error.message)
    channels.value = []
    totalItems.value = 0
    showError('Ошибка при загрузке каналов')
  } finally {
    loading.value = false
  }
}

const showChannelDetails = (channel) => {
  selectedChannel.value = channel
  showModal.value = true
}

const openChannelVideos = (channel) => {
  router.push({
    name: 'youtube',
    params: { tab: 'videos' },
    query: { channel_id: channel.channel_id }
  })
}

const excludeChannel = (channel) => {
  youtubeStore.addExcludedChannel(channel.title)
  showSuccess(`Канал ${channel.title} добавлен в исключения`)
  showModal.value = false
}

const showSuccess = (text) => {
  snackbarText.value = text
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

const showError = (text) => {
  snackbarText.value = text
  snackbarColor.value = 'error'
  showSnackbar.value = true
}

// Добавляем новые состояния
const showExcludedDialog = ref(false)
const excludedChannels = computed(() => youtubeStore.getExcludedChannels)

// Добавляем новые методы
const isChannelExcluded = (channelTitle) => {
  return excludedChannels.value.includes(channelTitle)
}

const showExcludedChannels = () => {
  showExcludedDialog.value = true
}

const includeChannel = (channel) => {
  youtubeStore.removeExcludedChannel(channel.title)
  showSuccess(`Канал ${channel.title} удален из исключений`)
  if (showExcludedDialog.value && !excludedChannels.value.length) {
    showExcludedDialog.value = false
  }
}

const clearExcludedChannels = () => {
  youtubeStore.clearExcludedChannels()
  showSuccess('Список исключенных каналов очищен')
  showExcludedDialog.value = false
}

// Вычисляемое свойство для общего количества страниц
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

onMounted(() => {
  loadChannels()
})
</script> 