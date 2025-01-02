<template>
  <v-card class="contest-filters pa-4 mb-4">
    <v-card-title>Фильтры</v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Поиск по названию -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.search"
            label="Поиск по названию"
            prepend-icon="mdi-magnify"
            clearable
            @input="emitFilters"
          ></v-text-field>
        </v-col>

        <!-- Фильтр по дате -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.dateRange"
            :items="dateRanges"
            label="Период"
            @change="emitFilters"
          ></v-select>
        </v-col>

        <!-- Фильтр по статусу -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Статус"
            multiple
            chips
            @change="emitFilters"
          ></v-select>
        </v-col>

        <!-- Сортировка -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.sort"
            :items="sortOptions"
            label="Сортировка"
            @change="emitFilters"
          ></v-select>
        </v-col>

        <!-- Фильтр по метрикам -->
        <v-col cols="12">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                Дополнительные фильтры
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-slider
                      v-model="filters.minScore"
                      label="Минимальный скор анализа"
                      min="0"
                      max="100"
                      thumb-label
                      @change="emitFilters"
                    ></v-slider>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-slider
                      v-model="filters.minViews"
                      label="Минимум просмотров"
                      min="0"
                      max="1000000"
                      thumb-label
                      step="1000"
                      @change="emitFilters"
                    ></v-slider>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>

      <!-- Кнопки управления -->
      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            color="error"
            text
            @click="resetFilters"
            :disabled="!hasActiveFilters"
          >
            Сбросить фильтры
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ContestFilters',

  setup(props, { emit }) {
    const filters = ref({
      search: '',
      dateRange: 'all',
      status: [],
      sort: 'date_desc',
      minScore: 0,
      minViews: 0
    });

    const dateRanges = [
      { text: 'Все время', value: 'all' },
      { text: 'Сегодня', value: 'today' },
      { text: 'Последние 7 дней', value: '7days' },
      { text: 'Последние 30 дней', value: '30days' }
    ];

    const statusOptions = [
      { text: 'Активные', value: 'active' },
      { text: 'Завершенные', value: 'completed' },
      { text: 'Предстоящие', value: 'upcoming' }
    ];

    const sortOptions = [
      { text: 'По дате (сначала новые)', value: 'date_desc' },
      { text: 'По дате (сначала старые)', value: 'date_asc' },
      { text: 'По просмотрам', value: 'views' },
      { text: 'По скору анализа', value: 'score' }
    ];

    const hasActiveFilters = computed(() => {
      return filters.value.search !== '' ||
        filters.value.dateRange !== 'all' ||
        filters.value.status.length > 0 ||
        filters.value.minScore > 0 ||
        filters.value.minViews > 0;
    });

    const emitFilters = () => {
      emit('update:filters', { ...filters.value });
    };

    const resetFilters = () => {
      filters.value = {
        search: '',
        dateRange: 'all',
        status: [],
        sort: 'date_desc',
        minScore: 0,
        minViews: 0
      };
      emitFilters();
    };

    return {
      filters,
      dateRanges,
      statusOptions,
      sortOptions,
      hasActiveFilters,
      emitFilters,
      resetFilters
    };
  }
};
</script> 