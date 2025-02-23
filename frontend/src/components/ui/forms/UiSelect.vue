<template>
  <div 
    class="ui-select" 
    :class="{ 
      'ui-select--error': error,
      'ui-select--open': isOpen,
      'ui-select--multiple': multiple
    }"
  >
    <label v-if="label" class="ui-select__label">
      {{ label }}
      <span v-if="required" class="ui-select__required">*</span>
    </label>
    
    <div class="ui-select__wrapper" @click="toggleDropdown">
      <div class="ui-select__field" :class="{ 'ui-select__field--placeholder': !hasValue }">
        <template v-if="multiple">
          <div v-if="selectedLabels.length" class="ui-select__tags">
            <span 
              v-for="(label, index) in selectedLabels" 
              :key="index" 
              class="ui-select__tag"
            >
              {{ label }}
              <button 
                class="ui-select__tag-remove"
                @click.stop="removeValue(selectedValues[index])"
              >
                ×
              </button>
            </span>
          </div>
          <span v-else>{{ placeholder }}</span>
        </template>
        <template v-else>
          {{ selectedLabel || placeholder }}
        </template>
      </div>
      
      <div class="ui-select__arrow">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          class="ui-select__arrow-icon"
          :class="{ 'ui-select__arrow-icon--open': isOpen }"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div v-show="isOpen" class="ui-select__dropdown">
      <div 
        v-for="option in options" 
        :key="option.value"
        class="ui-select__option"
        :class="{ 'ui-select__option--selected': isSelected(option.value) }"
        @click="selectOption(option)"
      >
        <template v-if="multiple">
          <div class="ui-select__checkbox">
            <svg v-if="isSelected(option.value)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </template>
        {{ option.label }}
      </div>
    </div>

    <span v-if="error" class="ui-select__error">{{ error }}</span>
    <span v-else-if="hint" class="ui-select__hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => options.every(option => 
      'value' in option && 'label' in option
    )
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Выберите значение'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

// Закрытие при клике вне компонента
const closeOnClickOutside = (event) => {
  if (!event.target.closest('.ui-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return props.modelValue !== ''
})

const selectedValues = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }
  return [props.modelValue]
})

const selectedLabels = computed(() => {
  return selectedValues.value.map(value => {
    const option = props.options.find(opt => opt.value === value)
    return option ? option.label : ''
  })
})

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : ''
})

const isSelected = (value) => {
  if (props.multiple) {
    return selectedValues.value.includes(value)
  }
  return props.modelValue === value
}

const selectOption = (option) => {
  if (props.multiple) {
    const values = [...selectedValues.value]
    const index = values.indexOf(option.value)
    
    if (index === -1) {
      values.push(option.value)
    } else {
      values.splice(index, 1)
    }
    
    emit('update:modelValue', values)
  } else {
    emit('update:modelValue', option.value)
    isOpen.value = false
  }
}

const removeValue = (value) => {
  if (props.multiple) {
    const values = selectedValues.value.filter(v => v !== value)
    emit('update:modelValue', values)
  }
}
</script>

<style scoped>
.ui-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ui-select__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.ui-select__required {
  color: rgb(var(--v-theme-error));
  margin-left: 0.25rem;
}

.ui-select__wrapper {
  position: relative;
  cursor: pointer;
}

.ui-select__field {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  transition: all var(--transition-base);
  min-height: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: rgb(var(--v-theme-surface));
  border-radius: var(--border-radius-md);
  flex-wrap: wrap;
  gap: 0.25rem;
}

.ui-select__field--placeholder {
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
}

.ui-select__field:hover {
  border-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.ui-select--open .ui-select__field {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.ui-select--error .ui-select__field {
  border-color: rgb(var(--v-theme-error));
}

.ui-select--error .ui-select__field:hover {
  border-color: rgb(var(--v-theme-error));
}

.ui-select__arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  transition: transform var(--transition-base);
}

.ui-select__arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform var(--transition-base);
}

.ui-select__arrow-icon--open {
  transform: rotate(180deg);
}

.ui-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  max-height: 15rem;
  overflow-y: auto;
}

.ui-select__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.ui-select__option:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.ui-select__option--selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.ui-select__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--border-radius-sm);
  color: rgb(var(--v-theme-primary));
}

.ui-select__option--selected .ui-select__checkbox {
  background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.ui-select__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.ui-select__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border-radius: var(--border-radius-full);
}

.ui-select__tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: currentColor;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-base);
}

.ui-select__tag-remove:hover {
  opacity: 1;
}

.ui-select__error {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}

.ui-select__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style> 