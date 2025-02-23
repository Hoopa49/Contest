<template>
  <v-container>
    <!-- Фильтры -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.platform"
              :items="platforms"
              label="Платформа"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statuses"
              label="Статус"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Поиск"
              append-icon="mdi-magnify"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              @click="applyFilters"
              :loading="loading"
            >
              Применить
            </v-btn>
            <v-btn
              class="ml-2"
              @click="resetFilters"
              text
            >
              Сбросить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Список конкурсов для модерации -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="contests"
        :loading="loading"
        :items-per-page="10"
      >
        <!-- Статус конкурса -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            small
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Действия -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            @click="viewContest(item)"
            class="mr-2"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="success"
            @click="approveContest(item)"
            v-if="item.status === 'pending'"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="error"
            @click="rejectContest(item)"
            v-if="item.status === 'pending'"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог просмотра конкурса -->
    <v-dialog v-model="viewDialog" max-width="800px">
      <v-card>
        <v-card-title>
          Просмотр конкурса
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="viewDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="selectedContest">
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1">Название</div>
              <div>{{ selectedContest.title }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1">Платформа</div>
              <div>{{ selectedContest.platform }}</div>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-1">Описание</div>
              <div>{{ selectedContest.description }}</div>
            </v-col>
            <!-- Дополнительные поля -->
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            @click="approveContest(selectedContest)"
            v-if="selectedContest?.status === 'pending'"
          >
            Одобрить
          </v-btn>
          <v-btn
            color="error"
            @click="rejectContest(selectedContest)"
            v-if="selectedContest?.status === 'pending'"
          >
            Отклонить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

export default {
  name: 'ContestModeration',
  setup() {
    const adminStore = useAdminStore()
    const loading = ref(false)
    const viewDialog = ref(false)
    const selectedContest = ref(null)

    const filters = reactive({
      platform: null,
      status: null,
      search: ''
    })

    const platforms = [
      'YouTube',
      'Instagram',
      'Telegram',
      'VK'
    ]

    const statuses = [
      'pending',
      'approved',
      'rejected'
    ]

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Название', key: 'title' },
      { title: 'Платформа', key: 'platform' },
      { title: 'Статус', key: 'status' },
      { title: 'Дата создания', key: 'createdAt' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const contests = ref([])

    // Методы
    const loadContests = async () => {
      loading.value = true
      try {
        contests.value = await adminStore.getContestsForModeration(filters)
      } catch (error) {
        console.error('Failed to load contests:', error)
      } finally {
        loading.value = false
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error'
      }
      return colors[status] || 'grey'
    }

    const applyFilters = () => {
      loadContests()
    }

    const resetFilters = () => {
      filters.platform = null
      filters.status = null
      filters.search = ''
      loadContests()
    }

    onMounted(() => {
      loadContests()
    })

    return {
      loading,
      filters,
      platforms,
      statuses,
      headers,
      contests,
      viewDialog,
      selectedContest,
      getStatusColor,
      applyFilters,
      resetFilters
    }
  }
}
</script> 
