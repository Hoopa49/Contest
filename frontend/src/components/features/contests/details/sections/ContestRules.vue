<!-- 
  ContestRules.vue
  Компонент для отображения правил и требований конкурса.
  Включает основные правила, требования к участникам и ограничения.
-->
<template>
  <v-expansion-panel class="contest-rules">
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon start color="amber">mdi-gavel</v-icon>
        <span class="text-h6">Правила участия</span>
        <v-chip
          v-if="hasImportantRules"
          color="error"
          size="small"
          class="ml-4"
        >
          Важно
        </v-chip>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <!-- Основные правила -->
      <v-row>
        <v-col cols="12">
          <v-list class="rules-list">
            <v-list-subheader class="font-weight-bold">
              Основные правила
            </v-list-subheader>

            <v-list-item
              v-for="(rule, index) in rules"
              :key="index"
              :class="{ 'important-rule': rule.important }"
            >
              <template v-slot:prepend>
                <v-icon
                  :color="rule.important ? 'error' : 'success'"
                  :icon="rule.important ? 'mdi-alert' : 'mdi-check-circle'"
                ></v-icon>
              </template>

              <v-list-item-title 
                :class="{ 'font-weight-bold': rule.important }"
              >
                {{ rule.text }}
              </v-list-item-title>

              <v-list-item-subtitle
                v-if="rule.description"
                class="mt-1"
              >
                {{ rule.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Требования к участникам -->
      <v-row v-if="requirements.length" class="mt-4">
        <v-col cols="12">
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon start color="info">mdi-account-check</v-icon>
              Требования к участникам
            </v-card-title>

            <v-card-text>
              <v-list density="comfortable">
                <v-list-item
                  v-for="(req, index) in requirements"
                  :key="index"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :color="req.required ? 'error' : 'info'"
                      :icon="req.required ? 'mdi-asterisk' : 'mdi-information'"
                      size="small"
                    ></v-icon>
                  </template>

                  <v-list-item-title>
                    {{ req.text }}
                    <v-chip
                      v-if="req.required"
                      color="error"
                      size="x-small"
                      class="ml-2"
                    >
                      Обязательно
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Ограничения -->
      <v-row v-if="restrictions.length" class="mt-4">
        <v-col cols="12">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-0"
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            
            <div class="text-subtitle-1 mb-2">Ограничения:</div>
            
            <v-list density="compact" class="bg-transparent">
              <v-list-item
                v-for="(restriction, index) in restrictions"
                :key="index"
                :prepend-icon="'mdi-minus-circle'"
              >
                {{ restriction }}
              </v-list-item>
            </v-list>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Дополнительная информация -->
      <v-row v-if="additionalInfo" class="mt-4">
        <v-col cols="12">
          <v-alert
            type="info"
            variant="tonal"
            class="mb-0"
          >
            {{ additionalInfo }}
          </v-alert>
        </v-col>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
import { computed } from 'vue'

// Определение типов
const RuleType = {
  /** Обычное правило */
  NORMAL: 'normal',
  /** Важное правило */
  IMPORTANT: 'important'
}

// Props с типизацией
const props = defineProps({
  /** Список правил конкурса */
  rules: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(rule => 
        typeof rule === 'object' &&
        typeof rule.text === 'string' &&
        (!rule.description || typeof rule.description === 'string')
      )
    }
  },
  /** Требования к участникам */
  requirements: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every(req =>
        typeof req === 'object' &&
        typeof req.text === 'string' &&
        typeof req.required === 'boolean'
      )
    }
  },
  /** Список ограничений */
  restrictions: {
    type: Array,
    default: () => []
  },
  /** Дополнительная информация */
  additionalInfo: {
    type: String,
    default: ''
  }
})

// Вычисляемые свойства
const hasImportantRules = computed(() => {
  return props.rules.some(rule => rule.important)
})
</script>

<style scoped>
.contest-rules {
  overflow: hidden;
}

.rules-list {
  background: transparent;
}

.important-rule {
  background-color: rgba(var(--v-theme-error), 0.05);
  border-radius: 8px;
}

.bg-transparent {
  background: transparent !important;
}

:deep(.v-list-item) {
  min-height: 48px;
  padding: 8px 16px;
}

:deep(.v-list-item__prepend) {
  margin-right: 16px;
}

@media (width <= 600px) {
  :deep(.v-list-item) {
    padding: 4px 8px;
  }
}
</style> 