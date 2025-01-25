<template>
  <v-container>
    <v-row>
      <!-- Основная информация -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <user-avatar
              :src="profile.avatar"
              :alt="profile.username"
              size="150"
            />

            <div class="text-h5 mb-2">{{ profile.username }}</div>
            <div class="text-subtitle-1 text-grey">{{ profile.email }}</div>
            
            <v-btn
              icon="mdi-pencil"
              size="small"
              class="position-absolute"
              style="top: 8px; right: 8px;"
              @click="editDialog = true"
            ></v-btn>
            
            <v-divider class="my-4"></v-divider>
            
            <v-row>
              <v-col cols="4">
                <div class="text-h6">{{ profile.stats.contests }}</div>
                <div class="text-caption">Конкурсов</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h6">{{ profile.stats.wins }}</div>
                <div class="text-caption">Побед</div>
              </v-col>
              <v-col cols="4">
                <div class="text-h6">{{ profile.stats.rating }}</div>
                <div class="text-caption">Рейтинг</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <edit-profile-dialog
          v-model="editDialog"
          :profile="profile"
          @saved="handleProfileUpdate"
        />

        <!-- Подписка -->
        <subscription-manager class="mt-4" />

        <!-- Достижения -->
        <user-achievements class="mt-4" />

        <!-- Уведомления -->
        <user-notifications class="mt-4" />

        <!-- Социальные сети -->
        <social-networks
          class="mt-4"
          v-model:connectedPlatforms="profile.connectedPlatforms"
        />
      </v-col>

      <!-- Правая колонка со статистикой -->
      <v-col cols="12" md="8">
        <!-- Статистика по платформам -->
        <platform-stats class="mb-4" />
        
        <!-- График активности -->
        <activity-chart class="mb-4" />

        <!-- Последние конкурсы -->
        <recent-contests />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import Chart from 'chart.js/auto'
import UserAvatar from '@/components/common/UserAvatar.vue'
import SocialNetworks from '@/components/common/SocialNetworks.vue'
import EditProfileDialog from '@/components/profile/EditProfileDialog.vue'
import ActivityChart from '@/components/profile/ActivityChart.vue'
import RecentContests from '@/components/profile/RecentContests.vue'
import PlatformStats from '@/components/profile/PlatformStats.vue'
import UserAchievements from '@/components/profile/UserAchievements.vue'
import UserNotifications from '@/components/profile/UserNotifications.vue'
import SubscriptionManager from '@/components/profile/SubscriptionManager.vue'

export default {
  name: 'UserProfile',
  
  components: {
    UserAvatar,
    SocialNetworks,
    EditProfileDialog,
    ActivityChart,
    RecentContests,
    PlatformStats,
    UserAchievements,
    UserNotifications,
    SubscriptionManager
  },
  
  setup() {
    const userStore = useUserStore()
    const activityChart = ref(null)
    const editDialog = ref(false)
    const connectSocialDialog = ref(false)
    const valid = ref(false)
    const saving = ref(false)
    const avatarFile = ref(null)
    const activityPeriod = ref('week')
    const search = ref('')

    const profile = reactive({
      username: '',
      email: '',
      avatar: null,
      bio: '',
      stats: {
        contests: 0,
        wins: 0,
        rating: 0
      },
      socials: {}
    })

    const editedProfile = reactive({...profile})

    const emailRules = [
      v => !!v || 'Email обязателен',
      v => /.+@.+\..+/.test(v) || 'Email должен быть валидным'
    ]

    const contestHeaders = [
      { title: 'Название', key: 'title', align: 'start', sortable: true },
      { title: 'Платформа', key: 'platform', align: 'center' },
      { title: 'Дата участия', key: 'participatedAt', align: 'center', sortable: true },
      { title: 'Статус', key: 'status', align: 'center' },
      { title: 'Действия', key: 'actions', align: 'center', sortable: false }
    ]

    const availablePlatforms = [
      { id: 'youtube', name: 'YouTube', icon: 'mdi-youtube', color: 'red' },
      { id: 'instagram', name: 'Instagram', icon: 'mdi-instagram', color: 'purple' },
      { id: 'vk', name: 'VKontakte', icon: 'mdi-vk', color: 'blue' },
      { id: 'telegram', name: 'Telegram', icon: 'mdi-telegram', color: 'light-blue' }
    ]

    // Методы
    const loadProfile = async () => {
      try {
        const userData = await userStore.getUserProfile()
        Object.assign(profile, userData)
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    const saveProfile = async () => {
      if (!valid.value) return

      saving.value = true
      try {
        const formData = new FormData()
        
        // Добавляем основные данные
        Object.keys(editedProfile).forEach(key => {
          if (key !== 'avatar') {
            formData.append(key, editedProfile[key])
          }
        })

        // Добавляем аватар, если он был изменен
        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value)
        }

        await userStore.updateProfile(formData)
        Object.assign(profile, editedProfile)
        editDialog.value = false
      } catch (error) {
        console.error('Failed to save profile:', error)
      } finally {
        saving.value = false
      }
    }

    const connectSocial = async (platform) => {
      try {
        const authUrl = await userStore.getSocialAuthUrl(platform)
        window.location.href = authUrl
      } catch (error) {
        console.error('Failed to initiate social connection:', error)
      }
    }

    const unlinkSocial = async (platform) => {
      try {
        await userStore.unlinkSocial(platform)
        delete profile.socials[platform]
      } catch (error) {
        console.error('Failed to unlink social account:', error)
      }
    }

    const getSocialIcon = (platform) => {
      const icons = {
        youtube: 'mdi-youtube',
        instagram: 'mdi-instagram',
        vk: 'mdi-vk',
        telegram: 'mdi-telegram'
      }
      return icons[platform] || 'mdi-account'
    }

    const getPlatformIcon = (platform) => {
      return getSocialIcon(platform.toLowerCase())
    }

    const getPlatformColor = (platform) => {
      const colors = {
        youtube: 'error',
        instagram: 'purple',
        vk: 'primary',
        telegram: 'info'
      }
      return colors[platform.toLowerCase()] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        completed: 'info',
        won: 'primary',
        lost: 'error'
      }
      return colors[status] || 'grey'
    }

    const initActivityChart = () => {
      const ctx = activityChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Активность',
            data: [],
            borderColor: 'primary',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const updateActivityChart = async () => {
      try {
        const data = await userStore.getUserActivity(activityPeriod.value)
        // Обновление данных графика
      } catch (error) {
        console.error('Failed to load activity data:', error)
      }
    }

    // Наблюдатели
    watch(activityPeriod, () => {
      updateActivityChart()
    })

    watch(editDialog, (newValue) => {
      if (newValue) {
        Object.assign(editedProfile, profile)
        avatarFile.value = null
      }
    })

    // Хуки жизненного цикла
    onMounted(() => {
      loadProfile()
      initActivityChart()
      updateActivityChart()
    })

    return {
      profile,
      editDialog,
      connectSocialDialog,
      valid,
      saving,
      avatarFile,
      editedProfile,
      activityPeriod,
      search,
      emailRules,
      contestHeaders,
      availablePlatforms,
      activityChart,
      saveProfile,
      connectSocial,
      unlinkSocial,
      getSocialIcon,
      getPlatformIcon,
      getPlatformColor,
      getStatusColor
    }
  }
}
</script>

<style scoped>
.v-avatar {
  border: 3px solid var(--v-primary-base);
}

.activity-chart {
  height: 300px;
}
</style> 