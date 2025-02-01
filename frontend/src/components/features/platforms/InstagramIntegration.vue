<template>
  <v-card>
    <v-card-title>
      Интеграция с Instagram
      <v-spacer></v-spacer>
      <v-switch
        v-model="enabled"
        color="primary"
        :loading="loading"
        @change="toggleIntegration"
      ></v-switch>
    </v-card-title>

    <v-card-text>
      <v-form v-model="isValid" @submit.prevent="saveSettings">
        <v-text-field
          v-model="settings.apiKey"
          label="API Ключ"
          :rules="[v => !!v || 'Обязательное поле']"
          :disabled="!enabled"
        ></v-text-field>
        
        <v-text-field
          v-model="settings.searchTags"
          label="Поисковые теги"
          hint="Разделяйте теги запятыми"
          persistent-hint
          :disabled="!enabled"
        ></v-text-field>

        <v-select
          v-model="settings.updateInterval"
          :items="updateIntervals"
          label="Интервал обновления"
          :disabled="!enabled"
        ></v-select>

        <v-btn
          color="primary"
          type="submit"
          :disabled="!enabled || !isValid"
          :loading="saving"
        >
          Сохранить настройки
        </v-btn>
      </v-form>
    </v-card-text>

    <!-- Статистика -->
    <v-card-text v-if="enabled">
      <v-row>
        <v-col cols="12" md="4" v-for="stat in stats" :key="stat.title">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <div>
                  <div class="text-subtitle-1">{{ stat.title }}</div>
                  <div class="text-h4">{{ stat.value }}</div>
                </div>
                <v-spacer></v-spacer>
                <v-icon size="48" :color="stat.color">{{ stat.icon }}</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue'
import { useIntegrationsStore } from '@/stores/integrations'

export default {
  name: 'InstagramIntegration',
  
  setup() {
    const store = useIntegrationsStore()
    const enabled = ref(false)
    const loading = ref(false)
    const saving = ref(false)
    const isValid = ref(false)
    
    const settings = ref({
      apiKey: '',
      searchTags: '',
      updateInterval: 30
    })

    const updateIntervals = [
      { title: '15 минут', value: 15 },
      { title: '30 минут', value: 30 },
      { title: '1 час', value: 60 },
      { title: '2 часа', value: 120 }
    ]

    const stats = computed(() => [
      {
        title: 'Найдено конкурсов',
        value: store.getInstagramStats?.contestsFound || 0,
        icon: 'mdi-trophy',
        color: 'success'
      },
      {
        title: 'Запросов к API',
        value: store.getInstagramStats?.apiRequests || 0,
        icon: 'mdi-api',
        color: 'info'
      },
      {
        title: 'Ошибок',
        value: store.getInstagramStats?.errors || 0,
        icon: 'mdi-alert',
        color: 'error'
      }
    ])

    // Загрузка настроек
    const loadSettings = async () => {
      loading.value = true
      try {
        const response = await store.getInstagramSettings()
        enabled.value = response.enabled
        settings.value = { ...response.settings }
      } catch (error) {
        console.error('Ошибка при загрузке настроек Instagram:', error)
      } finally {
        loading.value = false
      }
    }

    // Сохранение настроек
    const saveSettings = async () => {
      if (!isValid.value) return
      
      saving.value = true
      try {
        await store.updateInstagramSettings({
          enabled: enabled.value,
          settings: settings.value
        })
      } catch (error) {
        console.error('Ошибка при сохранении настроек Instagram:', error)
      } finally {
        saving.value = false
      }
    }

    // Включение/выключение интеграции
    const toggleIntegration = async () => {
      loading.value = true
      try {
        await store.toggleInstagramIntegration(enabled.value)
      } catch (error) {
        console.error('Ошибка при переключении интеграции Instagram:', error)
        enabled.value = !enabled.value // Возвращаем предыдущее состояние
      } finally {
        loading.value = false
      }
    }

    // Загружаем настройки при монтировании
    loadSettings()

    return {
      enabled,
      loading,
      saving,
      isValid,
      settings,
      updateIntervals,
      stats,
      saveSettings,
      toggleIntegration
    }
  }
}
</script> 