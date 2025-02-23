<!-- 
  RulesSections.vue
  Компонент для отображения разделов правил конкурса.
  Включает аккордеон с разделами правил и предупреждениями.
-->
<template>
  <div class="rules-sections">
    <!-- Заголовок секции -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mb-0">
        Правила участия
      </h3>
      <v-chip
        class="ml-4"
        color="primary"
        size="small"
        variant="outlined"
      >
        {{ sectionsCount }} разделов
      </v-chip>
    </div>

    <!-- Важные разделы -->
    <div v-if="importantSections.length" class="mb-4">
      <v-alert
        type="error"
        variant="tonal"
        class="important-alert"
      >
        <template v-slot:prepend>
          <v-icon>mdi-alert-circle</v-icon>
        </template>
        <div class="text-subtitle-2 mb-2">
          Важные положения правил:
        </div>
        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item
            v-for="section in importantSections"
            :key="section.id"
            :value="section"
            class="important-item"
            @click="scrollToSection(section.id)"
          >
            <template v-slot:prepend>
              <v-icon
                color="error"
                size="small"
              >
                mdi-alert
              </v-icon>
            </template>
            <v-list-item-title>
              {{ section.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-alert>
    </div>

    <!-- Разделы правил -->
    <v-expansion-panels
      v-model="expandedPanel"
      variant="accordion"
      class="rules-panels"
      :multiple="allowMultiple"
    >
      <v-expansion-panel
        v-for="section in sections"
        :key="section.id"
        :value="section.id"
        :class="[
          'section-panel',
          { 'important-panel': section.important }
        ]"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center">
            <v-icon
              :color="section.important ? 'error' : 'primary'"
              class="mr-2"
            >
              {{ section.important ? 'mdi-alert' : 'mdi-book-open-page-variant' }}
            </v-icon>
            {{ section.title }}
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <!-- Основной контент -->
          <div 
            class="section-content"
            v-html="formatContent(section.content)"
          />

          <!-- Дополнительная информация -->
          <div 
            v-if="section.note"
            class="text-caption text-medium-emphasis mt-2"
          >
            {{ section.note }}
          </div>

          <!-- Предупреждение -->
          <v-alert
            v-if="section.warning"
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            {{ section.warning }}
          </v-alert>

          <!-- Ссылки на другие разделы -->
          <div 
            v-if="section.relatedSections && section.relatedSections.length"
            class="mt-4"
          >
            <div class="text-caption text-medium-emphasis mb-2">
              Связанные разделы:
            </div>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="relatedId in section.relatedSections"
                :key="relatedId"
                size="small"
                variant="outlined"
                color="primary"
                class="related-chip"
                @click="scrollToSection(relatedId)"
              >
                {{ getSectionTitle(relatedId) }}
              </v-chip>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Кнопка "Развернуть все" -->
    <div class="d-flex justify-end mt-4">
      <v-btn
        variant="text"
        color="primary"
        size="small"
        :prepend-icon="expandedPanel.length === sections.length ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="toggleAll"
      >
        {{ expandedPanel.length === sections.length ? 'Свернуть все' : 'Развернуть все' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  sections: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(section => {
        return typeof section === 'object' &&
          'id' in section &&
          'title' in section &&
          'content' in section
      })
    }
  },
  allowMultiple: {
    type: Boolean,
    default: true
  }
})

// Состояние
const expandedPanel = ref([])

// Вычисляемые свойства
const sectionsCount = computed(() => props.sections.length)

const importantSections = computed(() => {
  return props.sections.filter(section => section.important)
})

// Методы
const formatContent = (content) => {
  if (!content) return ''
  
  // Заменяем переносы строк на <br>
  let formatted = content.replace(/\n/g, '<br>')
  
  // Выделяем важные части текста
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-error">$1</strong>'
  )
  
  // Добавляем ссылки
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="text-primary">$1</a>'
  )
  
  return formatted
}

const getSectionTitle = (id) => {
  const section = props.sections.find(s => s.id === id)
  return section ? section.title : ''
}

const scrollToSection = (id) => {
  // Раскрываем панель, если она свернута
  if (!expandedPanel.value.includes(id)) {
    if (props.allowMultiple) {
      expandedPanel.value.push(id)
    } else {
      expandedPanel.value = [id]
    }
  }

  // Прокручиваем к секции
  setTimeout(() => {
    const element = document.querySelector(`[data-section-id="${id}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const toggleAll = () => {
  if (expandedPanel.value.length === props.sections.length) {
    expandedPanel.value = []
  } else {
    expandedPanel.value = props.sections.map(section => section.id)
  }
}
</script>

<style scoped>
.rules-sections {
  position: relative;
}

.rules-panels {
  border-radius: 8px;
  overflow: hidden;
}

.section-panel {
  transition: all 0.3s ease;
}

.important-panel :deep(.v-expansion-panel-title) {
  color: var(--v-theme-error);
}

.section-content {
  line-height: 1.6;
}

.section-content :deep(a) {
  text-decoration: none;
}

.section-content :deep(a:hover) {
  text-decoration: underline;
}

.important-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.important-item:hover {
  background-color: rgba(var(--v-theme-error), 0.04);
}

.related-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-chip:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
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
  .section-content {
    font-size: 0.875rem;
  }
  
  .important-alert {
    padding: 12px;
  }
}
</style> 