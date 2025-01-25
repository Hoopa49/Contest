/**
 * Компонент отображения конкурсов пользователя
 * Позволяет просматривать и управлять своими конкурсами
 */
<template>
  <v-card flat color="background">
    <v-card-text>
      <!-- Статистика -->
      <v-fade-transition>
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card variant="outlined" :loading="isLoading">
              <v-card-text>
                <div class="d-flex flex-wrap gap-4">
                  <div class="stat-item">
                    <div class="text-h5">{{ contestStore.getTotalContests }}</div>
                    <div class="text-caption">Всего конкурсов</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-h5 text-success">{{ contestStore.getWonContests }}</div>
                    <div class="text-caption">Побед</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-h5 text-warning">{{ contestStore.getActiveContests }}</div>
                    <div class="text-caption">Активных</div>
                  </div>
                  <v-divider vertical></v-divider>
                  <div class="stat-item">
                    <div class="text-h5">{{ contestStore.getTotalPrize }}</div>
                    <div class="text-caption">Общий выигрыш</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-fade-transition>

      <!-- Вкладки -->
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="mb-6"
      >
        <v-tab value="contests">
          <v-icon start>mdi-trophy-outline</v-icon>
          Мои конкурсы
        </v-tab>
        <v-tab value="history">
          <v-icon start>mdi-history</v-icon>
          История участия
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Вкладка "Мои конкурсы" -->
        <v-window-item value="contests">
          <!-- Заголовок и фильтры -->
          <div class="d-flex align-center mb-6 flex-wrap gap-4">
            <v-spacer></v-spacer>
            <div class="d-flex gap-4">
              <v-select
                v-model="filters.status"
                label="Статус"
                :items="statusItems"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
                @update:model-value="loadContests"
              ></v-select>
              <v-select
                v-model="filters.sortBy"
                label="Сортировка"
                :items="sortItems"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
                @update:model-value="loadContests"
              ></v-select>
            </div>
          </div>

          <!-- Индикатор загрузки -->
          <v-fade-transition>
            <div v-if="isLoading" class="d-flex justify-center py-12">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </v-fade-transition>

          <!-- Сообщение об ошибке -->
          <v-scale-transition>
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ error }}
            </v-alert>
          </v-scale-transition>

          <!-- Пустое состояние -->
          <v-scale-transition>
            <v-alert
              v-if="!isLoading && !contests.length"
              type="info"
              variant="tonal"
              class="mb-4"
              icon="mdi-information"
            >
              {{ getEmptyStateMessage }}
            </v-alert>
          </v-scale-transition>

          <!-- Список конкурсов -->
          <template v-if="!isLoading && contests.length">
            <div>
              <v-virtual-scroll
                :items="contests"
                :height="600"
                item-height="88"
                ref="scrollContainer"
              >
                <template v-slot:default="{ item: contest }">
                  <v-slide-x-transition>
                    <v-list-item
                      :key="contest.id"
                      :value="contest.id"
                      rounded="lg"
                      class="mb-2 contest-item"
                    >
                      <template v-slot:prepend>
                        <v-avatar size="40" class="mr-3">
                          <v-img 
                            :src="contest.image || '/contest-placeholder.png'" 
                            :alt="contest.title"
                            error-src="/contest-placeholder.png"
                            loading="lazy"
                            class="contest-image"
                          >
                            <template v-slot:placeholder>
                              <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                  color="grey-lighten-4"
                                  indeterminate
                                  size="20"
                                ></v-progress-circular>
                              </div>
                            </template>
                          </v-img>
                        </v-avatar>
                        <v-chip
                          :color="getStatusColor(contest.status)"
                          size="small"
                          class="font-weight-medium status-chip"
                          :class="getStatusClass(contest.status)"
                        >
                          <v-icon start size="14">{{ getStatusIcon(contest.status) }}</v-icon>
                          {{ getStatusText(contest.status) }}
                        </v-chip>
                      </template>

                      <v-list-item-title class="text-h6 mb-1 contest-title">
                        {{ contest.title }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        <span class="text-medium-emphasis">
                          <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                          {{ formatDate(contest.startDate) }} - {{ formatDate(contest.endDate) }}
                        </span>
                        <span class="mx-2">•</span>
                        <span class="text-medium-emphasis">
                          <v-icon size="14" class="mr-1">mdi-account-group</v-icon>
                          {{ contest.participantsCount }} участников
                        </span>
                        <template v-if="contest.platform">
                          <span class="mx-2">•</span>
                          <v-chip
                            :color="getPlatformColor(contest.platform)"
                            size="x-small"
                            label
                            class="platform-chip"
                          >
                            <v-icon start size="12">{{ getPlatformIcon(contest.platform) }}</v-icon>
                            {{ contest.platform }}
                          </v-chip>
                        </template>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex align-center gap-2">
                          <TransitionGroup name="fade-slide" tag="div" class="d-flex">
                            <div :key="`view-${contest.id}`" class="action-wrapper">
                              <v-tooltip text="Просмотреть">
                                <template v-slot:activator="{ props }">
                                  <v-btn
                                    v-bind="props"
                                    color="primary"
                                    variant="text"
                                    @click="viewContest(contest.id)"
                                    class="action-button"
                                  >
                                    <v-icon>mdi-eye</v-icon>
                                  </v-btn>
                                </template>
                              </v-tooltip>
                            </div>

                            <template v-if="contest.status === 'draft'">
                              <div :key="`edit-${contest.id}`" class="action-wrapper">
                                <v-tooltip text="Редактировать">
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      color="primary"
                                      variant="text"
                                      @click="editContest(contest.id)"
                                      class="action-button"
                                    >
                                      <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                              <div :key="`publish-${contest.id}`" class="action-wrapper">
                                <v-tooltip text="Опубликовать">
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      color="success"
                                      variant="text"
                                      @click="publishContest(contest.id)"
                                      class="action-button"
                                    >
                                      <v-icon>mdi-publish</v-icon>
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                            </template>

                            <template v-if="contest.status === 'active'">
                              <div :key="`cancel-${contest.id}`" class="action-wrapper">
                                <v-tooltip text="Отменить">
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      color="error"
                                      variant="text"
                                      @click="cancelContest(contest.id)"
                                      class="action-button"
                                    >
                                      <v-icon>mdi-cancel</v-icon>
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                              <div :key="`check-${contest.id}`" class="action-wrapper">
                                <v-tooltip text="Проверить условия">
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      color="success"
                                      variant="text"
                                      @click="checkConditions(contest.id)"
                                      class="action-button"
                                    >
                                      <v-icon>mdi-check-circle</v-icon>
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                            </template>
                          </TransitionGroup>
                        </div>
                      </template>
                    </v-list-item>
                  </v-slide-x-transition>
                </template>
              </v-virtual-scroll>

              <!-- Индикатор загрузки при прокрутке -->
              <v-fade-transition>
                <div v-if="isLoadingMore" class="text-center py-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                  ></v-progress-circular>
                </div>
              </v-fade-transition>
            </div>
          </template>
        </v-window-item>

        <!-- Вкладка "История участия" -->
        <v-window-item value="history">
          <!-- Фильтры для истории -->
          <div class="d-flex align-center mb-6 flex-wrap gap-4">
            <v-spacer></v-spacer>
            <div class="d-flex gap-4">
              <v-select
                v-model="historyFilters.status"
                label="Статус"
                :items="historyStatusItems"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
                @update:model-value="loadHistory"
              ></v-select>
              <v-select
                v-model="historyFilters.sortBy"
                label="Сортировка"
                :items="historySortItems"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
                @update:model-value="loadHistory"
              ></v-select>
            </div>
          </div>

          <!-- Список истории участия -->
          <template v-if="!isLoading && history.length">
            <div>
              <v-virtual-scroll
                :items="history"
                :height="600"
                item-height="88"
              >
                <template v-slot:default="{ item: entry }">
                  <v-slide-x-transition>
                    <v-list-item
                      :key="entry.id"
                      rounded="lg"
                      class="mb-2 history-item"
                    >
                      <template v-slot:prepend>
                        <v-avatar size="40" class="mr-3">
                          <v-img 
                            :src="entry.contest.image || '/contest-placeholder.png'" 
                            :alt="entry.contest.title"
                            error-src="/contest-placeholder.png"
                            loading="lazy"
                            class="contest-image"
                          >
                            <template v-slot:placeholder>
                              <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                  color="grey-lighten-4"
                                  indeterminate
                                  size="20"
                                ></v-progress-circular>
                              </div>
                            </template>
                          </v-img>
                        </v-avatar>
                        <v-chip
                          :color="getParticipationStatusColor(entry.status)"
                          size="small"
                          class="font-weight-medium status-chip"
                        >
                          <v-icon start size="14">{{ getParticipationStatusIcon(entry.status) }}</v-icon>
                          {{ getParticipationStatusText(entry.status) }}
                        </v-chip>
                      </template>

                      <v-list-item-title class="text-h6 mb-1">
                        {{ entry.contest.title }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        <span class="text-medium-emphasis">
                          <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                          {{ formatDate(entry.participatedAt) }}
                        </span>
                        <template v-if="entry.prize">
                          <span class="mx-2">•</span>
                          <span class="text-success">
                            <v-icon size="14" class="mr-1">mdi-gift</v-icon>
                            Приз: {{ entry.prize }}
                          </span>
                        </template>
                        <template v-if="entry.contest.platform">
                          <span class="mx-2">•</span>
                          <v-chip
                            :color="getPlatformColor(entry.contest.platform)"
                            size="x-small"
                            label
                            class="platform-chip"
                          >
                            <v-icon start size="12">{{ getPlatformIcon(entry.contest.platform) }}</v-icon>
                            {{ entry.contest.platform }}
                          </v-chip>
                        </template>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex align-center gap-2">
                          <TransitionGroup name="fade-slide" tag="div" class="d-flex">
                            <div :key="`view-${entry.id}`" class="action-wrapper">
                              <v-tooltip text="Просмотреть">
                                <template v-slot:activator="{ props }">
                                  <v-btn
                                    v-bind="props"
                                    color="primary"
                                    variant="text"
                                    @click="viewContest(entry.contest.id)"
                                    class="action-button"
                                  >
                                    <v-icon>mdi-eye</v-icon>
                                  </v-btn>
                                </template>
                              </v-tooltip>
                            </div>
                          </TransitionGroup>
                        </div>
                      </template>
                    </v-list-item>
                  </v-slide-x-transition>
                </template>
              </v-virtual-scroll>

              <!-- Индикатор загрузки при прокрутке -->
              <v-fade-transition>
                <div v-if="isLoadingMore" class="text-center py-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                  ></v-progress-circular>
                </div>
              </v-fade-transition>
            </div>
          </template>

          <!-- Пустое состояние для истории -->
          <v-scale-transition>
            <v-alert
              v-if="!isLoading && !history.length"
              type="info"
              variant="tonal"
              class="mb-4"
              icon="mdi-information"
            >
              {{ getHistoryEmptyStateMessage }}
            </v-alert>
          </v-scale-transition>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useContestsStore } from '@/stores/contests'
import { useRouter } from 'vue-router'
import { useError } from '@/composables/useError'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'UserContests',
  
  setup() {
    const contestStore = useContestsStore()
    contestStore.init()
    const authStore = useAuthStore()
    const router = useRouter()
    const { error } = useError()
    const isLoadingMore = ref(false)
    const scrollContainer = ref(null)
    const activeTab = ref('contests')
    const history = ref([])

    // Состояния из хранилища
    const contests = computed(() => contestStore.getContests)
    const isLoading = computed(() => contestStore.getLoadingStatus)
    const pagination = computed(() => contestStore.getPagination)

    // Проверка наличия дополнительных элементов
    const hasMoreItems = computed(() => {
      return pagination.value.currentPage < pagination.value.totalPages
    })

    // Обработчик прокрутки
    const handleScroll = async (e) => {
      const target = e.target
      if (!target) return

      const scrollHeight = target.scrollHeight
      const scrollTop = target.scrollTop
      const clientHeight = target.clientHeight

      // Если прокрутили до конца минус 100px
      if (scrollHeight - scrollTop - clientHeight < 100) {
        await loadMore()
      }
    }

    // Загрузка дополнительных конкурсов
    const loadMore = async () => {
      if (isLoadingMore.value || !hasMoreItems.value) return

      isLoadingMore.value = true
      try {
        await contestStore.updatePage(pagination.value.currentPage + 1)
      } catch (err) {
        // Ошибки обрабатываются в useError composable
      } finally {
        isLoadingMore.value = false
      }
    }

    // Добавляем слушатель прокрутки при монтировании
    onMounted(() => {
      loadContests()
      const virtualScroll = document.querySelector('.v-virtual-scroll')
      if (virtualScroll) {
        virtualScroll.addEventListener('scroll', handleScroll)
      }
    })

    // Удаляем слушатель при размонтировании
    onUnmounted(() => {
      const virtualScroll = document.querySelector('.v-virtual-scroll')
      if (virtualScroll) {
        virtualScroll.removeEventListener('scroll', handleScroll)
      }
    })

    // Фильтры
    const filters = ref({
      status: '',
      sortBy: 'date_desc',
      page: 1,
      perPage: 10
    })

    // Статусы для выбора
    const statusItems = [
      { title: 'Все', value: '' },
      { title: 'Черновики', value: 'draft' },
      { title: 'Активные', value: 'active' },
      { title: 'Победные', value: 'won' },
      { title: 'Завершенные', value: 'completed' }
    ]

    // Варианты сортировки
    const sortItems = [
      { title: 'По дате (сначала новые)', value: 'date_desc' },
      { title: 'По дате (сначала старые)', value: 'date_asc' },
      { title: 'По названию (А-Я)', value: 'title_asc' },
      { title: 'По названию (Я-А)', value: 'title_desc' }
    ]

    // Сообщение пустого состояния
    const getEmptyStateMessage = computed(() => {
      if (filters.value.status) {
        return `У вас пока нет конкурсов со статусом "${statusItems.find(item => item.value === filters.value.status)?.title.toLowerCase()}"`
      }
      return 'У вас пока нет конкурсов'
    })

    // Загрузка конкурсов
    const loadContests = async () => {
      try {
        await contestStore.updateFilters(filters.value)
        await contestStore.fetchStats()
      } catch (err) {
        // Ошибки обрабатываются в useError composable
      }
    }

    // Форматирование даты
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    // Получение текста статуса
    const getStatusText = (status) => {
      const statuses = {
        draft: 'Черновик',
        active: 'Активный',
        completed: 'Завершен',
        won: 'Победа',
        cancelled: 'Отменен'
      }
      return statuses[status] || status
    }

    // Получение цвета статуса
    const getStatusColor = (status) => {
      const colors = {
        draft: 'grey',
        active: 'success',
        completed: 'info',
        won: 'warning',
        cancelled: 'error'
      }
      return colors[status] || 'grey'
    }

    // Получение цвета платформы
    const getPlatformColor = (platform) => {
      const colors = {
        instagram: 'purple',
        vk: 'blue',
        youtube: 'red',
        telegram: 'info'
      }
      return colors[platform.toLowerCase()] || 'grey'
    }

    // Получение иконки статуса
    const getStatusIcon = (status) => {
      const icons = {
        draft: 'mdi-pencil-outline',
        active: 'mdi-play-circle-outline',
        completed: 'mdi-check-circle-outline',
        won: 'mdi-trophy-outline',
        cancelled: 'mdi-close-circle-outline'
      }
      return icons[status] || 'mdi-help-circle-outline'
    }

    // Получение класса статуса
    const getStatusClass = (status) => {
      return `status-${status}`
    }

    // Получение иконки платформы
    const getPlatformIcon = (platform) => {
      const icons = {
        instagram: 'mdi-instagram',
        vk: 'mdi-vk',
        youtube: 'mdi-youtube',
        telegram: 'mdi-telegram'
      }
      return icons[platform.toLowerCase()] || 'mdi-web'
    }

    // Действия с конкурсами
    const editContest = (id) => {
      router.push({ name: 'contest-edit', params: { id } })
    }

    const publishContest = async (id) => {
      try {
        await contestStore.publishContest(id)
        await loadContests()
      } catch (err) {
        // Ошибки обрабатываются в useError composable
      }
    }

    const cancelContest = async (id) => {
      try {
        await contestStore.unpublishContest(id)
        await loadContests()
      } catch (err) {
        // Ошибки обрабатываются в useError composable
      }
    }

    // Просмотр конкурса
    const viewContest = (id) => {
      router.push({ name: 'contest-detail', params: { id } })
    }

    // Проверка условий конкурса
    const checkConditions = (id) => {
      router.push({ name: 'contest-participation', params: { id } })
    }

    // Фильтры для истории
    const historyFilters = ref({
      status: '',
      sortBy: 'date_desc',
      page: 1,
      perPage: 10
    })

    // Статусы для истории
    const historyStatusItems = [
      { title: 'Все', value: '' },
      { title: 'Участвую', value: 'participating' },
      { title: 'Победа', value: 'won' },
      { title: 'Не выиграл', value: 'lost' },
      { title: 'Дисквалифицирован', value: 'disqualified' }
    ]

    // Варианты сортировки для истории
    const historySortItems = [
      { title: 'По дате участия (сначала новые)', value: 'date_desc' },
      { title: 'По дате участия (сначала старые)', value: 'date_asc' },
      { title: 'По названию конкурса (А-Я)', value: 'title_asc' },
      { title: 'По названию конкурса (Я-А)', value: 'title_desc' }
    ]

    // Сообщение пустого состояния для истории
    const getHistoryEmptyStateMessage = computed(() => {
      if (historyFilters.value.status) {
        return `У вас пока нет конкурсов со статусом "${historyStatusItems.find(item => item.value === historyFilters.value.status)?.title.toLowerCase()}"`
      }
      return 'У вас пока нет истории участия в конкурсах'
    })

    // Загрузка истории
    const loadHistory = async () => {
      try {
        const response = await contestStore.fetchHistory(historyFilters.value)
        history.value = response.data
      } catch (err) {
        // Ошибки обрабатываются в useError composable
      }
    }

    // Получение цвета статуса участия
    const getParticipationStatusColor = (status) => {
      const colors = {
        participating: 'info',
        won: 'success',
        lost: 'grey',
        disqualified: 'error'
      }
      return colors[status] || 'grey'
    }

    // Получение иконки статуса участия
    const getParticipationStatusIcon = (status) => {
      const icons = {
        participating: 'mdi-account-clock',
        won: 'mdi-trophy',
        lost: 'mdi-close-circle',
        disqualified: 'mdi-block-helper'
      }
      return icons[status] || 'mdi-help-circle'
    }

    // Получение текста статуса участия
    const getParticipationStatusText = (status) => {
      const texts = {
        participating: 'Участвую',
        won: 'Победа',
        lost: 'Не выиграл',
        disqualified: 'Дисквалифицирован'
      }
      return texts[status] || status
    }

    // Следим за изменением вкладки
    watch(activeTab, (newTab) => {
      if (newTab === 'history') {
        loadHistory()
      } else {
        loadContests()
      }
    })

    // Инициализация
    onMounted(() => {
      if (activeTab.value === 'history') {
        loadHistory()
      } else {
        loadContests()
      }
    })

    return {
      contestStore,
      contests,
      isLoading,
      isLoadingMore,
      hasMoreItems,
      error,
      filters,
      statusItems,
      sortItems,
      getEmptyStateMessage,
      formatDate,
      getStatusText,
      getStatusColor,
      getStatusIcon,
      getStatusClass,
      getPlatformColor,
      getPlatformIcon,
      loadContests,
      loadMore,
      editContest,
      publishContest,
      cancelContest,
      viewContest,
      checkConditions,
      scrollContainer,
      activeTab,
      history,
      historyFilters,
      historyStatusItems,
      historySortItems,
      getHistoryEmptyStateMessage,
      getParticipationStatusColor,
      getParticipationStatusIcon,
      getParticipationStatusText,
      loadHistory
    }
  }
}
</script>

<style scoped>
.stat-item {
  text-align: center;
  min-width: 120px;
}

.gap-4 {
  gap: 1rem;
}

.contest-item {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.contest-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(4px);
}

.contest-image {
  transition: transform 0.3s ease;
}

.contest-item:hover .contest-image {
  transform: scale(1.05);
}

.contest-title {
  transition: color 0.3s ease;
}

.contest-item:hover .contest-title {
  color: rgb(var(--v-theme-primary));
}

.status-chip {
  transition: transform 0.3s ease;
}

.contest-item:hover .status-chip {
  transform: translateY(-2px);
}

.platform-chip {
  transition: all 0.3s ease;
}

.contest-item:hover .platform-chip {
  transform: translateY(-1px);
}

.action-button {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.contest-item:hover .action-button {
  opacity: 1;
}

.action-button:hover {
  transform: scale(1.1);
}

/* Стили для статусов */
.status-draft {
  border: 1px dashed currentColor;
}

.status-active {
  font-weight: 600;
}

.status-won {
  background: linear-gradient(45deg, var(--v-theme-warning), var(--v-theme-success));
}

/* Стили для виртуального скроллинга */
.v-virtual-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.2) transparent;
}

.v-virtual-scroll::-webkit-scrollbar {
  width: 6px;
}

.v-virtual-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.v-virtual-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.2);
  border-radius: 3px;
}

/* Стили для индикатора загрузки */
.v-progress-circular {
  margin: 0 auto;
}

@media (max-width: 600px) {
  .gap-4 {
    gap: 0.5rem;
  }
  
  .contest-item {
    padding: 8px;
  }
  
  .stat-item {
    min-width: 100px;
  }
}

.action-wrapper {
  display: inline-flex;
  transition: all 0.3s ease;
}

.action-wrapper + .action-wrapper {
  margin-left: 4px;
}

/* Анимации для кнопок действий */
.fade-slide-move,
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-active {
  position: absolute;
}

.history-item {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.history-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(4px);
}
</style> 