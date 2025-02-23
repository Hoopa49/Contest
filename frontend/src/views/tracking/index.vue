/**
 * Компонент отслеживания конкурсов
 * Позволяет управлять списком отслеживаемых каналов
 */
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Отслеживание конкурсов</h1>
        
        <!-- Список отслеживаемых каналов -->
        <v-card class="mb-6">
          <v-card-title class="d-flex align-center">
            Отслеживаемые каналы
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddChannelDialog = true"
            >
              Добавить канал
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-list v-if="trackedChannels.length">
              <v-list-item
                v-for="channel in trackedChannels"
                :key="channel.id"
                :title="channel.title"
                :subtitle="channel.description"
              >
                <template v-slot:prepend>
                  <v-avatar>
                    <v-img :src="channel.thumbnail"></v-img>
                  </v-avatar>
                </template>
                
                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    @click="removeChannel(channel)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-alert
              v-else
              type="info"
              text="Вы пока не отслеживаете ни один канал"
            ></v-alert>
          </v-card-text>
        </v-card>

        <!-- Диалог добавления канала -->
        <v-dialog v-model="showAddChannelDialog" max-width="500px">
          <v-card>
            <v-card-title>Добавить канал</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="addChannel">
                <v-text-field
                  v-model="newChannelUrl"
                  label="URL канала YouTube"
                  placeholder="https://www.youtube.com/channel/..."
                  :rules="[rules.required, rules.youtubeUrl]"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="addChannel"
                :loading="isLoading"
              >
                Добавить
              </v-btn>
              <v-btn
                color="grey"
                @click="showAddChannelDialog = false"
              >
                Отмена
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineOptions({
  name: 'TrackingView'
})

const showAddChannelDialog = ref(false)
const newChannelUrl = ref('')
const isLoading = ref(false)
const trackedChannels = ref([])

const rules = {
  required: v => !!v || 'Обязательное поле',
  youtubeUrl: v => /youtube\.com\/(channel|user|c)\/[\w-]+/.test(v) || 'Неверный формат URL'
}

onMounted(async () => {
  // Загрузка списка отслеживаемых каналов
  // trackedChannels.value = await getTrackedChannels()
})

const addChannel = async () => {
  if (!newChannelUrl.value) return
  
  isLoading.value = true
  try {
    // Добавление канала
    // const channel = await addChannelToTracking(newChannelUrl.value)
    // trackedChannels.value.push(channel)
    showAddChannelDialog.value = false
    newChannelUrl.value = ''
  } catch (error) {
    console.error('Ошибка при добавлении канала:', error)
  } finally {
    isLoading.value = false
  }
}

const removeChannel = async (channel) => {
  // Реализация удаления канала из отслеживаемых
}
</script> 