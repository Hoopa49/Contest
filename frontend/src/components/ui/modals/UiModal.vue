<template>
  <v-dialog
    v-model="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
    :transition="transition"
    :theme="theme"
    @click:outside="onClickOutside"
  >
    <v-card
      :loading="loading"
      :class="[
        'ui-modal',
        `ui-modal--${size}`,
        { 'ui-modal--fullscreen': fullscreen }
      ]"
    >
      <!-- Заголовок -->
      <v-card-title v-if="$slots.title || title" class="ui-modal__title">
        <slot name="title">{{ title }}</slot>
        <v-btn
          v-if="!persistent"
          icon="mdi-close"
          variant="text"
          size="small"
          @click="close"
          class="ui-modal__close"
        />
      </v-card-title>

      <!-- Контент -->
      <v-card-text :class="['ui-modal__content', { 'pa-0': noPadding }]">
        <slot></slot>
      </v-card-text>

      <!-- Действия -->
      <v-card-actions v-if="$slots.actions" class="ui-modal__actions">
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  // Управление видимостью
  modelValue: {
    type: Boolean,
    required: true
  },
  // Заголовок
  title: {
    type: String,
    default: ''
  },
  // Размер модального окна
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Максимальная ширина
  maxWidth: {
    type: [Number, String],
    default: undefined
  },
  // Запрет закрытия по клику вне окна
  persistent: {
    type: Boolean,
    default: false
  },
  // Включить скролл контента
  scrollable: {
    type: Boolean,
    default: true
  },
  // Анимация появления
  transition: {
    type: String,
    default: 'dialog-transition'
  },
  // Тема
  theme: {
    type: String,
    default: undefined
  },
  // Состояние загрузки
  loading: {
    type: Boolean,
    default: false
  },
  // Полноэкранный режим
  fullscreen: {
    type: Boolean,
    default: false
  },
  // Отключить отступы контента
  noPadding: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

// Методы
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onClickOutside = () => {
  if (!props.persistent) {
    close()
  }
}
</script>

<style scoped>
.ui-modal {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: rgb(var(--v-theme-surface));
}

.ui-modal--fullscreen {
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw !important;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 0;
}

/* Размеры */
.ui-modal--small {
  width: 400px;
}

.ui-modal--medium {
  width: 600px;
}

.ui-modal--large {
  width: 800px;
}

/* Заголовок */
.ui-modal__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-base) var(--spacing-lg);
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Контент */
.ui-modal__content {
  flex: 1;
  overflow-y: auto;
}

.ui-modal__content:not(.pa-0) {
  padding: var(--spacing-lg);
}

/* Действия */
.ui-modal__actions {
  padding: var(--spacing-base) var(--spacing-lg);
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Кнопка закрытия */
.ui-modal__close {
  margin-left: auto;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

/* Адаптивность */
@media (max-width: 600px) {
  .ui-modal {
    width: 100% !important;
    margin: var(--spacing-sm);
  }

  .ui-modal__title,
  .ui-modal__content:not(.pa-0),
  .ui-modal__actions {
    padding: var(--spacing-base);
  }
}
</style> 