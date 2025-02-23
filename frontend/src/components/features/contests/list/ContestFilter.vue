<!-- 
  ContestFilter.vue
  Компонент для фильтрации списка конкурсов.
  Включает поиск по названию, фильтры по платформам, статусам, датам и призовому фонду.
-->
<template>
  <v-card class="contest-filter">
    <v-card-text>
      <!-- Поиск -->
      <v-text-field
        v-model="searchValue"
        density="comfortable"
        placeholder="Поиск по названию или описанию"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        :loading="loading"
        class="mb-4"
        @update:model-value="updateSearch"
      />

      <v-row>
        <!-- Платформы -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="platformsValue"
            :items="platformOptions"
            label="Платформы"
            multiple
            chips
            closable-chips
            :loading="loading"
            hide-details
            class="mb-4"
          >
            <template v-slot:selection="{ item }">
              <v-chip
                :prepend-icon="getPlatformIcon(item.value)"
                :color="getPlatformColor(item.value)"
                class="platform-chip"
                size="small"
              >
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </v-col>

        <!-- Статусы -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="statusesValue"
            :items="statusOptions"
            label="Статусы"
            multiple
            chips
            closable-chips
            :loading="loading"
            hide-details
            class="mb-4"
          >
            <template v-slot:selection="{ item }">
              <v-chip
                :color="getStatusColor(item.value)"
                class="status-chip"
                size="small"
              >
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </v-col>

        <!-- Даты -->
        <v-col cols="12" sm="6" md="3">
          <v-menu
            v-model="showDatePicker"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="dateRangeText"
                label="Период проведения"
                prepend-inner-icon="mdi-calendar"
                readonly
                clearable
                :loading="loading"
                hide-details
                class="mb-4"
                @click:clear="clearDates"
              />
            </template>
            
            <v-date-picker
              v-model="dateRangeValue"
              range
              :loading="loading"
              @update:model-value="updateDateRange"
            />
          </v-menu>
        </v-col>

        <!-- Призовой фонд -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="prizeRangeText"
            label="Призовой фонд"
            prepend-inner-icon="mdi-currency-usd"
            readonly
            clearable
            :loading="loading"
            hide-details
            class="mb-4"
            @click="showPrizeDialog = true"
            @click:clear="clearPrize"
          />
        </v-col>
      </v-row>

      <!-- Кнопка сброса -->
      <div class="d-flex justify-end">
        <v-btn
          variant="text"
          color="primary"
          :disabled="!hasActiveFilters || loading"
          @click="resetFilters"
        >
          Сбросить фильтры
        </v-btn>
      </div>
    </v-card-text>

    <!-- Диалог выбора призового фонда -->
    <v-dialog
      v-model="showPrizeDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Призовой фонд</v-card-title>
        <v-card-text>
          <v-range-slider
            v-model="prizeRangeValue"
            :min="0"
            :max="1000000"
            :step="1000"
            :loading="loading"
            class="mt-4"
            @update:model-value="updatePrizeRange"
          >
            <template v-slot:prepend>
              <v-text-field
                v-model="prizeRangeValue[0]"
                type="number"
                density="compact"
                hide-details
                :min="0"
                :max="prizeRangeValue[1]"
                :step="1000"
                @update:model-value="updatePrizeMin"
              />
            </template>
            <template v-slot:append>
              <v-text-field
                v-model="prizeRangeValue[1]"
                type="number"
                density="compact"
                hide-details
                :min="prizeRangeValue[0]"
                :max="1000000"
                :step="1000"
                @update:model-value="updatePrizeMax"
              />
            </template>
          </v-range-slider>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showPrizeDialog = false"
          >
            Закрыть
          </v-btn>
          <v-btn
            color="primary"
            @click="applyPrizeRange"
          >
            Применить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { getPlatformInfo } from '@/utils/platforms'
import { getStatusInfo } from '@/utils/statuses'

// Props
const props = defineProps({
  platforms: {
    type: Array,
    default: () => []
  },
  statuses: {
    type: Array,
    default: () => []
  },
  dateRange: {
    type: Array,
    default: () => [null, null]
  },
  prizeRange: {
    type: Array,
    default: () => [0, null]
  },
  searchQuery: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits([
  'update:platforms',
  'update:statuses',
  'update:dateRange',
  'update:prizeRange',
  'update:searchQuery',
  'reset'
])

// Состояние
const searchValue = ref(props.searchQuery)
const platformsValue = ref(props.platforms)
const statusesValue = ref(props.statuses)
const dateRangeValue = ref(props.dateRange)
const prizeRangeValue = ref(props.prizeRange)
const showDatePicker = ref(false)
const showPrizeDialog = ref(false)

// Опции для селектов
const platformOptions = computed(() => [
  { title: 'Codeforces', value: 'codeforces' },
  { title: 'LeetCode', value: 'leetcode' },
  { title: 'AtCoder', value: 'atcoder' },
  { title: 'HackerRank', value: 'hackerrank' }
])

const statusOptions = computed(() => [
  { title: 'Активные', value: 'active' },
  { title: 'Завершенные', value: 'completed' },
  { title: 'Предстоящие', value: 'upcoming' }
])

// Вычисляемые свойства
const hasActiveFilters = computed(() => {
  return searchValue.value ||
    platformsValue.value.length > 0 ||
    statusesValue.value.length > 0 ||
    dateRangeValue.value.some(d => d !== null) ||
    prizeRangeValue.value.some(p => p !== null && p !== 0)
})

const dateRangeText = computed(() => {
  const [start, end] = dateRangeValue.value
  if (!start && !end) return ''
  if (!end) return `От ${formatDate(start)}`
  if (!start) return `До ${formatDate(end)}`
  return `${formatDate(start)} - ${formatDate(end)}`
})

const prizeRangeText = computed(() => {
  const [min, max] = prizeRangeValue.value
  if (!min && !max) return ''
  if (!max) return `От ${formatCurrency(min)}`
  if (!min) return `До ${formatCurrency(max)}`
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
})

// Методы
const updateSearch = () => {
  emit('update:searchQuery', searchValue.value)
}

const updateDateRange = () => {
  emit('update:dateRange', dateRangeValue.value)
  showDatePicker.value = false
}

const updatePrizeRange = () => {
  emit('update:prizeRange', prizeRangeValue.value)
}

const updatePrizeMin = (value) => {
  prizeRangeValue.value = [
    Math.min(Number(value), prizeRangeValue.value[1] || 1000000),
    prizeRangeValue.value[1]
  ]
}

const updatePrizeMax = (value) => {
  prizeRangeValue.value = [
    prizeRangeValue.value[0],
    Math.max(Number(value), prizeRangeValue.value[0] || 0)
  ]
}

const applyPrizeRange = () => {
  emit('update:prizeRange', prizeRangeValue.value)
  showPrizeDialog.value = false
}

const clearDates = () => {
  dateRangeValue.value = [null, null]
  emit('update:dateRange', dateRangeValue.value)
}

const clearPrize = () => {
  prizeRangeValue.value = [0, null]
  emit('update:prizeRange', prizeRangeValue.value)
}

const resetFilters = () => {
  searchValue.value = ''
  platformsValue.value = []
  statusesValue.value = []
  dateRangeValue.value = [null, null]
  prizeRangeValue.value = [0, null]
  emit('reset')
}

const getPlatformIcon = (platform) => {
  const info = getPlatformInfo(platform)
  return info.icon
}

const getPlatformColor = (platform) => {
  const info = getPlatformInfo(platform)
  return info.color
}

const getStatusColor = (status) => {
  const info = getStatusInfo(status)
  return info.color
}

// Отслеживание изменений
watch(platformsValue, (value) => {
  emit('update:platforms', value)
})

watch(statusesValue, (value) => {
  emit('update:statuses', value)
})

// Отслеживание изменений props
watch(() => props.searchQuery, (value) => {
  searchValue.value = value
})

watch(() => props.platforms, (value) => {
  platformsValue.value = value
})

watch(() => props.statuses, (value) => {
  statusesValue.value = value
})

watch(() => props.dateRange, (value) => {
  dateRangeValue.value = value
})

watch(() => props.prizeRange, (value) => {
  prizeRangeValue.value = value
})
</script>

<style scoped>
.contest-filter {
  border-radius: 8px;
}

.platform-chip,
.status-chip {
  font-size: 0.875rem;
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
@media (width <= 600px) {
  .contest-filter {
    padding: 1rem;
  }
}
</style> 
