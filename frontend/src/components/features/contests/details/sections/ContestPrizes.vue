<!-- 
  ContestPrizes.vue
  Компонент для отображения информации о призах конкурса.
  Показывает список призов с их описанием и визуальным оформлением.
-->
<template>
  <v-expansion-panel class="contest-prizes">
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon start color="warning">mdi-trophy</v-icon>
        <span class="text-h6">Призы</span>
        <v-chip
          v-if="totalValue"
          color="warning"
          class="ml-4"
        >
          {{ totalValue }}
        </v-chip>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <!-- Основные призы -->
      <v-row>
        <v-col 
          v-for="(prize, index) in mainPrizes"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :class="[
              'prize-card',
              `prize-card--${index + 1}`
            ]"
            :elevation="3 - index"
          >
            <div class="prize-header">
              <v-icon
                :color="getPrizeColor(index)"
                size="large"
              >
                {{ getPrizeIcon(index) }}
              </v-icon>
              <div class="text-h6 mt-2">{{ index + 1 }} место</div>
            </div>

            <v-divider></v-divider>

            <v-card-text>
              <div class="text-h5 mb-2">{{ prize.value }}</div>
              <div class="text-body-2">{{ prize.description }}</div>
              
              <v-chip-group
                v-if="prize.features?.length"
                class="mt-4"
              >
                <v-chip
                  v-for="(feature, fIndex) in prize.features"
                  :key="fIndex"
                  size="small"
                  variant="outlined"
                >
                  {{ feature }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Дополнительные призы -->
      <template v-if="additionalPrizes.length">
        <div class="text-h6 mt-6 mb-4">
          Дополнительные призы
        </div>

        <v-row>
          <v-col 
            v-for="(prize, index) in additionalPrizes"
            :key="index"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card variant="outlined" class="additional-prize">
              <v-card-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-gift</v-icon>
                </template>
                <v-card-title>{{ prize.title }}</v-card-title>
                <v-card-subtitle v-if="prize.value">
                  {{ prize.value }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <div class="text-body-2">{{ prize.description }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Условия получения -->
      <v-alert
        v-if="conditions.length"
        type="info"
        variant="tonal"
        class="mt-6"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <div class="text-subtitle-1 mb-2">Условия получения призов:</div>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(condition, index) in conditions"
            :key="index"
            :prepend-icon="'mdi-check-circle'"
          >
            {{ condition }}
          </v-list-item>
        </v-list>
      </v-alert>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
import { computed } from 'vue'
import { PrizeType } from '@/constants/contest'

// Props с типизацией
const props = defineProps({
  /** Список призов */
  prizes: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(prize => 
        typeof prize === 'object' &&
        typeof prize.title === 'string' &&
        typeof prize.description === 'string' &&
        typeof prize.value === 'number'
      )
    }
  },
  /** Общая стоимость призов */
  totalValue: {
    type: String,
    default: ''
  },
  /** Условия получения призов */
  conditions: {
    type: Array,
    default: () => []
  }
})

// Вычисляемые свойства
const mainPrizes = computed(() => 
  props.prizes.filter(prize => prize.type === PrizeType.MAIN)
)

const additionalPrizes = computed(() => 
  props.prizes.filter(prize => prize.type !== PrizeType.MAIN)
)

// Методы
const getPrizeColor = (index) => {
  const colors = ['amber-darken-2', 'grey-lighten-1', 'brown-lighten-1']
  return colors[index] || 'grey'
}

const getPrizeIcon = (index) => {
  if (index === 0) return 'mdi-trophy'
  if (index === 1) return 'mdi-medal'
  if (index === 2) return 'mdi-medal'
  return 'mdi-star'
}
</script>

<style scoped>
.contest-prizes {
  overflow: hidden;
}

.prize-card {
  height: 100%;
  transition: transform 0.2s;
}

.prize-card:hover {
  transform: translateY(-4px);
}

.prize-card--1 {
  background: linear-gradient(135deg, var(--v-theme-warning) 0%, var(--v-theme-warning-lighten-2) 100%);
}

.prize-card--2 {
  background: linear-gradient(135deg, var(--v-theme-grey) 0%, var(--v-theme-grey-lighten-2) 100%);
}

.prize-card--3 {
  background: linear-gradient(135deg, var(--v-theme-brown) 0%, var(--v-theme-brown-lighten-2) 100%);
}

.prize-header {
  text-align: center;
  padding: 16px;
}

.additional-prize {
  height: 100%;
  transition: transform 0.2s;
}

.additional-prize:hover {
  transform: translateY(-4px);
}

.bg-transparent {
  background: transparent !important;
}

@media (max-width: 600px) {
  .prize-card,
  .additional-prize {
    margin-bottom: 16px;
  }
}
</style> 