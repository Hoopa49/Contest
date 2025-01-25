<template>
  <v-container fluid>
    <v-form ref="form" v-model="isValid" @submit.prevent="saveSettings">
      <v-card>
        <v-card-title class="d-flex align-center">
          Настройки поиска
          <v-spacer></v-spacer>
          <v-btn
            type="submit"
            color="primary"
            :loading="saving"
            :disabled="!isValid || !hasChanges"
          >
            Сохранить
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.region"
                @update:model-value="value => updateSetting('region', value)"
                :items="regions"
                item-title="title"
                item-value="value"
                label="Регион поиска"
                :rules="[v => !!v || 'Выберите регион']"
                hint="Регион для поиска видео"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.language"
                @update:model-value="value => updateSetting('language', value)"
                :items="languages"
                item-title="title"
                item-value="value"
                label="Язык контента"
                :rules="[v => !!v || 'Выберите язык']"
                hint="Язык искомого контента"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.maxResults"
                @update:model-value="value => updateSetting('maxResults', value)"
                :min="10"
                :max="100"
                :step="10"
                label="Максимум результатов"
                thumb-label="always"
                hint="Количество результатов за один поиск"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.quotaLimit"
                @update:model-value="value => updateSetting('quotaLimit', value)"
                :min="1000"
                :max="50000"
                :step="1000"
                label="Лимит квоты API"
                thumb-label="always"
                hint="Дневной лимит запросов к API"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.searchInterval"
                @update:model-value="value => updateSetting('searchInterval', value)"
                :min="10"
                :max="120"
                :step="10"
                label="Интервал поиска (минуты)"
                thumb-label="always"
                hint="Как часто выполнять автоматический поиск"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.channelCheckInterval"
                @update:model-value="value => updateSetting('channelCheckInterval', value)"
                :min="30"
                :max="240"
                :step="30"
                label="Интервал проверки каналов (минуты)"
                thumb-label="always"
                hint="Как часто проверять каналы на новые видео"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.contestProbabilityThreshold"
                @update:model-value="value => updateSetting('contestProbabilityThreshold', value)"
                :min="0"
                :max="1"
                :step="0.1"
                label="Точность определения конкурсов"
                thumb-label="always"
                hint="Минимальный порог уверенности для определения конкурсного видео (0 - низкая, 1 - высокая)"
                persistent-hint
              >
                <template v-slot:append>
                  <v-chip
                    :color="getThresholdColor(localSettings.contestProbabilityThreshold)"
                    class="ml-2"
                  >
                    {{ getThresholdLabel(localSettings.contestProbabilityThreshold) }}
                  </v-chip>
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.minContestVideosForChannel"
                @update:model-value="value => updateSetting('minContestVideosForChannel', value)"
                :min="1"
                :max="10"
                :step="1"
                label="Мин. конкурсов для канала"
                thumb-label="always"
                hint="Минимальное количество конкурсных видео для отслеживания канала"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <div class="text-h6 mb-4">Дополнительные настройки поиска</div>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.videoOrder"
                @update:model-value="value => updateSetting('videoOrder', value)"
                :items="orderOptions"
                item-title="title"
                item-value="value"
                label="Сортировка видео"
                hint="Порядок сортировки результатов поиска"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.videoDuration"
                @update:model-value="value => updateSetting('videoDuration', value)"
                :items="durationOptions"
                item-title="title"
                item-value="value"
                label="Длительность видео"
                hint="Фильтр по длительности видео"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.videoDefinition"
                @update:model-value="value => updateSetting('videoDefinition', value)"
                :items="definitionOptions"
                item-title="title"
                item-value="value"
                label="Качество видео"
                hint="Минимальное качество видео"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="localSettings.videoType"
                @update:model-value="value => updateSetting('videoType', value)"
                :items="typeOptions"
                item-title="title"
                item-value="value"
                label="Тип видео"
                hint="Фильтр по типу видео"
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.minSubscriberCount"
                @update:model-value="value => updateSetting('minSubscriberCount', value)"
                :min="0"
                :max="1000000"
                :step="1000"
                label="Мин. подписчиков"
                thumb-label="always"
                hint="Минимальное количество подписчиков канала"
                persistent-hint
              >
                <template v-slot:thumb-label="{ modelValue }">
                  {{ formatNumber(modelValue) }}
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.minViewCount"
                @update:model-value="value => updateSetting('minViewCount', value)"
                :min="0"
                :max="1000000"
                :step="1000"
                label="Мин. просмотров"
                thumb-label="always"
                hint="Минимальное количество просмотров видео"
                persistent-hint
              >
                <template v-slot:thumb-label="{ modelValue }">
                  {{ formatNumber(modelValue) }}
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.minVideoAge"
                @update:model-value="value => updateSetting('minVideoAge', value)"
                :min="0"
                :max="30"
                :step="1"
                label="Мин. возраст видео (дни)"
                thumb-label="always"
                hint="Минимальный возраст видео для анализа"
                persistent-hint
              ></v-slider>
            </v-col>

            <v-col cols="12" md="6">
              <v-slider
                :model-value="localSettings.maxVideoAge"
                @update:model-value="value => updateSetting('maxVideoAge', value)"
                :min="1"
                :max="90"
                :step="1"
                label="Макс. возраст видео (дни)"
                thumb-label="always"
                hint="Максимальный возраст видео для анализа"
                persistent-hint
              ></v-slider>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useYoutubeStore } from '@/stores/youtube'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const youtubeStore = useYoutubeStore()
const form = ref(null)
const isValid = ref(false)
const saving = ref(false)

const originalSettings = ref(null)
const localSettings = ref({ ...props.modelValue })

const settings = computed({
  get: () => {
    const defaultSettings = {
      quotaLimit: 10000,
      searchInterval: 30,
      channelCheckInterval: 60,
      maxResults: 50,
      region: 'RU',
      language: 'ru',
      contestProbabilityThreshold: 0.7,
      minContestVideosForChannel: 3,
      videoOrder: 'date',
      videoDuration: 'any',
      videoDefinition: 'any',
      videoType: 'video',
      minSubscriberCount: 0,
      minViewCount: 0,
      minVideoAge: 0,
      maxVideoAge: 30
    }
    return { ...defaultSettings, ...localSettings.value }
  },
  set: (value) => {
    localSettings.value = { ...value }
    emit('update:modelValue', { ...localSettings.value })
  }
})

const regions = [
  { title: 'Россия', value: 'RU' },
  { title: 'США', value: 'US' },
  { title: 'Великобритания', value: 'GB' },
  { title: 'Германия', value: 'DE' },
  { title: 'Франция', value: 'FR' },
  { title: 'Испания', value: 'ES' },
  { title: 'Италия', value: 'IT' },
  { title: 'Япония', value: 'JP' },
  { title: 'Южная Корея', value: 'KR' },
  { title: 'Индия', value: 'IN' }
]

const languages = [
  { title: 'Русский', value: 'ru' },
  { title: 'Английский', value: 'en' },
  { title: 'Немецкий', value: 'de' },
  { title: 'Французский', value: 'fr' },
  { title: 'Испанский', value: 'es' },
  { title: 'Итальянский', value: 'it' },
  { title: 'Японский', value: 'ja' },
  { title: 'Корейский', value: 'ko' }
]

const orderOptions = [
  { title: 'По дате (сначала новые)', value: 'date' },
  { title: 'По релевантности', value: 'relevance' },
  { title: 'По рейтингу', value: 'rating' },
  { title: 'По просмотрам', value: 'viewCount' },
  { title: 'По названию', value: 'title' }
]

const durationOptions = [
  { title: 'Любая', value: 'any' },
  { title: 'Короткие (< 4 мин)', value: 'short' },
  { title: 'Средние (4-20 мин)', value: 'medium' },
  { title: 'Длинные (> 20 мин)', value: 'long' }
]

const definitionOptions = [
  { title: 'Любое', value: 'any' },
  { title: 'Стандартное', value: 'standard' },
  { title: 'Высокое (HD)', value: 'high' }
]

const typeOptions = [
  { title: 'Любой', value: 'any' },
  { title: 'Видео', value: 'video' },
  { title: 'Каналы', value: 'channel' },
  { title: 'Плейлисты', value: 'playlist' }
]

const getThresholdColor = (value) => {
  if (value >= 0.8) return 'success'
  if (value >= 0.5) return 'warning'
  return 'error'
}

const getThresholdLabel = (value) => {
  if (value >= 0.8) return 'Высокая точность'
  if (value >= 0.5) return 'Средняя точность'
  return 'Низкая точность'
}

const hasChanges = computed(() => {
  if (!originalSettings.value) return false
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

const loadSettings = async () => {
  try {
    const response = await youtubeStore.getSettings()
    if (response && response.data) {
      const loadedSettings = {
        quotaLimit: parseInt(response.data.quota_limit),
        searchInterval: parseInt(response.data.search_interval),
        channelCheckInterval: parseInt(response.data.channel_check_interval),
        maxResults: parseInt(response.data.max_results),
        region: response.data.region,
        language: response.data.language,
        contestProbabilityThreshold: parseFloat(response.data.contest_probability_threshold),
        minContestVideosForChannel: parseInt(response.data.min_contest_videos_for_channel),
        videoOrder: response.data.video_order,
        videoDuration: response.data.video_duration,
        videoDefinition: response.data.video_definition,
        videoType: response.data.video_type,
        minSubscriberCount: parseInt(response.data.min_subscriber_count),
        minViewCount: parseInt(response.data.min_view_count),
        minVideoAge: parseInt(response.data.min_video_age),
        maxVideoAge: parseInt(response.data.max_video_age)
      }
      originalSettings.value = { ...loadedSettings }
      localSettings.value = { ...loadedSettings }
      emit('update:modelValue', { ...loadedSettings })
    }
  } catch (error) {
    console.error('Ошибка при загрузке настроек:', error)
  }
}

const saveSettings = async () => {
  if (!form.value.validate()) return
  
  saving.value = true
  try {
    const settingsToSave = {
      ...localSettings.value,
      quotaLimit: parseInt(localSettings.value.quotaLimit),
      searchInterval: parseInt(localSettings.value.searchInterval),
      channelCheckInterval: parseInt(localSettings.value.channelCheckInterval),
      maxResults: parseInt(localSettings.value.maxResults),
      contestProbabilityThreshold: parseFloat(localSettings.value.contestProbabilityThreshold),
      minContestVideosForChannel: parseInt(localSettings.value.minContestVideosForChannel),
      minSubscriberCount: parseInt(localSettings.value.minSubscriberCount),
      minViewCount: parseInt(localSettings.value.minViewCount),
      minVideoAge: parseInt(localSettings.value.minVideoAge),
      maxVideoAge: parseInt(localSettings.value.maxVideoAge)
    }
    
    await youtubeStore.updateSettings(settingsToSave)
    originalSettings.value = { ...settingsToSave }
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error)
  } finally {
    saving.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const updateSetting = (key, value) => {
  localSettings.value[key] = value
  emit('update:modelValue', { ...localSettings.value })
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localSettings.value = { ...newValue }
  }
}, { immediate: true })

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.v-card-text {
  padding-top: 16px;
}
</style> 