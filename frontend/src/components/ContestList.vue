<template>
  <div class="contest-list">
    <div class="d-flex justify-space-between align-center mb-4">
      <v-btn color="primary" @click="showAddForm = true">
        Добавить конкурс
      </v-btn>
      
      <v-btn-toggle v-model="viewMode" mandatory>
        <v-btn value="list">
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <v-btn value="grid">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Фильтры -->
    <contest-filters
      @update:filters="updateFilters"
    />

    <!-- Список конкурсов -->
    <div v-if="filteredContests.length">
      <!-- Вид списком -->
      <v-list v-if="viewMode === 'list'">
        <v-list-item
          v-for="contest in filteredContests"
          :key="contest.id"
          class="mb-4"
        >
          <v-card width="100%">
            <v-card-title class="d-flex justify-space-between">
              {{ contest.title }}
              <v-chip :color="getStatusColor(contest.status)">
                {{ getStatusText(contest.status) }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <p>{{ contest.description }}</p>
              <div class="d-flex flex-wrap">
                <span class="mr-4">
                  <v-icon small>mdi-calendar-start</v-icon>
                  {{ formatDate(contest.startDate) }}
                </span>
                <span class="mr-4">
                  <v-icon small>mdi-calendar-end</v-icon>
                  {{ formatDate(contest.endDate) }}
                </span>
                <span v-if="contest.analysis">
                  <v-icon small>mdi-chart-bar</v-icon>
                  Скор: {{ Math.round(contest.analysis.score * 100) }}%
                </span>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="primary" @click="showDetails(contest)">
                Подробнее
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon @click="editContest(contest)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="error" @click="deleteContest(contest.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-list-item>
      </v-list>

      <!-- Вид сеткой -->
      <v-row v-else>
        <v-col
          v-for="contest in filteredContests"
          :key="contest.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card height="100%">
            <!-- Содержимое карточки такое же, как в списке -->
          </v-card>
        </v-col>
      </v-row>
    </div>

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

    <!-- Диалог с деталями -->
    <v-dialog v-model="showDetailsDialog" max-width="700">
      <contest-details
        v-if="selectedContest"
        :contest="selectedContest"
        @close="showDetailsDialog = false"
      />
    </v-dialog>

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
import { ref, computed } from 'vue';
import api from '../services/backendApi';
import { useToast } from 'vue-toastification';
import ContestFilters from './ContestFilters.vue';
import ContestDetails from './ContestDetails.vue';

export default {
  name: 'ContestList',
  
  components: {
    ContestFilters,
    ContestDetails
  },

  setup() {
    const toast = useToast();
    const contests = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const showAddForm = ref(false);
    const showDetailsDialog = ref(false);
    const selectedContest = ref(null);
    const editingContest = ref(null);
    const viewMode = ref('list');
    const filters = ref({
      search: '',
      dateRange: 'all',
      status: [],
      sort: 'date_desc',
      minScore: 0,
      minViews: 0
    });

    const filteredContests = computed(() => {
      let result = [...contests.value];

      // Применяем фильтры
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase();
        result = result.filter(contest => 
          contest.title.toLowerCase().includes(search) ||
          contest.description.toLowerCase().includes(search)
        );
      }

      if (filters.value.status.length) {
        result = result.filter(contest => 
          filters.value.status.includes(contest.status)
        );
      }

      if (filters.value.minScore > 0) {
        result = result.filter(contest => 
          (contest.analysis?.score || 0) * 100 >= filters.value.minScore
        );
      }

      // Сортировка
      result.sort((a, b) => {
        switch (filters.value.sort) {
          case 'date_desc':
            return new Date(b.startDate) - new Date(a.startDate);
          case 'date_asc':
            return new Date(a.startDate) - new Date(b.startDate);
          case 'views':
            return (b.statistics?.viewCount || 0) - (a.statistics?.viewCount || 0);
          case 'score':
            return (b.analysis?.score || 0) - (a.analysis?.score || 0);
          default:
            return 0;
        }
      });

      return result;
    });

    // ... остальные методы остаются без изменений ...

    return {
      contests,
      loading,
      error,
      showAddForm,
      showDetailsDialog,
      selectedContest,
      editingContest,
      viewMode,
      filteredContests,
      updateFilters: (newFilters) => {
        filters.value = newFilters;
      }
    };
  }
};
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