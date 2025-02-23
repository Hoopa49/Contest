<!-- 
  ParticipationStatus.vue
  Компонент для отображения статуса и прогресса участия в конкурсе.
  Включает заголовок со статусом и индикатор прогресса.
-->
<template>
  <div class="participation-status">
    <!-- Заголовок со статусом -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Участие в конкурсе
      </h3>
      <v-chip
        class="ml-4"
        :color="statusColor"
        size="small"
      >
        {{ statusText }}
      </v-chip>
    </div>

    <!-- Индикатор прогресса -->
    <v-progress-linear
      :model-value="progress"
      :color="progressColor"
      height="20"
      rounded
      class="mb-2"
    >
      <template v-slot:default="{ value }">
        <span class="progress-text">{{ Math.ceil(value) }}% выполнено</span>
      </template>
    </v-progress-linear>

    <!-- Подсказка -->
    <div 
      v-if="hint"
      class="text-caption text-medium-emphasis mt-1"
    >
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  progress: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Вычисляемые свойства
const statusText = computed(() => {
  if (props.loading) return 'Загрузка...'
  if (props.progress === 100) return 'Выполнено'
  if (props.progress > 0) return 'В процессе'
  return 'Не начато'
})

const statusColor = computed(() => {
  if (props.loading) return 'grey'
  if (props.progress === 100) return 'success'
  if (props.progress > 0) return 'warning'
  return 'error'
})

const progressColor = computed(() => {
  if (props.loading) return 'grey'
  if (props.progress === 100) return 'success'
  return 'primary'
})

const hint = computed(() => {
  if (props.loading) return 'Загрузка данных...'
  if (props.progress === 100) return 'Все условия выполнены'
  if (props.progress > 0) return 'Выполните оставшиеся условия'
  return 'Начните выполнять условия участия'
})
</script>

<style scoped>
.participation-status {
  position: relative;
}

.progress-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(var(--v-theme-on-surface), 0.2);
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
  .progress-text {
    font-size: 0.75rem;
  }
}
</style> 