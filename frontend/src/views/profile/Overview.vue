/**
 * Компонент обзора профиля
 * Отображает основную информацию о пользователе
 */
<template>
  <v-card flat color="background">
    <v-card-text>
      <!-- Последняя активность -->
      <v-expansion-panels v-model="panel">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon start>mdi-history</v-icon>
            История активности
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <!-- Статистика -->
            <v-row class="mb-6">
              <v-col cols="12" md="4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 2 : 0"
                    :color="isHovering ? 'primary' : 'surface'"
                    class="pa-4 transition-fast-in-fast-out"
                  >
                    <div :class="['text-h4 mb-1', isHovering ? 'text-white' : '']">
                      {{ stats.contests }}
                    </div>
                    <div :class="['text-caption', isHovering ? 'text-white' : 'text-medium-emphasis']">
                      КОНКУРСЫ
                    </div>
                  </v-card>
                </v-hover>
              </v-col>

              <v-col cols="12" md="4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 2 : 0"
                    :color="isHovering ? 'primary' : 'surface'"
                    class="pa-4 transition-fast-in-fast-out"
                  >
                    <div :class="['text-h4 mb-1', isHovering ? 'text-white' : '']">
                      {{ stats.drafts }}
                    </div>
                    <div :class="['text-caption', isHovering ? 'text-white' : 'text-medium-emphasis']">
                      ЧЕРНОВИКИ
                    </div>
                  </v-card>
                </v-hover>
              </v-col>

              <v-col cols="12" md="4">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 2 : 0"
                    :color="isHovering ? 'primary' : 'surface'"
                    class="pa-4 transition-fast-in-fast-out"
                  >
                    <div :class="['text-h4 mb-1', isHovering ? 'text-white' : '']">
                      {{ formatDate(lastLogin) }}
                    </div>
                    <div :class="['text-caption', isHovering ? 'text-white' : 'text-medium-emphasis']">
                      ПОСЛЕДНИЙ ВХОД
                    </div>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>

            <v-list lines="two">
              <v-list-item
                v-for="(activity, index) in recentActivity"
                :key="index"
                :subtitle="formatDate(activity.date)"
              >
                <template v-slot:prepend>
                  <v-icon :icon="getActivityIcon(activity.type)" :color="getActivityColor(activity.type)"></v-icon>
                </template>
                {{ activity.description }}
              </v-list-item>

              <v-list-item v-if="!recentActivity.length">
                <template v-slot:prepend>
                  <v-icon icon="mdi-information"></v-icon>
                </template>
                Нет недавней активности
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Основная информация -->
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon start color="primary">mdi-account-cog</v-icon>
            Основные настройки
          </v-card-title>
          
          <v-card-text>
            <v-form ref="profileForm" v-model="formValid">
              <!-- Аватар -->
              <div class="d-flex align-center mb-6">
                <v-avatar size="100" class="mr-4">
                  <v-img :src="avatar || '/default-avatar.png'" alt="Аватар"></v-img>
                </v-avatar>
                <div>
                  <v-file-input
                    v-model="newAvatar"
                    accept="image/*"
                    label="Изменить аватар"
                    prepend-icon=""
                    density="comfortable"
                    :rules="avatarRules"
                  ></v-file-input>
                </div>
              </div>

              <!-- Основная информация -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.firstName"
                    label="Имя"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.lastName"
                    label="Фамилия"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="profile.email"
                label="Email"
                type="email"
                :rules="emailRules"
              ></v-text-field>

              <v-text-field
                v-model="profile.phone"
                label="Телефон"
                type="tel"
                :rules="phoneRules"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!formValid"
              @click="saveProfile"
            >
              Сохранить изменения
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Подключенные соцсети -->
        <v-card>
          <v-card-title>
            <v-icon start color="primary">mdi-link-variant</v-icon>
            Подключенные аккаунты
          </v-card-title>

          <v-card-text>
            <v-list>
              <v-list-item
                v-for="social in socialAccounts"
                :key="social.platform"
              >
                <template v-slot:prepend>
                  <v-icon :color="social.connected ? 'success' : 'grey'">
                    {{ social.icon }}
                  </v-icon>
                </template>

                <v-list-item-title>{{ social.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ social.connected ? social.username : 'Не подключено' }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    :color="social.connected ? 'error' : 'primary'"
                    variant="text"
                    @click="toggleSocialAccount(social)"
                    :loading="social.loading"
                  >
                    {{ social.connected ? 'Отключить' : 'Подключить' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'ProfileOverview',

  setup() {
    const userStore = useUserStore()
    const panel = ref([0]) // Панель развернута по умолчанию
    const profileForm = ref(null)
    const formValid = ref(false)
    const saving = ref(false)
    const newAvatar = ref(null)

    // Аватар пользователя
    const avatar = computed(() => userStore.user?.avatar_url || '/default-avatar.png')

    // Данные профиля
    const profile = ref({
      firstName: userStore.user?.first_name || '',
      lastName: userStore.user?.last_name || '',
      email: userStore.user?.email || '',
      phone: userStore.user?.phone || ''
    })

    // Правила валидации
    const nameRules = [
      v => !!v || 'Поле обязательно для заполнения',
      v => v.length >= 2 || 'Минимум 2 символа'
    ]

    const emailRules = [
      v => !!v || 'Email обязателен',
      v => /.+@.+\..+/.test(v) || 'Введите корректный email'
    ]

    const phoneRules = [
      v => !v || /^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(v) || 'Введите корректный номер телефона'
    ]

    const avatarRules = [
      v => !v || v.size < 2000000 || 'Размер аватара должен быть меньше 2 МБ'
    ]

    // Метод сохранения профиля
    const saveProfile = async () => {
      if (!profileForm.value.validate()) return

      saving.value = true
      try {
        const formData = new FormData()
        
        // Добавляем основные данные
        formData.append('first_name', profile.value.firstName)
        formData.append('last_name', profile.value.lastName)
        formData.append('email', profile.value.email)
        formData.append('phone', profile.value.phone)

        // Добавляем аватар, если он был изменен
        if (newAvatar.value) {
          formData.append('avatar', newAvatar.value)
        }

        await userStore.updateProfile(formData)
        // Очищаем выбранный файл аватара после успешного сохранения
        newAvatar.value = null
      } catch (error) {
        console.error('Ошибка при сохранении профиля:', error)
      } finally {
        saving.value = false
      }
    }

    // Статистика
    const stats = computed(() => ({
      contests: userStore.stats?.totalContests || 0,
      drafts: userStore.stats?.draftsCount || 0
    }))

    // Последний вход
    const lastLogin = computed(() => userStore.user?.last_login || new Date())

    // История активности
    const recentActivity = computed(() => userStore.userActivity || [])

    // Форматирование даты
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Получение иконки для типа активности
    const getActivityIcon = (type) => {
      const icons = {
        login: 'mdi-login',                    // Вход в систему
        profile_update: 'mdi-account-edit',    // Обновление профиля
        password_change: 'mdi-key',            // Смена пароля
        contest_join: 'mdi-account-plus',      // Участие в конкурсе
        contest_leave: 'mdi-account-minus',    // Выход из конкурса
        contest_vote: 'mdi-star',              // Голосование в конкурсе
        contest_comment: 'mdi-comment',        // Комментарий к конкурсу
        default: 'mdi-circle-small'
      }
      return icons[type] || icons.default
    }

    // Получение цвета для типа активности
    const getActivityColor = (type) => {
      const colors = {
        login: 'info',
        profile_update: 'primary',
        password_change: 'warning',
        contest_join: 'success',
        contest_leave: 'error',
        contest_vote: 'amber',
        contest_comment: 'deep-purple',
        default: 'grey'
      }
      return colors[type] || colors.default
    }

    // В секции script добавляем новые состояния и методы
    const socialAccounts = ref([
      {
        platform: 'telegram',
        name: 'Telegram',
        icon: 'mdi-telegram',
        connected: false,
        username: '',
        loading: false
      },
      {
        platform: 'vk',
        name: 'VKontakte',
        icon: 'mdi-vk',
        connected: false,
        username: '',
        loading: false
      },
      {
        platform: 'github',
        name: 'GitHub',
        icon: 'mdi-github',
        connected: false,
        username: '',
        loading: false
      }
    ])

    // Метод для подключения/отключения соцсетей
    const toggleSocialAccount = async (social) => {
      social.loading = true
      try {
        if (social.connected) {
          await userStore.disconnectSocialAccount(social.platform)
          social.connected = false
          social.username = ''
        } else {
          const response = await userStore.connectSocialAccount(social.platform)
          social.connected = true
          social.username = response.username
        }
      } catch (err) {
        handleError(err)
      } finally {
        social.loading = false
      }
    }

    return {
      panel,
      stats,
      lastLogin,
      recentActivity,
      formatDate,
      getActivityIcon,
      getActivityColor,
      socialAccounts,
      toggleSocialAccount,
      profileForm,
      formValid,
      saving,
      profile,
      newAvatar,
      nameRules,
      emailRules,
      phoneRules,
      avatarRules,
      saveProfile,
      avatar
    }
  }
}
</script>

<style scoped>
.transition-fast-in-fast-out {
  transition: all 0.2s ease-in-out;
}

.v-expansion-panels {
  background-color: transparent !important;
}

.v-expansion-panel {
  background-color: rgb(var(--v-theme-surface)) !important;
}

.v-expansion-panel-title {
  color: rgb(var(--v-theme-on-surface));
}
</style> 