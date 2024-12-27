<template>
    <div>
      <h2>List of Contests</h2>
      <ul>
        <li v-for="contest in contests" :key="contest.id">
          <strong>{{ contest.title }}</strong> — {{ contest.prize }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '../services/backendApi.js';
  
  export default {
    name: 'ContestList',
    data() {
      return {
        contests: []
      };
    },
    async mounted() {
      // При загрузке компонента вызываем GET /contest
      try {
        const response = await api.get('/contest');
        this.contests = response.data; // массив конкурсов
      } catch (error) {
        console.error(error);
      }
    }
  };
  </script>
  
  <style scoped>
  /* ваши стили */
  </style>
  