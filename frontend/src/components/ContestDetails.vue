<template>
  <v-card class="contest-details pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      Информация о конкурсе
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Основная информация -->
        <v-col cols="12">
          <v-card outlined>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <h3 class="text-h6">{{ contest.title }}</h3>
                  <div class="subtitle-1 mb-2">
                    <v-icon small>mdi-account</v-icon>
                    {{ contest.author }}
                  </div>
                  <div class="mb-2">
                    <v-icon small>mdi-calendar</v-icon>
                    {{ formatDate(contest.publishedAt) }}
                  </div>
                </v-col>
                <v-col cols="12" md="4" class="text-right">
                  <v-btn
                    color="primary"
                    :href="contest.link"
                    target="_blank"
                    small
                  >
                    Открыть на YouTube
                    <v-icon small class="ml-1">mdi-open-in-new</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Метрики анализа -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Метрики анализа</v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Релевантность заголовка</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :value="contest.analysis.titleScore * 100"
                        height="20"
                        color="primary"
                      >
                        <template v-slot:default>
                          {{ Math.round(contest.analysis.titleScore * 100) }}%
                        </template>
                      </v-progress-linear>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Релевантность описания</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :value="contest.analysis.descriptionScore * 100"
                        height="20"
                        color="primary"
                      >
                        <template v-slot:default>
                          {{ Math.round(contest.analysis.descriptionScore * 100) }}%
                        </template>
                      </v-progress-linear>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Релевантность тегов</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :value="contest.analysis.tagsScore * 100"
                        height="20"
                        color="primary"
                      >
                        <template v-slot:default>
                          {{ Math.round(contest.analysis.tagsScore * 100) }}%
                        </template>
                      </v-progress-linear>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Статистика видео -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Статистика видео</v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Просмотры</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatNumber(contest.statistics.viewCount) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Лайки</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatNumber(contest.statistics.likeCount) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Комментарии</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatNumber(contest.statistics.commentCount) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContestDetails',

  props: {
    contest: {
      type: Object,
      required: true
    }
  },

  setup() {
    const formatDate = (date) => {
      return new Date(date).toLocaleString('ru-RU');
    };

    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    };

    return {
      formatDate,
      formatNumber
    };
  }
});
</script> 