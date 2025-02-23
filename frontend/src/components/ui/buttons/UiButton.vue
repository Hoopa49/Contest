<template>
  <button
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="ui-button__loader"></span>
    <span v-else class="ui-button__content">
      <slot name="icon"></slot>
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'info',
      'ghost'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 2px solid transparent;
  transition: all var(--transition-base);
  gap: 0.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  outline: none !important;

  &:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: none !important;
    box-shadow: var(--shadow-input-focus) !important;
  }
}

.ui-button:disabled {
  opacity: var(--v-disabled-opacity);
  cursor: not-allowed;
  background-color: rgb(var(--v-theme-surface-variant)) !important;
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity)) !important;
  border-color: transparent !important;
}

/* Размеры */
.ui-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.ui-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.ui-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Варианты */
.ui-button--primary {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border: none;

  &:hover:not(:disabled) {
    background-color: rgb(var(--v-theme-primary-darken-1));
  }
}

.ui-button--secondary {
  background-color: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &:hover:not(:disabled) {
    background-color: rgb(var(--v-theme-surface-variant));
  }
}

.ui-button--success {
  background-color: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-success));
  border: none;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.ui-button--warning {
  background-color: rgb(var(--v-theme-warning));
  color: rgb(var(--v-theme-on-warning));
  border: none;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.ui-button--danger {
  background-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
  border: none;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.ui-button--info {
  background-color: rgb(var(--v-theme-info));
  color: rgb(var(--v-theme-on-info));
  border: none;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.ui-button--ghost {
  background-color: transparent;
  border: none;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));

  &:hover:not(:disabled) {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

/* Loader */
.ui-button--loading {
  position: relative;
  color: transparent !important;
}

.ui-button__loader {
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentcolor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: button-loader 0.75s linear infinite;
}

.ui-button__content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes button-loader {
  to {
    transform: rotate(360deg);
  }
}
</style> 