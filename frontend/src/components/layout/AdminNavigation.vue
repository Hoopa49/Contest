<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="user?.name || 'Admin'"
      :subtitle="user?.email || ''"
    >
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Дашборд"
        value="dashboard"
        to="/admin"
        exact
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-account-group"
        title="Пользователи"
        value="users"
        to="/admin/users"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-trophy"
        title="Конкурсы"
        value="contests"
        to="/admin/contests"
      ></v-list-item>

      <v-list-group value="integrations">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-connection"
            title="Интеграции"
          ></v-list-item>
        </template>

        <v-list-item
          prepend-icon="mdi-youtube"
          title="YouTube"
          value="youtube"
          to="/admin/youtube"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-connection"
          title="Все интеграции"
          value="all-integrations"
          to="/admin/integrations"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-api"
          title="API настройки"
          value="api-settings"
          to="/admin/api-settings"
        ></v-list-item>
      </v-list-group>

      <v-list-group value="settings">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-cog"
            title="Настройки"
          ></v-list-item>
        </template>

        <v-list-item
          prepend-icon="mdi-cog-outline"
          title="Системные настройки"
          value="system-settings"
          to="/admin/system-settings"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-bell"
          title="Уведомления"
          value="notifications"
          to="/admin/notifications"
        ></v-list-item>
      </v-list-group>

      <v-list-item
        prepend-icon="mdi-chart-box"
        title="Аналитика"
        value="analytics"
        to="/admin/analytics"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-text-box-search"
        title="Логи"
        value="logs"
        to="/admin/logs"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          color="error"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          Выйти
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminNavigation',

  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const drawer = ref(true)
    const rail = ref(false)

    const user = computed(() => authStore.user)

    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    return {
      drawer,
      rail,
      user,
      logout
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}
</style> 