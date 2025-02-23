<!-- 
  ContestSort.vue
  Компонент для сортировки списка конкурсов.
  Позволяет выбрать поле и направление сортировки.
-->
<template>
  <v-card class="contest-sort">
    <v-card-text>
      <div class="d-flex align-center">
        <!-- Выбор поля сортировки -->
        <v-select
          v-model="sortField"
          :items="sortOptions"
          label="Сортировать по"
          density="comfortable"
          hide-details
          class="flex-grow-1 mr-2"
          :loading="loading"
        >
          <template v-slot:selection="{ item }">
            <v-icon
              :icon="item.raw.icon"
              size="small"
              class="mr-2"
            />
            {{ item.title }}
          </template>
          <template v-slot:item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="item.raw.title"
              :prepend-icon="item.raw.icon"
            />
          </template>
        </v-select>

        <!-- Направление сортировки -->
        <v-btn-toggle
          v-model="sortDirection"
          density="comfortable"
          color="primary"
          :loading="loading"
        >
          <v-btn
            value="asc"
            :disabled="loading"
          >
            <v-icon>mdi-sort-ascending</v-icon>
          </v-btn>
          <v-btn
            value="desc"
            :disabled="loading"
          >
            <v-icon>mdi-sort-descending</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'newest'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue'])

// Состояние
const sortField = ref('startDate')
const sortDirection = ref('desc')

// Опции сортировки
const sortOptions = computed(() => [
  {
    title: 'Дате начала',
    value: 'startDate',
    icon: 'mdi-calendar'
  },
  {
    title: 'Длительности',
    value: 'duration',
    icon: 'mdi-clock-outline'
  },
  {
    title: 'Призовому фонду',
    value: 'prize',
    icon: 'mdi-currency-usd'
  },
  {
    title: 'Участникам',
    value: 'participants',
    icon: 'mdi-account-group'
  },
  {
    title: 'Названию',
    value: 'title',
    icon: 'mdi-sort-alphabetical-variant'
  }
])

// Преобразование значения модели в поле и направление
const updateFromModelValue = (value) => {
  switch (value) {
    case 'newest':
      sortField.value = 'startDate'
      sortDirection.value = 'desc'
      break
    case 'oldest':
      sortField.value = 'startDate'
      sortDirection.value = 'asc'
      break
    case 'prize-high':
      sortField.value = 'prize'
      sortDirection.value = 'desc'
      break
    case 'prize-low':
      sortField.value = 'prize'
      sortDirection.value = 'asc'
      break
    case 'participants':
      sortField.value = 'participants'
      sortDirection.value = 'desc'
      break
    case 'title':
      sortField.value = 'title'
      sortDirection.value = 'asc'
      break
  }
}

// Преобразование поля и направления в значение модели
const updateModelValue = () => {
  let value = ''
  
  switch (sortField.value) {
    case 'startDate':
      value = sortDirection.value === 'desc' ? 'newest' : 'oldest'
      break
    case 'prize':
      value = sortDirection.value === 'desc' ? 'prize-high' : 'prize-low'
      break
    case 'participants':
      value = 'participants'
      break
    case 'title':
      value = 'title'
      break
    default:
      value = 'newest'
  }
  
  emit('update:modelValue', value)
}

// Отслеживание изменений
watch(sortField, updateModelValue)
watch(sortDirection, updateModelValue)
watch(() => props.modelValue, updateFromModelValue, { immediate: true })
</script>

<style scoped>
.contest-sort {
  border-radius: 8px;
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
  .contest-sort {
    padding: 1rem;
  }
}
</style>
