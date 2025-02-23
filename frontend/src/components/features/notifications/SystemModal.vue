<!--
  SystemModal.vue
  Компонент-обертка для модальных окон.
  Интегрирует UiModal с глобальным store.
-->
<template>
  <Teleport to="body">
    <component
      v-if="modal.isOpen"
      :is="modal.component"
      v-model="isOpen"
      v-bind="modal.props"
      @close="closeModal"
    />
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const store = useNotificationStore()

// Получаем состояние модального окна из store
const modal = computed(() => store.modal)

// Управление видимостью
const isOpen = computed({
  get: () => modal.value.isOpen,
  set: (value) => {
    if (!value) {
      closeModal()
    }
  }
})

// Закрытие модального окна
const closeModal = () => {
  store.closeModal()
}
</script>

<style scoped>
/* Стили не требуются, так как используются стили из UiModal */
</style> 