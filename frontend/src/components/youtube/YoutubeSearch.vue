<template>
  <v-card>
    <v-card-title>
      Поиск видео
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            label="Поисковый запрос"
            append-icon="mdi-magnify"
            @click:append="searchVideos"
            @keyup.enter="searchVideos"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6" class="d-flex align-center">
          <v-btn
            color="primary"
            class="ml-2"
            @click="showFilters = !showFilters"
          >
            <v-icon start>{{ showFilters ? 'mdi-filter-off' : 'mdi-filter' }}</v-icon>
            {{ showFilters ? 'Скрыть фильтры' : 'Показать фильтры' }}
          </v-btn>
        </v-col>
      </v-row>

      <v-expand-transition>
        <div v-if="showFilters">
          <v-divider class="my-4"></v-divider>
          
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.publishedAfter"
                :items="publishedAfterOptions"
                label="Опубликовано после"
                density="compact"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.minViews"
                :items="viewsOptions"
                label="Минимум просмотров"
                density="compact"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.minLikes"
                :items="likesOptions"
                label="Минимум лайков"
                density="compact"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.contestProbability"
                :items="probabilityOptions"
                label="Вероятность конкурса"
                density="compact"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-combobox
                v-model="filters.excludedChannels"
                :items="recentExcludedChannels"
                label="Исключить каналы"
                multiple
                chips
                density="compact"
                hide-details
              ></v-combobox>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.searchIn"
                :items="searchInOptions"
                label="Искать в"
                density="compact"
                multiple
              ></v-select>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <v-chip-group>
                <v-chip
                  v-for="keyword in commonKeywords"
                  :key="keyword"
                  @click="addToQuery(keyword)"
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  {{ keyword }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <v-data-table
        :headers="headers"
        :items="videos"
        :loading="loading"
        :no-data-text="noDataText"
        class="mt-4"
      >
        <template #item.thumbnail="{ item }">
          <v-img
            :src="item.raw.thumbnail"
            width="120"
            height="68"
            class="rounded"
            :alt="item.raw.title"
          ></v-img>
        </template>

        <template #item.title="{ item }">
          <div class="d-flex flex-column">
            <a 
              :href="'https://youtube.com/watch?v=' + item.raw.videoId" 
              target="_blank"
              class="text-decoration-none"
            >
              {{ item.raw.title }}
            </a>
            <small class="text-grey">{{ item.raw.channelTitle }}</small>
            <small class="text-grey">Опубликовано: {{ formatDate(item.raw.publishedAt) }}</small>
          </div>
        </template>

        <template #item.stats="{ item }">
          <div class="d-flex flex-column">
            <span>{{ formatNumber(item.raw.viewCount) }} просмотров</span>
            <span>{{ formatNumber(item.raw.likeCount) }} лайков</span>
            <v-chip
              v-if="item.raw.contest_probability"
              size="x-small"
              :color="getContestProbabilityColor(item.raw.contest_probability)"
              class="mt-1"
            >
              Вероятность конкурса: {{ Math.round(item.raw.contest_probability * 100) }}%
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="addToExcluded(item.raw.channelTitle)"
            class="mr-1"
          >
            <v-icon>mdi-eye-off</v-icon>
          </v-btn>
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
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useYoutubeStore } from '@/stores/youtube'

const youtubeStore = useYoutubeStore()
const searchQuery = ref('')
const loading = ref(false)
const videos = ref([])
const showFilters = ref(false)

// Опции для фильтров
const filters = ref({
  publishedAfter: 'day',
  minViews: 1000,
  minLikes: 100,
  contestProbability: 0.4,
  excludedChannels: [],
  searchIn: ['title', 'description']
})

const publishedAfterOptions = [
  { title: 'За последний день', value: 'day' },
  { title: 'За последнюю неделю', value: 'week' },
  { title: 'За последний месяц', value: 'month' },
  { title: 'За последние 3 месяца', value: '3months' },
  { title: 'За последний год', value: 'year' }
]

const viewsOptions = [
  { title: 'Любое количество', value: 0 },
  { title: 'От 1000', value: 1000 },
  { title: 'От 5000', value: 5000 },
  { title: 'От 10000', value: 10000 },
  { title: 'От 50000', value: 50000 }
]

const likesOptions = [
  { title: 'Любое количество', value: 0 },
  { title: 'От 100', value: 100 },
  { title: 'От 500', value: 500 },
  { title: 'От 1000', value: 1000 },
  { title: 'От 5000', value: 5000 }
]

const probabilityOptions = [
  { title: 'Любая', value: 0 },
  { title: 'От 40%', value: 0.4 },
  { title: 'От 60%', value: 0.6 },
  { title: 'От 80%', value: 0.8 }
]

const searchInOptions = [
  { title: 'Название', value: 'title' },
  { title: 'Описание', value: 'description' },
  { title: 'Теги', value: 'tags' }
]

const commonKeywords = [
  'конкурс',
  'розыгрыш',
  'giveaway',
  'приз',
  'подарок',
  'бесплатно',
  'участвуй',
  'победитель'
]

const recentExcludedChannels = ref([]) // Здесь будет храниться история исключенных каналов

const headers = [
  { title: 'Превью', key: 'thumbnail', sortable: false, width: '120px', align: 'center' },
  { title: 'Название', key: 'title', sortable: true, align: 'start' },
  { title: 'Статистика', key: 'stats', sortable: false, width: '150px', align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, width: '100px', align: 'center' }
]

const searchVideos = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    console.log('Начинаем поиск с параметрами:', {
      query: searchQuery.value,
      filters: filters.value
    })
    
    const result = await youtubeStore.searchVideos({
      query: searchQuery.value,
      publishedAfter: filters.value.publishedAfter,
      minViews: filters.value.minViews,
      minLikes: filters.value.minLikes,
      contestProbability: filters.value.contestProbability,
      excludedChannels: filters.value.excludedChannels,
      searchIn: filters.value.searchIn,
      maxResults: 50
    })
    
    if (!result?.videos || !Array.isArray(result.videos)) {
      console.warn('Получены некорректные данные поиска')
      videos.value = []
      return
    }
    
    videos.value = result.videos.map(video => ({
      raw: {
        ...video,
        thumbnail: video.thumbnail_url || '',
        videoId: video.youtube_id || '',
        channelTitle: video.channel_title || '',
        viewCount: video.view_count || 0,
        likeCount: video.like_count || 0,
        publishedAt: video.published_at || null
      }
    }))
    
    console.log('Найдено видео:', videos.value.length)
  } catch (error) {
    console.error('Ошибка при поиске видео:', error)
    videos.value = []
  } finally {
    loading.value = false
  }
}

const addToQuery = (keyword) => {
  if (!searchQuery.value.includes(keyword)) {
    searchQuery.value = searchQuery.value.trim() + ' ' + keyword
  }
}

const addToExcluded = (channelTitle) => {
  if (channelTitle && !filters.value.excludedChannels.includes(channelTitle)) {
    filters.value.excludedChannels.push(channelTitle)
    // Добавляем канал в историю исключенных
    if (!recentExcludedChannels.value.includes(channelTitle)) {
      recentExcludedChannels.value.push(channelTitle)
    }
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
    day: 'numeric'
  })
}

const getContestProbabilityColor = (probability) => {
  if (probability >= 0.7) return 'success'
  if (probability >= 0.4) return 'warning'
  return 'error'
}

const noDataText = computed(() => {
  if (loading.value) return 'Загрузка...'
  if (!searchQuery.value.trim()) return 'Введите поисковый запрос'
  return 'Ничего не найдено'
})

const showVideoDetails = (video) => {
  // Реализация показа деталей видео
}
</script> 