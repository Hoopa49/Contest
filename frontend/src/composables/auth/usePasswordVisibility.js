import { ref } from 'vue'

export function usePasswordVisibility() {
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }
  
  const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
  }
  
  return {
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility
  }
} 