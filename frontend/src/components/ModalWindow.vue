<!--
  Компонент для отображения модальных окон
  Поддерживает динамическую загрузку контента
-->
<template>
  <v-dialog
    v-model="isVisible"
    :max-width="600"
    @click:outside="closeModal"
  >
    <component 
      :is="modal.component"
      v-bind="modal.props"
      @close="closeModal"
    />
  </v-dialog>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'ModalWindow',
  
  setup() {
    const notificationStore = useNotificationStore()
    
    const modal = computed(() => notificationStore.modal)
    const isVisible = computed({
      get: () => modal.value.isOpen,
      set: () => closeModal()
    })
    
    const closeModal = () => {
      notificationStore.closeModal()
    }
    
    return {
      modal,
      isVisible,
      closeModal
    }
  }
}
</script> 