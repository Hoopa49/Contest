<!--
  Корневой компонент приложения
  Определяет основную структуру и layout
  Управляет инициализацией авторизации и состоянием приложения
-->
<template>
  <div class="app-layout">
    <!-- Хедер -->
    <AppHeader class="app-layout__header" />
    
    <!-- Основной контейнер -->
    <div class="app-layout__container">
      <!-- Навигация -->
      <AppNavigation class="app-layout__navigation" />
      
      <!-- Контент -->
      <main class="app-layout__content">
        <slot></slot>
      </main>
    </div>

    <!-- Футер временно отключен
    <AppFooter class="app-layout__footer" />
    -->
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppNavigation from './AppNavigation.vue'
// import AppFooter from './AppFooter.vue' // Временно отключен
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}

.app-layout__header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  width: 100%;
}

.app-layout__container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.app-layout__navigation {
  position: sticky;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  width: var(--sidebar-width);
  flex-shrink: 0;
  overflow-y: auto;
}

.app-layout__content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  min-height: calc(100vh - var(--navbar-height) - var(--spacing-lg) * 2);
}

.app-layout__footer {
  position: relative;
  z-index: var(--z-footer);
  width: 100%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .app-layout__container {
    flex-direction: column;
  }

  .app-layout__navigation {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    width: 100%;
    height: auto;
    z-index: calc(var(--z-header) - 1);
    background-color: rgb(var(--v-theme-surface));
    box-shadow: var(--shadow-md);
  }

  .app-layout__content {
    padding: var(--spacing-base);
    margin-top: var(--navbar-height);
  }
}
</style> 