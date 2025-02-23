<template>
  <div class="ui-input" :class="{ 'ui-input--error': error }">
    <label v-if="label" class="ui-input__label" :for="id">
      {{ label }}
      <span v-if="required" class="ui-input__required">*</span>
    </label>
    
    <div class="ui-input__wrapper">
      <input
        :id="id"
        ref="input"
        v-bind="$attrs"
        :value="modelValue"
        :disabled="disabled"
        :placeholder="placeholder"
        class="ui-input__field"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
    </div>

    <span v-if="error" class="ui-input__error">{{ error }}</span>
    <span v-else-if="hint" class="ui-input__hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
})

const input = ref(null)
const id = computed(() => `ui-input-${Math.random().toString(36).substr(2, 9)}`)

defineEmits(['update:modelValue', 'blur', 'focus'])
</script>

<style scoped>
.ui-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.ui-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}

.ui-input__required {
  color: rgb(var(--v-theme-error));
  margin-left: var(--spacing-xs);
}

.ui-input__wrapper {
  position: relative;
}

.ui-input__field {
  width: 100%;
  height: 52px;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  background: rgb(var(--v-theme-surface));
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.ui-input__field:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: var(--shadow-input-focus);
}

.ui-input__field:disabled {
  background: rgb(var(--v-theme-surface-variant));
  opacity: var(--v-disabled-opacity);
  cursor: not-allowed;
}

.ui-input__field::placeholder {
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
}

.ui-input--error .ui-input__field {
  border-color: rgb(var(--v-theme-error));
}

.ui-input--error .ui-input__field:focus {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-error), 0.2);
}

.ui-input__error {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}

.ui-input__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}
</style> 