<template>
  <transition name="alert">
    <div 
      v-if="modelValue"
      class="ui-alert" 
      :class="[
        `ui-alert--${type}`,
        { 'ui-alert--closable': closable }
      ]"
      role="alert"
    >
      <div class="ui-alert__icon">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <div class="ui-alert__content">
        <div v-if="title" class="ui-alert__title">{{ title }}</div>
        <div class="ui-alert__message">
          <slot>{{ message }}</slot>
        </div>
      </div>

      <UiButton 
        v-if="closable"
        variant="ghost"
        size="small"
        @click="$emit('update:modelValue', false)"
        class="ui-alert__close"
        aria-label="Закрыть"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </template>
      </UiButton>
    </div>
  </transition>
</template>

<script setup>
import UiButton from '../buttons/UiButton.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
  border-radius: var(--border-radius-md);
}

.ui-alert--info {
  background-color: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}

.ui-alert--success {
  background-color: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.ui-alert--warning {
  background-color: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.ui-alert--error {
  background-color: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

.ui-alert__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
}

.ui-alert__content {
  flex: 1;
  min-width: 0;
}

.ui-alert__title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.ui-alert__message {
  font-size: 0.875rem;
  line-height: 1.25rem;
  opacity: 0.9;
}

.ui-alert__close {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0.125rem 0 0 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: currentcolor;
  opacity: var(--v-medium-emphasis-opacity);
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.ui-alert__close:hover {
  opacity: 1;
}

/* Анимации */
.alert-enter-active,
.alert-leave-active {
  transition: all var(--transition-smooth);
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style> 