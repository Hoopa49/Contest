<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Уведомления
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-cog"
        variant="text"
        :to="{ name: 'notification-settings' }"
      ></v-btn>
    </v-card-title>

    <v-card-text>
      <v-list>
        <template v-for="(notification, index) in notifications" :key="notification.id">
          <v-list-item
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <template v-slot:prepend>
              <v-icon :color="getNotificationColor(notification.type)">
                {{ getNotificationIcon(notification.type) }}
              </v-icon>
            </template>

            <v-list-item-title>{{ notification.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>

            <template v-slot:append>
              <div class="text-caption text-grey">
                {{ formatDate(notification.createdAt) }}
              </div>
            </template>
          </v-list-item>

          <v-divider
            v-if="index < notifications.length - 1"
            :key="`divider-${notification.id}`"
          ></v-divider>
        </template>
      </v-list>

      <div v-if="notifications.length === 0" class="text-center pa-4">
        <v-icon size="48" color="grey" class="mb-2">mdi-bell-off</v-icon>
        <div class="text-body-1">Нет новых уведомлений</div>
      </div>
    </v-card-text>

    <v-card-actions v-if="notifications.length > 0">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="text"
        @click="markAllAsRead"
        :disabled="!hasUnread"
      >
        Отметить все как прочитанные
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'UserNotifications',

  setup() {
    const userStore = useUserStore()
    const notifications = ref([])

    const hasUnread = computed(() => {
      return notifications.value.some(n => !n.read)
    })

    const getNotificationIcon = (type) => {
      const icons = {
        contest: 'mdi-trophy',
        achievement: 'mdi-star',
        system: 'mdi-information',
        warning: 'mdi-alert'
      }
      return icons[type] || 'mdi-bell'
    }

    const getNotificationColor = (type) => {
      const colors = {
        contest: 'primary',
        achievement: 'warning',
        system: 'info',
        warning: 'error'
      }
      return colors[type] || 'grey'
    }

    const formatDate = (date) => {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru })
    }

    const loadNotifications = async () => {
      try {
        notifications.value = await userStore.getUserNotifications()
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    const markAsRead = async (id) => {
      try {
        await userStore.markNotificationAsRead(id)
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.read = true
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    const markAllAsRead = async () => {
      try {
        await userStore.markAllNotificationsAsRead()
        notifications.value = notifications.value.map(n => ({ ...n, read: true }))
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
      }
    }

    onMounted(() => {
      loadNotifications()
    })

    return {
      notifications,
      hasUnread,
      getNotificationIcon,
      getNotificationColor,
      formatDate,
      markAsRead,
      markAllAsRead
    }
  }
}
</script>

<style scoped>
.unread {
  background-color: var(--v-surface-variant);
}
</style> 