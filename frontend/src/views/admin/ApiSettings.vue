<template>
  <v-container>
    <v-card>
      <v-card-title>
        <YouTubeIcon class="mr-2" color="currentColor" />
        YouTube API Settings
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="saveAllSettings"
          :loading="saving"
        >
          Сохранить все изменения
        </v-btn>
      </v-card-title>

      <!-- YouTube API Settings -->
      <v-card-text>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-youtube</v-icon>
              YouTube API
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.youtube.apiKey"
                    label="API Key"
                    :type="showKeys.youtube ? 'text' : 'password'"
                    :append-icon="showKeys.youtube ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showKeys.youtube = !showKeys.youtube"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.youtube.quotaLimit"
                    label="Дневной лимит запросов"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-alert
                    :type="quotaStatus.youtube.type"
                    v-if="quotaStatus.youtube.message"
                  >
                    {{ quotaStatus.youtube.message }}
                  </v-alert>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Instagram API Settings -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-instagram</v-icon>
              Instagram API
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.instagram.accessToken"
                    label="Access Token"
                    :type="showKeys.instagram ? 'text' : 'password'"
                    :append-icon="showKeys.instagram ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showKeys.instagram = !showKeys.instagram"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.instagram.quotaLimit"
                    label="Часовой лимит запросов"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- VK API Settings -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-vk</v-icon>
              VK API
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.vk.accessToken"
                    label="Access Token"
                    :type="showKeys.vk ? 'text' : 'password'"
                    :append-icon="showKeys.vk ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showKeys.vk = !showKeys.vk"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.vk.quotaLimit"
                    label="Дневной лимит запросов"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- График использования API -->
    <v-card class="mt-4">
      <v-card-title>
        Использование API
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="timeRange" mandatory>
          <v-btn value="day">День</v-btn>
          <v-btn value="week">Неделя</v-btn>
          <v-btn value="month">Месяц</v-btn>
        </v-btn-toggle>
      </v-card-title>
      <v-card-text>
        <canvas ref="usageChart"></canvas>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Chart } from 'chart.js'
import { useAdminStore } from '@/stores/admin'
import YouTubeIcon from '@/components/icons/YouTubeIcon.vue'

export default {
  name: 'ApiSettings',
  components: {
    YouTubeIcon
  },
  setup() {
    const adminStore = useAdminStore()
    const saving = ref(false)
    const timeRange = ref('week')
    const usageChart = ref(null)

    const settings = reactive({
      youtube: {
        apiKey: '',
        quotaLimit: 10000
      },
      instagram: {
        accessToken: '',
        quotaLimit: 5000
      },
      vk: {
        accessToken: '',
        quotaLimit: 5000
      }
    })

    const showKeys = reactive({
      youtube: false,
      instagram: false,
      vk: false
    })

    const quotaStatus = reactive({
      youtube: { type: 'info', message: '' },
      instagram: { type: 'info', message: '' },
      vk: { type: 'info', message: '' }
    })

    // Методы
    const loadSettings = async () => {
      try {
        const data = await adminStore.getApiSettings()
        Object.assign(settings, data)
      } catch (error) {
        console.error('Failed to load API settings:', error)
      }
    }

    const saveAllSettings = async () => {
      saving.value = true
      try {
        await adminStore.saveApiSettings(settings)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to save API settings:', error)
        // Показать уведомление об ошибке
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      saving,
      settings,
      showKeys,
      quotaStatus,
      timeRange,
      usageChart,
      saveAllSettings
    }
  }
}
</script> 
