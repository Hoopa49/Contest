<!-- 
  ContestPrizes.vue
  Основной компонент для отображения призов конкурса.
  Объединяет компоненты карточек призов и их распределения.
-->
<template>
  <div class="contest-prizes">
    <!-- Заголовок -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <h2 class="text-h5 mb-0">
          Призы конкурса
        </h2>
        <v-chip
          v-if="!loading"
          class="ml-4"
          color="primary"
          size="small"
          variant="outlined"
        >
          {{ totalPrizes }}
        </v-chip>
      </div>

      <v-btn
        :loading="loading"
        :disabled="loading"
        variant="text"
        prepend-icon="mdi-refresh"
        @click="loadPrizes"
      >
        Обновить
      </v-btn>
    </div>

    <!-- Загрузка -->
    <v-skeleton-loader
      v-if="loading && !error"
      type="article, paragraph, actions"
    />

    <!-- Ошибка -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
      <template v-slot:append>
        <v-btn
          variant="text"
          @click="loadPrizes"
        >
          Повторить
        </v-btn>
      </template>
    </v-alert>

    <!-- Контент -->
    <template v-else>
      <!-- Распределение призов -->
      <prize-distribution
        v-if="prizes.length"
        :prizes="prizes"
        :note="distributionNote"
        class="mb-6"
      />

      <!-- Список призов -->
      <div 
        v-if="prizes.length"
        class="prizes-grid"
      >
        <prize-card
          v-for="prize in sortedPrizes"
          :key="prize.id"
          :prize="prize"
        />
      </div>

      <!-- Нет призов -->
      <v-alert
        v-else
        type="info"
        variant="tonal"
        class="mt-4"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        Информация о призах пока не добавлена
      </v-alert>
    </template>

    <!-- Уведомления -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showSnackbar = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContestsStore } from '@/stores/contests'
import PrizeDistribution from './components/PrizeDistribution.vue'
import PrizeCard from './components/PrizeCard.vue'

// Props
const props = defineProps({
  contestId: {
    type: [String, Number],
    required: true
  }
})

// Состояние
const contestStore = useContestsStore()
const loading = ref(false)
const error = ref(null)
const prizes = ref([])
const distributionNote = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Вычисляемые свойства
const sortedPrizes = computed(() => {
  return [...prizes.value].sort((a, b) => {
    // Сначала по типу (main > special > additional)
    const typeOrder = { main: 0, special: 1, additional: 2 }
    const typeCompare = typeOrder[a.type] - typeOrder[b.type]
    if (typeCompare !== 0) return typeCompare
    
    // Затем по позиции
    if (a.position && b.position) {
      return a.position - b.position
    }
    
    // Затем по стоимости
    return b.value - a.value
  })
})

const totalPrizes = computed(() => {
  const count = prizes.value.length
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} призов`
  }

  switch (lastDigit) {
    case 1:
      return `${count} приз`
    case 2:
    case 3:
    case 4:
      return `${count} приза`
    default:
      return `${count} призов`
  }
})

// Методы
const loadPrizes = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await contestStore.loadPrizes(props.contestId)
    prizes.value = data.prizes || []
    distributionNote.value = data.distributionNote || ''
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить призы конкурса'
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = error.value
  } finally {
    loading.value = false
  }
}

// Инициализация
onMounted(() => {
  loadPrizes()
})
</script>

<style scoped>
.contest-prizes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.prizes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* Анимации */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 600px) {
  .contest-prizes {
    padding: 16px;
  }
  
  .prizes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style> 