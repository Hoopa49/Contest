<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Последние конкурсы
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
        density="compact"
        style="max-width: 200px"
      ></v-text-field>
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="contests"
        :search="search"
        :loading="loading"
        hover
      >
        <!-- Колонка платформы -->
        <template v-slot:item.platform="{ item }">
          <v-icon :color="getPlatformColor(item.platform)">
            {{ getPlatformIcon(item.platform) }}
          </v-icon>
          {{ item.platform }}
        </template>

        <!-- Колонка статуса -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Колонка действий -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            :to="{ name: 'contest-details', params: { id: item.id }}"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'RecentContests',

  setup() {
    const userStore = useUserStore()
    const search = ref('')
    const loading = ref(false)
    const contests = ref([])

    const headers = [
      { title: 'Название', key: 'title', align: 'start', sortable: true },
      { title: 'Платформа', key: 'platform', align: 'center' },
      { title: 'Дата участия', key: 'participatedAt', align: 'center', sortable: true },
      { title: 'Статус', key: 'status', align: 'center' },
      { title: 'Действия', key: 'actions', align: 'center', sortable: false }
    ]

    const getPlatformIcon = (platform) => {
      const icons = {
        youtube: 'mdi-youtube',
        instagram: 'mdi-instagram',
        vk: 'mdi-vk',
        telegram: 'mdi-telegram'
      }
      return icons[platform.toLowerCase()] || 'mdi-account'
    }

    const getPlatformColor = (platform) => {
      const colors = {
        youtube: 'red',
        instagram: 'purple',
        vk: 'blue',
        telegram: 'light-blue'
      }
      return colors[platform.toLowerCase()] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        completed: 'info',
        won: 'primary',
        lost: 'error'
      }
      return colors[status] || 'grey'
    }

    const loadContests = async () => {
      loading.value = true
      try {
        contests.value = await userStore.getUserContests()
      } catch (error) {
        console.error('Failed to load contests:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadContests()
    })

    return {
      search,
      loading,
      contests,
      headers,
      getPlatformIcon,
      getPlatformColor,
      getStatusColor
    }
  }
}
</script> 