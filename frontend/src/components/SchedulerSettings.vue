<template>
  <v-card class="scheduler-settings pa-4 mt-8">
    <v-card-title class="d-flex justify-space-between align-center">
      Настройки сборщика
      <div class="d-flex align-center">
        <v-btn icon @click="exportSettings" class="mr-2">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="importSettings" class="mr-2">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn icon @click="loadSettings" :loading="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-form ref="form" @submit.prevent="saveSettings">
        <v-tabs
          v-model="activeTab"
          bg-color="primary"
          class="mb-4"
        >
          <v-tab value="basic">ОСНОВНЫЕ</v-tab>
          <v-tab value="keywords">КЛЮЧЕВЫЕ СЛОВА</v-tab>
          <v-tab value="filters">ФИЛЬТРЫ</v-tab>
          <v-tab value="scoring">ОЦЕНКА</v-tab>
          <v-tab value="schedule">РАСПИСАНИЕ</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="basic">
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.maxVideosPerRun"
                  type="number"
                  label="Максимум видео за один запуск"
                  :rules="[rules.required, rules.positive]"
                  hint="Ограничивает количество обрабатываемых видео"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.maxApiRequestsPerRun"
                  type="number"
                  label="Лимит API запросов за запуск"
                  :rules="[rules.required, rules.positive]"
                  hint="Помогает контролировать использование квоты"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.minVideoViews"
                  type="number"
                  label="Минимальное количество просмотров"
                  :rules="[rules.required, rules.positive]"
                  hint="Фильтрация видео по популярности"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.searchOrder"
                  :items="searchOrderOptions"
                  label="Порядок поиска"
                  hint="Влияет на релевантность результатов"
                  persistent-hint
                ></v-select>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="keywords">
            <v-row class="mt-4">
              <v-col cols="12">
                <v-combobox
                  v-model="settings.keywords"
                  multiple
                  chips
                  label="Ключевые слова"
                  hint="Добавьте ключевые слова для поиска конкурсов"
                  persistent-hint
                >
                  <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="removeKeyword(item)"
                    >
                      {{ item }}
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col>

              <v-col cols="12">
                <v-data-table
                  :headers="keywordHeaders"
                  :items="keywordStats"
                  :items-per-page="5"
                  dense
                >
                  <template v-slot:item.efficiency="{ item }">
                    <v-progress-linear
                      :value="item.efficiency"
                      height="20"
                      color="primary"
                    >
                      <template v-slot:default>
                        {{ item.efficiency }}%
                      </template>
                    </v-progress-linear>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="filters">
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.minDurationMinutes"
                  type="number"
                  label="Минимальная длительность (мин)"
                  hint="Минимальная длительность видео в минутах"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.maxDurationMinutes"
                  type="number"
                  label="Максимальная длительность (мин)"
                  hint="Максимальная длительность видео в минутах"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.minLikes"
                  type="number"
                  label="Минимум лайков"
                  hint="Минимальное количество лайков"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="settings.filters.excludedChannels"
                  multiple
                  chips
                  label="Исключенные каналы"
                  hint="Добавьте ID каналов для исключения"
                  persistent-hint
                >
                  <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="removeExcludedChannel(item)"
                    >
                      {{ item }}
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="scoring">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.titleWeight"
                  type="number"
                  label="Вес заголовка"
                  :rules="[rules.required, rules.positive]"
                  hint="Влияние заголовка на общий балл"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.descriptionWeight"
                  type="number"
                  label="Вес описания"
                  :rules="[rules.required, rules.positive]"
                  hint="Влияние описания на общий балл"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.tagsWeight"
                  type="number"
                  label="Вес тегов"
                  :rules="[rules.required, rules.positive]"
                  hint="Влияние тегов на общий балл"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.minimumTotalScore"
                  type="number"
                  label="Минимальный общий балл"
                  :rules="[rules.required, rules.positive]"
                  hint="Минимальный балл для успешного поиска"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="schedule">
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <div class="text-h6">Расписание запусков</div>
                <v-switch
                  v-model="settings.schedule.enabled"
                  @change="toggleSchedule"
                  label="Активировать"
                ></v-switch>
              </v-col>

              <!-- Частота запусков -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.schedule.frequency"
                  :items="frequencies"
                  item-title="label"
                  item-value="value"
                  label="Частота запусков"
                  :disabled="!settings.schedule.enabled"
                ></v-select>
              </v-col>

              <!-- Время запуска -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.schedule.time"
                  :items="timeSlots"
                  label="Время запуска"
                  :disabled="!settings.schedule.enabled || settings.schedule.frequency === 'hourly'"
                ></v-select>
              </v-col>

              <!-- Дни недели (для weekly) -->
              <v-col cols="12" v-if="settings.schedule.frequency === 'weekly'">
                <v-chip-group
                  v-model="settings.schedule.days"
                  multiple
                  column
                  :disabled="!settings.schedule.enabled"
                >
                  <v-chip
                    v-for="day in weekDays"
                    :key="day.value"
                    :value="day.value"
                    filter
                    outlined
                  >
                    {{ day.text }}
                  </v-chip>
                </v-chip-group>
              </v-col>

              <!-- Следующий запуск -->
              <v-col cols="12">
                <v-alert
                  v-if="settings.schedule.enabled && nextRun"
                  type="info"
                  class="mt-4"
                  border="left"
                  text
                >
                  Следующий запуск: {{ formatNextRun }}
                </v-alert>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>

        <v-divider class="my-4"></v-divider>

        <div class="d-flex justify-end">
          <v-btn
            text
            @click="resetSettings"
            :disabled="loading"
            class="mr-2"
          >
            Сбросить
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="loading"
          >
            Сохранить
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import api from '../services/backendApi';

export default {
  name: 'SchedulerSettings',
  
  setup() {
    const toast = useToast();
    const form = ref(null);
    const loading = ref(false);
    const activeTab = ref('basic');
    
    const defaultSettings = {
      maxVideosPerRun: 200,
      maxApiRequestsPerRun: 1000,
      minVideoViews: 1000,
      searchOrder: 'date',
      keywords: [],
      titleWeight: 1.0,
      descriptionWeight: 0.7,
      tagsWeight: 0.3,
      minimumTotalScore: 0.5,
      minDurationMinutes: 0,
      maxDurationMinutes: 0,
      minLikes: 0,
      filters: {
        excludedChannels: []
      },
      schedule: {
        enabled: false,
        frequency: 'daily',
        time: '00:00',
        days: []
      }
    };

    const settings = ref({...defaultSettings});

    const frequencies = [
      { label: 'Каждый час', value: 'hourly' },
      { label: 'Ежедневно', value: 'daily' },
      { label: 'Еженедельно', value: 'weekly' }
    ];

    const searchOrderOptions = [
      { text: 'По дате', value: 'date' },
      { text: 'По релевантности', value: 'relevance' },
      { text: 'По просмотрам', value: 'viewCount' }
    ].map(o => ({
      ...o,
      toString() { return this.text }
    }));

    const weekDays = [
      { text: 'Понедельник', value: 1 },
      { text: 'Вторник', value: 2 },
      { text: 'Среда', value: 3 },
      { text: 'Четверг', value: 4 },
      { text: 'Пятница', value: 5 },
      { text: 'Суббота', value: 6 },
      { text: 'Воскресенье', value: 0 }
    ].map(d => ({
      ...d,
      toString() { return this.text }
    }));

    const keywordHeaders = [
      { text: 'Ключевое слово', value: 'keyword', sortable: false },
      { text: 'Найдено конкурсов', value: 'count', sortable: true },
      { text: 'Эффективность', value: 'efficiency', sortable: true }
    ];

    const keywordStats = ref([]);

    const rules = {
      required: v => !!v || 'Обязательное поле',
      positive: v => v > 0 || 'Значение должно быть больше 0',
      maxValue: max => v => !v || v <= max || `Значение должно быть не больше ${max}`
    };

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return `${hour}:00`;
    });

    // Вычисляемые свойства
    const nextRun = computed(() => {
      if (!settings.value.schedule.enabled) return null;
      
      const now = new Date();
      const next = new Date(now);
      
      switch (settings.value.schedule.frequency) {
        case 'hourly':
          // Для hourly устанавливаем следующий час
          next.setHours(now.getHours() + 1, 0, 0, 0);
          break;
          
        case 'daily':
          // Для daily используем указанное время
          const [hours, minutes] = settings.value.schedule.time.split(':');
          next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
          break;
          
        case 'weekly':
          // Для weekly используем указанное время и дни недели
          const [weeklyHours, weeklyMinutes] = settings.value.schedule.time.split(':');
          next.setHours(parseInt(weeklyHours), parseInt(weeklyMinutes), 0, 0);
          
          if (settings.value.schedule.days.length > 0) {
            while (!settings.value.schedule.days.includes(next.getDay())) {
              next.setDate(next.getDate() + 1);
            }
            if (next <= now) {
              next.setDate(next.getDate() + 7);
            }
          }
          break;
      }
      
      return next;
    });

    const formatNextRun = computed(() => {
      if (!nextRun.value) return '';
      return new Date(nextRun.value).toLocaleString('ru-RU');
    });

    // Методы
    const toggleSchedule = async () => {
      if (!settings.value.schedule.enabled) {
        settings.value.schedule.days = [];
      }
      await saveSettings();
    };

    // Отслеживание изменений
    watch(
      () => settings.value.schedule.frequency,
      (newFreq) => {
        if (newFreq !== 'weekly') {
          settings.value.schedule.days = [];
        }
      }
    );

    // Методы
    const loadSettings = async () => {
      loading.value = true;
      try {
        const [settingsResponse, statsResponse, cronResponse] = await Promise.all([
          api.get('/api/scheduler/settings'),
          api.get('/api/scheduler/keywords/stats'),
          api.get('/api/scheduler/cron')
        ]);
        
        settings.value = {
          ...defaultSettings,
          ...settingsResponse.data,
          filters: {
            excludedChannels: settingsResponse.data.filters?.excludedChannels || []
          },
          schedule: {
            enabled: cronResponse.data.enabled,
            frequency: cronResponse.data.frequency,
            time: cronResponse.data.time,
            days: cronResponse.data.days || []
          }
        };
        
        keywordStats.value = statsResponse.data;
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        toast.error('Ошибка при загрузке настроек');
      } finally {
        loading.value = false;
      }
    };

    // Методы для работы с фильтрами
    const removeExcludedChannel = (channel) => {
      settings.value.filters.excludedChannels = 
        settings.value.filters.excludedChannels.filter(ch => ch !== channel);
    };

    // Валидация настроек расписания
    const validateSchedule = () => {
      if (!settings.value.schedule.enabled) return true;
      
      if (!settings.value.schedule.time) {
        toast.error('Укажите время запуска');
        return false;
      }

      if (settings.value.schedule.frequency === 'weekly' && settings.value.schedule.days.length === 0) {
        toast.error('Выберите хотя бы один день недели');
        return false;
      }

      return true;
    };

    // Расширяем существующий метод saveSettings
    const saveSettings = async () => {
      if (!form.value.validate()) return;
      if (!validateSchedule()) return;
      
      loading.value = true;
      try {
        // Сохраняем основные настройки
        await api.post('/api/scheduler/settings', {
          maxVideosPerRun: settings.value.maxVideosPerRun,
          maxApiRequestsPerRun: settings.value.maxApiRequestsPerRun,
          minVideoViews: settings.value.minVideoViews,
          keywords: settings.value.keywords,
          titleWeight: settings.value.titleWeight,
          descriptionWeight: settings.value.descriptionWeight,
          tagsWeight: settings.value.tagsWeight,
          minimumTotalScore: settings.value.minimumTotalScore,
          minDurationMinutes: settings.value.minDurationMinutes,
          maxDurationMinutes: settings.value.maxDurationMinutes,
          minLikes: settings.value.minLikes
        });

        // Отдельно сохраняем настройки расписания
        await api.post('/api/scheduler/cron', {
          enabled: settings.value.schedule.enabled,
          frequency: settings.value.schedule.frequency,
          time: settings.value.schedule.time,
          days: settings.value.schedule.days
        });

        toast.success('Настройки сохранены');
      } catch (error) {
        toast.error('Ошибка при сохранении настроек');
        console.error('Ошибка при сохранении настроек:', error);
      } finally {
        loading.value = false;
      }
    };

    const resetSettings = async () => {
      loading.value = true;
      try {
        await api.post('/api/scheduler/settings/reset');
        await loadSettings();
        toast.success('Настройки сброшены');
      } catch (error) {
        toast.error('Ошибка при сбросе настроек');
        console.error('Ошибка при сбросе настроек:', error);
      } finally {
        loading.value = false;
      }
    };

    const exportSettings = () => {
      const dataStr = JSON.stringify(settings.value, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scheduler-settings.json';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Настройки экспортированы');
    };

    const importSettings = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const importedSettings = JSON.parse(e.target.result);
            settings.value = { ...settings.value, ...importedSettings };
            await saveSettings();
            toast.success('Настройки импортированы');
          } catch (error) {
            toast.error('Ошибка при импорте настроек');
            console.error('Ошибка при импорте настроек:', error);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };

    const removeKeyword = (keyword) => {
      settings.value.keywords = settings.value.keywords.filter(k => k !== keyword);
    };

    // Инициализация
    onMounted(() => {
      loadSettings();
    });

    return {
      form,
      loading,
      activeTab,
      settings,
      searchOrderOptions,
      keywordHeaders,
      keywordStats,
      rules,
      loadSettings,
      saveSettings,
      resetSettings,
      exportSettings,
      importSettings,
      removeKeyword,
      frequencies,
      weekDays,
      timeSlots,
      nextRun,
      formatNextRun,
      removeExcludedChannel,
      validateSchedule,
      toggleSchedule
    };
  }
};
</script>

<style scoped>
.scheduler-settings {
  margin: 0 auto;
}

.v-tabs {
  margin-bottom: 20px;
}

.v-tab {
  text-transform: uppercase;
  font-weight: 500;
}

.v-tab--active {
  color: var(--v-primary-base) !important;
}
</style> 