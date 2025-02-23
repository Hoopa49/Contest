<!-- 
  ContestActions.vue
  Компонент для отображения действий с конкурсом:
  - Переход к конкурсу
  - Участие в конкурсе
  - Добавление в избранное
  - Поделиться
-->
<template>
  <div class="contest-actions">
    <!-- Кнопки действий -->
    <div class="d-flex flex-wrap align-center gap-4">
      <!-- Основная кнопка участия -->
      <div class="d-flex flex-column align-center" style="min-width: 200px;">
        <v-btn
          :color="participateColor"
          :loading="isParticipating"
          :disabled="isButtonDisabled"
          :prepend-icon="participateIcon"
          :data-status="buttonStatus"
          size="large"
          class="flex-grow-0 participation-button"
          @click="handleParticipateClick"
        >
          {{ participateText }}
        </v-btn>
        <span v-if="participateHint" class="text-caption text-grey mt-1 text-center" style="width: 100%;">
          {{ participateHint }}
        </span>
      </div>

      <!-- Дополнительные действия -->
      <div class="d-flex align-center gap-4">
        <v-btn
          :color="isFavorite ? 'warning' : undefined"
          :loading="isTogglingFavorite"
          variant="outlined"
          prepend-icon="mdi-star"
          class="flex-grow-0"
          @click="$emit('toggleFavorite')"
        >
          {{ isFavorite ? 'В избранном' : 'В избранное' }}
        </v-btn>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-share-variant"
          class="flex-grow-0"
          @click="$emit('share')"
        >
          Поделиться
        </v-btn>
      </div>
    </div>

    <!-- Модальное окно с условиями -->
    <contest-conditions-modal
      v-model="showConditionsModal"
      :contest-conditions="contestConditions"
      @submit="handleConditionsConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ContestConditionsModal from '../../participation/ContestConditionsModal.vue'

const props = defineProps({
  isFavorite: {
    type: Boolean,
    default: false
  },
  isTogglingFavorite: {
    type: Boolean,
    default: false
  },
  canParticipate: {
    type: Boolean,
    default: true
  },
  hasUserParticipated: {
    type: Boolean,
    default: false
  },
  conditions: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['participate', 'toggleFavorite', 'share'])

// Состояние
const isParticipating = ref(false)
const showConditionsModal = ref(false)

// Вычисляемые свойства
const participateColor = computed(() => {
  if (props.hasUserParticipated) return 'success'
  if (props.status === 'completed') return 'info'
  if (props.status === 'cancelled') return 'error'
  return 'primary'
})

const participateIcon = computed(() => {
  if (props.hasUserParticipated) return 'mdi-account-check'
  if (props.status === 'completed') return 'mdi-clock-end'
  if (props.status === 'cancelled') return 'mdi-cancel'
  return 'mdi-account-plus'
})

const participateText = computed(() => {
  if (props.hasUserParticipated) return 'Участник'
  if (props.status === 'completed') return 'Конкурс завершен'
  if (props.status === 'cancelled') return 'Конкурс отменен'
  return 'Участвовать'
})

const participateHint = computed(() => {
  if (props.hasUserParticipated) return 'Вы уже участвуете в этом конкурсе'
  if (props.status === 'completed') return 'Прием заявок на участие завершен'
  if (props.status === 'cancelled') return 'Конкурс был отменен'
  return ''
})

const isButtonDisabled = computed(() => {
  return props.hasUserParticipated || 
         !props.canParticipate || 
         isParticipating.value || 
         props.status === 'completed' || 
         props.status === 'cancelled'
})

const contestConditions = computed(() => {
  // Получаем основные правила из секции "Правила участия"
  const basicRules = [
    'Соблюдение авторских прав',
    'Оригинальный контент',
    'Соответствие тематике',
    'Сроки выполнения',
    'Формат подачи работы для youtube'
  ].map((text, index) => ({
    id: index + 1,
    text,
    required: true
  }))

  // Добавляем требования к участникам
  const requirements = props.conditions.map((condition, index) => ({
    id: basicRules.length + index + 1,
    text: condition.text || condition,
    hint: condition.hint,
    required: condition.required !== false
  }))

  return [...basicRules, ...requirements]
})

const buttonStatus = computed(() => {
  if (props.hasUserParticipated) return 'participant'
  if (props.status === 'completed') return 'completed'
  if (props.status === 'cancelled') return 'cancelled'
  return 'active'
})

// Методы
const handleConditionsConfirmed = async (conditions) => {
  if (!props.canParticipate || isParticipating.value) return
  
  try {
    isParticipating.value = true
    await emit('participate')
    showConditionsModal.value = false
  } finally {
    isParticipating.value = false
  }
}

const handleParticipateClick = () => {
  if (props.hasUserParticipated || !props.canParticipate) return
  showConditionsModal.value = true
}
</script> 

<style scoped>
.contest-actions {
  padding: 16px 0;
}

.gap-4 {
  gap: 16px;
}

.participation-button {
  width: 200px !important;
  height: 48px !important;
}

/* Стиль для завершенного конкурса */
.participation-button.v-btn--disabled[data-status="completed"] {
  background-color: transparent !important;
  color: rgb(var(--v-theme-info)) !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Стиль для отмененного конкурса */
.participation-button.v-btn--disabled[data-status="cancelled"] {
  background-color: transparent !important;
  color: rgb(var(--v-theme-error)) !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Стиль для участника */
.participation-button.v-btn--disabled[data-status="participant"] {
  background-color: transparent !important;
  color: rgb(var(--v-theme-success)) !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

@media (width <= 600px) {
  .contest-actions {
    padding: 12px 0;
  }
  
  .gap-4 {
    gap: 12px;
  }
}
</style> 