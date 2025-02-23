<!-- 
  ContestParticipation.vue
  Основной компонент для управления участием в конкурсе.
  Объединяет компоненты статуса, условий и загрузки материалов.
-->
<template>
  <v-card class="contest-participation">
    <!-- Статус участия -->
    <participation-status
      :progress="progress"
      :loading="loading"
      :status="participationStatus"
    />

    <v-divider class="my-4" />

    <!-- Условия участия -->
    <participation-conditions
      v-model:conditions="conditions"
      :loading="loading"
      :error="error"
      :disabled="isParticipating"
      @update:conditions="updateProgress"
      @verify="verifyCondition"
    />

    <!-- Загрузка материалов -->
    <v-expand-transition>
      <div v-if="showUploadSection">
        <v-divider class="my-4" />
        <participation-upload
          v-model="files"
          :loading="uploading"
          :disabled="!canSubmit || isParticipating"
          :error="uploadError"
          :max-files="maxFiles"
          :accepted-types="acceptedTypes"
          @error="handleUploadError"
          @remove="handleFileRemove"
        />
      </div>
    </v-expand-transition>

    <!-- Действия -->
    <v-card-actions>
      <v-btn
        v-if="canReset"
        variant="text"
        color="error"
        :disabled="loading || submitting"
        @click="resetParticipation"
      >
        Сбросить
      </v-btn>
      
      <v-spacer />
      
      <v-btn
        color="primary"
        :loading="submitting"
        :disabled="!canSubmit || isParticipating"
        @click="submitParticipation"
      >
        {{ submitButtonText }}
      </v-btn>
    </v-card-actions>

    <!-- Диалог подтверждения -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="400"
      :persistent="submitting"
    >
      <v-card>
        <v-card-title class="text-h6">
          Подтверждение участия
        </v-card-title>
        
        <v-card-text>
          <p class="mb-2">
            Вы уверены, что хотите подать заявку на участие в конкурсе?
          </p>
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-0"
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            После подтверждения вы не сможете изменить условия участия.
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="submitting"
            @click="showConfirmDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="confirmParticipation"
          >
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог сброса -->
    <v-dialog
      v-model="showResetDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6">
          Сброс прогресса
        </v-card-title>
        
        <v-card-text>
          <p class="mb-2">
            Вы уверены, что хотите сбросить весь прогресс?
          </p>
          <v-alert
            type="error"
            variant="tonal"
            class="mb-0"
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            Все выполненные условия и загруженные файлы будут удалены.
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showResetDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmReset"
          >
            Сбросить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Снэкбар для уведомлений -->
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
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useContestsStore } from '@/stores/contests'
import ParticipationStatus from './components/ParticipationStatus.vue'
import ParticipationConditions from './components/ParticipationConditions.vue'
import ParticipationUpload from './components/ParticipationUpload.vue'

// Props
const props = defineProps({
  contestId: {
    type: [String, Number],
    required: true
  },
  maxFiles: {
    type: Number,
    default: 5
  },
  acceptedTypes: {
    type: Array,
    default: () => ['image/*', 'application/pdf']
  }
})

// Состояние
const contestStore = useContestsStore()
const loading = ref(false)
const uploading = ref(false)
const submitting = ref(false)
const error = ref('')
const uploadError = ref('')
const progress = ref(0)
const files = ref([])
const showConfirmDialog = ref(false)
const showResetDialog = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const participationStatus = ref('pending') // pending, verifying, participating, rejected

// Условия участия
const conditions = ref([
  {
    id: 1,
    title: 'Подписаться на аккаунт',
    completed: false,
    available: true,
    required: true,
    hint: 'Необходимо подписаться на аккаунт организатора',
    verifying: false
  },
  {
    id: 2,
    title: 'Поставить лайк',
    completed: false,
    available: true,
    required: true,
    hint: 'Поставьте лайк конкурсному посту',
    verifying: false
  },
  {
    id: 3,
    title: 'Сделать репост',
    completed: false,
    available: true,
    required: false,
    hint: 'Сделайте репост конкурса к себе в профиль',
    verifying: false
  }
])

// Вычисляемые свойства
const showUploadSection = computed(() => {
  return progress.value === 100
})

const canSubmit = computed(() => {
  const requiredCompleted = conditions.value
    .filter(c => c.required)
    .every(c => c.completed)
    
  return requiredCompleted && (!showUploadSection.value || files.value.length > 0)
})

const canReset = computed(() => {
  return progress.value > 0 || files.value.length > 0
})

const isParticipating = computed(() => {
  return participationStatus.value === 'participating'
})

const submitButtonText = computed(() => {
  if (submitting.value) return 'Отправка...'
  if (isParticipating.value) return 'Вы участвуете'
  if (progress.value === 100) return 'Подтвердить участие'
  return 'Выполните обязательные условия'
})

// Методы
const updateProgress = () => {
  const completed = conditions.value.filter(c => c.completed).length
  progress.value = (completed / conditions.value.length) * 100
}

const verifyCondition = async (conditionId) => {
  const condition = conditions.value.find(c => c.id === conditionId)
  if (!condition || condition.verifying) return
  
  try {
    condition.verifying = true
    participationStatus.value = 'verifying'
    
    const result = await contestStore.verifyCondition({
      contestId: props.contestId,
      conditionId
    })
    
    condition.completed = result.completed
    if (result.message) {
      showSnackbar.value = true
      snackbarColor.value = result.completed ? 'success' : 'error'
      snackbarText.value = result.message
    }
    
  } catch (err) {
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = 'Не удалось проверить условие'
  } finally {
    condition.verifying = false
    participationStatus.value = 'pending'
    updateProgress()
  }
}

const handleUploadError = (message) => {
  uploadError.value = message
  showSnackbar.value = true
  snackbarColor.value = 'error'
  snackbarText.value = message
}

const handleFileRemove = (file) => {
  const index = files.value.indexOf(file)
  if (index > -1) {
    files.value.splice(index, 1)
    
    // Очищаем URL файла
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }
}

const submitParticipation = () => {
  if (canSubmit.value && !isParticipating.value) {
    showConfirmDialog.value = true
  }
}

const confirmParticipation = async () => {
  try {
    submitting.value = true
    showConfirmDialog.value = false
    
    await contestStore.submitParticipation({
      contestId: props.contestId,
      conditions: conditions.value,
      files: files.value
    })

    participationStatus.value = 'participating'
    showSnackbar.value = true
    snackbarColor.value = 'success'
    snackbarText.value = 'Заявка на участие успешно отправлена'
    
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при отправке заявки'
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = error.value
  } finally {
    submitting.value = false
  }
}

const resetParticipation = () => {
  showResetDialog.value = true
}

const confirmReset = () => {
  // Сбрасываем состояние
  conditions.value.forEach(condition => {
    condition.completed = false
    condition.verifying = false
  })
  
  // Очищаем файлы
  files.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
  files.value = []
  
  // Сбрасываем прогресс
  progress.value = 0
  participationStatus.value = 'pending'
  error.value = ''
  uploadError.value = ''
  
  showResetDialog.value = false
  showSnackbar.value = true
  snackbarColor.value = 'info'
  snackbarText.value = 'Прогресс участия сброшен'
}

// Инициализация
onMounted(async () => {
  try {
    loading.value = true
    const data = await contestStore.loadParticipationData(props.contestId)
    
    // Обновляем состояние из store
    if (data) {
      conditions.value = data.conditions || conditions.value
      files.value = data.files || []
      participationStatus.value = data.status || 'pending'
      updateProgress()
    }
    
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить данные об участии'
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = error.value
  } finally {
    loading.value = false
  }
})

// Очистка
onBeforeUnmount(() => {
  // Очищаем URL предпросмотров
  files.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
})
</script>

<style scoped>
.contest-participation {
  position: relative;
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
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
  .contest-participation {
    margin: 0;
  }
}
</style> 