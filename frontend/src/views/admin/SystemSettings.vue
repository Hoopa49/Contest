<template>
  <v-container>
    <v-card>
      <v-card-title>
        Системные настройки
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="saveAllSettings"
          :loading="saving"
        >
          Сохранить все изменения
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-expansion-panels>
          <!-- Безопасность -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-shield-lock</v-icon>
              Безопасность
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.security.maxLoginAttempts"
                    label="Максимальное количество попыток входа"
                    type="number"
                    hint="После превышения аккаунт будет временно заблокирован"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.security.passwordExpiryDays"
                    label="Срок действия пароля (дни)"
                    type="number"
                    hint="0 - без ограничения срока"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.security.sessionTimeoutMinutes"
                    label="Таймаут сессии (минуты)"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.security.requireTwoFactor"
                    label="Обязательная двухфакторная аутентификация"
                    color="primary"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Интеграции -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-connection</v-icon>
              Интеграции
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.integrations.youtube.enabled"
                    label="YouTube интеграция"
                    color="red"
                  ></v-switch>
                  <v-text-field
                    v-if="settings.integrations.youtube.enabled"
                    v-model="settings.integrations.youtube.updateInterval"
                    label="Интервал обновления (минуты)"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.integrations.telegram.enabled"
                    label="Telegram интеграция"
                    color="blue"
                  ></v-switch>
                  <v-switch
                    v-if="settings.integrations.telegram.enabled"
                    v-model="settings.integrations.telegram.webhookEnabled"
                    label="Использовать webhook"
                    color="blue"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Уведомления -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-bell</v-icon>
              Уведомления
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.email.enabled"
                    label="Email уведомления"
                    color="primary"
                  ></v-switch>
                  <v-text-field
                    v-if="settings.notifications.email.enabled"
                    v-model="settings.notifications.email.dailyLimit"
                    label="Дневной лимит"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.push.enabled"
                    label="Push уведомления"
                    color="primary"
                  ></v-switch>
                  <v-text-field
                    v-if="settings.notifications.push.enabled"
                    v-model="settings.notifications.push.batchSize"
                    label="Размер пакета"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Производительность -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-speedometer</v-icon>
              Производительность
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.performance.cacheTimeout"
                    label="Таймаут кэша (минуты)"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.performance.itemsPerPage"
                    label="Элементов на странице"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- История изменений -->
    <v-card class="mt-4">
      <v-card-title>
        История изменений
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          density="compact"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="historyHeaders"
        :items="settingsHistory"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.category="{ item }">
          <v-chip :color="getCategoryColor(item.raw.category)" size="small">
            {{ item.raw.category }}
          </v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.raw.created_at) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="info"
            @click="showChanges(item.raw)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="warning"
            @click="rollbackChanges(item.raw)"
          >
            <v-icon>mdi-restore</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог просмотра изменений -->
    <v-dialog v-model="showChangesDialog" max-width="600">
      <v-card>
        <v-card-title>
          Изменения настроек
          <v-spacer></v-spacer>
          <v-btn icon @click="showChangesDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(change, key) in selectedChanges"
              :key="key"
            >
              <template v-slot:prepend>
                <v-icon :color="change.type === 'added' ? 'success' : change.type === 'removed' ? 'error' : 'warning'">
                  {{ change.type === 'added' ? 'mdi-plus' : change.type === 'removed' ? 'mdi-minus' : 'mdi-pencil' }}
                </v-icon>
              </template>
              <v-list-item-title>{{ key }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ change.type === 'modified' ? `${change.old} → ${change.new}` : change.value }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { formatDate } from '@/utils/date'

export default {
  name: 'SystemSettings',
  
  setup() {
    const systemSettingsStore = useSystemSettingsStore()
    const saving = ref(false)
    const loading = ref(false)
    const search = ref('')
    const showChangesDialog = ref(false)
    const selectedChanges = ref({})

    // Настройки по умолчанию
    const settings = reactive({
      security: {
        maxLoginAttempts: 5,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 30,
        requireTwoFactor: false
      },
      integrations: {
        youtube: {
          enabled: true,
          updateInterval: 30
        },
        telegram: {
          enabled: false,
          webhookEnabled: true
        }
      },
      notifications: {
        email: {
          enabled: true,
          dailyLimit: 1000
        },
        push: {
          enabled: true,
          batchSize: 100
        }
      },
      performance: {
        cacheTimeout: 60,
        itemsPerPage: 20
      }
    })

    const historyHeaders = [
      { title: 'Категория', key: 'category' },
      { title: 'Изменено', key: 'updated_by' },
      { title: 'Дата', key: 'created_at' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const settingsHistory = ref([])

    // Методы
    const loadSettings = async () => {
      loading.value = true
      try {
        const data = await systemSettingsStore.getAllSettings()
        Object.assign(settings, data)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        loading.value = false
      }
    }

    const saveAllSettings = async () => {
      saving.value = true
      try {
        await systemSettingsStore.saveSettings(settings)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to save settings:', error)
        // Показать уведомление об ошибке
      } finally {
        saving.value = false
      }
    }

    const loadHistory = async () => {
      loading.value = true
      try {
        settingsHistory.value = await systemSettingsStore.getSettingsHistory()
      } catch (error) {
        console.error('Failed to load settings history:', error)
      } finally {
        loading.value = false
      }
    }

    const showChanges = (item) => {
      selectedChanges.value = item.changes
      showChangesDialog.value = true
    }

    const rollbackChanges = async (item) => {
      try {
        await systemSettingsStore.rollbackSettings(item.id)
        await loadSettings()
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to rollback settings:', error)
        // Показать уведомление об ошибке
      }
    }

    const getCategoryColor = (category) => {
      const colors = {
        security: 'red',
        integrations: 'blue',
        notifications: 'green',
        performance: 'orange'
      }
      return colors[category] || 'grey'
    }

    onMounted(() => {
      loadSettings()
      loadHistory()
    })

    return {
      saving,
      loading,
      settings,
      search,
      historyHeaders,
      settingsHistory,
      showChangesDialog,
      selectedChanges,
      saveAllSettings,
      showChanges,
      rollbackChanges,
      getCategoryColor,
      formatDate
    }
  }
}
</script> 