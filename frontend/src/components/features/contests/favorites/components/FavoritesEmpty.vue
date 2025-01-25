<!-- 
  FavoritesEmpty.vue
  Компонент для отображения пустого состояния избранных конкурсов.
  Показывает сообщение и кнопку для перехода к списку конкурсов.
-->
<template>
  <div class="favorites-empty">
    <v-card
      class="pa-6 text-center"
      variant="outlined"
    >
      <!-- Иконка -->
      <v-icon
        icon="mdi-heart-outline"
        size="64"
        color="grey-lighten-1"
        class="mb-4"
      />

      <!-- Заголовок -->
      <h3 class="text-h6 mb-2">
        У вас пока нет избранных конкурсов
      </h3>

      <!-- Описание -->
      <p class="text-body-1 text-medium-emphasis mb-6">
        Добавляйте интересные конкурсы в избранное, чтобы следить за ними и не пропустить важные обновления
      </p>

      <!-- Кнопка -->
      <v-btn
        color="primary"
        prepend-icon="mdi-trophy-outline"
        @click="$emit('browse')"
      >
        Посмотреть конкурсы
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
// Определяем события
defineEmits(['browse'])
</script>

<style scoped>
.favorites-empty {
  max-width: 600px;
  margin: 0 auto;
}

/* Анимации */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style> 