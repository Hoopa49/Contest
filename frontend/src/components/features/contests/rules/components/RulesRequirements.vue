<!-- 
  RulesRequirements.vue
  Компонент для отображения требований к участникам конкурса.
  Включает список обязательных и дополнительных требований.
-->
<template>
  <div class="rules-requirements">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Требования к участникам
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

    <!-- Список требований -->
    <v-list density="comfortable">
      <v-list-subheader v-if="requiredItems.length">
        Обязательные требования
      </v-list-subheader>

      <v-list-item
        v-for="requirement in requiredItems"
        :key="requirement.id"
        :value="requirement"
        class="requirement-item"
      >
        <template v-slot:prepend>
          <v-icon
            :color="getRequirementColor(requirement)"
            :icon="getRequirementIcon(requirement)"
          />
        </template>

        <v-list-item-title>
          {{ requirement.text }}
        </v-list-item-title>

        <template v-slot:append>
          <v-chip
            color="error"
            size="x-small"
            variant="flat"
          >
            Обязательно
          </v-chip>

          <v-tooltip
            v-if="requirement.hint"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="info"
                size="small"
                class="ml-2"
              >
                mdi-information
              </v-icon>
            </template>
            {{ requirement.hint }}
          </v-tooltip>
        </template>
      </v-list-item>

      <v-divider v-if="requiredItems.length && optionalItems.length" />

      <v-list-subheader v-if="optionalItems.length">
        Дополнительные требования
      </v-list-subheader>

      <v-list-item
        v-for="requirement in optionalItems"
        :key="requirement.id"
        :value="requirement"
        class="requirement-item"
      >
        <template v-slot:prepend>
          <v-icon
            :color="getRequirementColor(requirement)"
            :icon="getRequirementIcon(requirement)"
          />
        </template>

        <v-list-item-title>
          {{ requirement.text }}
        </v-list-item-title>

        <template v-slot:append>
          <v-chip
            color="info"
            size="x-small"
            variant="flat"
          >
            Опционально
          </v-chip>

          <v-tooltip
            v-if="requirement.hint"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="info"
                size="small"
                class="ml-2"
              >
                mdi-information
              </v-icon>
            </template>
            {{ requirement.hint }}
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <!-- Дополнительная информация -->
    <v-alert
      v-if="note"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      <template v-slot:prepend>
        <v-icon>mdi-information</v-icon>
      </template>
      {{ note }}
    </v-alert>

    <!-- Предупреждение -->
    <v-alert
      v-if="warning"
      type="warning"
      variant="tonal"
      class="mt-4"
    >
      <template v-slot:prepend>
        <v-icon>mdi-alert</v-icon>
      </template>
      {{ warning }}
    </v-alert>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  requirements: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => {
        return typeof item === 'object' &&
          'id' in item &&
          'text' in item &&
          'required' in item
      })
    }
  },
  note: {
    type: String,
    default: ''
  },
  warning: {
    type: String,
    default: ''
  }
})

// Вычисляемые свойства
const requiredItems = computed(() => {
  return props.requirements.filter(item => item.required)
})

const optionalItems = computed(() => {
  return props.requirements.filter(item => !item.required)
})

const statusText = computed(() => {
  const total = props.requirements.length
  const required = requiredItems.value.length
  
  if (required === 0) return 'Нет обязательных'
  if (required === total) return 'Все обязательные'
  return `${required} из ${total} обязательные`
})

const statusColor = computed(() => {
  const required = requiredItems.value.length
  if (required === 0) return 'success'
  if (required === props.requirements.length) return 'error'
  return 'warning'
})

// Методы
const getRequirementColor = (requirement) => {
  if (!requirement.available) return 'grey'
  if (requirement.completed) return 'success'
  return requirement.required ? 'error' : 'info'
}

const getRequirementIcon = (requirement) => {
  if (!requirement.available) return 'mdi-lock'
  if (requirement.completed) return 'mdi-check-circle'
  return requirement.required ? 'mdi-alert-circle' : 'mdi-information'
}
</script>

<style scoped>
.rules-requirements {
  position: relative;
}

.requirement-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.requirement-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
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
  .requirement-item {
    padding: 8px;
  }
  
  .v-list-item-title {
    font-size: 0.875rem;
  }
}
</style> 