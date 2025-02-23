<template>
  <label 
    class="ui-radio" 
    :class="{
      'ui-radio--error': error,
      'ui-radio--disabled': disabled
    }"
  >
    <input
      type="radio"
      class="ui-radio__input"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="$emit('update:modelValue', value)"
    >
    
    <div class="ui-radio__box">
      <div 
        v-show="modelValue === value"
        class="ui-radio__check"
      ></div>
    </div>
    
    <div class="ui-radio__content">
      <div class="ui-radio__label">
        {{ label }}
        <span v-if="required" class="ui-radio__required">*</span>
      </div>
      <span v-if="error" class="ui-radio__error">{{ error }}</span>
      <span v-else-if="hint" class="ui-radio__hint">{{ hint }}</span>
    </div>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  name: {
    type: String,
    required: true
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
.ui-radio {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
}

.ui-radio--disabled {
  opacity: var(--v-disabled-opacity);
  cursor: not-allowed;
}

.ui-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ui-radio__box {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 50%;
  background-color: rgb(var(--v-theme-surface));
  transition: all var(--transition-base);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.ui-radio__input:checked + .ui-radio__box {
  border-color: rgb(var(--v-theme-primary));
}

.ui-radio__input:focus + .ui-radio__box {
  box-shadow: var(--shadow-input-focus);
}

.ui-radio--error .ui-radio__box {
  border-color: rgb(var(--v-theme-error));
}

.ui-radio--error .ui-radio__input:checked + .ui-radio__box {
  border-color: rgb(var(--v-theme-error));
}

.ui-radio--error .ui-radio__input:focus + .ui-radio__box {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-error), 0.2);
}

.ui-radio:hover:not(.ui-radio--disabled) .ui-radio__box {
  border-color: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
}

.ui-radio:hover:not(.ui-radio--disabled) .ui-radio__input:checked + .ui-radio__box {
  border-color: rgb(var(--v-theme-primary-darken-1));
}

.ui-radio__check {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.625rem;
  height: 0.625rem;
  transition: all var(--transition-base);
  transform: translate(-50%, -50%);
  background-color: rgb(var(--v-theme-primary));
  border-radius: 50%;
}

.ui-radio--error .ui-radio__check {
  background-color: rgb(var(--v-theme-error));
}

.ui-radio__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.ui-radio__label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  line-height: 1.25rem;
}

.ui-radio__required {
  color: rgb(var(--v-theme-error));
  margin-left: 0.25rem;
}

.ui-radio__error {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}

.ui-radio__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}
</style> 