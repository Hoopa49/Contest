<template>
  <v-container>
    <!-- Фильтры -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.type"
              :items="notificationTypes"
              label="Тип уведомления"
              clearable
              :disabled="loading"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.status"
              :items="notificationStatuses"
              label="Статус"
              clearable
              :disabled="loading"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Поиск"
              append-icon="mdi-magnify"
              clearable
              :disabled="loading"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Список уведомлений -->
    <v-card>
      <v-card-text v-if="loading" class="d-flex justify-center align-center pa-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card-text>

      <template v-else>
        <v-list v-if="filteredNotifications.length > 0">
          <v-slide-y-transition group>
            <v-list-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              :class="{ 'unread': !notification.read }"
              rounded="lg"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-icon :color="getNotificationColor(notification.type)">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ notification.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="mt-1">
                {{ notification.message }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center">
                  <v-chip
                    size="small"
                    :color="getStatusColor(notification.status)"
                    class="mr-2"
                    variant="flat"
                  >
                    {{ notification.status }}
                  </v-chip>
                  <span class="text-caption text-grey mr-2">
                    {{ formatDate(notification.createdAt) }}
                  </span>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        v-bind="props"
                        density="comfortable"
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-if="!notification.read"
                        @click="markAsRead(notification.id)"
                        :loading="markingAsRead === notification.id"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-check</v-icon>
                        </template>
                        <v-list-item-title>Отметить как прочитанное</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="deleteNotification(notification.id)"
                        :loading="deleting === notification.id"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Удалить</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-list-item>
          </v-slide-y-transition>
        </v-list>

        <v-card-text v-else class="text-center pa-8">
          <v-icon size="64" color="grey" class="mb-4">mdi-bell-off</v-icon>
          <div class="text-h6 text-grey">Уведомлений нет</div>
          <div class="text-body-2 text-grey">Здесь будут отображаться ваши уведомления</div>
        </v-card-text>

        <!-- Пагинация -->
        <v-card-actions v-if="filteredNotifications.length > 0">
          <v-spacer></v-spacer>
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            :disabled="loading"
          ></v-pagination>
        </v-card-actions>
      </template>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'NotificationList',
  setup() {
    const notificationStore = useNotificationStore()
    const page = ref(1)
    const itemsPerPage = 10
    const loading = ref(true)
    const markingAsRead = ref(null)
    const deleting = ref(null)

    const filters = reactive({
      type: null,
      status: null,
      search: ''
    })

    const notificationTypes = [
      { title: 'Система', value: 'system' },
      { title: 'Конкурс', value: 'contest' },
      { title: 'Платформа', value: 'platform' },
      { title: 'Безопасность', value: 'security' }
    ]

    const notificationStatuses = [
      { title: 'Новое', value: 'new' },
      { title: 'Прочитано', value: 'read' },
      { title: 'В процессе', value: 'processing' },
      { title: 'Завершено', value: 'completed' }
    ]

    // Вычисляемые свойства
    const filteredNotifications = computed(() => {
      let filtered = notificationStore.allNotifications
      
      if (filters.type) {
        filtered = filtered.filter(n => n.type === filters.type)
      }

      if (filters.status) {
        filtered = filtered.filter(n => n.status === filters.status)
      }

      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(n => 
          n.title.toLowerCase().includes(search) ||
          n.message.toLowerCase().includes(search)
        )
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredNotifications.value.length / itemsPerPage)
    })

    // Методы
    const getNotificationColor = (type) => {
      const colors = {
        system: 'grey',
        contest: 'primary',
        platform: 'success',
        security: 'error'
      }
      return colors[type] || 'grey'
    }

    const getNotificationIcon = (type) => {
      const icons = {
        system: 'mdi-cog',
        contest: 'mdi-trophy',
        platform: 'mdi-connection',
        security: 'mdi-shield'
      }
      return icons[type] || 'mdi-bell'
    }

    const getStatusColor = (status) => {
      const colors = {
        new: 'info',
        read: 'grey',
        processing: 'warning',
        completed: 'success'
      }
      return colors[status] || 'grey'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    const markAsRead = async (id) => {
      markingAsRead.value = id
      try {
        await notificationStore.markAsRead(id)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      } finally {
        markingAsRead.value = null
      }
    }

    const deleteNotification = async (id) => {
      deleting.value = id
      try {
        await notificationStore.deleteNotification(id)
      } catch (error) {
        console.error('Failed to delete notification:', error)
      } finally {
        deleting.value = null
      }
    }

    // Загрузка данных
    const loadData = async () => {
      loading.value = true
      try {
        await notificationStore.fetchNotifications()
      } finally {
        loading.value = false
      }
    }

    // Наблюдатели
    watch([filters, page], () => {
      loadData()
    })

    // Инициализация
    onMounted(() => {
      loadData()
    })

    return {
      page,
      loading,
      markingAsRead,
      deleting,
      filters,
      notificationTypes,
      notificationStatuses,
      filteredNotifications,
      totalPages,
      getNotificationColor,
      getNotificationIcon,
      getStatusColor,
      formatDate,
      markAsRead,
      deleteNotification
    }
  }
}
</script>

<style scoped>
.unread {
  background-color: var(--v-surface-variant);
}

.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  transform: translateX(4px);
}

.v-slide-y-transition-enter-active,
.v-slide-y-transition-leave-active {
  transition: all 0.3s ease;
}

.v-slide-y-transition-enter-from,
.v-slide-y-transition-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style> 