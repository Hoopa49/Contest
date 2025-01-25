<!-- 
  ContestConditionsModal.vue
  Модальное окно с условиями участия в конкурсе
-->
<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 pb-2">
        Условия участия
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Список условий -->
        <v-list class="mb-4">
          <v-list-item
            v-for="condition in conditions"
            :key="condition.id"
            class="px-0"
          >
            <template v-slot:prepend>
              <v-checkbox
                v-model="condition.checked"
                hide-details
                @change="updateAllChecked"
              />
            </template>

            <v-list-item-title class="condition-text">
              {{ condition.text }}
              <v-chip
                v-if="condition.required"
                color="error"
                size="x-small"
                class="ml-2"
              >
                Обязательно
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle
              v-if="condition.hint"
              class="mt-1 text-grey"
            >
              {{ condition.hint }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-divider class="mb-4" />

        <!-- Общий чекбокс -->
        <v-checkbox
          v-model="allChecked"
          label="Подтверждаю, что ознакомлен и согласен со всеми условиями участия"
          color="primary"
          hide-details
          class="mb-4"
          @click="toggleAll"
        />
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        
        <v-btn
          color="grey-darken-1"
          variant="text"
          :disabled="loading"
          @click="close"
        >
          Отмена
        </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!canSubmit"
          @click="submit"
        >
          Присоединиться к конкурсу
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  contestConditions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// Состояние
const dialog = ref(false)
const loading = ref(false)
const error = ref(null)
const allChecked = ref(false)
const conditions = ref([])

// Методы
const updateAllChecked = () => {
  allChecked.value = conditions.value.every(condition => condition.checked)
}

const toggleAll = () => {
  const newState = !allChecked.value
  conditions.value.forEach(condition => {
    condition.checked = newState
  })
}

// Следим за изменением modelValue
watch(() => props.modelValue, (value) => {
  dialog.value = value
})

// Следим за изменением dialog
watch(dialog, (value) => {
  if (!value) {
    emit('update:modelValue', false)
  }
})

// Следим за изменением условий конкурса
watch(() => props.contestConditions, (newConditions) => {
  conditions.value = newConditions.map(condition => ({
    ...condition,
    checked: false
  }))
  updateAllChecked()
}, { immediate: true })

// Вычисляемые свойства
const canSubmit = computed(() => {
  return conditions.value.every(condition => condition.checked)
})

const submit = async () => {
  if (!canSubmit.value || loading.value) return

  try {
    loading.value = true
    error.value = null
    
    await emit('submit', conditions.value)
    close()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const close = () => {
  dialog.value = false
  error.value = null
  conditions.value.forEach(condition => {
    condition.checked = false
  })
  allChecked.value = false
}
</script>

<style scoped>
.condition-text {
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.5;
  padding-right: 8px;
}
</style> 