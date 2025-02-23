<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    @update:model-value="updateDialog"
  >
    <v-card>
      <!-- Заголовок -->
      <v-card-title class="text-h5 pa-4">
        {{ title || 'Подтверждение' }}
      </v-card-title>

      <!-- Сообщение -->
      <v-card-text class="pa-4">
        {{ message || 'Вы уверены, что хотите выполнить это действие?' }}
      </v-card-text>

      <!-- Кнопки -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="handleCancel"
        >
          {{ cancelText || 'Отмена' }}
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText || 'Подтвердить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ConfirmDialog',

  props: {
    // Управление видимостью диалога
    modelValue: {
      type: Boolean,
      default: false
    },
    // Заголовок диалога
    title: {
      type: String,
      default: ''
    },
    // Текст сообщения
    message: {
      type: String,
      default: ''
    },
    // Текст кнопки подтверждения
    confirmText: {
      type: String,
      default: ''
    },
    // Текст кнопки отмены
    cancelText: {
      type: String,
      default: ''
    },
    // Состояние загрузки
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'confirm', 'cancel'],

  setup(props, { emit }) {
    const dialog = ref(props.modelValue)

    // Следим за изменением modelValue
    watch(() => props.modelValue, (newValue) => {
      dialog.value = newValue
    })

    // Обновляем состояние диалога
    const updateDialog = (value) => {
      dialog.value = value
      emit('update:modelValue', value)
    }

    // Обработка подтверждения
    const handleConfirm = () => {
      emit('confirm')
    }

    // Обработка отмены
    const handleCancel = () => {
      emit('cancel')
      updateDialog(false)
    }

    return {
      dialog,
      updateDialog,
      handleConfirm,
      handleCancel
    }
  }
}
</script>

<style scoped>
.v-card-title {
  border-bottom: 1px solid rgb(0 0 0 / 12%);
}

.v-card-actions {
  border-top: 1px solid rgb(0 0 0 / 12%);
}
</style> 
