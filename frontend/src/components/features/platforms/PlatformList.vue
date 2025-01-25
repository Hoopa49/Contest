<template>
  <v-container>
    <!-- Поиск и фильтры -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Поиск платформ"
              prepend-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.category"
              :items="categories"
              label="Категория"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Сортировка"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Список платформ -->
    <v-row>
      <v-col
        v-for="platform in filteredPlatforms"
        :key="platform.id"
        cols="12"
        md="4"
        lg="3"
      >
        <v-card
          :class="{ 'platform-card': true, 'connected': platform.isConnected }"
          @click="viewPlatform(platform.id)"
        >
          <v-img
            :src="platform.logo"
            height="120"
            class="platform-logo"
            contain
          ></v-img>

          <v-card-title class="text-center">
            {{ platform.name }}
          </v-card-title>

          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption">Рейтинг:</span>
              <v-rating
                v-model="platform.rating"
                density="compact"
                size="small"
                readonly
                half-increments
              ></v-rating>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption">Конкурсов:</span>
              <span class="font-weight-medium">{{ platform.contestsCount }}</span>
            </div>

            <div class="d-flex justify-space-between">
              <span class="text-caption">Участников:</span>
              <span class="font-weight-medium">{{ formatNumber(platform.usersCount) }}</span>
            </div>

            <v-chip
              :color="platform.isConnected ? 'success' : 'grey'"
              size="small"
              class="mt-2"
            >
              {{ platform.isConnected ? 'Подключено' : 'Не подключено' }}
            </v-chip>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              block
              :color="platform.isConnected ? 'error' : 'primary'"
              variant="text"
              @click.stop="toggleConnection(platform)"
            >
              {{ platform.isConnected ? 'Отключить' : 'Подключить' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог подключения -->
    <v-dialog v-model="connectDialog.show" max-width="500">
      <v-card>
        <v-card-title>
          Подключение к {{ connectDialog.platform?.name }}
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="connectDialog.show = false"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="connectDialog.error"
            type="error"
            class="mb-4"
          >
            {{ connectDialog.error }}
          </v-alert>

          <v-form ref="connectForm" v-model="connectDialog.valid">
            <v-text-field
              v-model="connectDialog.credentials.username"
              label="Имя пользователя"
              :rules="[v => !!v || 'Обязательное поле']"
            ></v-text-field>

            <v-text-field
              v-model="connectDialog.credentials.apiKey"
              label="API ключ"
              :rules="[v => !!v || 'Обязательное поле']"
              :type="showApiKey ? 'text' : 'password'"
              :append-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showApiKey = !showApiKey"
            ></v-text-field>
          </v-form>

          <div class="text-caption mt-2">
            <v-icon start size="small">mdi-information</v-icon>
            Инструкции по получению API ключа можно найти в
            <a :href="connectDialog.platform?.docsUrl" target="_blank">документации</a>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="connectDialog.show = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="connectPlatform"
            :loading="connectDialog.loading"
            :disabled="!connectDialog.valid"
          >
            Подключить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template> 

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlatformStore } from '@/stores/platform'

export default {
  name: 'PlatformList',
  
  setup() {
    const router = useRouter()
    const platformStore = usePlatformStore()
    const connectForm = ref(null)
    const search = ref('')
    const showApiKey = ref(false)

    const filters = reactive({
      category: null,
      sortBy: 'rating'
    })

    const connectDialog = reactive({
      show: false,
      platform: null,
      valid: false,
      loading: false,
      error: null,
      credentials: {
        username: '',
        apiKey: ''
      }
    })

    // Опции для фильтров
    const categories = [
      { text: 'Социальные сети', value: 'social' },
      { text: 'Видеохостинги', value: 'video' },
      { text: 'Мессенджеры', value: 'messenger' }
    ]

    const sortOptions = [
      { text: 'По рейтингу', value: 'rating' },
      { text: 'По количеству конкурсов', value: 'contests' },
      { text: 'По количеству участников', value: 'users' }
    ]

    // Фильтрация платформ
    const filteredPlatforms = computed(() => {
      let result = platformStore.platforms

      // Поиск
      if (search.value) {
        const searchLower = search.value.toLowerCase()
        result = result.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        )
      }

      // Категория
      if (filters.category) {
        result = result.filter(p => p.category === filters.category)
      }

      // Сортировка
      result = [...result].sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return b.rating - a.rating
          case 'contests':
            return b.contestsCount - a.contestsCount
          case 'users':
            return b.usersCount - a.usersCount
          default:
            return 0
        }
      })

      return result
    })

    // Методы
    const loadPlatforms = async () => {
      try {
        await platformStore.getPlatforms()
      } catch (error) {
        console.error('Failed to load platforms:', error)
      }
    }

    const viewPlatform = (id) => {
      router.push({ name: 'platform-details', params: { id } })
    }

    const toggleConnection = (platform) => {
      if (platform.isConnected) {
        disconnectPlatform(platform)
      } else {
        showConnectDialog(platform)
      }
    }

    const showConnectDialog = (platform) => {
      connectDialog.platform = platform
      connectDialog.show = true
      connectDialog.error = null
      connectDialog.credentials.username = ''
      connectDialog.credentials.apiKey = ''
    }

    const connectPlatform = async () => {
      if (!connectDialog.valid) return

      connectDialog.loading = true
      connectDialog.error = null

      try {
        await platformStore.connectPlatform(
          connectDialog.platform.id,
          connectDialog.credentials
        )
        connectDialog.show = false
      } catch (error) {
        connectDialog.error = error.message
      } finally {
        connectDialog.loading = false
      }
    }

    const disconnectPlatform = async (platform) => {
      try {
        await platformStore.disconnectPlatform(platform.id)
      } catch (error) {
        console.error('Failed to disconnect platform:', error)
      }
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat().format(num)
    }

    // При монтировании
    onMounted(() => {
      loadPlatforms()
    })

    return {
      connectForm,
      search,
      showApiKey,
      filters,
      connectDialog,
      categories,
      sortOptions,
      filteredPlatforms,
      viewPlatform,
      toggleConnection,
      connectPlatform,
      formatNumber
    }
  }
}
</script>

<style scoped>
.platform-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.platform-card:hover {
  transform: translateY(-4px);
}

.platform-card.connected {
  border: 2px solid var(--v-success-base);
}

.platform-logo {
  padding: 1rem;
  background-color: var(--v-background);
}

.v-rating {
  display: inline-flex;
}
</style> 