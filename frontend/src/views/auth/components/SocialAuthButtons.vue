<!--
  Компонент кнопок для входа через социальные сети
-->
<template>
  <div class="social-buttons">
    <button
      v-for="provider in providers"
      :key="provider.name"
      class="social-button"
      :class="provider.name"
      @click="$emit('auth', provider.name)"
      :title="`Войти через ${provider.title}`"
    >
      <font-awesome-icon :icon="provider.icon" />
    </button>
  </div>
</template>

<script setup>
import { faGoogle, faVk, faTelegram } from '@fortawesome/free-brands-svg-icons'

const providers = [
  { name: 'google', title: 'Google', icon: faGoogle },
  { name: 'vk', title: 'VKontakte', icon: faVk },
  { name: 'telegram', title: 'Telegram', icon: faTelegram }
]

defineEmits(['auth'])
</script>

<style lang="scss">
@use '@/styles/components/social-auth-buttons';
</style> 