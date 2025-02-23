<template>
  <v-container fluid>
    <!-- Вкладки -->
    <v-tabs v-model="activeTab" color="primary" @update:modelValue="handleTabChange">
      <v-tab value="dashboard">
        <v-icon start>mdi-view-dashboard</v-icon>
        Дашборд
      </v-tab>
      <v-tab value="analytics">
        <v-icon start>mdi-chart-bar</v-icon>
        Аналитика
      </v-tab>
      <v-tab value="users">
        <v-icon start>mdi-account-group</v-icon>
        Пользователи
      </v-tab>
      <v-tab value="contests">
        <v-icon start>mdi-trophy</v-icon>
        Конкурсы
      </v-tab>
      <v-tab value="integrations">
        <v-icon start>mdi-connection</v-icon>
        Интеграции
      </v-tab>
      <v-tab value="notifications">
        <v-icon start>mdi-bell</v-icon>
        Уведомления
      </v-tab>
      <v-tab value="system-settings">
        <v-icon start>mdi-cog-box</v-icon>
        Настройки
      </v-tab>
      <v-tab value="ui-kit">
        <v-icon start>mdi-palette</v-icon>
        UI Kit
      </v-tab>
    </v-tabs>

    <!-- Содержимое вкладок -->
    <router-view></router-view>
  </v-container>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'AdminLayout',
  
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // Активная вкладка из маршрута
    const activeTab = ref(route.meta.tab || 'dashboard')

    // Обработка смены вкладки
    const handleTabChange = (tab) => {
      switch (tab) {
        case 'dashboard':
          router.push({ name: 'admin-dashboard' })
          break
        case 'users':
          router.push({ name: 'admin-users' })
          break
        case 'contests':
          router.push({ name: 'admin-contests' })
          break
        case 'integrations':
          router.push({ name: 'admin-integrations' })
          break
        case 'notifications':
          router.push({ name: 'admin-notifications' })
          break
        case 'system-settings':
          router.push({ name: 'admin-system-settings' })
          break
        case 'analytics':
          router.push({ name: 'admin-analytics' })
          break
        case 'ui-kit':
          router.push({ name: 'admin-ui-kit' })
          break
      }
    }

    // Следим за изменениями маршрута
    watch(() => route.meta.tab, (newTab) => {
      if (newTab) {
        activeTab.value = newTab
      }
    })

    return {
      activeTab,
      handleTabChange
    }
  }
}
</script> 