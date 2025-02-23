<template>
  <div 
    class="ui-card" 
    :class="[
      `ui-card--${variant}`,
      { 'ui-card--hoverable': hoverable }
    ]"
  >
    <!-- Заголовок -->
    <div v-if="$slots.header || title" class="ui-card__header">
      <slot name="header">
        <h3 class="ui-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="ui-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Изображение -->
    <div v-if="image" class="ui-card__image">
      <img :src="image" :alt="imageAlt">
    </div>

    <!-- Основной контент -->
    <div class="ui-card__content">
      <slot></slot>
    </div>

    <!-- Футер -->
    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Заголовок карточки
  title: {
    type: String,
    default: ''
  },
  // Подзаголовок
  subtitle: {
    type: String,
    default: ''
  },
  // URL изображения
  image: {
    type: String,
    default: ''
  },
  // Alt-текст для изображения
  imageAlt: {
    type: String,
    default: ''
  },
  // Вариант отображения
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated'].includes(value)
  },
  // Эффект при наведении
  hoverable: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.ui-card {
  background-color: rgb(var(--v-theme-surface));
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all var(--transition-base);
}

/* Варианты */
.ui-card--default {
  box-shadow: var(--shadow-sm);
}

.ui-card--outlined {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-card--elevated {
  box-shadow: var(--shadow-md);
}

/* Эффект при наведении */
.ui-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Заголовок */
.ui-card__header {
  padding: 1rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-card__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  line-height: 1.5;
}

.ui-card__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  line-height: 1.4;
}

/* Изображение */
.ui-card__image {
  position: relative;
  padding-top: 56.25%; /* 16:9 */
  background-color: rgb(var(--v-theme-surface-variant));
}

.ui-card__image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Контент */
.ui-card__content {
  padding: 1rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Футер */
.ui-card__footer {
  padding: 1rem;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface-variant));
}
</style> 