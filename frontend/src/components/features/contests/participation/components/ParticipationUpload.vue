<!-- 
  ParticipationUpload.vue
  Компонент для загрузки материалов участия в конкурсе.
  Включает загрузку файлов, предпросмотр и валидацию.
-->
<template>
  <div class="participation-upload">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-subtitle-1 mb-0">
        Загрузка материалов
      </h3>
      <v-chip
        class="ml-4"
        :color="statusColor"
        size="small"
        variant="outlined"
      >
        {{ statusText }}
      </v-chip>
    </div>

    <!-- Поле загрузки файлов -->
    <v-file-input
      v-model="filesValue"
      :rules="fileRules"
      :accept="acceptedTypes"
      :label="uploadLabel"
      :hint="uploadHint"
      :loading="loading"
      :disabled="disabled"
      :error="!!error"
      :error-messages="error"
      density="comfortable"
      prepend-icon="mdi-camera"
      variant="outlined"
      multiple
      show-size
      counter
      persistent-hint
      @update:model-value="handleFilesChange"
    />

    <!-- Предпросмотр загруженных файлов -->
    <div 
      v-if="previews.length"
      class="previews mt-4"
    >
      <v-row>
        <v-col
          v-for="(preview, index) in previews"
          :key="index"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card
            class="preview-card"
            :loading="loading"
          >
            <!-- Изображение -->
            <v-img
              :src="preview.url"
              :aspect-ratio="1"
              cover
              class="preview-image"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                </v-row>
              </template>

              <!-- Оверлей с действиями -->
              <div class="preview-overlay">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  :disabled="loading || disabled"
                  @click="removeFile(index)"
                >
                  <v-tooltip activator="parent" location="top">
                    Удалить файл
                  </v-tooltip>
                </v-btn>
              </div>
            </v-img>

            <!-- Информация о файле -->
            <v-card-text class="pa-2">
              <div class="text-caption text-truncate">
                {{ preview.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatFileSize(preview.size) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

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
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  acceptedTypes: {
    type: String,
    default: 'image/*'
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue', 'error'])

// Состояние
const filesValue = ref([])
const previews = ref([])

// Вычисляемые свойства
const statusText = computed(() => {
  if (props.loading) return 'Загрузка...'
  if (props.disabled) return 'Загрузка недоступна'
  if (filesValue.value.length === 0) return 'Нет файлов'
  return `Загружено ${filesValue.value.length} из ${props.maxFiles}`
})

const statusColor = computed(() => {
  if (props.loading) return 'grey'
  if (props.disabled) return 'error'
  if (filesValue.value.length === 0) return 'warning'
  return 'success'
})

const uploadLabel = computed(() => {
  if (props.loading) return 'Загрузка файлов...'
  if (props.disabled) return 'Загрузка недоступна'
  return 'Добавьте фото или видео'
})

const uploadHint = computed(() => {
  return `Максимум ${props.maxFiles} файлов, до ${formatFileSize(props.maxFileSize)} каждый`
})

// Правила валидации
const fileRules = [
  value => {
    if (!value || value.length === 0) return true
    if (value.length > props.maxFiles) return `Максимум ${props.maxFiles} файлов`
    return true
  },
  value => {
    if (!value) return true
    for (const file of value) {
      if (file.size > props.maxFileSize) {
        return `Файл ${file.name} превышает ${formatFileSize(props.maxFileSize)}`
      }
    }
    return true
  }
]

// Методы
const handleFilesChange = (files) => {
  if (!files) {
    clearPreviews()
    emit('update:modelValue', [])
    return
  }

  // Проверяем количество файлов
  if (files.length > props.maxFiles) {
    emit('error', `Максимум ${props.maxFiles} файлов`)
    return
  }

  // Проверяем размер каждого файла
  for (const file of files) {
    if (file.size > props.maxFileSize) {
      emit('error', `Файл ${file.name} превышает ${formatFileSize(props.maxFileSize)}`)
      return
    }
  }

  // Создаем превью
  createPreviews(files)
  emit('update:modelValue', files)
}

const createPreviews = (files) => {
  clearPreviews()
  
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      previews.value.push({
        url: e.target.result,
        name: file.name,
        size: file.size
      })
    }
    reader.readAsDataURL(file)
  })
}

const clearPreviews = () => {
  previews.value.forEach(preview => {
    URL.revokeObjectURL(preview.url)
  })
  previews.value = []
}

const removeFile = (index) => {
  const newFiles = [...filesValue.value]
  newFiles.splice(index, 1)
  filesValue.value = newFiles
  handleFilesChange(newFiles)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Б'
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Отслеживание изменений props
watch(() => props.modelValue, (value) => {
  if (value !== filesValue.value) {
    filesValue.value = value
    createPreviews(value)
  }
}, { deep: true })

// Очистка при размонтировании
onUnmounted(() => {
  clearPreviews()
})
</script>

<style scoped>
.participation-upload {
  position: relative;
}

.previews {
  display: grid;
  gap: 1rem;
}

.preview-card {
  position: relative;
  transition: transform 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-4px);
}

.preview-image {
  border-radius: 4px 4px 0 0;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(0 0 0 / 30%);
  transition: opacity 0.2s ease;
  opacity: 0;
}

.preview-card:hover .preview-overlay {
  opacity: 1;
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
  .previews {
    gap: 0.5rem;
  }

  .preview-overlay {
    opacity: 1;
    background: rgb(0 0 0 / 20%);
  }
}
</style> 