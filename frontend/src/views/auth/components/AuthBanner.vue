<!--
  Компонент баннера для страниц аутентификации
  Отображает логотип, заголовок и список преимуществ
-->
<template>
  <div class="auth-banner">
    <div class="banner-content">
      <div class="logo">🎲</div>
      <h1>{{ isRegister ? 'Создайте аккаунт!' : 'Добро пожаловать!' }}</h1>
      <p class="subtitle">{{ isRegister ? 'Присоединяйтесь к нашему сообществу и начните выигрывать прямо сейчас!' : 'Безграничные возможности испытать удачу и поверить в судьбу!' }}</p>
      
      <div class="features">
        <div v-if="!isRegister" class="feature-item" v-for="feature in loginFeatures" :key="feature.title">
          <div class="feature-text">
            <span class="feature-emoji">{{ feature.emoji }}</span>
            <h3>{{ feature.title }}</h3>
          </div>
          <p>{{ feature.description }}</p>
        </div>
        
        <div v-if="isRegister" class="feature-item" v-for="feature in registerFeatures" :key="feature.title">
          <div class="feature-text">
            <span class="feature-emoji">{{ feature.emoji }}</span>
            <h3>{{ feature.title }}</h3>
          </div>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isRegister: {
    type: Boolean,
    default: false
  }
})

const loginFeatures = [
  {
    emoji: '🎯',
    title: 'Участвуйте во всех конкурсах одновременно',
    description: 'Количество конкурсов не ограничено'
  },
  {
    emoji: '🎮',
    title: 'Выполняйте условия в два клика',
    description: 'Позвольте удаче сделать все за вас'
  },
  // {
  //   emoji: '⚙️',
  //   title: 'Настройте свои интересы и предпочтения',
  //   description: 'Платформа подстраивается под вас'
  // },
  {
    emoji: '🎁',
    title: 'Убедитесь в честности и прозрачности конкурса',
    description: 'Подробная статистика и отчеты'
  }
]

const registerFeatures = [
  // {
  //   emoji: '🚀',
  //   title: 'Быстрая регистрация',
  //   description: 'Всего несколько шагов для начала'
  // },
  {
    emoji: '🎨',
    title: 'Персонализация профиля',
    description: 'Настройте профиль под себя'
  },
  {
    emoji: '🔒',
    title: 'Безопасность данных',
    description: 'Ваши данные под надежной защитой'
  },
  {
    emoji: '🎉',
    title: 'Бонусы новым участникам',
    description: 'Специальные предложения для новичков'
  }
]
</script>

<style lang="scss">
@use '@/styles/components/auth-banner';
</style> 