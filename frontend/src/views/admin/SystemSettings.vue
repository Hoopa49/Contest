<template>
  <v-container>
    <!-- Системные настройки -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="settings-nav">
          <v-list bg-color="background">
            <v-list-item
              v-for="(section, index) in settingsSections"
              :key="index"
              :value="section"
              :active="activeSection === section.id"
              @click="activeSection = section.id"
              class="settings-nav-item"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon :color="activeSection === section.id ? section.color : 'grey'" class="mr-2">
                  {{ section.icon }}
                </v-icon>
              </template>
              <v-list-item-title>{{ section.title }}</v-list-item-title>
              <template v-slot:append>
                <v-icon v-if="hasChanges(section.id)" color="warning" size="small">
                  mdi-circle-medium
                </v-icon>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-2"></v-divider>

          <v-card-actions class="pa-4">
            <UiButton
              variant="primary"
              :loading="saving"
              :disabled="!hasAnyChanges"
              @click="saveAllSettings"
              class="w-100"
            >
              <template #icon>
                <v-icon>mdi-content-save</v-icon>
              </template>
              Сохранить изменения
            </UiButton>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon :color="getCurrentSection.color" size="28" class="mr-2">
                {{ getCurrentSection.icon }}
              </v-icon>
            </template>
            <v-card-title class="text-h5">
              {{ getCurrentSection.title }}
            </v-card-title>
            <v-card-subtitle>
              {{ getCurrentSection.description }}
            </v-card-subtitle>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-container fluid class="pa-0">
              <!-- Секция безопасности -->
              <v-fade-transition>
                <div v-if="activeSection === 'security'" class="settings-section">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="settings.security.maxLoginAttempts"
                        type="number"
                        label="Максимальное количество попыток входа"
                        hint="После превышения аккаунт будет заблокирован"
                        persistent-hint
                        min="1"
                        max="10"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="settings.security.passwordExpiryDays"
                        type="number"
                        label="Срок действия пароля (дни)"
                        hint="0 - без ограничения срока"
                        persistent-hint
                        min="0"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="settings.security.sessionTimeoutMinutes"
                        type="number"
                        label="Таймаут сессии (минуты)"
                        hint="Время до автоматического выхода"
                        persistent-hint
                        min="5"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-switch
                        v-model="settings.security.requireTwoFactor"
                        label="Двухфакторная аутентификация"
                        hint="Обязательна для всех пользователей"
                        persistent-hint
                      />
                    </v-col>
                    <!-- Добавляем настройки безопасности API -->
                    <v-col cols="12">
                      <v-card variant="outlined" class="mt-4">
                        <v-card-title class="d-flex align-center">
                          <v-icon start color="primary" class="me-2">mdi-api</v-icon>
                          Безопасность API
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" sm="6">
                              <v-select
                                v-model="settings.security.apiAccessControl"
                                :items="['public', 'private', 'restricted']"
                                label="Контроль доступа к API"
                                hint="Уровень доступа к API endpoints"
                                persistent-hint
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="settings.security.apiAllowedOrigins"
                                label="Разрешенные источники"
                                hint="Список разрешенных доменов через запятую"
                                persistent-hint
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-fade-transition>

              <!-- Секция интеграций -->
              <v-fade-transition>
                <div v-if="activeSection === 'integrations'" class="settings-section">
                  <v-row>
                    <v-col cols="12">
                      <v-card variant="outlined" class="mb-4">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-icon color="red">mdi-youtube</v-icon>
                          </template>
                          <v-card-title>YouTube</v-card-title>
                        </v-card-item>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" sm="6">
                              <v-switch
                                v-model="settings.integrations.youtube.enabled"
                                label="Включить интеграцию"
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="settings.integrations.youtube.updateInterval"
                                type="number"
                                label="Интервал обновления (минуты)"
                                :disabled="!settings.integrations.youtube.enabled"
                                min="1"
                              />
                            </v-col>
                          </v-row>
                          <v-row class="mt-2">
                            <v-col cols="12" class="d-flex gap-4">
                              <UiButton
                                variant="secondary"
                                size="small"
                                :disabled="!settings.integrations.youtube.enabled"
                              >
                                <template #icon>
                                  <v-icon>mdi-refresh</v-icon>
                                </template>
                                Обновить данные
                              </UiButton>
                              <UiButton
                                variant="danger"
                                size="small"
                                :disabled="!settings.integrations.youtube.enabled"
                              >
                                <template #icon>
                                  <v-icon>mdi-delete</v-icon>
                                </template>
                                Очистить кэш
                              </UiButton>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-icon color="primary">mdi-telegram</v-icon>
                          </template>
                          <v-card-title>Telegram</v-card-title>
                        </v-card-item>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" sm="6">
                              <v-switch
                                v-model="settings.integrations.telegram.enabled"
                                label="Включить интеграцию"
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-switch
                                v-model="settings.integrations.telegram.webhookEnabled"
                                label="Использовать webhook"
                                :disabled="!settings.integrations.telegram.enabled"
                              />
                            </v-col>
                          </v-row>
                          <v-row class="mt-2">
                            <v-col cols="12" class="d-flex gap-4">
                              <UiButton
                                variant="info"
                                size="small"
                                :disabled="!settings.integrations.telegram.enabled"
                              >
                                <template #icon>
                                  <v-icon>mdi-cog</v-icon>
                                </template>
                                Настроить webhook
                              </UiButton>
                              <UiButton
                                variant="success"
                                size="small"
                                :disabled="!settings.integrations.telegram.enabled"
                              >
                                <template #icon>
                                  <v-icon>mdi-test-tube</v-icon>
                                </template>
                                Тест соединения
                              </UiButton>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-fade-transition>

              <!-- Секция уведомлений -->
              <v-fade-transition>
                <div v-if="activeSection === 'notifications'" class="settings-section">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-card variant="outlined" class="mb-4">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-icon color="blue">mdi-email</v-icon>
                          </template>
                          <v-card-title>Email уведомления</v-card-title>
                        </v-card-item>
                        <v-card-text>
                          <v-switch
                            v-model="settings.notifications.email.enabled"
                            label="Включить email уведомления"
                            class="mb-4"
                          />
                          <v-text-field
                            v-model="settings.notifications.email.dailyLimit"
                            type="number"
                            label="Дневной лимит"
                            hint="Максимальное количество писем в день"
                            persistent-hint
                            :disabled="!settings.notifications.email.enabled"
                            min="1"
                          />
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-card variant="outlined">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-icon color="deep-purple">mdi-bell</v-icon>
                          </template>
                          <v-card-title>Push уведомления</v-card-title>
                        </v-card-item>
                        <v-card-text>
                          <v-switch
                            v-model="settings.notifications.push.enabled"
                            label="Включить push уведомления"
                            class="mb-4"
                          />
                          <v-text-field
                            v-model="settings.notifications.push.batchSize"
                            type="number"
                            label="Размер пакета"
                            hint="Количество уведомлений в одном пакете"
                            persistent-hint
                            :disabled="!settings.notifications.push.enabled"
                            min="1"
                          />
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-fade-transition>

              <!-- Секция производительности -->
              <v-fade-transition>
                <div v-if="activeSection === 'performance'" class="settings-section">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="settings.performance.cacheTimeout"
                        type="number"
                        label="Таймаут кэша (минуты)"
                        hint="Время хранения данных в кэше"
                        persistent-hint
                        min="1"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="settings.performance.itemsPerPage"
                        type="number"
                        label="Элементов на странице"
                        hint="Количество элементов при пагинации"
                        persistent-hint
                        min="10"
                        max="100"
                      />
                    </v-col>
                    <!-- Добавляем настройки производительности API -->
                    <v-col cols="12">
                      <v-card variant="outlined" class="mt-4">
                        <v-card-title class="d-flex align-center">
                          <v-icon start color="primary" class="me-2">mdi-api</v-icon>
                          Производительность API
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="settings.performance.apiRateLimit"
                                type="number"
                                label="Лимит запросов (в минуту)"
                                hint="Максимальное количество запросов к API"
                                persistent-hint
                                min="1"
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field
                                v-model="settings.performance.apiTimeout"
                                type="number"
                                label="Таймаут API (секунды)"
                                hint="Максимальное время ожидания ответа"
                                persistent-hint
                                min="1"
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-fade-transition>
            </v-container>
          </v-card-text>

          <!-- Уведомление об изменениях -->
          <v-expand-transition>
            <div v-if="hasAnyChanges" class="changes-alert">
              <v-alert
                type="warning"
                variant="tonal"
                class="ma-4"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                <div class="d-flex align-center justify-space-between flex-wrap">
                  <div>
                    <span class="text-subtitle-1 font-weight-medium">Есть несохраненные изменения</span>
                    <br>
                    <span class="text-body-2">Не забудьте сохранить изменения перед выходом</span>
                  </div>
                  <UiButton
                    variant="warning"
                    @click="saveAllSettings"
                    :loading="saving"
                    class="mt-2 mt-sm-0"
                  >
                    <template #icon>
                      <v-icon>mdi-content-save</v-icon>
                    </template>
                    Сохранить
                  </UiButton>
                </div>
              </v-alert>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

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
        :loading="systemSettingsStore.loading"
        hover
        density="compact"
        class="history-table"
        fixed-header
        height="400"
      >
        <template v-slot:item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            size="x-small"
            class="text-capitalize font-weight-medium"
            variant="flat"
          >
            {{ translateCategory(item.category) }}
          </v-chip>
        </template>

        <template v-slot:item.changes="{ item }">
          <div class="changes-summary">
            <template v-for="(change, key) in item.changes" :key="key">
              <div class="change-item">
                <span class="change-key">{{ key }}:</span>
                <template v-if="change.old !== undefined && change.new !== undefined">
                  <span class="change-value old">{{ JSON.stringify(change.old) }}</span>
                  <v-icon size="x-small" color="grey" class="mx-1">mdi-arrow-right</v-icon>
                  <span class="change-value new">{{ JSON.stringify(change.new) }}</span>
                </template>
                <template v-else>
                  <span class="change-value">{{ JSON.stringify(change) }}</span>
                </template>
              </div>
            </template>
          </div>
        </template>

        <template v-slot:item.updatedBy="{ item }">
          <div class="d-flex align-center">
            <v-icon size="x-small" color="grey" class="mr-1">mdi-account</v-icon>
            <span class="text-body-2">{{ formatUpdatedBy(item.updatedBy) }}</span>
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <div class="d-flex align-center">
            <v-icon size="x-small" color="grey" class="mr-1">mdi-clock-outline</v-icon>
            <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <UiButton
              variant="ghost"
              size="small"
              @click="showChanges(item)"
              class="mr-1"
            >
              <template #icon>
                <v-icon>mdi-eye</v-icon>
              </template>
            </UiButton>
            <UiButton
              variant="ghost"
              size="small"
              @click="restoreChanges(item)"
            >
              <template #icon>
                <v-icon>mdi-restore</v-icon>
              </template>
            </UiButton>
          </div>
        </template>

        <template v-slot:bottom>
          <div class="text-caption pa-2 text-grey">
            Всего записей: {{ settingsHistory.length }}
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог подтверждения отката -->
    <v-dialog v-model="rollbackDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Подтверждение отката
        </v-card-title>

        <v-card-text>
          Вы действительно хотите откатить настройки к этой версии? Это действие нельзя будет отменить.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <UiButton
            variant="ghost"
            @click="rollbackDialog = false"
          >
            Отмена
          </UiButton>
          <UiButton
            variant="warning"
            :loading="rolling"
            @click="executeRollback"
          >
            Откатить
          </UiButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра изменений -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center text-h6 pa-4 pb-2 bg-primary-lighten-5">
          <v-icon class="mr-2" :color="getCategoryColor(selectedItem?.category)">{{ getCategoryIcon(dialogTitle) }}</v-icon>
          {{ dialogTitle }}
          <v-spacer></v-spacer>
          <UiButton
            variant="ghost"
            size="small"
            @click="dialog = false"
          >
            <template #icon>
              <v-icon>mdi-close</v-icon>
            </template>
          </UiButton>
        </v-card-title>

        <v-card-subtitle class="pa-4 pt-2 d-flex align-center">
          <v-avatar size="32" color="grey-lighten-3" class="mr-2">
            <v-icon size="small">mdi-account</v-icon>
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="text-subtitle-2">{{ formatUpdatedBy(selectedItem?.updatedBy) }}</span>
            <span class="text-caption text-grey">
              <v-icon size="x-small" color="grey" class="mr-1">mdi-clock-outline</v-icon>
              {{ formatDate(selectedItem?.created_at) }}
            </span>
          </div>
        </v-card-subtitle>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <div v-if="Object.keys(dialogChanges).length === 0" class="text-center pa-4">
            <v-icon size="48" color="grey-lighten-1">mdi-alert</v-icon>
            <div class="text-h6 mt-2">Нет изменений</div>
            <div class="text-body-2 text-grey">В этой версии не было внесено изменений</div>
          </div>
          <div v-else class="changes-list">
            <template v-for="(value, key) in dialogChanges" :key="key">
              <div class="change-block mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" :color="getCategoryColor(selectedItem?.category)" class="mr-2">
                    {{ getSettingIcon(key) }}
                  </v-icon>
                  <span class="text-h6">{{ translateSettingName(key) }}</span>
                </div>

                <template v-if="typeof value === 'object' && value !== null">
                  <div v-if="value.old !== undefined && value.new !== undefined" class="changes-container">
                    <div class="change-row">
                      <div class="change-label">
                        <v-icon size="small" color="error" class="mr-1">mdi-minus-circle</v-icon>
                        Старое значение
                      </div>
                      <div class="change-value old pa-2">
                        {{ formatValue(value.old) }}
                      </div>
                    </div>
                    
                    <v-divider class="my-2"></v-divider>
                    
                    <div class="change-row">
                      <div class="change-label">
                        <v-icon size="small" color="success" class="mr-1">mdi-plus-circle</v-icon>
                        Новое значение
                      </div>
                      <div class="change-value new pa-2">
                        {{ formatValue(value.new) }}
                      </div>
                    </div>
                  </div>

                  <div v-else-if="value.type === 'removed'" class="removed-block">
                    <div class="change-label">
                      <v-icon size="small" color="warning" class="mr-1">mdi-delete</v-icon>
                      Удалено
                    </div>
                    <div class="change-value removed pa-2">
                      {{ formatValue(value.old) }}
                    </div>
                  </div>

                  <div v-else-if="value.type === 'added'" class="added-block">
                    <div class="change-label">
                      <v-icon size="small" color="info" class="mr-1">mdi-plus</v-icon>
                      Добавлено
                    </div>
                    <div class="change-value added pa-2">
                      {{ formatValue(value.new) }}
                    </div>
                  </div>
                </template>
              </div>
              <v-divider v-if="key !== Object.keys(dialogChanges).pop()" class="mb-4"></v-divider>
            </template>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            prepend-icon="mdi-restore"
            color="warning"
            variant="tonal"
            @click="confirmRollback(selectedItem)"
          >
            Откатить к этой версии
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Обновленный снэкбар -->
    <v-snackbar
      v-model="snackbarShow"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbarShow = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { useNotification } from '@/composables/useNotification'
import { formatDate } from '@/utils/date'
import UiButton from '@/components/ui/buttons/UiButton.vue'

export default {
  name: 'SystemSettings',
  
  components: {
    UiButton
  },
  
  setup() {
    const systemSettingsStore = useSystemSettingsStore()
    const saving = ref(false)
    const loading = ref(true)
    const search = ref('')
    const showChangesDialog = ref(false)
    const selectedChanges = ref({})
    const snackbarShow = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')
    const dialog = ref(false)
    const dialogTitle = ref('')
    const dialogContent = ref('')
    const rollbackDialog = ref(false)
    const rolling = ref(false)
    const selectedItem = ref(null)
    const dialogChanges = ref({})
    const activeSection = ref('security')
    const settingsSections = [
      {
        id: 'security',
        title: 'Безопасность',
        icon: 'mdi-shield-lock',
        color: 'red',
        description: 'Настройки безопасности и аутентификации'
      },
      {
        id: 'integrations',
        title: 'Интеграции',
        icon: 'mdi-connection',
        color: 'blue',
        description: 'Управление внешними интеграциями'
      },
      {
        id: 'notifications',
        title: 'Уведомления',
        icon: 'mdi-bell',
        color: 'green',
        description: 'Настройка системных уведомлений'
      },
      {
        id: 'performance',
        title: 'Производительность',
        icon: 'mdi-speedometer',
        color: 'orange',
        description: 'Оптимизация производительности системы'
      }
    ]

    // Создаем реактивный объект settings с начальной структурой
    const settings = reactive({
      security: {
        maxLoginAttempts: 5,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 30,
        requireTwoFactor: false,
        apiAccessControl: 'public',
        apiAllowedOrigins: ''
      },
      integrations: {
        youtube: {
          enabled: false,
          updateInterval: 30
        },
        telegram: {
          enabled: false,
          webhookEnabled: false
        }
      },
      notifications: {
        email: {
          enabled: false,
          dailyLimit: 1000
        },
        push: {
          enabled: false,
          batchSize: 100
        }
      },
      performance: {
        cacheTimeout: 60,
        itemsPerPage: 20,
        apiRateLimit: 10,
        apiTimeout: 10
      }
    })

    // Сохраняем предыдущее состояние настроек для отслеживания изменений
    const previousSettings = ref(null)

    // Проверка наличия изменений в разделе
    const hasChanges = (sectionId) => {
      if (!previousSettings.value) return false
      return JSON.stringify(settings[sectionId]) !== JSON.stringify(previousSettings.value[sectionId])
    }

    // Проверка наличия любых изменений
    const hasAnyChanges = computed(() => {
      if (!previousSettings.value) return false
      return Object.keys(settings).some(hasChanges)
    })

    const historyHeaders = [
      { 
        title: 'Категория',
        key: 'category',
        align: 'start',
        sortable: true,
        width: '120px'
      },
      {
        title: 'Изменения',
        key: 'changes',
        align: 'start',
        sortable: false,
        width: '400px'
      },
      { 
        title: 'Изменено',
        key: 'updatedBy',
        align: 'start',
        sortable: false,
        width: '150px'
      },
      { 
        title: 'Дата',
        key: 'created_at',
        align: 'start',
        sortable: true,
        width: '180px'
      },
      { 
        title: 'Действия',
        key: 'actions',
        align: 'end',
        sortable: false,
        width: '100px'
      }
    ]

    const settingsHistory = ref([])

    // Методы
    const showSnackbar = (text, color = 'success') => {
      snackbarText.value = text
      snackbarColor.value = color
      snackbarShow.value = true
    }

    const formatUpdatedBy = (user) => {
      if (!user) return 'Система'
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`
      }
      if (user.firstName) {
        return user.firstName
      }
      if (user.email) {
        return user.email
      }
      return 'Система'
    }

    const loadSettings = async () => {
      try {
        console.log('Загрузка настроек...')
        const data = await systemSettingsStore.getAllSettings()
        console.log('Полученные настройки:', data)
        console.log('Текущее состояние settings:', settings)
        
        if (data && typeof data === 'object') {
          // Обновляем настройки из БД
          Object.keys(settings).forEach(category => {
            if (data[category]) {
              console.log(`Обновление категории ${category}:`, data[category])
              Object.assign(settings[category], data[category])
            }
          })
          
          console.log('Обновленное состояние settings:', settings)
          
          // Сохраняем текущее состояние для отслеживания изменений
          previousSettings.value = JSON.parse(JSON.stringify(settings))
          return true
        } else {
          console.warn('Данные настроек пусты или некорректны:', data)
          showSnackbar('Не удалось загрузить настройки', 'warning')
          return false
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error)
        showSnackbar('Ошибка при загрузке настроек', 'error')
        return false
      }
    }

    const loadHistory = async () => {
      try {
        const response = await systemSettingsStore.getHistory()
        
        if (response.success) {
          settingsHistory.value = response.data.map(item => ({
            id: item.id || '',
            category: item.category || 'unknown',
            changes: item.changes || {},
            created_at: item.created_at || new Date().toISOString(),
            updatedBy: item.updatedBy || {
              id: 'system',
              email: 'system@example.com',
              firstName: 'Система',
              lastName: ''
            }
          }))
          return true
        } else {
          console.warn('Ошибка при загрузке истории:', response.error)
          settingsHistory.value = []
          showSnackbar('Ошибка при загрузке истории', 'error')
          return false
        }
      } catch (error) {
        console.error('Ошибка загрузки истории:', error)
        settingsHistory.value = []
        showSnackbar('Ошибка при загрузке истории', 'error')
        return false
      }
    }

    const saveAllSettings = async () => {
      if (!previousSettings.value) return

      try {
        // Создаем объект изменений
        const changes = {}
        for (const [key, value] of Object.entries(settings)) {
          if (JSON.stringify(previousSettings.value[key]) !== JSON.stringify(value)) {
            changes[key] = {
              old: previousSettings.value[key],
              new: value
            }
          }
        }

        // Если нет изменений, показываем сообщение
        if (Object.keys(changes).length === 0) {
          snackbarColor.value = 'warning'
          snackbarText.value = 'Нет изменений для сохранения'
          showSnackbar.value = true
          return
        }

        console.log('Сохраняем изменения:', changes)

        // Отправляем изменения на сервер
        const response = await systemSettingsStore.saveSettings({
          settings: settings,
          changes: changes,
          description: 'Обновление настроек системы'
        })

        if (response.success) {
          // Обновляем предыдущее состояние
          previousSettings.value = JSON.parse(JSON.stringify(settings))
          
          // Обновляем историю
          await Promise.all([
            loadSettings(),
            loadHistory()
          ])

          snackbarColor.value = 'success'
          snackbarText.value = 'Настройки успешно сохранены'
        } else {
          throw new Error(response.error || 'Ошибка при сохранении настроек')
        }
      } catch (error) {
        console.error('Ошибка при сохранении настроек:', error)
        snackbarColor.value = 'error'
        snackbarText.value = error.message || 'Ошибка при сохранении настроек'
      }
      
      showSnackbar.value = true
    }

    const showChanges = (item) => {
      console.log('Показываем изменения:', {
        item,
        changes: item.changes
      })
      
      selectedItem.value = item
      dialogChanges.value = item.changes || {}
      dialogTitle.value = translateCategory(item.category)
      dialog.value = true
    }

    const translateCategory = (category) => {
      const translations = {
        security: 'Безопасность',
        integrations: 'Интеграции',
        notifications: 'Уведомления',
        performance: 'Производительность',
        history: 'История'
      }
      return translations[category] || category
    }

    const confirmRollback = (item) => {
      selectedItem.value = item
      rollbackDialog.value = true
    }

    const executeRollback = async () => {
      if (!selectedItem.value) return

      rolling.value = true
      try {
        await systemSettingsStore.rollbackSettings(selectedItem.value.id)
        rollbackDialog.value = false
        showSnackbar('Настройки успешно откачены')
        await loadHistory()
        await loadSettings()
      } catch (error) {
        console.error('Ошибка отката настроек:', error)
        showSnackbar('Ошибка при откате настроек', 'error')
      } finally {
        rolling.value = false
        selectedItem.value = null
      }
    }

    const formatChanges = (changes) => {
      if (!changes || typeof changes !== 'object') {
        return 'Нет данных об изменениях'
      }

      const summaries = []
      for (const [key, value] of Object.entries(changes)) {
        if (typeof value === 'object' && value !== null) {
          if (value.old !== undefined && value.new !== undefined) {
            const oldValue = typeof value.old === 'object' ? JSON.stringify(value.old) : value.old
            const newValue = typeof value.new === 'object' ? JSON.stringify(value.new) : value.new
            summaries.push(`${key}: ${oldValue} ➔ ${newValue}`)
          } else if (Object.keys(value).length > 0) {
            summaries.push(`${key}: ${JSON.stringify(value)}`)
          }
        }
      }

      if (summaries.length === 0) {
        return 'Нет изменений'
      }

      // Форматируем каждое изменение на новой строке
      return summaries.map(summary => {
        if (summary.length > 70) {
          return summary.slice(0, 67) + '...'
        }
        return summary
      }).join('\n')
    }

    const formatDate = (date) => {
      if (!date) {
        console.log('Empty date received:', date) // Добавляем для отладки
        return 'Не указано'
      }
      
      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          console.error('Некорректная дата:', date)
          return 'Некорректная дата'
        }
        
        const formattedDate = new Intl.DateTimeFormat('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(dateObj)
        
        return formattedDate
      } catch (error) {
        console.error('Ошибка форматирования даты:', error, date)
        return 'Ошибка даты'
      }
    }

    const getCategoryColor = (category) => {
      const colors = {
        security: 'red',
        integrations: 'blue',
        notifications: 'green',
        performance: 'orange',
        history: 'purple'
      }
      return colors[category] || 'grey'
    }

    const getCategoryIcon = (category) => {
      const icons = {
        'Безопасность': 'mdi-shield-lock',
        'Интеграции': 'mdi-connection',
        'Уведомления': 'mdi-bell',
        'Производительность': 'mdi-speedometer'
      }
      return icons[category] || 'mdi-cog'
    }

    const translateSettingName = (key) => {
      const translations = {
        security: 'Безопасность',
        integrations: 'Интеграции',
        notifications: 'Уведомления',
        performance: 'Производительность',
        maxLoginAttempts: 'Максимальное количество попыток входа',
        passwordExpiryDays: 'Срок действия пароля',
        sessionTimeoutMinutes: 'Таймаут сессии',
        requireTwoFactor: 'Двухфакторная аутентификация',
        youtube: 'YouTube интеграция',
        telegram: 'Telegram интеграция',
        email: 'Email уведомления',
        push: 'Push уведомления',
        cacheTimeout: 'Таймаут кэша',
        itemsPerPage: 'Элементов на странице',
        enabled: 'Включено',
        updateInterval: 'Интервал обновления',
        webhookEnabled: 'Webhook включен',
        dailyLimit: 'Дневной лимит',
        batchSize: 'Размер пакета',
        apiAccessControl: 'Контроль доступа к API',
        apiAllowedOrigins: 'Разрешенные источники'
      }
      return translations[key] || key
    }

    const formatValue = (value) => {
      if (value === undefined || value === null) {
        return '—'
      }
      if (typeof value === 'boolean') {
        return value ? 'Да' : 'Нет'
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    }

    const getSettingIcon = (key) => {
      const icons = {
        maxLoginAttempts: 'mdi-shield-key',
        passwordExpiryDays: 'mdi-key-clock',
        sessionTimeoutMinutes: 'mdi-timer-sand',
        requireTwoFactor: 'mdi-two-factor-authentication',
        youtube: 'mdi-youtube',
        telegram: 'mdi-telegram',
        email: 'mdi-email',
        push: 'mdi-bell',
        cacheTimeout: 'mdi-timer',
        itemsPerPage: 'mdi-format-list-numbered',
        apiAccessControl: 'mdi-shield-key',
        apiAllowedOrigins: 'mdi-link'
      }
      return icons[key] || 'mdi-cog'
    }

    // Получение текущего раздела
    const getCurrentSection = computed(() => {
      return settingsSections.find(section => section.id === activeSection.value) || settingsSections[0]
    })

    // Инициализация данных
    const initializeData = async () => {
      loading.value = true
      try {
        console.log('Начало инициализации...')
        await Promise.all([
          loadSettings(),
          loadHistory()
        ])
        console.log('Инициализация завершена')
      } catch (error) {
        console.error('Ошибка инициализации компонента:', error)
        showSnackbar('Ошибка загрузки данных', 'error')
      } finally {
        loading.value = false
      }
    }

    // Вызываем инициализацию при монтировании
    onMounted(() => {
      initializeData()
    })

    return {
      saving,
      loading,
      search,
      settings,
      historyHeaders,
      settingsHistory,
      showChangesDialog,
      selectedChanges,
      saveAllSettings,
      showChanges,
      getCategoryColor,
      formatDate,
      formatUpdatedBy,
      snackbarShow,
      snackbarText,
      snackbarColor,
      formatChanges,
      dialog,
      dialogTitle,
      dialogContent,
      rollbackDialog,
      rolling,
      selectedItem,
      dialogChanges,
      translateCategory,
      confirmRollback,
      executeRollback,
      getCategoryIcon,
      translateSettingName,
      formatValue,
      getSettingIcon,
      activeSection,
      settingsSections,
      getCurrentSection,
      hasChanges,
      hasAnyChanges,
      systemSettingsStore
    }
  }
}
</script>

<style scoped>
.history-table {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 8px;
}

:deep(.v-data-table-header) {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

:deep(.v-data-table-header th) {
  height: 40px !important;
  padding: 0 12px !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

:deep(.v-data-table__tr) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
}

:deep(.v-data-table__tr td) {
  height: 40px !important;
  padding: 4px 12px !important;
  font-size: 0.875rem !important;
}

.changes-summary {
  max-width: 100%;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8125rem;
}

.change-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 2px 0;
}

.change-key {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-right: 4px;
  font-weight: 500;
}

.change-value {
  color: rgba(var(--v-theme-on-surface), 0.87);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8125rem;
}

.change-value.old {
  color: rgba(var(--v-theme-error), 0.87);
  text-decoration: line-through;
}

.change-value.new {
  color: rgba(var(--v-theme-success), 0.87);
}

:deep(.v-chip) {
  font-size: 0.75rem !important;
}

:deep(.v-btn--density-compact) {
  width: 24px !important;
  height: 24px !important;
}

:deep(.v-btn--density-compact .v-icon) {
  font-size: 16px !important;
}

.changes-container {
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 8px;
}

.change-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.v-alert) {
  margin-bottom: 0;
}

:deep(.v-list-item-subtitle) {
  white-space: normal;
  overflow: visible;
}

.text-h6 {
  font-size: 1rem !important;
  font-weight: 500;
}

.removed-value .change-value,
.old-value .change-value {
  text-decoration: line-through;
  opacity: 0.7;
}

.added-value .change-value,
.new-value .change-value {
  font-weight: 500;
}

.changes-list {
  max-width: 100%;
}

.change-block {
  background: rgba(var(--v-theme-surface-variant), 0.02);
  border-radius: 8px;
}

.change-row {
  margin-bottom: 8px;
}

.change-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 4px;
}

.change-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.change-value.old {
  background: rgba(var(--v-theme-error), 0.05);
  color: rgba(var(--v-theme-error), 0.87);
}

.change-value.new {
  background: rgba(var(--v-theme-success), 0.05);
  color: rgba(var(--v-theme-success), 0.87);
}

.change-value.removed {
  background: rgba(var(--v-theme-warning), 0.05);
  color: rgba(var(--v-theme-warning), 0.87);
  text-decoration: line-through;
}

.change-value.added {
  background: rgba(var(--v-theme-info), 0.05);
  color: rgba(var(--v-theme-info), 0.87);
}

.text-h6 {
  font-size: 1rem !important;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

:deep(.v-card-title) {
  line-height: 1.5;
}

:deep(.v-card-subtitle) {
  opacity: 1;
}

.settings-nav {
  position: sticky;
  top: 1rem;
}

.settings-nav-item {
  margin-bottom: 4px;
}

.settings-nav-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.settings-nav-item.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.settings-section {
  animation: fade-in 0.3s ease-in-out;
}

.changes-alert {
  animation: slide-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gap-4 {
  gap: 1rem !important;
}

.w-100 {
  width: 100%;
}
</style> 