<template>
  <div class="ui-table">
    <!-- Заголовок таблицы -->
    <div v-if="$slots.header" class="ui-table__header">
      <slot name="header"></slot>
    </div>

    <!-- Основная таблица -->
    <div class="ui-table__wrapper">
      <table class="ui-table__table">
        <thead>
          <tr>
            <th v-if="selectable" class="ui-table__th ui-table__th--checkbox">
              <UiCheckbox
                :model-value="isAllSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="ui-table__th"
              :class="{
                'ui-table__th--sortable': column.sortable,
                'ui-table__th--sorted': sortBy === column.key
              }"
              @click="column.sortable && sort(column.key)"
            >
              <div class="ui-table__th-content">
                {{ column.label }}
                <svg
                  v-if="column.sortable"
                  class="ui-table__sort-icon"
                  :class="{
                    'ui-table__sort-icon--asc': sortBy === column.key && sortOrder === 'asc',
                    'ui-table__sort-icon--desc': sortBy === column.key && sortOrder === 'desc'
                  }"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </th>
            <th v-if="$slots.actions" class="ui-table__th ui-table__th--actions">
              Действия
            </th>
          </tr>
        </thead>
        
        <tbody>
          <template v-if="items.length">
            <tr
              v-for="item in sortedItems"
              :key="item[rowKey]"
              class="ui-table__row"
              :class="{ 'ui-table__row--selected': isSelected(item) }"
            >
              <td v-if="selectable" class="ui-table__td ui-table__td--checkbox">
                <UiCheckbox
                  :model-value="isSelected(item)"
                  @update:model-value="toggleSelect(item)"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                class="ui-table__td"
              >
                <slot
                  :name="column.key"
                  :item="item"
                  :value="item[column.key]"
                >
                  {{ item[column.key] }}
                </slot>
              </td>
              <td v-if="$slots.actions" class="ui-table__td ui-table__td--actions">
                <slot name="actions" :item="item"></slot>
              </td>
            </tr>
          </template>
          <tr v-else class="ui-table__row ui-table__row--empty">
            <td :colspan="totalColumns" class="ui-table__td ui-table__td--empty">
              <slot name="empty">Нет данных</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div v-if="showPagination" class="ui-table__footer">
      <div class="ui-table__pagination">
        <span class="ui-table__pagination-info">
          {{ paginationInfo }}
        </span>
        <div class="ui-table__pagination-controls">
          <UiButton
            variant="ghost"
            size="small"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </template>
          </UiButton>
          <span class="ui-table__pagination-pages">
            Страница {{ currentPage }} из {{ totalPages }}
          </span>
          <UiButton
            variant="ghost"
            size="small"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </template>
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UiCheckbox from '../forms/UiCheckbox.vue'
import UiButton from '../buttons/UiButton.vue'

const props = defineProps({
  // Данные таблицы
  items: {
    type: Array,
    required: true
  },
  // Конфигурация колонок
  columns: {
    type: Array,
    required: true,
    validator: (columns) => columns.every(column => 'key' in column && 'label' in column)
  },
  // Ключ для уникальной идентификации строк
  rowKey: {
    type: String,
    default: 'id'
  },
  // Возможность выбора строк
  selectable: {
    type: Boolean,
    default: false
  },
  // Выбранные строки
  modelValue: {
    type: Array,
    default: () => []
  },
  // Пагинация
  currentPage: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    default: null
  },
  // Сортировка
  defaultSort: {
    type: Object,
    default: () => ({
      key: '',
      order: 'asc'
    })
  }
})

const emit = defineEmits(['update:modelValue', 'update:currentPage', 'sort'])

// Состояние сортировки
const sortBy = ref(props.defaultSort.key)
const sortOrder = ref(props.defaultSort.order)

// Вычисляемые свойства
const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (props.$slots.actions) count++
  return count
})

const showPagination = computed(() => {
  return props.totalItems !== null && props.totalItems > props.perPage
})

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.perPage)
})

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.perPage + 1
  const end = Math.min(start + props.perPage - 1, props.totalItems)
  return `Показано ${start}-${end} из ${props.totalItems}`
})

const isAllSelected = computed(() => {
  return props.items.length > 0 && props.items.every(item => isSelected(item))
})

const sortedItems = computed(() => {
  if (!sortBy.value) return props.items

  return [...props.items].sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]

    if (aValue === bValue) return 0
    
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return aValue > bValue ? modifier : -modifier
  })
})

// Методы
const sort = (key) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  
  emit('sort', { key: sortBy.value, order: sortOrder.value })
}

const isSelected = (item) => {
  return props.modelValue.some(selected => selected[props.rowKey] === item[props.rowKey])
}

const toggleSelect = (item) => {
  const selected = [...props.modelValue]
  const index = selected.findIndex(i => i[props.rowKey] === item[props.rowKey])
  
  if (index === -1) {
    selected.push(item)
  } else {
    selected.splice(index, 1)
  }
  
  emit('update:modelValue', selected)
}

const toggleSelectAll = (value) => {
  emit('update:modelValue', value ? [...props.items] : [])
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}
</script>

<style scoped>
.ui-table {
  width: 100%;
  background-color: rgb(var(--v-theme-surface));
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.ui-table__wrapper {
  overflow-x: auto;
}

.ui-table__table {
  width: 100%;
  border-collapse: collapse;
}

.ui-table__th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  background-color: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-table__th--sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-base);
}

.ui-table__th--sortable:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.ui-table__th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ui-table__sort-icon {
  width: 1rem;
  height: 1rem;
  transition: transform var(--transition-base);
  opacity: var(--v-medium-emphasis-opacity);
}

.ui-table__sort-icon--asc {
  transform: rotate(0deg);
  opacity: 1;
}

.ui-table__sort-icon--desc {
  transform: rotate(180deg);
  opacity: 1;
}

.ui-table__td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-table__row {
  transition: background-color var(--transition-base);
}

.ui-table__row:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.ui-table__row--selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.ui-table__row--selected:hover {
  background-color: rgba(var(--v-theme-primary), 0.15);
}

.ui-table__row--empty {
  text-align: center;
}

.ui-table__td--empty {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  padding: 3rem 1rem;
}

.ui-table__td--checkbox,
.ui-table__th--checkbox {
  width: 1px;
  padding-right: 0;
}

.ui-table__td--actions,
.ui-table__th--actions {
  width: 1px;
  white-space: nowrap;
  text-align: right;
}

.ui-table__header {
  padding: 1rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-table__footer {
  padding: 1rem;
  background-color: rgb(var(--v-theme-surface-variant));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ui-table__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.ui-table__pagination-info {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.ui-table__pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ui-table__pagination-pages {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}
</style> 