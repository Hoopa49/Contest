<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Достижения
      <v-spacer></v-spacer>
      <v-chip>{{ achievements.length }}/{{ totalAchievements }}</v-chip>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col
          v-for="achievement in achievements"
          :key="achievement.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :color="achievement.unlocked ? 'primary' : 'grey'"
            theme="dark"
            class="achievement-card"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon
                  :icon="achievement.icon"
                  size="32"
                  class="me-2"
                  :color="achievement.unlocked ? 'white' : 'grey-lighten-1'"
                />
                <div>
                  <div class="text-h6">{{ achievement.title }}</div>
                  <div class="text-caption">{{ achievement.description }}</div>
                </div>
              </div>

              <v-progress-linear
                v-if="achievement.progress"
                :model-value="achievement.progress.current"
                :max="achievement.progress.total"
                height="8"
                rounded
                class="mt-2"
              >
                <template v-slot:default="{ value }">
                  {{ Math.ceil(value) }}%
                </template>
              </v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'UserAchievements',

  setup() {
    const userStore = useUserStore()
    const achievements = ref([])
    const totalAchievements = ref(0)

    const loadAchievements = async () => {
      try {
        const data = await userStore.getUserAchievements()
        achievements.value = data.achievements
        totalAchievements.value = data.total
      } catch (error) {
        console.error('Failed to load achievements:', error)
      }
    }

    onMounted(() => {
      loadAchievements()
    })

    return {
      achievements,
      totalAchievements
    }
  }
}
</script>

<style scoped>
.achievement-card {
  transition: transform 0.2s;
}

.achievement-card:hover {
  transform: translateY(-4px);
}
</style> 