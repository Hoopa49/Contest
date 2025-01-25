<template>
  <v-container>
    <!-- Заголовок -->
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Конкурсы</h1>
      </v-col>
    </v-row>

    <!-- Фильтры -->
    <contest-list-filters
      :filters="filters"
      @filter-change="handleFilterChange"
    />

    <!-- Сообщение об ошибке -->
    <v-row v-if="error">
      <v-col>
        <v-alert
          type="error"
          title="Ошибка"
          :text="error"
          class="mb-4"
        />
      </v-col>
    </v-row>

    <!-- Список конкурсов -->
    <contest-list
      :contests="contests"
      :loading="isLoading"
      @select="handleSelect"
      @toggle-favorite="handleToggleFavorite"
      @share="handleShare"
    />

    <!-- Кнопка "Загрузить еще" -->
    <v-row v-if="hasMorePages" class="mt-4">
      <v-col class="text-center">
        <v-btn
          :loading="isLoading"
          :disabled="isLoading"
          @click="loadMore"
        >
          Загрузить еще
        </v-btn>
      </v-col>
    </v-row>

    <!-- Диалог шаринга -->
    <contest-share
      v-model="showShareDialog"
      :contest-id="selectedContest?.id"
      :title="selectedContest?.title"
      :description="selectedContest?.description"
      :image="selectedContest?.image"
      @share="handleShareComplete"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useContestsStore } from '@/stores/contests'
import { useRouter } from 'vue-router'
import ContestList from './ContestList.vue'
import ContestListFilters from './ContestListFilters.vue'
import ContestShare from '../details/social/share/ContestShare.vue'

const router = useRouter()
const store = useContestsStore()

// State
const showShareDialog = ref(false)
const selectedContest = ref(null)

const { 
  contests,
  isLoading,
  error,
  filters,
  pagination
} = storeToRefs(store)

const hasMorePages = computed(() => {
  return pagination.value.currentPage < pagination.value.totalPages
})

// Методы
const handleFilterChange = async (newFilters) => {
  try {
    await store.updateFilters(newFilters)
  } catch (err) {
    console.error('Error updating filters:', err)
  }
}

const handleSelect = (contest) => {
  router.push({ name: 'contest-details', params: { id: contest.id }})
}

const handleToggleFavorite = async (contest) => {
  try {
    await store.toggleFavorite(contest.id)
  } catch (err) {
    console.error('Error toggling favorite:', err)
  }
}

const loadMore = async () => {
  try {
    await store.loadMore()
  } catch (err) {
    console.error('Error loading more contests:', err)
  }
}

const handleShare = (contest) => {
  selectedContest.value = contest
  showShareDialog.value = true
}

const handleShareComplete = () => {
  showShareDialog.value = false
  selectedContest.value = null
}

// Уведомления
const showNotification = (message) => {
  // TODO: Добавить компонент уведомлений
  alert(message)
}

onMounted(async () => {
  try {
    await Promise.all([
      store.updateFilters(filters.value),
      store.loadFavoriteContests()
    ])
  } catch (err) {
    console.error('Error loading initial data:', err)
  }
})
</script> 