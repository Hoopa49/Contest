<!-- 
  ParticipationConditions.vue
  Компонент для отображения и управления условиями участия в конкурсе.
  Включает список условий с чекбоксами, подсказками и индикацией выполнения.
-->
<template>
  <div class="participation-conditions">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-subtitle-1 mb-0">
        Условия участия
      </h3>
      <v-chip
        class="ml-4"
        :color="completedColor"
        size="small"
        variant="outlined"
      >
        {{ completedText }}
      </v-chip>
    </div>

    <!-- Список условий -->
    <v-list>
      <v-list-item
        v-for="condition in conditions"
        :key="condition.id"
        :class="{
          'completed': condition.completed,
          'disabled': !condition.available || loading
        }"
      >
        <template v-slot:prepend>
          <v-checkbox
            v-model="condition.completed"
            :disabled="!condition.available || loading"
            :color="getCheckboxColor(condition)"
            hide-details
            @update:model-value="updateCondition(condition)"
          />
        </template>

        <v-list-item-title 
          :class="{ 
            'text-disabled': !condition.available,
            'text-success': condition.completed
          }"
        >
          {{ condition.title }}
          <v-chip
            v-if="condition.required"
            size="x-small"
            color="error"
            class="ml-2"
          >
            Обязательно
          </v-chip>
        </v-list-item-title>

        <template v-slot:append>
          <!-- Индикатор загрузки -->
          <v-progress-circular
            v-if="loading && condition.loading"
            indeterminate
            size="20"
            width="2"
            color="primary"
            class="mr-2"
          />

          <!-- Иконка статуса -->
          <v-icon
            v-else-if="condition.completed"
            color="success"
            size="small"
            class="mr-2"
          >
            mdi-check-circle
          </v-icon>

          <!-- Подсказка -->
          <v-tooltip
            v-if="condition.hint"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                :color="condition.completed ? 'success' : 'info'"
                size="small"
              >
                mdi-information
              </v-icon>
            </template>
            {{ condition.hint }}
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <!-- Сообщение об ошибке -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      closable
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  conditions: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(condition => {
        return typeof condition === 'object' &&
          'id' in condition &&
          'title' in condition &&
          'completed' in condition &&
          'available' in condition
      })
    }
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

// Эмиты
const emit = defineEmits(['update:conditions'])

// Вычисляемые свойства
const completedCount = computed(() => {
  return props.conditions.filter(c => c.completed).length
})

const requiredCount = computed(() => {
  return props.conditions.filter(c => c.required).length
})

const completedRequired = computed(() => {
  return props.conditions.filter(c => c.required && c.completed).length
})

const totalCount = computed(() => props.conditions.length)

const isAllCompleted = computed(() => {
  return completedCount.value === totalCount.value
})

const completedText = computed(() => {
  if (props.loading) return 'Загрузка...'
  
  const completed = completedCount.value
  const total = totalCount.value
  const required = requiredCount.value
  const completedReq = completedRequired.value

  if (required > 0) {
    return `Выполнено ${completedReq}/${required} обязательных и ${completed - completedReq}/${total - required} доп.`
  }
  
  return `Выполнено ${completed} из ${total}`
})

const completedColor = computed(() => {
  if (props.loading) return 'grey'
  if (isAllCompleted.value) return 'success'
  if (completedCount.value > 0) return 'warning'
  return 'error'
})

// Методы
const getCheckboxColor = (condition) => {
  if (!condition.available) return 'grey'
  if (condition.completed) return 'success'
  return 'primary'
}

const updateCondition = (condition) => {
  emit('update:conditions', [...props.conditions])
}
</script>

<style scoped>
.participation-conditions {
  position: relative;
}

.v-list-item.completed {
  background-color: rgba(var(--v-theme-success), 0.05);
}

.v-list-item.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Анимации */
.v-list-item {
  transition: background-color 0.3s ease;
}

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
  .v-list-item {
    padding: 8px;
  }
  
  .v-list-item-title {
    font-size: 0.875rem;
  }
}
</style> 