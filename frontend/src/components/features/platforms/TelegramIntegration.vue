<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon color="light-blue" class="mr-2">mdi-telegram</v-icon>
      Telegram Интеграция
      <v-spacer></v-spacer>
      <v-switch
        v-model="isEnabled"
        label="Активно"
        @change="toggleIntegration"
      ></v-switch>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Настройки бота -->
        <v-col cols="12">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                Настройки бота
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.bot.token"
                      label="Bot Token"
                      :type="showToken ? 'text' : 'password'"
                      :append-icon="showToken ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="showToken = !showToken"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.bot.username"
                      label="Bot Username"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-btn
                      color="info"
                      @click="testBotConnection"
                      :loading="testing"
                    >
                      Проверить подключение
                    </v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Мониторинг каналов -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                Мониторинг каналов
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="settings.channels"
                      label="Каналы для мониторинга"
                      hint="Один канал на строку (@channel или t.me/channel)"
                      rows="4"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="settings.searchFrequency"
                      :items="searchFrequencies"
                      label="Частота проверки"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.maxMessages"
                      type="number"
                      label="Макс. количество сообщений"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Фильтры -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                Фильтры
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.filters.minSubscribers"
                      type="number"
                      label="Мин. подписчиков канала"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.filters.minViews"
                      type="number"
                      label="Мин. просмотров"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="settings.filters.keywords"
                      label="Ключевые слова"
                      hint="Разделяйте слова запятой"
                      rows="2"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Автоматические действия -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                Автоматические действия
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.actions.autoJoinChannels"
                      label="Автоматически вступать в каналы"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.actions.forwardToChannel"
                      label="Пересылать найденные конкурсы"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6" v-if="settings.actions.forwardToChannel">
                    <v-text-field
                      v-model="settings.actions.targetChannel"
                      label="ID канала для пересылки"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>

        <!-- Статистика -->
        <v-col cols="12">
          <v-card>
            <v-card-title>Статистика</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="3">
                  <div class="text-h6">Найдено конкурсов</div>
                  <div class="text-h4">{{ stats.totalFound }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-h6">Обработано</div>
                  <div class="text-h4">{{ stats.processed }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-h6">Успешно</div>
                  <div class="text-h4">{{ stats.successful }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-h6">Ошибки</div>
                  <div class="text-h4">{{ stats.errors }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        @click="saveSettings"
        :loading="saving"
      >
        Сохранить настройки
      </v-btn>
      <v-btn
        color="secondary"
        @click="runManualSearch"
        :loading="searching"
        :disabled="!isEnabled"
      >
        Запустить поиск
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'

export default {
  name: 'TelegramIntegration',
  setup() {
    const adminStore = useAdminStore()
    const isEnabled = ref(false)
    const saving = ref(false)
    const searching = ref(false)
    const testing = ref(false)
    const showToken = ref(false)

    const searchFrequencies = [
      { title: 'Каждый час', value: 'hourly' },
      { title: 'Каждые 6 часов', value: '6hours' },
      { title: 'Каждые 12 часов', value: '12hours' },
      { title: 'Раз в день', value: 'daily' }
    ]

    const settings = reactive({
      bot: {
        token: '',
        username: ''
      },
      channels: '',
      searchFrequency: 'daily',
      maxMessages: 100,
      filters: {
        minSubscribers: 1000,
        minViews: 100,
        keywords: ''
      },
      actions: {
        autoJoinChannels: false,
        forwardToChannel: false,
        targetChannel: ''
      }
    })

    const stats = reactive({
      totalFound: 0,
      processed: 0,
      successful: 0,
      errors: 0
    })

    // Методы
    const toggleIntegration = async () => {
      try {
        await adminStore.toggleTelegramIntegration(isEnabled.value)
      } catch (error) {
        console.error('Failed to toggle integration:', error)
        isEnabled.value = !isEnabled.value
      }
    }

    const testBotConnection = async () => {
      testing.value = true
      try {
        await adminStore.testTelegramBot(settings.bot)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to test bot connection:', error)
        // Показать уведомление об ошибке
      } finally {
        testing.value = false
      }
    }

    const saveSettings = async () => {
      saving.value = true
      try {
        await adminStore.saveTelegramSettings(settings)
      } catch (error) {
        console.error('Failed to save settings:', error)
      } finally {
        saving.value = false
      }
    }

    const runManualSearch = async () => {
      searching.value = true
      try {
        const results = await adminStore.runTelegramSearch(settings)
        Object.assign(stats, results)
      } catch (error) {
        console.error('Failed to run search:', error)
      } finally {
        searching.value = false
      }
    }

    return {
      isEnabled,
      saving,
      searching,
      testing,
      showToken,
      settings,
      stats,
      searchFrequencies,
      toggleIntegration,
      testBotConnection,
      saveSettings,
      runManualSearch
    }
  }
}
</script> 