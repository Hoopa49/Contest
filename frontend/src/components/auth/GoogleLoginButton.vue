<template>
  <button 
    class="google-login-button" 
    @click="handleGoogleLogin"
    :disabled="loading"
  >
    <div class="button-content">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path 
          fill="currentColor" 
          d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
        />
      </svg>
      <span>{{ loading ? 'Загрузка...' : 'Войти через Google' }}</span>
    </div>
  </button>
</template>

<script>
export default {
  name: 'GoogleLoginButton',
  
  data() {
    return {
      loading: false
    }
  },

  methods: {
    async handleGoogleLogin() {
      try {
        this.loading = true
        this.$emit('auth', 'google')
      } catch (error) {
        console.error('Ошибка при авторизации через Google:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.google-login-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #dadce0;
  color: #3c4043;
  transition: all 0.3s ease;
  border-radius: 4px;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.google-login-button:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
}

.google-login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.google-icon {
  width: 18px;
  height: 18px;
  color: #4285f4;
}
</style> 