<!-- 
  ContestComments.vue
  Основной компонент для работы с комментариями конкурса.
  Управляет состоянием комментариев и взаимодействием с API.
-->
<template>
  <div class="comments-section">
    <!-- Заголовок и количество комментариев -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-comment-multiple-outline" class="mr-2" />
        <span class="text-h6">
          Комментарии ({{ totalComments }})
        </span>
      </div>
      
      <!-- Сортировка -->
      <div class="sort-label"></div>
      <v-select
      v-model="sortBy"
      :items="sortOptions"
      label="Сортировка"
      variant="outlined"
      density="comfortable"
      hide-details
      class="mb-2"
      style="max-width: 200px"
    />
    </div>

    <!-- Форма добавления комментария -->
    <comment-form
      v-if="canAddComment"
      v-model:value="commentText"
      label="Написать комментарий"
      :loading="isLoading"
      class="mb-6"
      @submit="submitComment"
    />

    <!-- Список комментариев -->
    <comment-list
      :comments="sortedComments"
      :current-user-id="currentUserId"
      :current-user-name="currentUserName"
      :current-user-avatar="currentUserAvatar"
      :items-per-page="itemsPerPage"
      @update="updateComment"
      @delete="deleteComment"
      @reply="addReply"
    />

    <!-- Уведомление -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { contestCommentApi } from '@/services/api/contest_comment.api'
import CommentForm from './components/CommentForm.vue'
import CommentList from './components/CommentList.vue'

// Props
const props = defineProps({
  contestId: {
    type: String,
    required: true
  }
})

// Состояние
const comments = ref([])
const isLoading = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const itemsPerPage = 10
const currentPage = ref(1)
const totalPages = ref(1)
const commentText = ref('')
const sortBy = ref('popular')

// Опции сортировки
const sortOptions = [
  { title: 'Сначала новые', value: 'newest' },
  { title: 'Сначала старые', value: 'oldest' },
  { title: 'Популярные', value: 'popular' }
]

// Получаем данные из хранилища
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id)
const currentUserName = computed(() => authStore.user?.username)
const currentUserAvatar = computed(() => authStore.user?.avatar)

// Вычисляемые свойства
const canAddComment = computed(() => isAuthenticated.value && currentUserId.value)

const totalComments = computed(() => {
  if (!comments.value) return 0
  
  let total = comments.value.length
  comments.value.forEach(comment => {
    total += comment.replies?.length || 0
  })
  return total
})

const sortedComments = computed(() => {
  let sorted = [...comments.value]
  
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'popular':
      return sorted.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0))
    default:
      return sorted
  }
})

// Методы работы с API
const fetchComments = async () => {
  isLoading.value = true
  try {
    console.log('Fetching comments for contest:', props.contestId)
    
    const response = await contestCommentApi.getComments(props.contestId, currentPage.value, itemsPerPage)
    console.log('Comments response:', response)
    
    comments.value = response.comments || []
    totalPages.value = response.totalPages || 1
    console.log('Updated comments:', comments.value)
  } catch (error) {
    console.error('Error in fetchComments:', error)
    comments.value = []
    showNotification('Не удалось загрузить комментарии', 'error')
  } finally {
    isLoading.value = false
  }
}

const submitComment = async (content) => {
  if (!content?.trim()) return

  isLoading.value = true
  try {
    console.log('Submitting comment:', content)
    
    const response = await contestCommentApi.addComment(props.contestId, {
      content
    })
    
    console.log('Submit comment response:', response)
    
    // Создаем объект нового комментария
    const newComment = {
      id: response.id,
      content: response.content,
      createdAt: response.createdAt,
      author: response.author || {
        id: currentUserId.value,
        name: currentUserName.value,
        avatar: currentUserAvatar.value
      },
      replies: []
    }

    // Добавляем комментарий в начало списка
    comments.value = [newComment, ...comments.value]
    commentText.value = '' // Очищаем поле ввода
    showNotification('Комментарий добавлен')
  } catch (error) {
    console.error('Error in submitComment:', error)
    showNotification(error.message || 'Не удалось добавить комментарий', 'error')
  } finally {
    isLoading.value = false
  }
}

const updateComment = async ({ id, content }) => {
  isLoading.value = true
  try {
    const response = await contestCommentApi.updateComment(id, content)
    
    // Находим комментарий для обновления
    const comment = comments.value.find(c => c.id === id)
    if (comment) {
      comment.content = response.content
      comment.isEdited = true
      showNotification('Комментарий обновлен')
    }
  } catch (error) {
    console.error('Error in updateComment:', error)
    showNotification('Не удалось обновить комментарий', 'error')
  } finally {
    isLoading.value = false
  }
}

const deleteComment = async (commentId) => {
  isLoading.value = true
  try {
    await contestCommentApi.deleteComment(commentId)
    
    // Удаляем комментарий из списка
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value.splice(index, 1)
      showNotification('Комментарий удален')
    }
  } catch (error) {
    console.error('Error in deleteComment:', error)
    showNotification('Не удалось удалить комментарий', 'error')
  } finally {
    isLoading.value = false
  }
}

const addReply = async ({ parentId, content }) => {
  isLoading.value = true
  try {
    const response = await contestCommentApi.addReply(props.contestId, parentId, {
      content
    })

    // Находим родительский комментарий
    const parentComment = comments.value.find(c => c.id === parentId)
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = []
      }

      // Создаем объект нового ответа
      const newReply = {
        id: response.id,
        content: response.content,
        createdAt: response.createdAt,
        author: response.author || {
          id: currentUserId.value,
          name: currentUserName.value,
          avatar: currentUserAvatar.value
        }
      }

      // Добавляем ответ к родительскому комментарию
      parentComment.replies.push(newReply)
      showNotification('Ответ добавлен')
    }
  } catch (error) {
    console.error('Error in addReply:', error)
    showNotification('Не удалось добавить ответ', 'error')
  } finally {
    isLoading.value = false
  }
}

// Вспомогательные методы
const showNotification = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}

// Жизненный цикл
onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comments-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.sort-wrapper {
  position: relative;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
  padding: 4px 12px;
}

.sort-label {
  position: absolute;
  top: -10px;
  left: 8px;
  padding: 0 4px;
  background: rgb(var(--v-theme-background));
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.75rem;
}

.sort-select {
  width: 140px;
}

:deep(.sort-select .v-field) {
  border: none !important;
  background: none !important;
  padding: 0 !important;
}

:deep(.sort-select .v-field__input) {
  min-height: 24px !important;
  padding: 0 !important;
}

:deep(.sort-select .v-field__append-inner) {
  padding-inline-start: 4px !important;
}
</style> 