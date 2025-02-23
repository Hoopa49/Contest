<!-- 
  ContestShare.vue
  Компонент для шеринга конкурса в социальных сетях.
  Позволяет пользователям делиться конкурсом в различных социальных сетях,
  копировать ссылку на конкурс и отслеживать статистику шеринга.
-->
<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    transition="dialog-bottom-transition"
    :overlay-opacity="currentTheme === 'dark' ? 0.85 : 0.5"
    :overlay-color="currentTheme === 'dark' ? '#000000' : '#424242'"
    :theme="currentTheme"
  >
    <v-card class="share-card pa-4" :loading="isLoading">
      <v-card-title class="text-h6 mb-2 d-flex align-center">
        <v-icon icon="mdi-share-variant" class="mr-2" />
        Поделиться конкурсом
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <!-- Ссылка для копирования -->
      <v-text-field
        v-model="shareUrl"
        readonly
        label="Ссылка на конкурс"
        :append-inner-icon="copyIcon"
        @click:append-inner="copyToClipboard"
        :messages="copyMessage"
        :error="!!error"
        class="mb-6"
        hide-details="auto"
        variant="outlined"
      />

      <!-- Кнопки социальных сетей -->
      <v-card-text class="d-flex justify-center flex-wrap gap-6 py-2">
        <div v-for="network in socialNetworks" :key="network.name" class="share-network-container">
          <div class="share-button-wrapper">
            <v-btn
              :color="network.color"
              variant="tonal"
              icon
              @click="handleShare(network)"
              class="share-btn"
              :disabled="isLoading"
              :elevation="0"
              size="large"
            >
              <component 
                :is="network.icon"
                style="width: 24px; height: 24px;"
              />
            </v-btn>
            <div v-if="network.shareCount > 0" 
                 class="share-count" 
                 :class="[
                   { 'large-number': network.shareCount > 9999 },
                   `share-count--${network.name.toLowerCase()}`
                 ]"
            >
              {{ formatShareCount(network.shareCount) }}
            </div>
          </div>
          <div class="network-name">{{ network.name }}</div>
        </div>
      </v-card-text>

      <!-- Снэкбар для уведомлений -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="3000"
        location="top"
      >
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="showSnackbar = false"
          >
            Закрыть
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { markRaw } from 'vue'
import TwitterIcon from '@/components/ui/icons/TwitterIcon.vue'
import FacebookIcon from '@/components/ui/icons/FacebookIcon.vue'
import WhatsAppIcon from '@/components/ui/icons/WhatsAppIcon.vue'
import InstagramIcon from '@/components/ui/icons/InstagramIcon.vue'
import VkIcon from '@/components/ui/icons/VkIcon.vue'
import TelegramIcon from '@/components/ui/icons/TelegramIcon.vue'
import api from '@/services/api.service'

// Функция для получения счетчиков из localStorage
const getStoredShareCounts = (contestId) => {
  try {
    const stored = localStorage.getItem(`shareCount_${contestId}`)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Функция для сохранения счетчиков в localStorage
const saveShareCounts = (contestId, counts) => {
  try {
    localStorage.setItem(`shareCount_${contestId}`, JSON.stringify(counts))
  } catch (error) {
    console.error('Ошибка при сохранении счетчиков:', error)
  }
}

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  contestId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  }
})

// Эмиты событий
const emit = defineEmits(['update:modelValue', 'share'])

// Состояние компонента
const route = useRoute()
const theme = useTheme()
const currentTheme = computed(() => theme.global.current.value.name)
const isLoading = ref(false)
const error = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const copyMessage = ref('')
const copyIcon = computed(() => copyMessage.value ? 'mdi-check' : 'mdi-content-copy')
const shareStats = ref({
  'VK': 0,
  'Telegram': 0,
  'WhatsApp': 0,
  'Instagram': 0,
  'X': 0,
  'Facebook': 0
})

// Загрузка статистики при открытии диалога
watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.contestId) {
    try {
      isLoading.value = true
      console.log('Загрузка статистики для конкурса:', props.contestId)
      
      const response = await api.get(`/api/contests/${props.contestId}/share-stats`)
      console.log('Ответ от сервера:', response)
      
      // Проверяем наличие данных и обновляем статистику
      if (typeof response === 'object') {
        Object.keys(shareStats.value).forEach(network => {
          // Проверяем существование значения и конвертируем в число
          const count = response[network]
          shareStats.value[network] = typeof count === 'number' ? count : 0
        })
        console.log('Обновленная статистика:', shareStats.value)
      } else {
        console.error('Получены некорректные данные:', response)
        throw new Error('Некорректный формат данных')
      }
    } catch (err) {
      console.error('Ошибка при загрузке статистики шеринга:', err)
      // Сбрасываем все счетчики в 0 при ошибке
      Object.keys(shareStats.value).forEach(network => {
        shareStats.value[network] = 0
      })
      showNotification('Не удалось загрузить статистику шеринга', 'error')
    } finally {
      isLoading.value = false
    }
  }
})

// URL для шеринга
const shareUrl = computed(() => {
  if (!props.contestId) return window.location.href
  
  const baseUrl = `${window.location.origin}/contests/${props.contestId}`
  const params = new URLSearchParams()
  if (props.title) params.append('title', props.title)
  if (props.description) params.append('description', props.description)
  if (props.image) params.append('image', props.image)
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
})

// Список социальных сетей с адаптивными цветами
const socialNetworks = computed(() => [
  { 
    name: 'VK',
    icon: markRaw(VkIcon),
    color: 'primary',
    shareCount: shareStats.value['VK'],
    url: (url) => `https://vk.com/share.php?url=${url}`
  },
  {
    name: 'Telegram',
    icon: markRaw(TelegramIcon),
    color: 'info',
    shareCount: shareStats.value['Telegram'],
    url: (url) => `https://t.me/share/url?url=${url}&text=${encodeURIComponent(props.title)}`
  },
  {
    name: 'WhatsApp',
    icon: markRaw(WhatsAppIcon),
    color: 'success',
    shareCount: shareStats.value['WhatsApp'],
    url: (url) => `https://api.whatsapp.com/send?text=${encodeURIComponent(props.title + '\n' + url)}`
  },
  {
    name: 'Instagram',
    icon: markRaw(InstagramIcon),
    color: 'purple',
    shareCount: shareStats.value['Instagram'],
    url: (url) => `https://www.instagram.com/share?url=${encodeURIComponent(url)}&caption=${encodeURIComponent(props.title)}`
  },
  {
    name: 'X',
    icon: markRaw(TwitterIcon),
    color: theme.global.current.value.dark ? 'grey-lighten-3' : 'grey-darken-3',
    shareCount: shareStats.value['X'],
    url: (url) => `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(props.title)}`
  },
  {
    name: 'Facebook',
    icon: markRaw(FacebookIcon),
    color: '#1877F2',
    shareCount: shareStats.value['Facebook'],
    url: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`
  }
])

// Закрытие диалога
const close = () => {
  emit('update:modelValue', false)
}

// Копирование в буфер обмена
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copyMessage.value = 'Ссылка скопирована!'
    showNotification('Ссылка успешно скопирована!', 'success')
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    error.value = 'Не удалось скопировать ссылку'
    showNotification('Не удалось скопировать ссылку', 'error')
  }
}

// Обработчик шеринга
const handleShare = async (network) => {
  try {
    // Отправляем запрос на увеличение счетчика
    const response = await api.post(`/api/contests/${props.contestId}/share-stats`, {
      network: network.name
    })
    
    console.log('Ответ после шеринга:', response)
    
    // Обновляем локальный счетчик
    if (response && typeof response === 'object') {
      const { network: updatedNetwork, share_count } = response
      if (typeof share_count === 'number') {
        shareStats.value[updatedNetwork] = share_count
        console.log('Обновлен счетчик для', updatedNetwork, ':', share_count)
      }
    }

    // Обновляем все счетчики с сервера
    const statsResponse = await api.get(`/api/contests/${props.contestId}/share-stats`)
    console.log('Ответ с обновленной статистикой:', statsResponse)
    
    if (typeof statsResponse === 'object') {
      Object.keys(shareStats.value).forEach(networkName => {
        shareStats.value[networkName] = statsResponse[networkName] || 0
      })
      console.log('Обновлена общая статистика:', shareStats.value)
    }

    // Открываем окно шеринга
    const shareWindow = window.open(network.url(shareUrl.value), '_blank', 'width=600,height=400')
    if (shareWindow) {
      shareWindow.focus()
    }

    // Вызываем событие share
    emit('share', { network: network.name })
  } catch (error) {
    console.error('Ошибка при шеринге:', error)
    showNotification('Не удалось поделиться', 'error')
  }
}

// Показ уведомлений
const showNotification = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}

// Улучшенное форматирование числа шеринга
const formatShareCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 10000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
</script>

<style scoped>
.share-card {
  transition: all 0.3s ease;
  border-radius: 16px;
}

.share-network-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.share-button-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-count {
  position: absolute;
  top: -8px;
  right: -12px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  color: white;
  transition: all 0.3s ease;
  min-width: 24px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.12);
}

.share-count--vk {
  background: rgb(var(--v-theme-primary));
}

.share-count--telegram {
  background: rgb(var(--v-theme-info));
}

.share-count--whatsapp {
  background: rgb(var(--v-theme-success));
}

.share-count--instagram {
  background: #E4405F;
}

.share-count--x {
  background: rgb(var(--v-theme-grey-lighten-3));
  color: rgb(var(--v-theme-on-surface));
}

.share-count--facebook {
  background: rgb(var(--v-theme-primary));
}

.share-count.large-number {
  right: -20px;
  height: 22px;
  padding: 0 8px;
  min-width: 42px;
  font-size: 11px;
}

.share-count:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(var(--v-theme-on-surface), 0.16);
}

.share-btn {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  transition: all 0.2s ease;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.share-btn:hover + .share-count {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(var(--v-theme-on-surface), 0.16);
}

.network-name {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.9;
  font-weight: 500;
  margin-top: 4px;
  transition: opacity 0.2s ease;
}

.share-network-container:hover .network-name {
  opacity: 1;
}

/* Анимация для иконки копирования */
.v-icon {
  transition: transform 0.2s ease;
}

.v-text-field:hover .v-icon {
  transform: scale(1.1);
}

/* Адаптивная верстка */
@media (width <= 600px) {
  .share-network-container {
    min-width: 70px;
  }
  
  .share-btn {
    width: 40px;
    height: 40px;
  }
}
</style> 