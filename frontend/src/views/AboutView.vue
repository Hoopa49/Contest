<!-- 
  Компонент страницы О проекте
  Содержит информацию о проекте, его целях и возможностях
-->
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Заголовок -->
        <v-card class="mb-6">
          <v-card-text class="text-center">
            <h1 class="text-h3 mb-4">О нашем проекте</h1>
            <p class="text-subtitle-1">
              Платформа для проведения и участия в конкурсах различной направленности
            </p>
          </v-card-text>
        </v-card>

        <!-- Основная информация -->
        <v-card class="mb-6">
          <v-card-text>
            <h2 class="text-h5 mb-4">Наша миссия</h2>
            <p class="text-body-1 mb-4">
              Мы стремимся создать удобную и доступную платформу, которая поможет талантливым людям 
              проявить себя и найти новые возможности для развития. Наша цель - объединить участников 
              и организаторов конкурсов на одной площадке, сделав процесс проведения соревнований 
              максимально простым и эффективным.
            </p>
          </v-card-text>
        </v-card>

        <!-- Возможности -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card height="100%">
              <v-card-text>
                <h3 class="text-h6 mb-4">Для участников</h3>
                <v-list>
                  <v-list-item prepend-icon="mdi-check-circle" title="Удобный поиск конкурсов"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Простая регистрация"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Отслеживание прогресса"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Обратная связь от жюри"></v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card height="100%">
              <v-card-text>
                <h3 class="text-h6 mb-4">Для организаторов</h3>
                <v-list>
                  <v-list-item prepend-icon="mdi-check-circle" title="Создание конкурсов"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Управление участниками"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Система оценивания"></v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" title="Аналитика и отчеты"></v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Контакты -->
        <v-card class="mt-6">
          <v-card-text>
            <h2 class="text-h5 mb-4">Свяжитесь с нами</h2>
            <v-row>
              <v-col cols="12" md="4">
                <div class="d-flex align-center mb-4">
                  <v-icon size="24" class="mr-2">mdi-email</v-icon>
                  <span>support@contest-platform.com</span>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center mb-4">
                  <v-icon size="24" class="mr-2">mdi-phone</v-icon>
                  <span>+7 (999) 123-45-67</span>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center mb-4">
                  <v-icon size="24" class="mr-2">mdi-map-marker</v-icon>
                  <span>г. Москва, ул. Примерная, 123</span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AboutView'
}
</script> 