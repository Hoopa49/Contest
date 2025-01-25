<template>
  <div class="sidebar-wrapper">
    <!-- Затемнение фона -->
    <div
      v-if="modelValue"
      class="sidebar-overlay"
      :class="{ 'is-visible': modelValue }"
      @click="handleOverlayClick"
    ></div>

    <!-- Основной контент сайдбара -->
    <aside
      class="sidebar"
      :class="[
        `position-${position}`,
        { 'is-visible': modelValue }
      ]"
      :style="{ width: computedWidth }"
    >
      <!-- Заголовок -->
      <div class="sidebar-header">
        <div class="d-flex align-center">
          <slot name="header">
            <h3 class="text-h6">{{ title }}</h3>
          </slot>
        </div>
        
        <v-btn
          v-if="!persistent"
          icon="mdi-close"
          variant="text"
          size="small"
          @click="close"
        ></v-btn>
      </div>

      <!-- Основной контент -->
      <div class="sidebar-content">
        <slot></slot>
      </div>

      <!-- Нижняя часть -->
      <div v-if="$slots.footer" class="sidebar-footer">
        <slot name="footer"></slot>
      </div>
    </aside>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Sidebar',

  props: {
    // v-model для управления видимостью
    modelValue: {
      type: Boolean,
      default: false
    },
    // Заголовок сайдбара
    title: {
      type: String,
      default: ''
    },
    // Ширина сайдбара
    width: {
      type: [Number, String],
      default: 300
    },
    // Позиция (left/right)
    position: {
      type: String,
      default: 'right',
      validator: (value) => ['left', 'right'].includes(value)
    },
    // Нельзя закрыть кликом по оверлею
    persistent: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'close'],

  setup(props, { emit }) {
    // Преобразование ширины в CSS значение
    const computedWidth = computed(() => {
      return typeof props.width === 'number' ? `${props.width}px` : props.width
    })

    // Обработка клика по оверлею
    const handleOverlayClick = () => {
      if (!props.persistent) {
        close()
      }
    }

    // Закрытие сайдбара
    const close = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    return {
      computedWidth,
      handleOverlayClick,
      close
    }
  }
}
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  z-index: 1000;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(var(--v-theme-on-surface));
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.sidebar-overlay.is-visible {
  opacity: 0.5;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 0 20px rgba(var(--v-theme-on-surface), 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.sidebar.position-left {
  left: 0;
  transform: translateX(-100%);
}

.sidebar.position-right {
  right: 0;
  transform: translateX(100%);
}

.sidebar.is-visible {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Стили для скроллбара */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.3);
}
</style> 
