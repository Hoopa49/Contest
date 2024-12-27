<!-- frontend/src/components/ContestList.vue -->
<template>
  <div>
    <h2>Список Конкурсов</h2>
    <button @click="showAddForm = true">Добавить Конкурс</button>
    
    <!-- Форма добавления конкурса -->
    <div v-if="showAddForm">
      <h3>Добавить Новый Конкурс</h3>
      <form @submit.prevent="addContest">
        <label>Название:
          <input v-model="newContest.title" type="text" required />
        </label><br/>
        <label>Приз:
          <input v-model="newContest.prize" type="text" required />
        </label><br/>
        <label>Дата начала:
          <input v-model="newContest.startDate" type="date" required />
        </label><br/>
        <label>Дата окончания:
          <input v-model="newContest.endDate" type="date" required />
        </label><br/>
        <label>Условия:
          <textarea v-model="newContest.conditions"></textarea>
        </label><br/>
        <label>Видео ID:
          <input v-model="newContest.videoId" type="number" required />
        </label><br/>
        <button type="submit">Сохранить</button>
        <button type="button" @click="showAddForm = false">Отмена</button>
      </form>
    </div>
    
    <!-- Список конкурсов -->
    <ul>
      <li v-for="contest in contests" :key="contest.id">
        <strong>{{ contest.title }}</strong> — Приз: {{ contest.prize }}
        <span>Дата: {{ formatDate(contest.startDate) }} - {{ formatDate(contest.endDate) }}</span>
        <span>Видео ID: {{ contest.videoId }}</span>
        <button @click="editContest(contest)">Редактировать</button>
        <button @click="deleteContest(contest.id)">Удалить</button>
      </li>
    </ul>
    
    <!-- Форма редактирования конкурса -->
    <div v-if="showEditForm">
      <h3>Редактировать Конкурс</h3>
      <form @submit.prevent="updateContest">
        <label>Название:
          <input v-model="editContestData.title" type="text" required />
        </label><br/>
        <label>Приз:
          <input v-model="editContestData.prize" type="text" required />
        </label><br/>
        <label>Дата начала:
          <input v-model="editContestData.startDate" type="date" required />
        </label><br/>
        <label>Дата окончания:
          <input v-model="editContestData.endDate" type="date" required />
        </label><br/>
        <label>Условия:
          <textarea v-model="editContestData.conditions"></textarea>
        </label><br/>
        <label>Видео ID:
          <input v-model="editContestData.videoId" type="number" required />
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
  name: 'ContestList',
  data() {
    return {
      contests: [],
      showAddForm: false,
      newContest: {
        title: '',
        prize: '',
        startDate: '',
        endDate: '',
        conditions: '',
        videoId: null
      },
      showEditForm: false,
      editContestData: {}
    };
  },
  methods: {
    async fetchContests() {
      try {
        const response = await api.get('/contest');
        this.contests = response.data;
      } catch (error) {
        console.error('Ошибка при получении конкурсов:', error);
        alert('Не удалось загрузить конкурсы.');
      }
    },
    async addContest() {
      try {
        await api.post('/contest', this.newContest);
        this.showAddForm = false;
        this.newContest = { title: '', prize: '', startDate: '', endDate: '', conditions: '', videoId: null };
        this.fetchContests();
        alert('Конкурс добавлен успешно!');
      } catch (error) {
        console.error('Ошибка при добавлении конкурса:', error);
        alert('Не удалось добавить конкурс.');
      }
    },
    editContest(contest) {
      this.editContestData = { ...contest };
      this.showEditForm = true;
    },
    async updateContest() {
      try {
        await api.put(`/contest/${this.editContestData.id}`, this.editContestData);
        this.showEditForm = false;
        this.editContestData = {};
        this.fetchContests();
        alert('Конкурс обновлен успешно!');
      } catch (error) {
        console.error('Ошибка при обновлении конкурса:', error);
        alert('Не удалось обновить конкурс.');
      }
    },
    async deleteContest(id) {
      if (!confirm('Вы уверены, что хотите удалить этот конкурс?')) return;
      try {
        await api.delete(`/contest/${id}`);
        this.fetchContests();
        alert('Конкурс удален успешно!');
      } catch (error) {
        console.error('Ошибка при удалении конкурса:', error);
        alert('Не удалось удалить конкурс.');
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  },
  mounted() {
    this.fetchContests();
  }
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
button {
  margin-left: 10px;
}
</style>
