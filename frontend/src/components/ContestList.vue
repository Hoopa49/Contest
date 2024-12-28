<template>
  <div class="contest-list">
    <!-- Кнопка добавления конкурса -->
    <v-btn 
      color="primary" 
      @click="showAddForm = true"
      class="mb-4"
    >
      Добавить конкурс
    </v-btn>

    <!-- Список конкурсов -->
    <v-list v-if="contests.length">
      <v-list-item
        v-for="contest in contests"
        :key="contest.id"
        class="mb-4"
      >
        <v-card width="100%">
          <v-card-title>{{ contest.title }}</v-card-title>
          <v-card-text>
            <p>{{ contest.description }}</p>
            <p>Начало: {{ formatDate(contest.startDate) }}</p>
            <p>Окончание: {{ formatDate(contest.endDate) }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn 
              color="primary" 
              @click="editContest(contest)"
            >
              Редактировать
            </v-btn>
            <v-btn 
              color="error" 
              @click="deleteContest(contest.id)"
            >
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-list-item>
    </v-list>
    <v-alert
      v-else-if="!loading"
      type="info"
      text="Нет доступных конкурсов"
    ></v-alert>

    <!-- Индикатор загрузки -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-circular>

    <!-- Форма добавления/редактирования -->
    <v-dialog v-model="showAddForm" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingContest ? 'Редактировать конкурс' : 'Добавить конкурс' }}
        </v-card-title>
        <v-card-text>
          <!-- Форма будет добавлена позже -->
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '../services/backendApi';

export default {
  name: 'ContestList',
  
  data() {
    return {
      contests: [],
      loading: false,
      error: null,
      showAddForm: false,
      showEditForm: false,
      editingContest: null
    }
  },

  methods: {
    async fetchContests() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/api/contests');
        this.contests = response.data;
      } catch (error) {
        console.error('Ошибка при получении конкурсов:', error);
        this.error = 'Не удалось загрузить конкурсы';
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return 'Не указано';
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    editContest(contest) {
      this.editingContest = { ...contest };
      this.showEditForm = true;
    },

    async deleteContest(id) {
      if (!confirm('Вы уверены, что хотите удалить этот конкурс?')) {
        return;
      }

      try {
        await api.delete(`/api/contests/${id}`);
        this.contests = this.contests.filter(c => c.id !== id);
      } catch (error) {
        console.error('Ошибка при удалении конкурса:', error);
        // Добавьте обработку ошибки, например, показ уведомления
      }
    }
  },

  mounted() {
    this.fetchContests();
  }
}
</script>

<style scoped>
.contest-list {
  padding: 20px;
}

.v-list-item {
  margin-bottom: 16px;
}

.v-card {
  width: 100%;
}
</style>