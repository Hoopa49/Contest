<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Конкурсные видео
      <v-spacer></v-spacer>
      <v-select
        v-model="filter.status"
        :items="statusOptions"
        label="Статус"
        hide-details
        density="compact"
        class="mx-4"
        style="max-width: 150px"
      ></v-select>
      <v-pagination
        v-model="pagination.page"
        :length="totalPages"
        :total-visible="5"
        density="compact"
        size="small"
        @update:model-value="handlePageChange"
      ></v-pagination>
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="videos"
        :loading="loading"
        :items-per-page="pagination.itemsPerPage"
        :page="pagination.page"
        :items-length="pagination.totalItems"
        :items-per-page-options="[10, 25, 50, 100]"
        hover
        @update:options="handleTableOptionsUpdate"
      >
        <template #bottom>
          <div class="d-flex justify-end pt-2">
            <v-pagination
              v-model="pagination.page"
              :length="totalPages"
              :total-visible="5"
              density="compact"
              size="small"
              @update:model-value="handlePageChange"
            ></v-pagination>
          </div>
        </template>

        <template #item.thumbnail="{ item }">
          <v-img
            :src="item.raw.thumbnail_url"
            :aspect-ratio="16/9"
            width="120"
            class="rounded"
          ></v-img>
        </template>

        <template #item.title="{ item }">
          <div class="d-flex flex-column">
            <a 
              :href="'https://youtube.com/watch?v=' + item.raw.youtube_id"
              target="_blank"
              class="text-decoration-none"
            >
              {{ item.raw.title }}
            </a>
            <div class="text-caption text-grey">{{ item.raw.channel_title }}</div>
          </div>
        </template>

        <template #item.contest="{ item }">
          <div class="d-flex flex-column align-center">
            <v-chip
              :color="getStatusColor(item.raw.status)"
              size="small"
            >
              {{ getStatusText(item.raw.status) }}
            </v-chip>
          </div>
        </template>

        <template #item.participants="{ item }">
          {{ formatNumber(item.raw.participants_count || 0) }}
        </template>

        <template #item.favorites="{ item }">
          {{ formatNumber(item.raw.favorites_count || 0) }}
        </template>

        <template #item.likes="{ item }">
          <div class="text-center">{{ formatNumber(item.raw.likes_count) }}</div>
        </template>

        <template #item.comments="{ item }">
          <div class="text-center">{{ formatNumber(item.raw.comments_count) }}</div>
        </template>

        <template #item.views="{ item }">
          <div class="text-center">{{ formatNumber(item.raw.views_count) }}</div>
        </template>

        <template #item.publish_date="{ item }">
          <div class="text-center">{{ formatDate(item.raw.publish_date) }}</div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="showVideoDetails(item.raw)"
          >
            <v-icon>mdi-information</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="dialog.show" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <span class="text-h6">Детали видео</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text v-if="dialog.video" class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-img
                :src="dialog.video.thumbnail_url"
                :aspect-ratio="16/9"
                class="rounded"
              ></v-img>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-h6 mb-4">{{ dialog.video.title }}</div>
              
              <v-list density="compact" class="pa-0">
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-youtube</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Канал</v-list-item-title>
                  <v-list-item-subtitle>{{ dialog.video.channel_title }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-information</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Статус обработки</v-list-item-title>
                  <v-list-item-subtitle class="d-flex align-center">
                    <v-chip
                      :color="getStatusColor(dialog.video.status)"
                      size="small"
                      class="mr-2"
                    >
                      {{ getStatusText(dialog.video.status) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-eye</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Просмотры</v-list-item-title>
                  <v-list-item-subtitle>{{ formatNumber(dialog.video.views_count) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-thumb-up</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Лайки</v-list-item-title>
                  <v-list-item-subtitle>{{ formatNumber(dialog.video.likes_count) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-comment</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Комментарии</v-list-item-title>
                  <v-list-item-subtitle>{{ formatNumber(dialog.video.comments_count) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Дата публикации</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(dialog.video.publish_date) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            v-if="dialog.video?.status === 'contest' && dialog.video?.contest_id"
            color="primary"
            variant="text"
            :href="'/contests/' + dialog.video.contest_id"
            target="_blank"
            class="mr-2"
          >
            <v-icon start>mdi-trophy-outline</v-icon>
            Перейти к конкурсу
          </v-btn>
          <v-btn
            color="primary"
            :href="'https://youtube.com/watch?v=' + dialog.video?.youtube_id"
            target="_blank"
          >
            <v-icon start>mdi-youtube</v-icon>
            Открыть на YouTube
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { useYoutubeStore } from '@/stores/youtube'

const youtubeStore = useYoutubeStore()
const loading = ref(false)
const videos = ref([])

const statusOptions = [
  { title: 'Все', value: 'all' },
  { title: 'На проверке', value: 'pending' },
  { title: 'Конкурсы', value: 'contest' },
  { title: 'Не конкурсы', value: 'not_contest' }
]

const filter = reactive({
  status: 'all'
})

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [],
  groupBy: [],
})

const dialog = reactive({
  show: false,
  video: null
})

const headers = [
  { title: 'Превью', key: 'thumbnail', sortable: false, width: '120px', align: 'center' },
  { title: 'Название', key: 'title', sortable: true, align: 'start' },
  { title: 'Статус', key: 'contest', sortable: false, width: '100px', align: 'center' },
  { title: 'Просмотры', key: 'views', sortable: true, width: '100px', align: 'center' },
  { title: 'Лайки', key: 'likes', sortable: true, width: '100px', align: 'center' },
  { title: 'Комментарии', key: 'comments', sortable: true, width: '100px', align: 'center' },
  { title: 'Дата публикации', key: 'publish_date', sortable: true, width: '150px', align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, width: '100px', align: 'center' }
]

const isComponentMounted = ref(true)

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'not_contest':
      return 'error'
    case 'contest':
      return 'success'
    default:
      return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'На проверке'
    case 'not_contest':
      return 'Не конкурс'
    case 'contest':
      return 'Конкурс'
    default:
      return 'Не обработано'
  }
}

const getContestTypeText = (type) => {
  switch (type?.toLowerCase()) {
    case 'giveaway':
      return 'Розыгрыш'
    case 'competition':
      return 'Конкурс'
    case 'raffle':
      return 'Лотерея'
    default:
      return 'Не определен'
  }
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('ru-RU').format(num)
}

const formatDate = (date) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const totalPages = computed(() => {
  const total = Math.ceil(pagination.totalItems / pagination.itemsPerPage)
  return total > 0 ? total : 1
})

const handlePageChange = async (newPage) => {
  console.log('Смена страницы на:', newPage)
  pagination.page = newPage
  await loadVideos()
}

const handleTableOptionsUpdate = async (options) => {
  console.log('Обновление опций таблицы:', options)
  
  if (options.itemsPerPage !== pagination.itemsPerPage) {
    pagination.itemsPerPage = options.itemsPerPage
    pagination.page = 1 // Сбрасываем на первую страницу при изменении количества элементов
  } else if (options.page !== pagination.page) {
    pagination.page = options.page
  }
  
  pagination.sortBy = options.sortBy || []
  pagination.groupBy = options.groupBy || []
  
  await loadVideos()
}

const loadVideos = async () => {
  if (!isComponentMounted.value) return
  
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.itemsPerPage,
      status: filter.status
    }
    
    console.log('Загрузка видео с параметрами:', params)
    
    const result = await youtubeStore.getContestVideos(params)
    
    if (!result?.videos || !Array.isArray(result.videos)) {
      console.warn('Получены некорректные данные от сервера:', result)
      videos.value = []
      pagination.totalItems = 0
      return
    }
    
    videos.value = result.videos.map(video => ({
      raw: video,
      thumbnail: video.thumbnail_url || '',
      title: video.title || '',
      participants: formatNumber(video.participants_count) || '0',
      favorites: formatNumber(video.favorites_count) || '0',
      likes: formatNumber(video.likes_count) || '0',
      comments: formatNumber(video.comments_count) || '0',
      views: formatNumber(video.views_count) || '0',
      publish_date: formatDate(video.publish_date),
      contest: {
        status: video.status || 'unknown',
        type: getContestTypeText(video.contest_type)
      }
    }))
    
    // Обновляем общее количество элементов
    pagination.totalItems = parseInt(result.total) || 0
    
    console.log('Обновлено состояние:', {
      videosCount: videos.value.length,
      totalItems: pagination.totalItems,
      currentPage: pagination.page,
      totalPages: totalPages.value
    })
  } catch (error) {
    console.error('Ошибка при загрузке видео:', error)
    videos.value = []
    pagination.totalItems = 0
  } finally {
    loading.value = false
  }
}

const showVideoDetails = (video) => {
  dialog.video = video
  dialog.show = true
}

// Обновляем обработчик изменения фильтра
watch(() => filter.status, (newStatus) => {
  console.log('Изменен фильтр статуса:', newStatus)
  pagination.page = 1 // Сбрасываем на первую страницу при изменении фильтра
  loadVideos()
})

onMounted(() => {
  isComponentMounted.value = true
  loadVideos()
})

onUnmounted(() => {
  isComponentMounted.value = false
})
</script> 