import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useError } from '@/composables/useError'

export function useRegister() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { error, handleError, clearErrors } = useError()
  
  const registerForm = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const loading = ref(false)
  
  const validateForm = () => {
    clearErrors()
    const errors = {}
    
    if (!registerForm.value.username) {
      errors.username = 'Введите имя пользователя'
    }
    
    if (!registerForm.value.email) {
      errors.email = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
      errors.email = 'Введите корректный email'
    }
    
    if (!registerForm.value.password) {
      errors.password = 'Введите пароль'
    } else if (registerForm.value.password.length < 8) {
      errors.password = 'Пароль должен быть не менее 8 символов'
    }
    
    if (!registerForm.value.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль'
    } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
    }
    
    return errors
  }
  
  const handleRegister = async () => {
    try {
      loading.value = true
      const errors = validateForm()
      
      if (Object.keys(errors).length > 0) {
        handleError({ errors })
        return
      }
      
      await authStore.register({
        username: registerForm.value.username,
        email: registerForm.value.email,
        password: registerForm.value.password
      })
      
      // Перенаправление после успешной регистрации
      router.push('/')
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }
  
  return {
    registerForm,
    loading,
    error,
    handleRegister
  }
} 