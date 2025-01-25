<template>
  <v-app-bar color="primary" dark>
    <v-app-bar-title>Contest Aggregator</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn to="/" text>Главная</v-btn>
    <v-btn to="/contests" text>Конкурсы</v-btn>
    <v-btn to="/login" text v-if="!isAuthenticated">Войти</v-btn>
    <v-btn @click="logout" text v-else>Выйти</v-btn>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const logout = () => {
  authStore.logout()
}
</script> 