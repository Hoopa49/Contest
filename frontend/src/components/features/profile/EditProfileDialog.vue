<template>
  <v-dialog v-model="modelValue" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Редактировать профиль</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <!-- Аватар -->
            <v-col cols="12" class="text-center">
              <user-avatar
                :src="previewAvatar || editedProfile.avatar"
                :alt="editedProfile.username"
                size="150"
              />
              <v-file-input
                v-model="avatarFile"
                accept="image/*"
                label="Изменить аватар"
                prepend-icon="mdi-camera"
                @change="previewImage"
                class="mt-4"
              ></v-file-input>
            </v-col>

            <!-- Основная информация -->
            <v-col cols="12">
              <v-text-field
                v-model="editedProfile.username"
                label="Имя пользователя"
                required
                :rules="[v => !!v || 'Имя пользователя обязательно']"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="editedProfile.email"
                label="Email"
                required
                :rules="emailRules"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editedProfile.bio"
                label="О себе"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Отмена
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="save"
          :loading="saving"
          :disabled="!valid"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/common/UserAvatar.vue'

export default {
  name: 'EditProfileDialog',

  components: {
    UserAvatar
  },

  props: {
    modelValue: Boolean,
    profile: {
      type: Object,
      required: true
    }
  },

  emits: ['update:modelValue', 'saved'],

  setup(props, { emit }) {
    const userStore = useUserStore()
    const form = ref(null)
    const valid = ref(false)
    const saving = ref(false)
    const avatarFile = ref(null)
    const previewAvatar = ref(null)
    const editedProfile = ref({ ...props.profile })

    const emailRules = [
      v => !!v || 'Email обязателен',
      v => /.+@.+\..+/.test(v) || 'Email должен быть валидным'
    ]

    watch(() => props.profile, (newProfile) => {
      editedProfile.value = { ...newProfile }
    })

    const previewImage = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewAvatar.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        previewAvatar.value = null
      }
    }

    const save = async () => {
      if (!valid.value) return

      saving.value = true
      try {
        const formData = new FormData()
        
        Object.keys(editedProfile.value).forEach(key => {
          if (key !== 'avatar') {
            formData.append(key, editedProfile.value[key])
          }
        })

        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value)
        }

        await userStore.updateProfile(formData)
        emit('saved', editedProfile.value)
        emit('update:modelValue', false)
      } catch (error) {
        console.error('Failed to save profile:', error)
      } finally {
        saving.value = false
      }
    }

    return {
      form,
      valid,
      saving,
      avatarFile,
      previewAvatar,
      editedProfile,
      emailRules,
      save,
      previewImage
    }
  }
}
</script> 