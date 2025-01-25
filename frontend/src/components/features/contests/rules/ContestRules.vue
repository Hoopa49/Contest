<!-- 
  ContestRules.vue
  Основной компонент для отображения правил конкурса.
  Объединяет все подкомпоненты правил в единый интерфейс.
-->
<template>
  <div class="contest-rules">
    <!-- Заголовок и кнопка скачивания -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5">Правила конкурса</h2>
      <v-btn
        v-if="allowDownload"
        :loading="downloading"
        :disabled="downloading"
        color="primary"
        variant="outlined"
        prepend-icon="mdi-download"
        @click="downloadRules"
      >
        Скачать правила
      </v-btn>
    </div>

    <!-- Загрузка -->
    <v-skeleton-loader
      v-if="loading"
      type="article, paragraph, actions"
    />

    <!-- Ошибка загрузки -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
      <template v-slot:append>
        <v-btn
          variant="text"
          @click="loadRules"
        >
          Повторить
        </v-btn>
      </template>
    </v-alert>

    <!-- Контент правил -->
    <template v-else>
      <!-- Обзор -->
      <rules-overview
        v-if="overview"
        :contest-id="contestId"
        :start-date="overview.startDate"
        :end-date="overview.endDate"
        :prize-fund="overview.prizeFund"
        :allow-download="allowDownload"
        class="mb-6"
        @download="downloadRules"
      />

      <!-- Требования -->
      <rules-requirements
        v-if="requirements && requirements.length"
        :requirements="requirements"
        :notes="requirementsNotes"
        :warnings="requirementsWarnings"
        class="mb-6"
      />

      <!-- Этапы -->
      <rules-stages
        v-if="stages && stages.length"
        :stages="stages"
        :warnings="stagesWarnings"
        class="mb-6"
      />

      <!-- Разделы правил -->
      <rules-sections
        v-if="sections && sections.length"
        :sections="sections"
        class="mb-6"
      />

      <!-- Ограничения -->
      <rules-restrictions
        v-if="restrictions && restrictions.length"
        :restrictions="restrictions"
        :note="restrictionsNote"
      />
    </template>

    <!-- Уведомления -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationColor"
      :timeout="3000"
    >
      {{ notificationText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RulesOverview from './components/RulesOverview.vue'
import RulesRequirements from './components/RulesRequirements.vue'
import RulesStages from './components/RulesStages.vue'
import RulesSections from './components/RulesSections.vue'
import RulesRestrictions from './components/RulesRestrictions.vue'

// Props
const props = defineProps({
  contestId: {
    type: [Number, String],
    required: true
  },
  allowDownload: {
    type: Boolean,
    default: true
  }
})

// Состояние
const loading = ref(false)
const error = ref(null)
const downloading = ref(false)

const overview = ref(null)
const requirements = ref([])
const requirementsNotes = ref([])
const requirementsWarnings = ref([])
const stages = ref([])
const stagesWarnings = ref([])
const sections = ref([])
const restrictions = ref([])
const restrictionsNote = ref('')

const showNotification = ref(false)
const notificationText = ref('')
const notificationColor = ref('success')

// Методы
const loadRules = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Здесь будет API-запрос для загрузки правил
    const response = await fetch(`/api/contests/${props.contestId}/rules`)
    const data = await response.json()
    
    // Обновляем состояние
    overview.value = data.overview
    requirements.value = data.requirements || []
    requirementsNotes.value = data.requirementsNotes || []
    requirementsWarnings.value = data.requirementsWarnings || []
    stages.value = data.stages || []
    stagesWarnings.value = data.stagesWarnings || []
    sections.value = data.sections || []
    restrictions.value = data.restrictions || []
    restrictionsNote.value = data.restrictionsNote || ''
    
  } catch (e) {
    error.value = 'Не удалось загрузить правила конкурса'
    console.error('Error loading rules:', e)
  } finally {
    loading.value = false
  }
}

const downloadRules = async () => {
  if (downloading.value) return
  
  downloading.value = true
  try {
    // Здесь будет API-запрос для скачивания правил
    const response = await fetch(`/api/contests/${props.contestId}/rules/download`)
    const blob = await response.blob()
    
    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contest-${props.contestId}-rules.pdf`
    
    // Запускаем скачивание
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Очищаем URL
    window.URL.revokeObjectURL(url)
    
    showNotification.value = true
    notificationText.value = 'Правила успешно скачаны'
    notificationColor.value = 'success'
    
  } catch (e) {
    showNotification.value = true
    notificationText.value = 'Не удалось скачать правила'
    notificationColor.value = 'error'
    console.error('Error downloading rules:', e)
  } finally {
    downloading.value = false
  }
}

// Жизненный цикл
onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.contest-rules {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Анимации */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 600px) {
  .contest-rules {
    padding: 16px;
  }
}
</style> 