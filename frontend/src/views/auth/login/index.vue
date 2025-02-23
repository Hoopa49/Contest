<!--
  Страница входа
  Объединяет компоненты баннера и формы входа
-->
<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Левая часть (40%) -->
      <AuthBanner :is-register="false" />

      <!-- Правая часть (60%) -->
      <div class="auth-form-container">
        <div class="auth-form-wrapper">
          <font-awesome-icon
            :icon="isDarkTheme ? faMoon : faSun"
            class="theme-toggle"
            @click="toggleTheme"
            :title="isDarkTheme ? 'Включить светлую тему' : 'Включить темную тему'"
          />
          
          <!-- Переключатель -->
          <div class="auth-switcher">
            <button 
              class="primary"
              @click="$router.push('/auth/login')"
            >
              Вход
            </button>
            <button 
              class="secondary"
              @click="$router.push('/auth/register')"
            >
              Регистрация
            </button>
          </div>

          <!-- Форма входа -->
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import AuthBanner from '../components/AuthBanner.vue'
import LoginForm from './components/LoginForm.vue'

const uiStore = useUiStore()
const isDarkTheme = computed(() => uiStore.isDarkTheme)
const toggleTheme = () => uiStore.toggleTheme()
</script>

<style lang="scss">
@use '@/styles/components/auth';
</style>