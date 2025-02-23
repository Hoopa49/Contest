<!-- 
  RulesOverview.vue
  Компонент для отображения основной информации о правилах конкурса.
  Включает даты проведения, призовой фонд и возможность скачивания правил.
-->
<template>
  <div class="rules-overview">
    <!-- Заголовок с кнопкой скачивания -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Правила конкурса
      </h3>
      <v-spacer />
      <v-btn
        v-if="allowDownload"
        icon="mdi-download"
        variant="text"
        size="small"
        :loading="downloading"
        :disabled="downloading"
        @click="downloadRules"
      >
        <v-tooltip activator="parent" location="top">
          Скачать правила
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Основная информация -->
    <v-alert
      type="info"
      variant="tonal"
      class="overview-alert"
    >
      <template v-slot:prepend>
        <v-icon>mdi-information</v-icon>
      </template>

      <div class="d-flex flex-column gap-2">
        <!-- Даты -->
        <div class="d-flex align-center">
          <v-icon
            size="small"
            color="primary"
            class="mr-2"
          >
            mdi-calendar-range
          </v-icon>
          <div class="d-flex flex-column">
            <div class="text-body-2">
              <strong>Начало:</strong>
              <span class="ml-1">{{ formatDate(startDate) }}</span>
            </div>
            <div class="text-body-2">
              <strong>Окончание:</strong>
              <span class="ml-1">{{ formatDate(endDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Длительность -->
        <div class="d-flex align-center">
          <v-icon
            size="small"
            color="primary"
            class="mr-2"
          >
            mdi-clock-outline
          </v-icon>
          <div class="text-body-2">
            <strong>Длительность:</strong>
            <span class="ml-1">{{ duration }}</span>
          </div>
        </div>

        <!-- Призовой фонд -->
        <div class="d-flex align-center">
          <v-icon
            size="small"
            color="primary"
            class="mr-2"
          >
            mdi-trophy
          </v-icon>
          <div class="text-body-2">
            <strong>Призовой фонд:</strong>
            <span class="ml-1">{{ prize }}</span>
          </div>
        </div>

        <!-- Статус -->
        <div class="d-flex align-center">
          <v-icon
            size="small"
            :color="statusColor"
            class="mr-2"
          >
            {{ statusIcon }}
          </v-icon>
          <div class="text-body-2">
            <strong>Статус:</strong>
            <v-chip
              :color="statusColor"
              size="x-small"
              class="ml-2"
            >
              {{ statusText }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-alert>

    <!-- Сообщение об ошибке -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      closable
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/formatters'

// Props
const props = defineProps({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  prize: {
    type: String,
    required: true
  },
  allowDownload: {
    type: Boolean,
    default: true
  }
})

// Эмиты
const emit = defineEmits(['download', 'error'])

// Состояние
const downloading = ref(false)
const error = ref('')

// Вычисляемые свойства
const duration = computed(() => {
  const start = props.startDate.getTime()
  const end = props.endDate.getTime()
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  
  if (days === 1) return '1 день'
  if (days < 5) return `${days} дня`
  return `${days} дней`
})

const statusText = computed(() => {
  const now = new Date()
  if (now < props.startDate) return 'Предстоит'
  if (now > props.endDate) return 'Завершен'
  return 'Активен'
})

const statusColor = computed(() => {
  switch (statusText.value) {
    case 'Предстоит': return 'info'
    case 'Активен': return 'success'
    case 'Завершен': return 'error'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (statusText.value) {
    case 'Предстоит': return 'mdi-clock-outline'
    case 'Активен': return 'mdi-play-circle'
    case 'Завершен': return 'mdi-check-circle'
    default: return 'mdi-help-circle'
  }
})

// Методы
const downloadRules = async () => {
  if (downloading.value) return
  
  try {
    downloading.value = true
    error.value = ''
    emit('download')
  } catch (err) {
    error.value = err.message || 'Ошибка при скачивании правил'
    emit('error', error.value)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.rules-overview {
  position: relative;
}

.overview-alert {
  border-radius: 8px;
}

.overview-alert :deep(.v-alert__prepend) {
  align-self: start;
  margin-top: 4px;
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
  .overview-alert {
    padding: 12px;
  }
  
  .text-body-2 {
    font-size: 0.875rem;
  }
}
</style> 