/**
 * Компонент страницы 404
 * Отображается, когда запрошенная страница не найдена
 */
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <h1 class="text-h1 font-weight-bold primary--text mb-4">404</h1>
        <h2 class="text-h4 mb-4">Страница не найдена</h2>
        <p class="text-body-1 mb-8">Извините, запрошенная страница не существует или была удалена.</p>
        <v-btn
          color="primary"
          to="/"
          rounded
          elevation="2"
        >
          Вернуться на главную
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFound'
}
</script> 