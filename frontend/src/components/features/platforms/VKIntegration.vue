<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon color="blue" class="mr-2">mdi-vk</v-icon>
      VK Интеграция
      <v-spacer></v-spacer>
      <v-switch
        v-model="isEnabled"
        label="Активно"
        @change="toggleIntegration"
      ></v-switch>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Настройки поиска -->
        <v-col cols="12">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                Настройки поиска
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.keywords"
                      label="Ключевые слова"
                      hint="Разделяйте слова запятой"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.groups"
                      label="ID групп для мониторинга"
                      hint="Разделяйте ID запятой"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="settings.searchFrequency"
                      :items="searchFrequencies"
                      label="Частота поиска"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.maxPosts"
                      type="number"
                      label="Максимальное количество постов"
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
                      v-model="settings.filters.minMembers"
                      type="number"
                      label="Мин. подписчиков группы"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.filters.minLikes"
                      type="number"
                      label="Мин. лайков"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.filters.verifiedOnly"
                      label="Только верифицированные группы"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.filters.withLinks"
                      label="Только с внешними ссылками"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Дополнительные настройки -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                Дополнительные настройки
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.advanced.includeComments"
                      label="Анализировать комментарии"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="settings.advanced.includeReposts"
                      label="Учитывать репосты"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="settings.advanced.excludePatterns"
                      label="Исключающие паттерны"
                      hint="Один паттерн на строку"
                      rows="3"
                    ></v-textarea>
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
                  <div class="text-h6">Найдено постов</div>
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
  name: 'VKIntegration',
  setup() {
    const adminStore = useAdminStore()
    const isEnabled = ref(false)
    const saving = ref(false)
    const searching = ref(false)

    const searchFrequencies = [
      { title: 'Каждый час', value: 'hourly' },
      { title: 'Каждые 6 часов', value: '6hours' },
      { title: 'Каждые 12 часов', value: '12hours' },
      { title: 'Раз в день', value: 'daily' }
    ]

    const settings = reactive({
      keywords: '',
      groups: '',
      searchFrequency: 'daily',
      maxPosts: 100,
      filters: {
        minMembers: 1000,
        minLikes: 50,
        verifiedOnly: false,
        withLinks: true
      },
      advanced: {
        includeComments: true,
        includeReposts: true,
        excludePatterns: ''
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
        await adminStore.toggleVKIntegration(isEnabled.value)
      } catch (error) {
        console.error('Failed to toggle integration:', error)
        isEnabled.value = !isEnabled.value
      }
    }

    const saveSettings = async () => {
      saving.value = true
      try {
        await adminStore.saveVKSettings(settings)
      } catch (error) {
        console.error('Failed to save settings:', error)
      } finally {
        saving.value = false
      }
    }

    const runManualSearch = async () => {
      searching.value = true
      try {
        const results = await adminStore.runVKSearch(settings)
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
      settings,
      stats,
      searchFrequencies,
      toggleIntegration,
      saveSettings,
      runManualSearch
    }
  }
}
</script> 