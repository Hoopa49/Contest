<template>
  <v-chip
    :color="statusColor"
    :size="size"
    :class="{'text-caption': small}"
    class="status-chip"
  >
    <v-icon start size="small">{{ statusIcon }}</v-icon>
    {{ statusText }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'small'
  },
  small: {
    type: Boolean,
    default: false
  }
})

const statusColor = computed(() => {
  const colors = {
    active: 'success',
    completed: 'info',
    cancelled: 'error',
    draft: 'grey'
  }
  return colors[props.status] || 'grey'
})

const statusIcon = computed(() => {
  const icons = {
    active: 'mdi-play-circle',
    completed: 'mdi-check-circle',
    cancelled: 'mdi-close-circle',
    draft: 'mdi-file-outline'
  }
  return icons[props.status] || 'mdi-help-circle'
})

const statusText = computed(() => {
  const texts = {
    active: 'Активный',
    completed: 'Завершен',
    cancelled: 'Отменен',
    draft: 'Черновик'
  }
  return texts[props.status] || props.status
})
</script>

<style scoped>
.status-chip {
  min-width: 110px;
  justify-content: center;
}
</style>
