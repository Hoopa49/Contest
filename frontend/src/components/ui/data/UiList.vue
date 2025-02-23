<template>
  <ul 
    class="ui-list" 
    :class="[
      `ui-list--${variant}`,
      `ui-list--${size}`,
      { 'ui-list--hoverable': hoverable }
    ]"
  >
    <li 
      v-for="(item, index) in items" 
      :key="item[itemKey] || index"
      class="ui-list__item"
      :class="{ 'ui-list__item--active': isActive(item) }"
      @click="$emit('select', item)"
    >
      <!-- Иконка -->
      <div v-if="$slots.icon" class="ui-list__icon">
        <slot name="icon" :item="item" :index="index"></slot>
      </div>

      <!-- Основной контент -->
      <div class="ui-list__content">
        <div v-if="$slots.title || item[titleKey]" class="ui-list__title">
          <slot name="title" :item="item" :index="index">
            {{ item[titleKey] }}
          </slot>
        </div>
        
        <div v-if="$slots.subtitle || item[subtitleKey]" class="ui-list__subtitle">
          <slot name="subtitle" :item="item" :index="index">
            {{ item[subtitleKey] }}
          </slot>
        </div>

        <div v-if="$slots.description || item[descriptionKey]" class="ui-list__description">
          <slot name="description" :item="item" :index="index">
            {{ item[descriptionKey] }}
          </slot>
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div v-if="$slots.meta" class="ui-list__meta">
        <slot name="meta" :item="item" :index="index"></slot>
      </div>

      <!-- Действия -->
      <div v-if="$slots.actions" class="ui-list__actions">
        <slot name="actions" :item="item" :index="index"></slot>
      </div>
    </li>

    <!-- Пустое состояние -->
    <li v-if="!items.length" class="ui-list__empty">
      <slot name="empty">
        <div class="ui-list__empty-content">
          <svg class="ui-list__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ emptyText }}</span>
        </div>
      </slot>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  // Элементы списка
  items: {
    type: Array,
    default: () => []
  },
  // Ключ для уникальной идентификации элементов
  itemKey: {
    type: String,
    default: 'id'
  },
  // Ключи для отображения данных
  titleKey: {
    type: String,
    default: 'title'
  },
  subtitleKey: {
    type: String,
    default: 'subtitle'
  },
  descriptionKey: {
    type: String,
    default: 'description'
  },
  // Активный элемент
  modelValue: {
    type: [Object, Array],
    default: null
  },
  // Вариант отображения
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'divided'].includes(value)
  },
  // Размер элементов
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Эффект при наведении
  hoverable: {
    type: Boolean,
    default: false
  },
  // Текст для пустого состояния
  emptyText: {
    type: String,
    default: 'Нет данных'
  }
})

defineEmits(['update:modelValue', 'select'])

// Проверка активного элемента
const isActive = (item) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.some(selected => selected[props.itemKey] === item[props.itemKey])
  }
  return props.modelValue?.[props.itemKey] === item[props.itemKey]
}
</script>

<style scoped>
.ui-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Варианты */
.ui-list--default {
  background-color: rgb(var(--v-theme-surface));
  border-radius: var(--border-radius-md);
}

.ui-list--bordered {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--border-radius-md);
}

.ui-list--divided .ui-list__item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Элемент списка */
.ui-list__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

/* Размеры */
.ui-list--small .ui-list__item {
  padding: 0.5rem 0.75rem;
}

.ui-list--large .ui-list__item {
  padding: 1.25rem 1.5rem;
}

/* Эффекты */
.ui-list--hoverable .ui-list__item:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.ui-list__item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Иконка */
.ui-list__icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  flex-shrink: 0;
}

.ui-list--small .ui-list__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.ui-list--large .ui-list__icon {
  width: 2.5rem;
  height: 2.5rem;
}

/* Контент */
.ui-list__content {
  flex: 1;
  min-width: 0;
}

.ui-list__title {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  line-height: 1.25;
}

.ui-list--small .ui-list__title {
  font-size: 0.875rem;
}

.ui-list--large .ui-list__title {
  font-size: 1.125rem;
}

.ui-list__subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  margin-top: 0.25rem;
}

.ui-list--small .ui-list__subtitle {
  font-size: 0.75rem;
}

.ui-list__description {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  margin-top: 0.5rem;
}

/* Мета-информация */
.ui-list__meta {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

/* Действия */
.ui-list__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Пустое состояние */
.ui-list__empty {
  padding: 3rem 1rem;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.ui-list__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.ui-list__empty-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
}
</style> 