<template>
  <div class="telegram-login-button" ref="container"></div>
</template>

<script>
export default {
  name: 'TelegramLoginButton',
  
  props: {
    botName: {
      type: String,
      required: true
    },
    buttonSize: {
      type: String,
      default: 'large',
      validator: value => ['large', 'medium', 'small'].includes(value)
    }
  },

  mounted() {
    console.log('TelegramLoginButton mounted, botName:', this.botName)
    this.loadTelegramWidget()
  },

  beforeUnmount() {
    console.log('TelegramLoginButton unmounting')
    // Очищаем глобальный обработчик
    window.onTelegramAuth = null
    // Очищаем контейнер
    if (this.$refs.container) {
      this.$refs.container.innerHTML = ''
    }
  },

  methods: {
    loadTelegramWidget() {
      console.log('Loading Telegram widget...')
      if (!this.$refs.container) {
        console.error('Container ref not found')
        return
      }

      // Очищаем контейнер перед добавлением нового скрипта
      this.$refs.container.innerHTML = ''

      // Создаем уникальное имя для обработчика
      const handlerName = `onTelegramAuth_${Date.now()}`
      
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://telegram.org/js/telegram-widget.js?22'

      // Исправляем определение домена для локального окружения
      const domain = window.location.hostname === 'localhost' 
        ? window.location.host // Используем host с портом (например: localhost:8080)
        : window.location.hostname

      console.log('Widget configuration:', {
        domain,
        botName: this.botName
      })

      // Добавляем обязательный атрибут data-auth-url
      script.setAttribute('data-telegram-login', this.botName)
      script.setAttribute('data-size', this.buttonSize)
      script.setAttribute('data-onauth', handlerName)
      script.setAttribute('data-auth-url', `${window.location.origin}/auth/telegram/callback`) // Добавляем корректный callback URL
      
      // Регистрируем обработчик авторизации до добавления скрипта
      window[handlerName] = (user) => {
        console.log('Telegram auth callback received:', {
          id: user.id,
          username: user.username,
          auth_date: user.auth_date,
          hash: user.hash
        })
        this.$emit('auth', user)
      }

      script.onerror = (error) => {
        console.error('Error loading Telegram widget:', error)
      }

      script.onload = () => {
        console.log('Telegram widget script loaded successfully')
        // Проверяем, создался ли iframe после загрузки
        setTimeout(() => {
          const iframe = this.$refs.container.querySelector('iframe')
          if (!iframe) {
            console.error('Telegram widget iframe not created')
            console.log('Current domain:', domain)
            console.log('Bot name:', this.botName)
            console.log('Script attributes:', {
              'data-telegram-login': script.getAttribute('data-telegram-login'),
              'data-size': script.getAttribute('data-size'),
              'data-onauth': script.getAttribute('data-onauth')
            })
          } else {
            console.log('Telegram widget iframe created successfully')
          }
        }, 1000)
      }

      this.$refs.container.appendChild(script)
    }
  }
}
</script>

<style scoped>
.telegram-login-button {
  display: inline-block;
  margin: 0.5rem 0;
}
</style> 