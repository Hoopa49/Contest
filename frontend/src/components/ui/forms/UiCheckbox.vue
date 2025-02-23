<template>
  <label 
    class="ui-checkbox" 
    :class="{
      'ui-checkbox--error': error,
      'ui-checkbox--disabled': disabled
    }"
  >
    <input
      type="checkbox"
      class="ui-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    
    <div class="ui-checkbox__box">
      <svg 
        v-show="modelValue"
        class="ui-checkbox__check"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fill-rule="evenodd" 
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
          clip-rule="evenodd"
        />
      </svg>
    </div>
    
    <div class="ui-checkbox__content">
      <div class="ui-checkbox__label">
        {{ label }}
        <span v-if="required" class="ui-checkbox__required">*</span>
      </div>
      <span v-if="error" class="ui-checkbox__error">{{ error }}</span>
      <span v-else-if="hint" class="ui-checkbox__hint">{{ hint }}</span>
    </div>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
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

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
}

.ui-checkbox--disabled {
  opacity: var(--v-disabled-opacity);
  cursor: not-allowed;
}

.ui-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ui-checkbox__box {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 0.375rem;
  background-color: rgb(var(--v-theme-surface));
  transition: all var(--transition-base);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.ui-checkbox__input:checked + .ui-checkbox__box {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary));
}

.ui-checkbox__input:focus + .ui-checkbox__box {
  box-shadow: var(--shadow-input-focus);
}

.ui-checkbox--error .ui-checkbox__box {
  border-color: rgb(var(--v-theme-error));
}

.ui-checkbox--error .ui-checkbox__input:checked + .ui-checkbox__box {
  background-color: rgb(var(--v-theme-error));
  border-color: rgb(var(--v-theme-error));
}

.ui-checkbox--error .ui-checkbox__input:focus + .ui-checkbox__box {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-error), 0.2);
}

.ui-checkbox:hover:not(.ui-checkbox--disabled) .ui-checkbox__box {
  border-color: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
}

.ui-checkbox:hover:not(.ui-checkbox--disabled) .ui-checkbox__input:checked + .ui-checkbox__box {
  border-color: rgb(var(--v-theme-primary-darken-1));
  background-color: rgb(var(--v-theme-primary-darken-1));
}

.ui-checkbox__check {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  color: rgb(var(--v-theme-on-primary));
  transform: translate(-50%, -50%);
}

.ui-checkbox__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.ui-checkbox__label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  line-height: 1.25rem;
}

.ui-checkbox__required {
  color: rgb(var(--v-theme-error));
  margin-left: 0.25rem;
}

.ui-checkbox__error {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}

.ui-checkbox__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}
</style> 