<!-- 
  RulesRestrictions.vue
  Компонент для отображения ограничений конкурса.
  Включает список запретов и предупреждений.
-->
<template>
  <div class="rules-restrictions">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Ограничения и запреты
      </h3>
      <v-chip
        class="ml-4"
        color="error"
        size="small"
        variant="outlined"
      >
        {{ restrictionsCount }} ограничений
      </v-chip>
    </div>

    <!-- Предупреждение -->
    <v-alert
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <template v-slot:prepend>
        <v-icon>mdi-alert-circle</v-icon>
      </template>
      <div class="text-subtitle-2 mb-2">
        Внимание!
      </div>
      <div class="text-body-2">
        Нарушение любого из перечисленных ограничений может привести к дисквалификации участника.
      </div>
    </v-alert>

    <!-- Список ограничений -->
    <v-list
      class="restrictions-list"
      density="comfortable"
    >
      <v-list-item
        v-for="(restriction, index) in restrictions"
        :key="index"
        :value="restriction"
        class="restriction-item"
      >
        <template v-slot:prepend>
          <v-icon
            color="error"
            size="small"
          >
            mdi-close-circle
          </v-icon>
        </template>

        <v-list-item-title>
          {{ restriction.title }}
        </v-list-item-title>

        <v-list-item-subtitle
          v-if="restriction.description"
          class="mt-1"
        >
          {{ restriction.description }}
        </v-list-item-subtitle>

        <!-- Дополнительная информация -->
        <template v-if="restriction.details">
          <v-divider class="my-2" />
          <div 
            class="text-caption text-medium-emphasis"
            v-html="formatDetails(restriction.details)"
          />
        </template>

        <!-- Предупреждение для ограничения -->
        <v-alert
          v-if="restriction.warning"
          type="warning"
          variant="tonal"
          class="mt-2"
          density="comfortable"
        >
          <template v-slot:prepend>
            <v-icon size="small">mdi-alert</v-icon>
          </template>
          {{ restriction.warning }}
        </v-alert>
      </v-list-item>
    </v-list>

    <!-- Дополнительная информация -->
    <div 
      v-if="note"
      class="text-caption text-medium-emphasis mt-4"
    >
      {{ note }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  restrictions: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(restriction => {
        return typeof restriction === 'object' &&
          'title' in restriction
      })
    }
  },
  note: {
    type: String,
    default: ''
  }
})

// Вычисляемые свойства
const restrictionsCount = computed(() => props.restrictions.length)

// Методы
const formatDetails = (details) => {
  if (!details) return ''
  
  // Заменяем переносы строк на <br>
  let formatted = details.replace(/\n/g, '<br>')
  
  // Выделяем важные части текста
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-error">$1</strong>'
  )
  
  // Добавляем ссылки
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="text-primary">$1</a>'
  )
  
  return formatted
}
</script>

<style scoped>
.rules-restrictions {
  position: relative;
}

.restrictions-list {
  border: 1px solid rgba(var(--v-theme-error), 0.12);
  border-radius: 8px;
  overflow: hidden;
}

.restriction-item {
  border-bottom: 1px solid rgba(var(--v-theme-error), 0.12);
  transition: background-color 0.2s ease;
}

.restriction-item:last-child {
  border-bottom: none;
}

.restriction-item:hover {
  background-color: rgba(var(--v-theme-error), 0.04);
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
  .restriction-item {
    padding: 12px;
  }
}
</style> 