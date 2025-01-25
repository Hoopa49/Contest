<template>
  <v-footer class="footer">
    <v-container>
      <v-row>
        <!-- Логотип и описание -->
        <v-col cols="12" md="4" class="mb-4">
          <div class="d-flex align-center mb-4">
            <v-img
              v-if="showLogo"
              src="/logo.svg"
              alt="Логотип"
              width="40"
              height="40"
              class="mr-2"
            ></v-img>
            <h2 class="text-h5">{{ appName }}</h2>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            Платформа для поиска и участия в конкурсах в социальных сетях
          </p>
        </v-col>

        <!-- Навигационные ссылки -->
        <v-col 
          v-for="(group, index) in navigationGroups" 
          :key="index"
          cols="6" 
          md="2"
        >
          <h3 class="text-subtitle-1 font-weight-bold mb-4">{{ group.title }}</h3>
          <v-list density="compact" nav class="footer-links">
            <v-list-item
              v-for="link in group.links"
              :key="link.title"
              :to="link.to"
              :href="link.href"
              :target="link.href ? '_blank' : undefined"
              class="footer-link px-0"
            >
              {{ link.title }}
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Социальные сети -->
        <v-col cols="12" md="2">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Мы в соцсетях</h3>
          <div class="d-flex gap-2">
            <v-btn
              v-for="social in socialLinks"
              :key="social.icon"
              :href="social.href"
              target="_blank"
              icon
              variant="text"
              :title="social.title"
            >
              <v-icon>{{ social.icon }}</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Нижняя часть футера -->
      <v-divider class="my-4"></v-divider>
      
      <v-row align="center">
        <v-col cols="12" md="6" class="text-center text-md-left">
          <span class="text-body-2 text-medium-emphasis">
            © {{ currentYear }} {{ appName }}. Все права защищены
          </span>
        </v-col>
        <v-col cols="12" md="6" class="text-center text-md-right">
          <v-btn
            v-for="link in bottomLinks"
            :key="link.title"
            variant="text"
            :to="link.to"
            class="text-body-2"
            density="compact"
          >
            {{ link.title }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Footer',

  props: {
    showLogo: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const appName = 'Contest Platform'
    
    const currentYear = computed(() => new Date().getFullYear())

    const navigationGroups = [
      {
        title: 'Платформа',
        links: [
          { title: 'О проекте', to: '/about' },
          { title: 'Возможности', to: '/features' },
          { title: 'Цены', to: '/pricing' },
          { title: 'Блог', to: '/blog' }
        ]
      },
      {
        title: 'Поддержка',
        links: [
          { title: 'Помощь', to: '/help' },
          { title: 'FAQ', to: '/faq' },
          { title: 'Контакты', to: '/contact' }
        ]
      }
    ]

    const socialLinks = [
      { icon: 'mdi-youtube', href: 'https://youtube.com', title: 'YouTube' },
      { icon: 'mdi-instagram', href: 'https://instagram.com', title: 'Instagram' },
      { icon: 'mdi-telegram', href: 'https://telegram.org', title: 'Telegram' },
      { icon: 'mdi-vk', href: 'https://vk.com', title: 'VKontakte' }
    ]

    const bottomLinks = [
      { title: 'Условия использования', to: '/terms' },
      { title: 'Конфиденциальность', to: '/privacy' }
    ]

    return {
      appName,
      currentYear,
      navigationGroups,
      socialLinks,
      bottomLinks
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.footer-links {
  background-color: transparent !important;
}

.footer-link {
  min-height: 32px !important;
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: rgb(var(--v-theme-primary));
}

/* Адаптивность */
@media (max-width: 600px) {
  .v-col {
    padding-bottom: 24px;
  }
}
</style> 
