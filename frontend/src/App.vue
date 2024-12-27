<!-- frontend/src/App.vue -->
<template>
  <v-app>
    <Navbar />
    <router-view />
    <v-btn @click="showToast" color="primary" class="ma-4">Показать уведомление</v-btn>
    <Toast />
  </v-app>
</template>

<script>
import Navbar from './components/Navbar.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'App',
  components: { Navbar },
  setup() {
    const toast = useToast()

    const showToast = () => {
      toast.success('Успешно!')
    }

    return { showToast }
  }
}
</script>

<style>
/* Ваши стили */
</style>
