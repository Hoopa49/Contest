<!-- 
  CommentList.vue
  Компонент для отображения списка комментариев.
  Включает сортировку, пагинацию и отображение отдельных комментариев.
-->
<template>
  <div class="comment-list">
    <!-- Список комментариев -->
    <div v-if="paginatedComments.length" class="comments-container">
      <comment-item
        v-for="comment in paginatedComments"
        :key="comment.id"
        :comment="comment"
        :can-manage-comment="canManageComment(comment)"
        :current-user-name="currentUserName"
        :current-user-avatar="currentUserAvatar"
        class="mb-4"
        @update="updateComment"
        @delete="deleteComment"
        @reply="addReply"
      />

      <!-- Пагинация -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        class="mt-4"
      />
    </div>
    
    <!-- Сообщение об отсутствии комментариев -->
    <v-alert
      v-else
      type="info"
      text="Комментариев пока нет. Будьте первым!"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CommentItem from './CommentItem.vue'

// Props
const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  currentUserId: {
    type: String,
    default: ''
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
const currentPage = ref(1)
const sortBy = ref('newest')

// Опции сортировки
const sortOptions = [
  { title: 'Сначала новые', value: 'newest' },
  { title: 'Сначала старые', value: 'oldest' },
  { title: 'Популярные', value: 'popular' }
]

// Вычисляемые свойства
const sortedComments = computed(() => {
  let sorted = [...props.comments]
  
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

const totalPages = computed(() => 
  Math.ceil(sortedComments.value.length / props.itemsPerPage)
)

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return sortedComments.value.slice(start, end)
})

// Методы
const canManageComment = (comment) => {
  return props.currentUserId && comment.author?.id && props.currentUserId === comment.author.id
}

const updateComment = (data) => {
  emit('update', data)
}

const deleteComment = (commentId) => {
  emit('delete', commentId)
}

const addReply = (data) => {
  emit('reply', data)
}

// Сброс страницы при изменении сортировки
watch(sortBy, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.comment-list {
  width: 100%;
}

.comments-container {
  min-height: 200px;
}
</style> 