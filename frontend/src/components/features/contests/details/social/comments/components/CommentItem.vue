<!-- 
  CommentItem.vue
  Компонент для отображения отдельного комментария.
  Включает информацию об авторе, текст комментария, действия (редактирование, удаление, ответ)
  и вложенные ответы.
-->
<template>
  <div class="comment-item">
    <!-- Шапка комментария -->
    <div class="d-flex align-center mb-2">
      <user-avatar
        :src="comment.author?.avatar"
        :alt="comment.author?.name || 'Пользователь'"
        size="32"
        class="mr-2"
      />
      <div class="comment-header">
        <div class="font-weight-medium">{{ comment.author?.name || 'Пользователь' }}</div>
        <div class="text-caption text-grey">
          {{ formatDate(comment.createdAt) }}
          <span v-if="comment.isEdited" class="ml-2">(изменено)</span>
        </div>
      </div>
    </div>

    <!-- Текст комментария -->
    <div v-if="!isEditing" class="comment-content mb-2">
      {{ comment.content }}
    </div>
    <comment-form
      v-else
      :initial-value="comment.content"
      label="Редактировать комментарий"
      :rows="2"
      show-cancel
      submit-text="Сохранить"
      :loading="loading"
      @submit="saveEdit"
      @cancel="cancelEdit"
    />

    <!-- Действия с комментарием -->
    <div class="comment-actions d-flex align-center">
      <v-btn
        variant="text"
        density="comfortable"
        size="small"
        @click="toggleReply"
        :disabled="loading"
      >
        Ответить
      </v-btn>
      
      <template v-if="canManageComment">
        <v-btn
          v-if="!isEditing"
          variant="text"
          density="comfortable"
          size="small"
          @click="startEditing"
          :disabled="loading"
        >
          Редактировать
        </v-btn>
        
        <v-btn
          variant="text"
          density="comfortable"
          size="small"
          color="error"
          @click="confirmDelete"
          :disabled="loading"
        >
          Удалить
        </v-btn>
      </template>
    </div>

    <!-- Форма ответа -->
    <comment-reply
      v-if="showReplyForm"
      class="mt-2 ml-8"
      :parent-author-name="comment.author?.name || 'Пользователь'"
      :current-user-name="currentUserName"
      :current-user-avatar="currentUserAvatar"
      :loading="loading"
      @submit="submitReply"
      @cancel="toggleReply"
    />

    <!-- Вложенные ответы -->
    <div 
      v-if="comment.replies?.length"
      class="nested-replies ml-8 mt-2"
    >
      <div 
        v-for="reply in comment.replies"
        :key="reply.id"
        class="reply-item mt-2"
      >
        <div class="d-flex align-center mb-1">
          <user-avatar
            :src="reply.author?.avatar"
            :alt="reply.author?.name || 'Пользователь'"
            size="24"
            class="mr-2"
          />
          <div class="reply-header">
            <div class="font-weight-medium">{{ reply.author?.name || 'Пользователь' }}</div>
            <div class="text-caption text-grey">{{ formatDate(reply.createdAt) }}</div>
          </div>
        </div>
        <div class="reply-content ml-9">{{ reply.content }}</div>
      </div>
    </div>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Удалить комментарий?
        </v-card-title>
        <v-card-text>
          Это действие нельзя будет отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="deleteComment"
            :loading="loading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentForm from './CommentForm.vue'
import CommentReply from './CommentReply.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

// Props
const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  canManageComment: {
    type: Boolean,
    default: false
  },
  currentUserName: {
    type: String,
    default: null
  },
  currentUserAvatar: {
    type: String,
    default: null
  }
})

// Эмиты
const emit = defineEmits(['update', 'delete', 'reply'])

// Состояние
const isEditing = ref(false)
const showReplyForm = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)

// Методы
const formatDate = (date) => {
  return new Date(date).toLocaleString('ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveEdit = async (newContent) => {
  loading.value = true
  try {
    await emit('update', { 
      id: props.comment.id, 
      content: newContent 
    })
    isEditing.value = false
  } finally {
    loading.value = false
  }
}

const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value
}

const submitReply = async (content) => {
  loading.value = true
  try {
    await emit('reply', {
      parentId: props.comment.id,
      content
    })
    showReplyForm.value = false
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const deleteComment = async () => {
  loading.value = true
  try {
    await emit('delete', props.comment.id)
    showDeleteDialog.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comment-item {
  position: relative;
  transition: all 0.3s ease;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.comment-content {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 8px 0;
}

.nested-replies {
  border-left: 2px solid rgba(var(--v-theme-on-surface), 0.12);
  padding-left: 16px;
  margin-top: 12px;
}

.reply-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-item:last-child {
  border-bottom: none;
}
</style> 