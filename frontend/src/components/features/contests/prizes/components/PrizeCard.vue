<!-- 
  PrizeCard.vue
  Компонент для отображения отдельного приза конкурса.
  Включает информацию о призе, его стоимости и условиях получения.
-->
<template>
  <v-card
    :class="[
      'prize-card',
      { 'prize-card--main': isMain }
    ]"
    :variant="isMain ? 'elevated' : 'outlined'"
  >
    <!-- Заголовок -->
    <v-card-title class="d-flex align-center">
      <div class="d-flex align-center flex-grow-1">
        <v-icon
          :icon="getPrizeIcon(prize.type)"
          :color="getPrizeColor(prize.type)"
          class="mr-2"
          size="24"
        />
        {{ prize.title }}
      </div>
      
      <v-chip
        v-if="prize.position"
        :color="getPrizeColor(prize.type)"
        size="small"
        variant="outlined"
      >
        {{ getPrizePosition(prize.position) }}
      </v-chip>
    </v-card-title>

    <!-- Изображение -->
    <v-img
      v-if="prize.image"
      :src="prize.image"
      :aspect-ratio="16/9"
      cover
      class="prize-image"
    >
      <!-- Стоимость -->
      <div
        v-if="prize.value"
        class="prize-value"
      >
        <v-chip
          color="primary"
          size="small"
        >
          {{ formatPrizeValue(prize.value) }}
        </v-chip>
      </div>
    </v-img>

    <v-card-text>
      <!-- Описание -->
      <div 
        v-if="prize.description"
        class="text-body-1 mb-4"
        v-html="formatDescription(prize.description)"
      />

      <!-- Условия -->
      <div v-if="prize.conditions && prize.conditions.length">
        <div class="text-subtitle-2 mb-2">
          Условия получения:
        </div>
        <v-list density="compact">
          <v-list-item
            v-for="(condition, index) in prize.conditions"
            :key="index"
            :prepend-icon="condition.required ? 'mdi-check-circle' : 'mdi-information'"
            :color="condition.required ? 'success' : 'info'"
          >
            {{ condition.text }}
            <v-chip
              v-if="condition.required"
              color="error"
              size="x-small"
              class="ml-2"
            >
              Обязательно
            </v-chip>
          </v-list-item>
        </v-list>
      </div>

      <!-- Дополнительная информация -->
      <v-alert
        v-if="prize.note"
        type="info"
        variant="tonal"
        class="mt-4 mb-0"
        density="comfortable"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        {{ prize.note }}
      </v-alert>
    </v-card-text>

    <!-- Действия -->
    <v-card-actions v-if="prize.link">
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :href="prize.link"
        target="_blank"
        rel="noopener"
      >
        Подробнее о призе
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  prize: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value === 'object' &&
        'title' in value &&
        'type' in value
    }
  }
})

// Вычисляемые свойства
const isMain = computed(() => {
  return props.prize.type === 'main' || props.prize.position <= 3
})

// Методы
const getPrizeIcon = (type) => {
  switch (type) {
    case 'main': return 'mdi-trophy'
    case 'additional': return 'mdi-gift'
    case 'special': return 'mdi-star'
    default: return 'mdi-gift'
  }
}

const getPrizeColor = (type) => {
  switch (type) {
    case 'main': return 'warning'
    case 'additional': return 'success'
    case 'special': return 'primary'
    default: return 'grey'
  }
}

const getPrizePosition = (position) => {
  switch (position) {
    case 1: return '1 место'
    case 2: return '2 место'
    case 3: return '3 место'
    default: return `${position} место`
  }
}

const formatPrizeValue = (value) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value)
  }
  return value
}

const formatDescription = (description) => {
  if (!description) return ''
  
  // Заменяем переносы строк на <br>
  let formatted = description.replace(/\n/g, '<br>')
  
  // Выделяем важные части текста
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-primary">$1</strong>'
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
.prize-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease;
}

.prize-card:hover {
  transform: translateY(-4px);
}

.prize-card--main {
  background: linear-gradient(135deg, rgba(var(--v-theme-warning), 0.1) 0%, rgba(var(--v-theme-warning), 0.05) 100%);
  border: 2px solid rgb(var(--v-theme-warning));
}

.prize-image {
  position: relative;
}

.prize-value {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px;
  background-color: rgba(var(--v-theme-surface), 0.9);
  color: rgb(var(--v-theme-on-surface));
  border-radius: 4px;
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
  .prize-card {
    margin-bottom: 16px;
  }
}
</style> 