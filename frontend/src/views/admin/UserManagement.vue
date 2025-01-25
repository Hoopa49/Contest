<template>
    <v-container>
      <v-card>
        <!-- Заголовок и поиск -->
        <v-card-title>
          Управление пользователями
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
  
        <!-- Таблица пользователей -->
        <v-data-table
          :headers="headers"
          :items="users"
          :search="search"
          :loading="loading"
        >
          <!-- Действия с пользователем -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              small
              @click="editUser(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              small
              color="error"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
  
          <!-- Статус пользователя -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
            >
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Диалог редактирования -->
      <v-dialog v-model="editDialog" max-width="500px">
        <v-card>
          <v-card-title>
            Редактировать пользователя
          </v-card-title>
          <v-card-text>
            <v-form ref="editForm">
              <!-- Форма редактирования -->
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="saveUser"
            >
              Сохранить
            </v-btn>
            <v-btn
              text
              @click="editDialog = false"
            >
              Отмена
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { useAdminStore } from '@/stores/admin'
  
  export default {
    name: 'UserManagement',
    setup() {
      const adminStore = useAdminStore()
      const search = ref('')
      const loading = ref(false)
      const editDialog = ref(false)
      const editedUser = ref(null)
  
      const headers = [
        { title: 'ID', key: 'id' },
        { title: 'Email', key: 'email' },
        { title: 'Имя', key: 'name' },
        { title: 'Роль', key: 'role' },
        { title: 'Статус', key: 'status' },
        { title: 'Действия', key: 'actions', sortable: false }
      ]
  
      const users = ref([])
  
      // Методы управления пользователями
      const loadUsers = async () => {
        loading.value = true
        try {
          users.value = await adminStore.getUsers()
        } catch (error) {
          console.error('Failed to load users:', error)
        } finally {
          loading.value = false
        }
      }
  
      return {
        search,
        loading,
        headers,
        users,
        editDialog,
        editedUser,
        loadUsers
      }
    }
  }
  </script>
