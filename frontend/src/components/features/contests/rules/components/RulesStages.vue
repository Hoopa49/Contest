<!-- 
  RulesStages.vue
  Компонент для отображения этапов проведения конкурса.
  Включает временную шкалу с описанием каждого этапа.
-->
<template>
  <div class="rules-stages">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Этапы конкурса
      </h3>
      <v-chip
        class="ml-4"
        :color="currentStageColor"
        size="small"
        variant="outlined"
      >
        {{ currentStageText }}
      </v-chip>
    </div>

    <!-- Временная шкала -->
    <v-timeline
      density="comfortable"
      align="start"
      line-thickness="2"
      truncate-line="both"
    >
      <v-timeline-item
        v-for="(stage, index) in stages"
        :key="stage.id"
        :dot-color="getStageColor(stage)"
        :size="getStageSize(stage)"
        :icon="getStageIcon(stage)"
        :fill-dot="isCurrentStage(stage)"
        class="stage-item"
      >
        <!-- Дата этапа -->
        <template v-slot:opposite>
          <div class="text-caption">
            {{ formatDate(stage.date) }}
          </div>
          <div 
            v-if="getTimeLeft(stage)"
            class="text-caption text-medium-emphasis"
          >
            {{ getTimeLeft(stage) }}
          </div>
        </template>

        <!-- Содержимое этапа -->
        <v-card
          :class="[
            'stage-card',
            { 'current-stage': isCurrentStage(stage) }
          ]"
          :variant="isCurrentStage(stage) ? 'elevated' : 'flat'"
          :color="isCurrentStage(stage) ? 'primary' : undefined"
        >
          <v-card-title class="text-subtitle-1 py-2">
            {{ stage.title }}
            
            <!-- Индикатор текущего этапа -->
            <v-chip
              v-if="isCurrentStage(stage)"
              color="primary"
              size="x-small"
              class="ml-2"
            >
              Текущий этап
            </v-chip>
          </v-card-title>

          <v-card-text class="pt-2 pb-3">
            <!-- Описание -->
            <div class="text-body-2 mb-2">
              {{ stage.description }}
            </div>

            <!-- Дополнительная информация -->
            <div 
              v-if="stage.note"
              class="text-caption text-medium-emphasis"
            >
              {{ stage.note }}
            </div>

            <!-- Действия -->
            <div 
              v-if="stage.actions && stage.actions.length"
              class="d-flex gap-2 mt-3"
            >
              <v-btn
                v-for="action in stage.actions"
                :key="action.id"
                :color="action.color || 'primary'"
                :variant="action.variant || 'tonal'"
                :disabled="!isStageAvailable(stage)"
                size="small"
                @click="handleAction(stage, action)"
              >
                <v-icon
                  v-if="action.icon"
                  :icon="action.icon"
                  size="small"
                  start
                />
                {{ action.text }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>

    <!-- Предупреждение -->
    <v-alert
      v-if="warning"
      type="warning"
      variant="tonal"
      class="mt-4"
    >
      <template v-slot:prepend>
        <v-icon>mdi-alert</v-icon>
      </template>
      {{ warning }}
    </v-alert>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatters'

// Props
const props = defineProps({
  stages: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(stage => {
        return typeof stage === 'object' &&
          'id' in stage &&
          'title' in stage &&
          'description' in stage &&
          'date' in stage &&
          'status' in stage
      })
    }
  },
  warning: {
    type: String,
    default: ''
  }
})

// Эмиты
const emit = defineEmits(['action'])

// Вычисляемые свойства
const currentStage = computed(() => {
  return props.stages.find(stage => stage.status === 'current') || null
})

const currentStageText = computed(() => {
  if (!currentStage.value) return 'Нет активных этапов'
  return currentStage.value.title
})

const currentStageColor = computed(() => {
  if (!currentStage.value) return 'grey'
  return getStageColor(currentStage.value)
})

// Методы
const getStageColor = (stage) => {
  switch (stage.status) {
    case 'completed': return 'success'
    case 'current': return 'primary'
    case 'upcoming': return 'grey'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getStageSize = (stage) => {
  return isCurrentStage(stage) ? 'large' : 'small'
}

const getStageIcon = (stage) => {
  switch (stage.status) {
    case 'completed': return 'mdi-check-circle'
    case 'current': return 'mdi-play-circle'
    case 'upcoming': return 'mdi-clock-outline'
    case 'cancelled': return 'mdi-close-circle'
    default: return 'mdi-help-circle'
  }
}

const isCurrentStage = (stage) => {
  return stage.status === 'current'
}

const isStageAvailable = (stage) => {
  return ['current', 'completed'].includes(stage.status)
}

const getTimeLeft = (stage) => {
  const now = new Date()
  const stageDate = new Date(stage.date)
  const diff = stageDate - now

  if (diff < 0) return ''
  
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `Через ${Math.floor(days / 30)} мес.`
  if (days > 0) return `Через ${days} дн.`
  
  const hours = Math.ceil(diff / (1000 * 60 * 60))
  if (hours > 0) return `Через ${hours} ч.`
  
  const minutes = Math.ceil(diff / (1000 * 60))
  return `Через ${minutes} мин.`
}

const handleAction = (stage, action) => {
  emit('action', { stage, action })
}
</script>

<style scoped>
.rules-stages {
  position: relative;
}

.stage-item {
  transition: transform 0.2s ease;
}

.stage-card {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.current-stage {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.15);
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
@media (width <= 600px) {
  .stage-card {
    margin-left: 0;
  }
  
  .text-subtitle-1 {
    font-size: 1rem;
  }
  
  .text-body-2 {
    font-size: 0.875rem;
  }
}
</style> 