<!--
  UserAvatar.vue
  Универсальный компонент для отображения аватара пользователя
  с поддержкой fallback на инициалы или иконку
-->
<template>
  <v-avatar
    :size="size"
    :color="!src && initials ? backgroundColor : undefined"
    class="user-avatar"
  >
    <v-img
      v-if="src"
      :src="src"
      :alt="alt"
      :width="size"
      :height="size"
      @error="handleImageError"
    >
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    
    <span
      v-else-if="initials"
      class="text-subtitle-2 font-weight-medium"
      :style="{ fontSize: `${Math.floor(size * 0.4)}px` }"
    >
      {{ initials }}
    </span>
    
    <v-icon
      v-else
      :size="iconSize"
      color="grey"
    >
      mdi-account
    </v-icon>
  </v-avatar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCache } from '@/composables/useCache'

const props = defineProps({
  // URL изображения аватара
  src: {
    type: String,
    default: null
  },
  // Alt текст для изображения
  alt: {
    type: String,
    default: 'User avatar'
  },
  // Размер аватара
  size: {
    type: [Number, String],
    default: 40
  },
  // Имя пользователя для генерации инициалов
  name: {
    type: String,
    default: ''
  },
  // Цвет фона для инициалов
  color: {
    type: String,
    default: null
  }
})

// Кеширование URL аватаров
const { cache, addToCache } = useCache('avatars', 60 * 60 * 1000) // Кеш на 1 час
const imageError = ref(false)

// Размер иконки
const iconSize = computed(() => {
  const avatarSize = typeof props.size === 'number' ? props.size : parseInt(props.size)
  return Math.floor(avatarSize * 0.7)
})

// Генерация инициалов
const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

// Генерация цвета фона для инициалов
const backgroundColor = computed(() => {
  if (props.color) return props.color
  
  // Если цвет не указан, генерируем на основе имени
  if (!props.name) return 'grey'
  
  const colors = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error'
  ]
  
  const index = props.name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  
  return colors[index]
})

// Обработка ошибок загрузки изображения
const handleImageError = () => {
  console.warn(`Failed to load avatar image: ${props.src}`)
  imageError.value = true
  
  // Удаляем неработающий URL из кеша
  if (props.src) {
    cache.delete(props.src)
  }
}

// Добавляем успешно загруженный URL в кеш
if (props.src && !imageError.value) {
  addToCache(props.src)
}
</script>

<style scoped>
.user-avatar {
  transition: all var(--transition-base);
}
</style> 