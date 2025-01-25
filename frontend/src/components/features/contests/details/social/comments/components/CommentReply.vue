<!-- 
  CommentReply.vue
  Компонент формы для ответа на комментарий.
  Включает форму ввода и кнопки управления.
-->
<template>
  <div class="reply-form">
    <div class="d-flex align-center mb-2">
      <user-avatar
        :src="currentUserAvatar"
        :alt="currentUserName"
        size="24"
        class="mr-2"
      />
      <div class="text-caption">
        Ответ для <span class="font-weight-medium">{{ parentAuthorName }}</span>
      </div>
    </div>

    <v-textarea
      v-model="replyText"
      :label="label"
      variant="outlined"
      :rows="2"
      counter
      :maxlength="1000"
      :disabled="disabled"
      :error-messages="errorMessage"
      :loading="loading"
      density="comfortable"
      hide-details="auto"
      class="mb-2"
      @keydown.ctrl.enter="submitReply"
    />
    
    <div class="d-flex justify-end">
      <!-- Подсказка о горячих клавишах -->
      <div class="text-caption text-grey mr-3 mt-2">
        Ctrl + Enter для быстрого ответа
      </div>

      <div class="d-flex">
        <v-btn
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
          @click="submitReply"
        >
          Ответить
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

// Props
const props = defineProps({
  parentAuthorName: {
    type: String,
    default: 'Пользователь'
  },
  currentUserName: {
    type: String,
    default: null
  },
  currentUserAvatar: {
    type: String,
    default: null
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

// Эмиты
const emit = defineEmits(['submit', 'cancel'])

// Состояние
const replyText = ref('')
const errorMessage = ref('')

// Вычисляемые свойства
const isValid = computed(() => {
  return replyText.value.trim().length > 0
})

const label = computed(() => {
  return `Ответить ${props.parentAuthorName}`
})

// Методы
const submitReply = () => {
  if (!isValid.value) return
  
  emit('submit', replyText.value.trim())
  replyText.value = ''
}

const cancel = () => {
  replyText.value = ''
  emit('cancel')
}
</script>

<style scoped>
.reply-form {
  border-radius: 4px;
  padding: 12px;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  margin-top: 8px;
}
</style> 