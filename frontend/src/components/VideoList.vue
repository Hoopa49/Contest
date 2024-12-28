<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Видео</h2>
        
        <!-- Загрузка -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
        ></v-progress-circular>

        <!-- Ошибка -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Список видео -->
        <v-row v-if="!loading && !error">
          <v-col 
            v-for="video in videos" 
            :key="video.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card>
              <v-card-title>{{ video.title }}</v-card-title>
              <v-card-text>
                <div>Автор: {{ video.author }}</div>
                <div>Источник: {{ video.source }}</div>
                <div>Дата публикации: {{ formatDate(video.publicationDate) }}</div>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="primary"
                  :href="video.link"
                  target="_blank"
                  text
                >
                  Смотреть
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Нет видео -->
        <v-alert
          v-if="!loading && !error && videos.length === 0"
          type="info"
          class="mb-4"
        >
          Видео не найдены
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '../services/backendApi';
import { useToast } from 'vue-toastification';

export default {
  name: 'VideoList',
  setup() {
    const toast = useToast();
    return { toast }
  },
  data() {
    return {
      videos: [],
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchVideos() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching videos...');
        const response = await api.get('/api/videos'); 
        this.videos = response.data;
        console.log('Videos loaded:', this.videos);
      } catch (error) {
        console.error('Error loading videos:', error);
        this.error = error.response?.data?.error || 'Ошибка загрузки видео';
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    }
  },
  mounted() {
    this.fetchVideos();
  }
}
</script>