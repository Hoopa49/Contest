<!--
  SystemToasts.vue
  Компонент-обертка для системных уведомлений.
  Интегрирует UiToast с глобальным store.
-->
<template>
  <Teleport to="body">
    <div class="system-toasts" :class="position">
      <TransitionGroup name="toast-list">
        <UiToast
          v-for="toast in toasts"
          :key="toast.id"
          v-model="toast.show"
          :type="toast.type"
          :title="toast.title"
          :message="toast.message"
          :duration="toast.duration"
          @update:model-value="(value) => !value && removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import UiToast from '@/components/ui/notifications/UiToast.vue'

const store = useNotificationStore()

// Получаем все активные тосты
const toasts = computed(() => store.toasts)

// Позиция тостов на экране
const position = computed(() => store.toastPosition || 'top-right')

// Удаление тоста
const removeToast = (id) => {
  store.removeToast(id)
}
</script>

<style scoped>
.system-toasts {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem;
  pointer-events: none;
}

.system-toasts :deep(.ui-toast) {
  pointer-events: auto;
}

/* Позиционирование */
.top-right {
  top: 0;
  right: 0;
}

.top-left {
  top: 0;
  left: 0;
}

.bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: column-reverse;
}

.bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: column-reverse;
}

.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

/* Анимации для группы */
.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-active {
  position: absolute;
}
</style> 