<template>
  <v-container>
    <v-card>
      <v-card-title>
        Настройки уведомлений
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="saveSettings"
          :loading="saving"
        >
          Сохранить изменения
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Каналы уведомлений -->
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              Каналы уведомлений
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <!-- Email уведомления -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon start>mdi-email</v-icon>
                      Email уведомления
                      <v-spacer></v-spacer>
                      <v-switch
                        v-model="settings.channels.email.enabled"
                        hide-details
                      ></v-switch>
                    </v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="settings.channels.email.address"
                        label="Email адрес"
                        :disabled="!settings.channels.email.enabled"
                      ></v-text-field>
                      <v-select
                        v-model="settings.channels.email.frequency"
                        :items="emailFrequencies"
                        label="Частота отправки"
                        :disabled="!settings.channels.email.enabled"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Push уведомления -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon start>mdi-bell</v-icon>
                      Push уведомления
                      <v-spacer></v-spacer>
                      <v-switch
                        v-model="settings.channels.push.enabled"
                        hide-details
                      ></v-switch>
                    </v-card-title>
                    <v-card-text>
                      <v-checkbox
                        v-model="settings.channels.push.desktop"
                        label="Разрешить на десктопе"
                        :disabled="!settings.channels.push.enabled"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="settings.channels.push.mobile"
                        label="Разрешить на мобильных устройствах"
                        :disabled="!settings.channels.push.enabled"
                      ></v-checkbox>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Telegram уведомления -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon start>mdi-telegram</v-icon>
                      Telegram уведомления
                      <v-spacer></v-spacer>
                      <v-switch
                        v-model="settings.channels.telegram.enabled"
                        hide-details
                      ></v-switch>
                    </v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="settings.channels.telegram.username"
                        label="Telegram username"
                        :disabled="!settings.channels.telegram.enabled"
                      ></v-text-field>
                      <v-btn
                        color="primary"
                        block
                        :disabled="!settings.channels.telegram.enabled"
                        @click="connectTelegram"
                        :loading="connecting"
                      >
                        Подключить Telegram
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Типы уведомлений -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              Типы уведомлений
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6" v-for="type in notificationTypes" :key="type.value">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon start>{{ type.icon }}</v-icon>
                      {{ type.title }}
                      <v-spacer></v-spacer>
                      <v-switch
                        v-model="settings.types[type.value].enabled"
                        hide-details
                      ></v-switch>
                    </v-card-title>
                    <v-card-text>
                      <v-select
                        v-model="settings.types[type.value].channels"
                        :items="availableChannels"
                        label="Каналы уведомлений"
                        multiple
                        chips
                        :disabled="!settings.types[type.value].enabled"
                      ></v-select>
                      <v-select
                        v-model="settings.types[type.value].importance"
                        :items="importanceLevels"
                        label="Важность"
                        :disabled="!settings.types[type.value].enabled"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Расписание -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              Расписание уведомлений
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title>Тихие часы</v-card-title>
                    <v-card-text>
                      <v-checkbox
                        v-model="settings.schedule.quietHours.enabled"
                        label="Включить тихие часы"
                      ></v-checkbox>
                      <v-row v-if="settings.schedule.quietHours.enabled">
                        <v-col cols="6">
                          <v-text-field
                            v-model="settings.schedule.quietHours.start"
                            label="Начало"
                            type="time"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="settings.schedule.quietHours.end"
                            label="Конец"
                            type="time"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title>Дни недели</v-card-title>
                    <v-card-text>
                      <v-checkbox
                        v-for="day in weekDays"
                        :key="day.value"
                        v-model="settings.schedule.days[day.value]"
                        :label="day.label"
                      ></v-checkbox>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'NotificationSettings',
  setup() {
    const notificationStore = useNotificationStore()
    const saving = ref(false)
    const connecting = ref(false)

    const settings = reactive({
      channels: {
        email: {
          enabled: false,
          address: '',
          frequency: 'instant'
        },
        push: {
          enabled: false,
          desktop: true,
          mobile: true
        },
        telegram: {
          enabled: false,
          username: ''
        }
      },
      types: {
        system: {
          enabled: true,
          channels: ['push'],
          importance: 'normal'
        },
        contest: {
          enabled: true,
          channels: ['email', 'push'],
          importance: 'high'
        },
        platform: {
          enabled: true,
          channels: ['push'],
          importance: 'low'
        },
        security: {
          enabled: true,
          channels: ['email', 'push', 'telegram'],
          importance: 'critical'
        }
      },
      schedule: {
        quietHours: {
          enabled: false,
          start: '23:00',
          end: '07:00'
        },
        days: {
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: true,
          sun: true
        }
      }
    })

    const emailFrequencies = [
      { title: 'Мгновенно', value: 'instant' },
      { title: 'Ежечасно', value: 'hourly' },
      { title: 'Ежедневно', value: 'daily' },
      { title: 'Еженедельно', value: 'weekly' }
    ]

    const notificationTypes = [
      { title: 'Системные', value: 'system', icon: 'mdi-cog' },
      { title: 'Конкурсы', value: 'contest', icon: 'mdi-trophy' },
      { title: 'Платформы', value: 'platform', icon: 'mdi-connection' },
      { title: 'Безопасность', value: 'security', icon: 'mdi-shield' }
    ]

    const availableChannels = [
      { title: 'Email', value: 'email' },
      { title: 'Push', value: 'push' },
      { title: 'Telegram', value: 'telegram' }
    ]

    const importanceLevels = [
      { title: 'Низкая', value: 'low' },
      { title: 'Нормальная', value: 'normal' },
      { title: 'Высокая', value: 'high' },
      { title: 'Критическая', value: 'critical' }
    ]

    const weekDays = [
      { label: 'Понедельник', value: 'mon' },
      { label: 'Вторник', value: 'tue' },
      { label: 'Среда', value: 'wed' },
      { label: 'Четверг', value: 'thu' },
      { label: 'Пятница', value: 'fri' },
      { label: 'Суббота', value: 'sat' },
      { label: 'Воскресенье', value: 'sun' }
    ]

    // Методы
    const saveSettings = async () => {
      saving.value = true
      try {
        await notificationStore.updateSettings(notificationStore.notificationSettings)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to save notification settings:', error)
        // Показать уведомление об ошибке
      } finally {
        saving.value = false
      }
    }

    const connectTelegram = async () => {
      connecting.value = true
      try {
        await notificationStore.connectTelegram(settings.channels.telegram.username)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to connect Telegram:', error)
        // Показать уведомление об ошибке
      } finally {
        connecting.value = false
      }
    }

    return {
      saving,
      connecting,
      settings,
      emailFrequencies,
      notificationTypes,
      availableChannels,
      importanceLevels,
      weekDays,
      saveSettings,
      connectTelegram
    }
  }
}
</script> 