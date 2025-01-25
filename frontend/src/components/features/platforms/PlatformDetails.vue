<template>
  <v-container>
    <v-row>
      <!-- Основная информация -->
      <v-col cols="12" md="8">
        <v-card>
          <v-img
            :src="platform.banner"
            height="200"
            cover
            class="platform-banner"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-title class="d-flex align-center">
            <v-avatar size="64" class="mr-4">
              <v-img :src="platform.logo" :alt="platform.name"></v-img>
            </v-avatar>
            <div>
              <div class="text-h5">{{ platform.name }}</div>
              <div class="text-subtitle-1 text-grey">{{ platform.category }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip
              :color="platform.isConnected ? 'success' : 'grey'"
              class="ml-2"
            >
              {{ platform.isConnected ? 'Подключено' : 'Не подключено' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-rating
                v-model="platform.rating"
                readonly
                half-increments
              ></v-rating>
              <span class="text-body-2 ml-2">
                ({{ platform.reviewsCount }} отзывов)
              </span>
            </div>

            <v-row class="mb-4">
              <v-col cols="4">
                <div class="text-h6">{{ formatNumber(platform.contestsCount) }}</div>
                <div class="text-caption">Конкурсов</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h6">{{ formatNumber(platform.usersCount) }}</div>
                <div class="text-caption">Участников</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h6">{{ platform.successRate }}%</div>
                <div class="text-caption">Успешных конкурсов</div>
              </v-col>
            </v-row>

            <div class="text-body-1 mb-4">
              {{ platform.description }}
            </div>

            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  Возможности платформы
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <v-list-item
                      v-for="(feature, index) in platform.features"
                      :key="index"
                      :title="feature.title"
                      :subtitle="feature.description"
                    >
                      <template v-slot:prepend>
                        <v-icon :color="feature.available ? 'success' : 'grey'">
                          {{ feature.available ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  Требования к конкурсам
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <v-list-item
                      v-for="(requirement, index) in platform.requirements"
                      :key="index"
                      :title="requirement"
                      prepend-icon="mdi-information"
                    ></v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              :color="platform.isConnected ? 'error' : 'primary'"
              @click="toggleConnection"
              :loading="connecting"
            >
              {{ platform.isConnected ? 'Отключить' : 'Подключить' }}
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              :href="platform.docsUrl"
              target="_blank"
              prepend-icon="mdi-book-open-variant"
            >
              Документация
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              icon
              @click="showReviewDialog = true"
            >
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Статистика -->
        <v-card class="mt-4">
          <v-card-title>
            Статистика использования
            <v-spacer></v-spacer>
            <v-select
              v-model="statsFilter"
              :items="statsFilters"
              density="compact"
              hide-details
            ></v-select>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <canvas ref="statsChart"></canvas>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Отзывы -->
        <contest-reviews
          :entity-id="platform.id"
          entity-type="platform"
          v-model:rating="platform.rating"
          v-model:reviews-count="platform.reviewsCount"
          class="mt-4"
        />
      </v-col>

      <!-- Боковая панель -->
      <v-col cols="12" md="4">
        <!-- Активные конкурсы -->
        <v-card class="mb-4">
          <v-card-title>
            Активные конкурсы
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              :to="{ name: 'contest-create', query: { platform: platform.id }}"
            >
              Создать
            </v-btn>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="contest in activeContests"
              :key="contest.id"
              :to="{ name: 'contest-details', params: { id: contest.id }}"
            >
              <template v-slot:prepend>
                <v-avatar size="40">
                  <v-img
                    :src="contest.image"
                    :alt="contest.title"
                  ></v-img>
                </v-avatar>
              </template>

              <v-list-item-title>{{ contest.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(contest.endDate) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Интеграции -->
        <v-card>
          <v-card-title>Интеграции</v-card-title>
          <v-list>
            <v-list-item
              v-for="integration in platform.integrations"
              :key="integration.id"
            >
              <template v-slot:prepend>
                <v-icon :color="integration.connected ? 'success' : 'grey'">
                  {{ integration.icon }}
                </v-icon>
              </template>

              <v-list-item-title>{{ integration.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ integration.connected ? 'Подключено' : 'Не подключено' }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  :color="integration.connected ? 'error' : 'primary'"
                  variant="text"
                  @click="toggleIntegration(integration)"
                >
                  {{ integration.connected ? 'Отключить' : 'Подключить' }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог добавления отзыва -->
    <v-dialog v-model="showReviewDialog" max-width="500">
      <v-card>
        <v-card-title>
          Добавить отзыв
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showReviewDialog = false"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="reviewForm" v-model="reviewValid">
            <v-rating
              v-model="newReview.rating"
              color="warning"
              hover
              class="mb-4"
            ></v-rating>

            <v-textarea
              v-model="newReview.text"
              label="Ваш отзыв"
              :rules="[v => !!v || 'Обязательное поле']"
              rows="4"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showReviewDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="submitReview"
            :loading="submittingReview"
            :disabled="!reviewValid"
          >
            Отправить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlatformStore } from '@/stores/platform'
import Chart from 'chart.js/auto'
import ContestReviews from '@/components/features/contests/details/social/reviews/ContestReviews.vue'

export default {
  name: 'PlatformDetails',
  components: {
    ContestReviews
  },
  
  setup() {
    const route = useRoute()
    const router = useRouter()
    const platformStore = usePlatformStore()
    
    const statsChart = ref(null)
    const chartInstance = ref(null)
    const reviewForm = ref(null)
    const reviewValid = ref(false)
    const connecting = ref(false)
    const showReviewDialog = ref(false)
    const submittingReview = ref(false)

    const platform = ref({
      name: '',
      category: '',
      description: '',
      logo: '',
      banner: '',
      rating: 0,
      reviewsCount: 0,
      contestsCount: 0,
      usersCount: 0,
      successRate: 0,
      isConnected: false,
      features: [],
      requirements: [],
      reviews: [],
      integrations: []
    })

    const activeContests = ref([])

    const statsFilter = ref('month')
    const statsFilters = [
      { title: 'За неделю', value: 'week' },
      { title: 'За месяц', value: 'month' },
      { title: 'За год', value: 'year' }
    ]

    const newReview = reactive({
      rating: 0,
      text: ''
    })

    const ratingDistribution = computed(() => {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      if (!platform.value?.reviews) return distribution
      platform.value.reviews.forEach(review => {
        distribution[review.rating]++
      })
      return distribution
    })

    const canAddReview = computed(() => {
      if (!authStore.isAuthenticated) return false
      return !platform.value?.reviews?.some(review => review.author.id === authStore.currentUser?.id)
    })

    const isCurrentUserReview = (review) => {
      return review.author.id === authStore.currentUser?.id
    }

    const toggleReviewLike = async (review) => {
      try {
        const response = await platformStore.toggleReviewLike(platform.value.id, review.id)
        if (response.success) {
          review.isLiked = !review.isLiked
          review.likesCount += review.isLiked ? 1 : -1
        }
      } catch (error) {
        console.error('Failed to toggle review like:', error)
      }
    }

    const editReview = (review) => {
      newReview.rating = review.rating
      newReview.text = review.text
      newReview.id = review.id
      showReviewDialog.value = true
    }

    const deleteReview = async (reviewId) => {
      try {
        const response = await platformStore.deleteReview(platform.value.id, reviewId)
        if (response.success) {
          platform.value.reviews = platform.value.reviews.filter(r => r.id !== reviewId)
          platform.value.reviewsCount--
          // Пересчитываем средний рейтинг
          if (platform.value.reviews.length) {
            const sum = platform.value.reviews.reduce((acc, r) => acc + r.rating, 0)
            platform.value.rating = (sum / platform.value.reviews.length).toFixed(1)
          } else {
            platform.value.rating = 0
          }
        }
      } catch (error) {
        console.error('Failed to delete review:', error)
      }
    }

    // Методы
    const loadPlatform = async () => {
      try {
        const data = await platformStore.getPlatform(route.params.id)
        platform.value = data
      } catch (error) {
        console.error('Failed to load platform:', error)
        router.push({ name: 'platforms' })
      }
    }

    const loadActiveContests = async () => {
      try {
        activeContests.value = await platformStore.getPlatformContests(route.params.id, {
          status: 'active'
        })
      } catch (error) {
        console.error('Failed to load active contests:', error)
      }
    }

    const toggleConnection = async () => {
      connecting.value = true
      try {
        if (platform.value.isConnected) {
          await platformStore.disconnectPlatform(platform.value.id)
        } else {
          await platformStore.connectPlatform(platform.value.id)
        }
        platform.value.isConnected = !platform.value.isConnected
      } catch (error) {
        console.error('Failed to toggle connection:', error)
      } finally {
        connecting.value = false
      }
    }

    const toggleIntegration = async (integration) => {
      try {
        if (integration.connected) {
          await platformStore.disconnectIntegration(platform.value.id, integration.id)
        } else {
          await platformStore.connectIntegration(platform.value.id, integration.id)
        }
        integration.connected = !integration.connected
      } catch (error) {
        console.error('Failed to toggle integration:', error)
      }
    }

    const submitReview = async () => {
      if (!reviewValid.value) return

      submittingReview.value = true
      try {
        const review = await platformStore.addReview(platform.value.id, newReview)
        platform.value.reviews.unshift(review)
        platform.value.rating = (platform.value.rating * platform.value.reviewsCount + review.rating) / (platform.value.reviewsCount + 1)
        platform.value.reviewsCount++
        showReviewDialog.value = false
        newReview.rating = 0
        newReview.text = ''
      } catch (error) {
        console.error('Failed to submit review:', error)
      } finally {
        submittingReview.value = false
      }
    }

    const updateChart = async () => {
      try {
        const stats = await platformStore.getPlatformStats(platform.value.id, statsFilter.value)
        
        if (chartInstance.value) {
          chartInstance.value.destroy()
        }

        chartInstance.value = new Chart(statsChart.value, {
          type: 'line',
          data: {
            labels: stats.labels,
            datasets: [
              {
                label: 'Конкурсы',
                data: stats.contests,
                borderColor: '#1976D2',
                tension: 0.1
              },
              {
                label: 'Участники',
                data: stats.participants,
                borderColor: '#4CAF50',
                tension: 0.1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        })
      } catch (error) {
        console.error('Failed to load statistics:', error)
      }
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat().format(num)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    // Наблюдатели
    watch(statsFilter, () => {
      updateChart()
    })

    // Жизненный цикл
    onMounted(() => {
      loadPlatform()
      loadActiveContests()
      nextTick(() => {
        updateChart()
      })
    })

    onUnmounted(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
    })

    return {
      platform,
      activeContests,
      statsChart,
      statsFilter,
      statsFilters,
      reviewForm,
      reviewValid,
      connecting,
      showReviewDialog,
      submittingReview,
      newReview,
      ratingDistribution,
      canAddReview,
      isCurrentUserReview,
      toggleConnection,
      toggleIntegration,
      submitReview,
      toggleReviewLike,
      editReview,
      deleteReview,
      formatNumber,
      formatDate
    }
  }
}
</script>

<style scoped>
.platform-banner {
  position: relative;
}

.platform-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.5));
}

.v-rating {
  display: inline-flex;
}

.v-list-item {
  border-radius: 8px;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.v-rating .v-icon {
  padding: 0;
}
</style> 