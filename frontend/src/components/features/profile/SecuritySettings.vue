<template>
  <v-container>
    <v-row>
      <!-- Смена пароля -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start color="primary">mdi-lock</v-icon>
            Смена пароля
          </v-card-title>
          
          <v-card-text>
            <v-form ref="passwordForm" v-model="passwordValid">
              <v-text-field
                v-model="passwords.current"
                label="Текущий пароль"
                :type="showPasswords.current ? 'text' : 'password'"
                :append-icon="showPasswords.current ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPasswords.current = !showPasswords.current"
                :rules="[v => !!v || 'Обязательное поле']"
              ></v-text-field>

              <v-text-field
                v-model="passwords.new"
                label="Новый пароль"
                :type="showPasswords.new ? 'text' : 'password'"
                :append-icon="showPasswords.new ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPasswords.new = !showPasswords.new"
                :rules="passwordRules"
              ></v-text-field>

              <v-text-field
                v-model="passwords.confirm"
                label="Подтверждение пароля"
                :type="showPasswords.confirm ? 'text' : 'password'"
                :append-icon="showPasswords.confirm ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPasswords.confirm = !showPasswords.confirm"
                :rules="[
                  v => !!v || 'Обязательное поле',
                  v => v === passwords.new || 'Пароли не совпадают'
                ]"
              ></v-text-field>

              <v-btn
                block
                color="primary"
                @click="changePassword"
                :loading="changingPassword"
                :disabled="!passwordValid"
              >
                Изменить пароль
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Двухфакторная аутентификация -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start color="primary">mdi-shield-lock</v-icon>
            Двухфакторная аутентификация
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="!twoFactor.enabled"
              type="warning"
              text="Рекомендуется включить двухфакторную аутентификацию для повышения безопасности аккаунта"
            ></v-alert>

            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h6">Статус</div>
                <div class="text-subtitle-1">
                  {{ twoFactor.enabled ? 'Включено' : 'Отключено' }}
                </div>
              </div>
              <v-btn
                :color="twoFactor.enabled ? 'error' : 'success'"
                @click="toggleTwoFactor"
                :loading="togglingTwoFactor"
              >
                {{ twoFactor.enabled ? 'Отключить' : 'Включить' }}
              </v-btn>
            </div>

            <template v-if="showQRCode">
              <div class="text-center mb-4">
                <img :src="twoFactor.qrCode" alt="QR Code" class="qr-code">
                <div class="text-caption mt-2">
                  Отсканируйте QR-код с помощью приложения аутентификации
                </div>
              </div>

              <v-text-field
                v-model="twoFactor.code"
                label="Код подтверждения"
                :rules="[v => !!v || 'Введите код']"
                maxlength="6"
                class="mb-4"
              ></v-text-field>

              <v-btn
                block
                color="primary"
                @click="verifyTwoFactor"
                :loading="verifyingCode"
                :disabled="!twoFactor.code"
              >
                Подтвердить
              </v-btn>
            </template>

            <template v-if="twoFactor.enabled">
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    Резервные коды
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="text-caption mb-2">
                      Сохраните эти коды в надежном месте. Они позволят вам войти в аккаунт, если вы потеряете доступ к приложению аутентификации.
                    </div>
                    <v-list density="compact">
                      <v-list-item
                        v-for="code in twoFactor.backupCodes"
                        :key="code"
                        :title="code"
                      ></v-list-item>
                    </v-list>
                    <v-btn
                      block
                      variant="outlined"
                      color="primary"
                      class="mt-4"
                      @click="generateNewBackupCodes"
                      :loading="generatingCodes"
                    >
                      Сгенерировать новые коды
                    </v-btn>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- История входов -->
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start color="primary">mdi-history</v-icon>
            История входов
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="loginHistoryHeaders"
              :items="loginHistory"
              :loading="loadingHistory"
            >
              <template v-slot:item.device="{ item }">
                <v-icon :icon="getDeviceIcon(item.device)" class="mr-2"></v-icon>
                {{ item.device }}
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="item.status === 'success' ? 'success' : 'error'"
                  size="small"
                >
                  {{ item.status === 'success' ? 'Успешно' : 'Неудачно' }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'SecuritySettings',
  
  setup() {
    const userStore = useUserStore()
    const passwordForm = ref(null)
    const passwordValid = ref(false)
    const changingPassword = ref(false)
    const togglingTwoFactor = ref(false)
    const verifyingCode = ref(false)
    const generatingCodes = ref(false)
    const loadingHistory = ref(false)
    const showQRCode = ref(false)

    const passwords = reactive({
      current: '',
      new: '',
      confirm: ''
    })

    const showPasswords = reactive({
      current: false,
      new: false,
      confirm: false
    })

    const twoFactor = reactive({
      enabled: false,
      qrCode: null,
      code: '',
      backupCodes: []
    })

    const passwordRules = [
      v => !!v || 'Обязательное поле',
      v => v.length >= 8 || 'Минимум 8 символов',
      v => /[A-Z]/.test(v) || 'Минимум 1 заглавная буква',
      v => /[0-9]/.test(v) || 'Минимум 1 цифра',
      v => /[!@#$%^&*]/.test(v) || 'Минимум 1 спецсимвол'
    ]

    const loginHistoryHeaders = [
      { title: 'Дата', key: 'timestamp', align: 'start', sortable: true },
      { title: 'IP адрес', key: 'ip', align: 'start' },
      { title: 'Устройство', key: 'device', align: 'start' },
      { title: 'Местоположение', key: 'location', align: 'start' },
      { title: 'Статус', key: 'status', align: 'center' }
    ]

    const loginHistory = ref([])

    // Методы
    const changePassword = async () => {
      if (!passwordValid.value) return

      changingPassword.value = true
      try {
        await userStore.changePassword(passwords)
        // Очистка формы
        passwords.current = ''
        passwords.new = ''
        passwords.confirm = ''
        passwordForm.value?.reset()
      } catch (error) {
        console.error('Failed to change password:', error)
      } finally {
        changingPassword.value = false
      }
    }

    const toggleTwoFactor = async () => {
      togglingTwoFactor.value = true
      try {
        if (!twoFactor.enabled) {
          const response = await userStore.enableTwoFactor()
          twoFactor.qrCode = response.qrCode
          showQRCode.value = true
        } else {
          await userStore.disableTwoFactor()
          twoFactor.enabled = false
          twoFactor.backupCodes = []
        }
      } catch (error) {
        console.error('Failed to toggle 2FA:', error)
      } finally {
        togglingTwoFactor.value = false
      }
    }

    const verifyTwoFactor = async () => {
      verifyingCode.value = true
      try {
        const response = await userStore.verifyTwoFactor(twoFactor.code)
        twoFactor.enabled = true
        twoFactor.backupCodes = response.backupCodes
        showQRCode.value = false
      } catch (error) {
        console.error('Failed to verify 2FA:', error)
      } finally {
        verifyingCode.value = false
        twoFactor.code = ''
      }
    }

    const generateNewBackupCodes = async () => {
      generatingCodes.value = true
      try {
        const response = await userStore.generateBackupCodes()
        twoFactor.backupCodes = response.backupCodes
      } catch (error) {
        console.error('Failed to generate backup codes:', error)
      } finally {
        generatingCodes.value = false
      }
    }

    const loadLoginHistory = async () => {
      loadingHistory.value = true
      try {
        loginHistory.value = await userStore.getLoginHistory()
      } catch (error) {
        console.error('Failed to load login history:', error)
      } finally {
        loadingHistory.value = false
      }
    }

    const getDeviceIcon = (device) => {
      const icons = {
        desktop: 'mdi-desktop-classic',
        mobile: 'mdi-cellphone',
        tablet: 'mdi-tablet'
      }
      return icons[device.toLowerCase()] || 'mdi-devices'
    }

    // При монтировании
    onMounted(() => {
      loadLoginHistory()
    })

    return {
      passwordForm,
      passwordValid,
      changingPassword,
      togglingTwoFactor,
      verifyingCode,
      generatingCodes,
      loadingHistory,
      showQRCode,
      passwords,
      showPasswords,
      twoFactor,
      passwordRules,
      loginHistoryHeaders,
      loginHistory,
      changePassword,
      toggleTwoFactor,
      verifyTwoFactor,
      generateNewBackupCodes,
      getDeviceIcon
    }
  }
}
</script>

<style scoped>
.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto;
}
</style> 