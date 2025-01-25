<!-- 
  CommentForm.vue
  Компонент формы для создания и редактирования комментариев.
  Используется как для новых комментариев, так и для редактирования существующих.
-->
<template>
  <div class="comment-form">
    <v-textarea
      :model-value="value"
      @update:model-value="$emit('update:value', $event)"
      :label="label"
      variant="outlined"
      :rows="rows"
      counter
      :maxlength="1000"
      :disabled="disabled || loading"
      :error-messages="errorMessage"
      density="comfortable"
      hide-details="auto"
      class="mb-2"
      @keydown.ctrl.enter="submitForm"
    />
    
    <div class="d-flex" :class="{ 'justify-end': !showCancel, 'justify-space-between': showCancel }">
      <!-- Подсказка о горячих клавишах -->
      <div class="text-caption text-grey mr-3 mt-2">
        Ctrl + Enter для быстрой отправки
      </div>

      <div class="d-flex">
        <v-btn
          v-if="showCancel"
          variant="text"
          :disabled="disabled || loading"
          @click="cancel"
          class="mr-2"
        >
          Отмена
        </v-btn>
        
        <v-btn
          color="primary"
          :disabled="!isValid || disabled || loading"
          :loading="loading"
          @click="submitForm"
        >
          {{ submitText }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: 'Отправить'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  initialValue: {
    type: String,
    default: ''
  }
})

// Эмиты
const emit = defineEmits(['update:value', 'submit', 'cancel'])

// Вычисляемые свойства
const isValid = computed(() => {
  return props.value.trim().length > 0
})

const errorMessage = computed(() => {
  if (props.value && props.value.length > 1000) {
    return 'Максимальная длина комментария - 1000 символов'
  }
  return ''
})

// Методы
const submitForm = () => {
  if (!isValid.value) return
  
  emit('submit', props.value.trim())
}

const cancel = () => {
  emit('update:value', props.initialValue)
  emit('cancel')
}
</script>

<style scoped>
.comment-form {
  width: 100%;
}
</style> 