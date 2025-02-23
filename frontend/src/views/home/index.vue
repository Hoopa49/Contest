/**
 * Главная страница приложения
 * Отображает основные возможности и навигацию по сервису
 */
<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 mb-6">Добро пожаловать!</h1>
        <p class="text-body-1">
          Наш сервис поможет вам найти интересные конкурсы и розыгрыши на YouTube.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Поиск конкурсов</v-card-title>
          <v-card-text>
            Используйте умный поиск для нахождения актуальных конкурсов
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" to="/contests">Начать поиск</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Отслеживание</v-card-title>
          <v-card-text>
            Следите за обновлениями и не пропускайте новые конкурсы
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" to="/tracking">Отслеживать</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Личный кабинет</v-card-title>
          <v-card-text>
            Управляйте своими подписками и настройками
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" to="/profile">Перейти</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineOptions({
  name: 'HomeView'
})
</script> 