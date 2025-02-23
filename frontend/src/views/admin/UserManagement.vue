<template>
    <v-container>
      <v-card>
        <!-- Заголовок и поиск -->
        <v-card-title class="d-flex align-center py-3">
          <span>Управление пользователями</span>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
            density="compact"
            class="table-search"
            style="max-width: 300px;"
          ></v-text-field>
        </v-card-title>
  
        <!-- Таблица пользователей -->
        <v-data-table
          :headers="headers"
          :items="users"
          :search="search"
          :loading="loading"
          hover
        >
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-tooltip location="top" text="Редактировать">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    color="primary"
                    variant="text"
                    v-bind="props"
                    @click="editUser(item)"
                    class="mr-1"
                  >
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip location="top" text="Удалить">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    variant="text"
                    v-bind="props"
                    @click="confirmDelete(item)"
                  >
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
  
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.is_active)"
              variant="outlined"
              size="small"
              :text="item.is_active ? 'Активен' : 'Заблокирован'"
            />
          </template>

          <template v-slot:item.name="{ item }">
            {{ formatUserName(item) }}
          </template>

          <template v-slot:item.last_login="{ item }">
            {{ formatDate(item.last_login) }}
          </template>

          <template v-slot:item.role="{ item }">
            {{ item.role === 'admin' ? 'Администратор' : 'Пользователь' }}
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Диалог редактирования -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Редактировать пользователя
          </v-card-title>
          <v-card-text>
            <v-form ref="editForm">
              <v-text-field
                v-model="editedUser.email"
                label="Email"
                required
                :rules="[v => !!v || 'Email обязателен']"
              ></v-text-field>
              
              <v-text-field
                v-model="editedUser.first_name"
                label="Имя"
              ></v-text-field>
              
              <v-text-field
                v-model="editedUser.last_name"
                label="Фамилия"
              ></v-text-field>
              
              <v-select
                v-model="editedUser.role"
                :items="['user', 'admin']"
                label="Роль"
                required
                :rules="[v => !!v || 'Роль обязательна']"
              ></v-select>
              
              <v-switch
                v-model="editedUser.is_active"
                label="Активен"
                color="success"
                hide-details
                class="mt-4"
              ></v-switch>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click="saveUser"
            >
              Сохранить
            </v-btn>
            <v-btn
              variant="text"
              @click="dialog = false"
            >
              Отмена
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Удаление пользователя</span>
          </v-card-title>

          <v-card-text>
            Вы действительно хотите удалить этого пользователя?
            <br>
            Это действие нельзя будет отменить.
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              @click="deleteDialog = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="deleteUser"
            >
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import { useAdminStore } from '@/stores/admin'
  import { useAuthStore } from '@/stores/auth'
  
  export default {
    name: 'UserManagement',
    setup() {
      const adminStore = useAdminStore()
      const authStore = useAuthStore()
      const search = ref('')
      const loading = ref(false)
      const dialog = ref(false)
      const deleteDialog = ref(false)
      const editedUser = ref(null)
      const userToDelete = ref(null)
  
      const headers = [
        { title: 'ID', key: 'id', width: '200px' },
        { title: 'Email', key: 'email', width: '200px' },
        { title: 'Имя', key: 'name', width: '200px' },
        { title: 'Роль', key: 'role', width: '100px' },
        { title: 'Статус', key: 'status', width: '120px', align: 'center' },
        { title: 'Дата создания', key: 'created_at', width: '150px' },
        { title: 'Последний вход', key: 'last_login', width: '150px' },
        { title: 'Действия', key: 'actions', width: '100px', sortable: false, align: 'center' }
      ]
  
      const users = ref([])

      // Методы для работы с пользователями
      const editUser = (user) => {
        editedUser.value = { ...user }
        dialog.value = true
      }

      const confirmDelete = (user) => {
        userToDelete.value = user
        deleteDialog.value = true
      }

      const deleteUser = async () => {
        try {
          loading.value = true
          await adminStore.deleteUser(userToDelete.value.id)
          deleteDialog.value = false
          await loadUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
        } finally {
          loading.value = false
        }
      }

      const saveUser = async () => {
        try {
          loading.value = true
          await adminStore.updateUser(editedUser.value.id, editedUser.value)
          dialog.value = false
          await loadUsers()
        } catch (error) {
          console.error('Error saving user:', error)
        } finally {
          loading.value = false
        }
      }

      // Форматирование имени пользователя
      const formatUserName = (user) => {
        if (user.first_name && user.last_name) {
          return `${user.first_name} ${user.last_name}`
        } else if (user.first_name) {
          return user.first_name
        } else if (user.last_name) {
          return user.last_name
        } else {
          return 'Не указано'
        }
      }

      // Форматирование даты
      const formatDate = (date) => {
        if (!date) return 'Никогда'
        return new Date(date).toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
  
      // Методы управления пользователями
      const loadUsers = async () => {
        loading.value = true
        try {
          console.log('Загрузка пользователей...')
          console.log('Состояние авторизации:', {
            isInitialized: authStore.isInitialized,
            isAuthenticated: authStore.isAuthenticated,
            isAdmin: authStore.isAdmin,
            user: authStore.user
          })
          
          if (!authStore.isInitialized) {
            console.log('Ожидание инициализации авторизации...')
            await authStore.init()
          }
  
          if (!authStore.isAuthenticated) {
            throw new Error('Пользователь не авторизован')
          }
  
          if (!authStore.isAdmin) {
            throw new Error('Недостаточно прав для просмотра пользователей')
          }
  
          const response = await adminStore.fetchUsers()
          users.value = Array.isArray(response.data) ? response.data : []
          console.log('Пользователи загружены:', users.value)
        } catch (error) {
          console.error('Ошибка при загрузке пользователей:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
          })
        } finally {
          loading.value = false
        }
      }
  
      // Добавляем вызов при монтировании
      onMounted(() => {
        loadUsers()
      })
  
      return {
        search,
        loading,
        headers,
        users,
        dialog,
        deleteDialog,
        editedUser,
        userToDelete,
        loadUsers,
        formatUserName,
        formatDate,
        getStatusColor: (isActive) => isActive ? 'success' : 'error',
        editUser,
        confirmDelete,
        deleteUser,
        saveUser
      }
    }
  }
  </script>

<style scoped>
.table-search {
  margin-right: 16px;
}

:deep(.v-data-table) {
  background: transparent !important;
}

:deep(.v-data-table-header) {
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

:deep(.v-data-table__tr:hover:not(.v-data-table__expanded__content, .v-data-table__empty-wrapper)) {
  background: rgba(var(--v-theme-surface-variant), 0.05) !important;
}
</style>
