import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useError } from '@/composables/useError'

export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { error, handleError, clearErrors } = useError()
  
  const loginForm = ref({
    email: '',
    password: '',
    remember: false
  })
  
  const loading = ref(false)
  
  const handleLogin = async () => {
    try {
      loading.value = true
      clearErrors()
      
      await authStore.login({
        email: loginForm.value.email,
        password: loginForm.value.password,
        remember: loginForm.value.remember
      })
      
      // Перенаправление после успешного входа
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }
  
  const handleSocialAuth = async (provider) => {
    try {
      loading.value = true
      clearErrors()
      
      await authStore.socialAuth(provider)
      
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }
  
  return {
    loginForm,
    loading,
    error,
    handleLogin,
    handleSocialAuth
  }
} 