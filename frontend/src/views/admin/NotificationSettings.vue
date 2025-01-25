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
          Сохранить
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Email уведомления -->
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-email</v-icon>
              Email уведомления
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.email.smtpHost"
                    label="SMTP Host"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.email.smtpPort"
                    label="SMTP Port"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.email.username"
                    label="Email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.email.password"
                    label="Пароль"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    color="info"
                    @click="testEmailConnection"
                    :loading="testingEmail"
                  >
                    Проверить соединение
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Push уведомления -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-bell</v-icon>
              Push уведомления
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.push.fcmKey"
                    label="Firebase Cloud Messaging Key"
                    :type="showFcmKey ? 'text' : 'password'"
                    :append-icon="showFcmKey ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showFcmKey = !showFcmKey"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    color="info"
                    @click="testPushNotification"
                    :loading="testingPush"
                  >
                    Отправить тестовое уведомление
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Шаблоны уведомлений -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-file-document</v-icon>
              Шаблоны уведомлений
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-tabs v-model="activeTemplate">
                <v-tab value="welcome">Приветствие</v-tab>
                <v-tab value="newContest">Новый конкурс</v-tab>
                <v-tab value="reminder">Напоминание</v-tab>
              </v-tabs>

              <v-window v-model="activeTemplate">
                <v-window-item value="welcome">
                  <v-textarea
                    v-model="settings.templates.welcome"
                    label="Шаблон приветственного письма"
                    rows="10"
                    hint="Доступные переменные: {userName}, {siteName}"
                  ></v-textarea>
                </v-window-item>
                
                <v-window-item value="newContest">
                  <v-textarea
                    v-model="settings.templates.newContest"
                    label="Шаблон уведомления о новом конкурсе"
                    rows="10"
                    hint="Доступные переменные: {contestName}, {prize}, {endDate}"
                  ></v-textarea>
                </v-window-item>

                <v-window-item value="reminder">
                  <v-textarea
                    v-model="settings.templates.reminder"
                    label="Шаблон напоминания"
                    rows="10"
                    hint="Доступные переменные: {contestName}, {daysLeft}"
                  ></v-textarea>
                </v-window-item>
              </v-window>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'

export default {
  name: 'NotificationSettings',
  setup() {
    const adminStore = useAdminStore()
    const saving = ref(false)
    const testingEmail = ref(false)
    const testingPush = ref(false)
    const showPassword = ref(false)
    const showFcmKey = ref(false)
    const activeTemplate = ref('welcome')

    const settings = reactive({
      email: {
        smtpHost: '',
        smtpPort: 587,
        username: '',
        password: ''
      },
      push: {
        fcmKey: ''
      },
      templates: {
        welcome: '',
        newContest: '',
        reminder: ''
      }
    })

    // Методы
    const saveSettings = async () => {
      saving.value = true
      try {
        await adminStore.updateNotificationSettings(notificationStore.notificationSettings)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to save notification settings:', error)
        // Показать уведомление об ошибке
      } finally {
        saving.value = false
      }
    }

    const testEmailConnection = async () => {
      testingEmail.value = true
      try {
        await adminStore.testEmailConnection(settings.email)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to test email connection:', error)
        // Показать уведомление об ошибке
      } finally {
        testingEmail.value = false
      }
    }

    const testPushNotification = async () => {
      testingPush.value = true
      try {
        await adminStore.testPushNotification(settings.push)
        // Показать уведомление об успехе
      } catch (error) {
        console.error('Failed to test push notification:', error)
        // Показать уведомление об ошибке
      } finally {
        testingPush.value = false
      }
    }

    return {
      saving,
      testingEmail,
      testingPush,
      showPassword,
      showFcmKey,
      activeTemplate,
      settings,
      saveSettings,
      testEmailConnection,
      testPushNotification
    }
  }
}
</script> 