<!--
  Компонент для отображения ошибок
  Поддерживает разные типы ошибок с соответствующими стилями
-->
<template>
  <div v-if="error" :class="['error-alert', `error-alert--${error.type}`]">
    <div class="error-alert__icon">
      <i v-if="error.type === 'auth'" class="fas fa-lock" />
      <i v-else-if="error.type === 'network'" class="fas fa-wifi" />
      <i v-else-if="error.type === 'server'" class="fas fa-server" />
      <i v-else class="fas fa-exclamation-circle" />
    </div>
    <div class="error-alert__content">
      <p class="error-alert__message">{{ error.message }}</p>
      <button v-if="error.type === 'auth'" @click="$router.push('/login')" class="error-alert__action">
        Войти
      </button>
    </div>
    <button class="error-alert__close" @click="$emit('close')">
      <i class="fas fa-times" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    error: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && value.type && value.message
      }
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.error-alert {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.1);
}

.error-alert--auth {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.error-alert--network {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.error-alert--server {
  border-left: 4px solid rgb(var(--v-theme-error-darken-1));
}

.error-alert--unknown {
  border-left: 4px solid rgb(var(--v-theme-grey));
}

.error-alert__icon {
  margin-right: 1rem;
  font-size: 1.5rem;
}

.error-alert--auth .error-alert__icon {
  color: rgb(var(--v-theme-error));
}

.error-alert--network .error-alert__icon {
  color: rgb(var(--v-theme-warning));
}

.error-alert--server .error-alert__icon {
  color: rgb(var(--v-theme-error-darken-1));
}

.error-alert--unknown .error-alert__icon {
  color: rgb(var(--v-theme-grey));
}

.error-alert__content {
  flex: 1;
}

.error-alert__message {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.error-alert__action {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-alert__action:hover {
  background-color: rgb(var(--v-theme-primary-darken-1));
}

.error-alert__close {
  padding: 0.5rem;
  border: none;
  background: none;
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: pointer;
  transition: color 0.2s;
}

.error-alert__close:hover {
  color: rgba(var(--v-theme-on-surface), 0.8);
}
</style> 
