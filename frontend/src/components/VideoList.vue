<!-- frontend/src/components/VideoList.vue -->
<template>
    <div>
      <h2>Список Видео</h2>
      <button @click="showAddForm = true">Добавить Видео</button>
      
      <!-- Форма добавления видео -->
      <div v-if="showAddForm">
        <h3>Добавить новое Видео</h3>
        <form @submit.prevent="addVideo">
          <label>Название:
            <input v-model="newVideo.title" type="text" required />
          </label><br/>
          <label>URL:
            <input v-model="newVideo.url" type="text" required />
          </label><br/>
          <label>Источник:
            <input v-model="newVideo.source" type="text" required />
          </label><br/>
          <button type="submit">Сохранить</button>
          <button type="button" @click="showAddForm = false">Отмена</button>
        </form>
      </div>
      
      <!-- Список видео -->
      <ul>
        <li v-for="video in videos" :key="video.id">
          <strong>{{ video.title }}</strong> — {{ video.source }}
          <a :href="video.url" target="_blank">Смотреть</a>
          <button @click="editVideo(video)">Редактировать</button>
          <button @click="deleteVideo(video.id)">Удалить</button>
        </li>
      </ul>
      
      <!-- Форма редактирования видео -->
      <div v-if="showEditForm">
        <h3>Редактировать Видео</h3>
        <form @submit.prevent="updateVideo">
          <label>Название:
            <input v-model="editVideoData.title" type="text" required />
          </label><br/>
          <label>URL:
            <input v-model="editVideoData.url" type="text" required />
          </label><br/>
          <label>Источник:
            <input v-model="editVideoData.source" type="text" required />
          </label><br/>
          <button type="submit">Обновить</button>
          <button type="button" @click="showEditForm = false">Отмена</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../services/backendApi.js';
  
  export default {
    name: 'VideoList',
    data() {
      return {
        videos: [],
        showAddForm: false,
        newVideo: {
          title: '',
          url: '',
          source: ''
        },
        showEditForm: false,
        editVideoData: {}
      };
    },
    methods: {
      async fetchVideos() {
        try {
          const response = await api.get('/videos');
          this.videos = response.data;
        } catch (error) {
          console.error('Ошибка при получении видео:', error);
          alert('Не удалось загрузить видео.');
        }
      },
      async addVideo() {
        try {
          await api.post('/videos', this.newVideo);
          this.showAddForm = false;
          this.newVideo = { title: '', url: '', source: '' };
          this.fetchVideos();
          alert('Видео добавлено успешно!');
        } catch (error) {
          console.error('Ошибка при добавлении видео:', error);
          alert('Не удалось добавить видео.');
        }
      },
      editVideo(video) {
        this.editVideoData = { ...video };
        this.showEditForm = true;
      },
      async updateVideo() {
        try {
          await api.put(`/videos/${this.editVideoData.id}`, this.editVideoData);
          this.showEditForm = false;
          this.editVideoData = {};
          this.fetchVideos();
          alert('Видео обновлено успешно!');
        } catch (error) {
          console.error('Ошибка при обновлении видео:', error);
          alert('Не удалось обновить видео.');
        }
      },
      async deleteVideo(id) {
        if (!confirm('Вы уверены, что хотите удалить это видео?')) return;
        try {
          await api.delete(`/videos/${id}`);
          this.fetchVideos();
          alert('Видео удалено успешно!');
        } catch (error) {
          console.error('Ошибка при удалении видео:', error);
          alert('Не удалось удалить видео.');
        }
      }
    },
    mounted() {
      this.fetchVideos();
    }
  };
  </script>
  
  <style scoped>
  /* Добавьте стили по необходимости */
  button {
    margin-left: 10px;
  }
  </style>
  