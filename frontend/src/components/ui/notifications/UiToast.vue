<template>
  <transition name="toast">
    <div 
      v-if="modelValue"
      class="ui-toast" 
      :class="[
        `ui-toast--${type}`,
        { 'ui-toast--with-progress': showProgress }
      ]"
      role="alert"
    >
      <div class="ui-toast__icon">
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
      
      <div class="ui-toast__content">
        <div v-if="title" class="ui-toast__title">{{ title }}</div>
        <div class="ui-toast__message">
          <slot>{{ message }}</slot>
        </div>
      </div>

      <UiButton 
        variant="ghost"
        size="small"
        @click="close"
        class="ui-toast__close"
        aria-label="Закрыть"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </template>
      </UiButton>

      <div 
        v-if="showProgress" 
        class="ui-toast__progress"
        :style="{ animationDuration: `${duration}ms` }"
      ></div>
    </div>
  </transition>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import UiButton from '../buttons/UiButton.vue'

const props = defineProps({
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
  duration: {
    type: Number,
    default: 5000
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

let timer = null

const close = () => {
  clearTimeout(timer)
  emit('update:modelValue', false)
}

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.ui-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 1rem;
  gap: 0.75rem;
  border-radius: var(--border-radius-md);
  background-color: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-md);
  overflow: hidden;
  max-width: 24rem;
}

.ui-toast--info {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.ui-toast--success {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.ui-toast--warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.ui-toast--error {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.ui-toast__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
}

.ui-toast--info .ui-toast__icon {
  color: rgb(var(--v-theme-info));
}

.ui-toast--success .ui-toast__icon {
  color: rgb(var(--v-theme-success));
}

.ui-toast--warning .ui-toast__icon {
  color: rgb(var(--v-theme-warning));
}

.ui-toast--error .ui-toast__icon {
  color: rgb(var(--v-theme-error));
}

.ui-toast__content {
  flex: 1;
  min-width: 0;
}

.ui-toast__title {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  margin-bottom: 0.25rem;
}

.ui-toast__message {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.ui-toast__close {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0.125rem 0 0 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  opacity: var(--v-medium-emphasis-opacity);
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.ui-toast__close:hover {
  opacity: 1;
}

.ui-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentcolor;
  opacity: 0.2;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

/* Анимации */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-smooth);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 