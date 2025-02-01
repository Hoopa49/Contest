<template>
  <v-container fluid>
    <!-- Вкладки -->
    <v-tabs v-model="activeTab" color="primary" @update:modelValue="handleTabChange">
      <v-tab value="dashboard">
        <v-icon start>mdi-view-dashboard</v-icon>
        Дашборд
      </v-tab>
      <v-tab value="users">
        <v-icon start>mdi-account-group</v-icon>
        Пользователи
      </v-tab>
      <v-tab value="integrations">
        <v-icon start>mdi-connection</v-icon>
        Интеграции
      </v-tab>
      <v-tab value="system-settings">
        <v-icon start>mdi-cog-box</v-icon>
        Системные настройки
      </v-tab>
      <v-tab value="logs">
        <v-icon start>mdi-text-box-search</v-icon>
        Логи
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
        case 'integrations':
          router.push({ name: 'admin-integrations' })
          break
        case 'system-settings':
          router.push({ name: 'admin-system-settings' })
          break
        case 'logs':
          router.push({ name: 'admin-logs' })
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