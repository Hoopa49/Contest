<!-- 
  ContestHeader.vue
  Компонент заголовка конкурса.
  Отображает основную информацию: изображение, название, платформу и статус.
-->
<template>
  <v-card class="contest-header">
    <!-- Изображение конкурса -->
    <v-img
      :src="headerImage"
      :alt="title"
      height="300"
      cover
      class="header-image"
    >
      <!-- Оверлей для темных изображений -->
      <div class="image-overlay"></div>
      
      <!-- Плейсхолдер при загрузке -->
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey-lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>

    <!-- Заголовок и информация -->
    <v-card-title class="header-content pa-4">
      <div class="d-flex flex-wrap align-center">
        <!-- Платформа -->
        <contest-platform
          :platform="platform"
          class="mr-3 mb-2"
        />
        
        <!-- Название -->
        <h1 class="text-h5 font-weight-bold mb-2">
          {{ title }}
        </h1>
        
        <v-spacer></v-spacer>
        
        <!-- Статус -->
        <contest-status-component
          :status="status"
          class="ml-auto mb-2"
        />
      </div>

      <!-- Дополнительная информация -->
      <div 
        v-if="subtitle"
        class="text-subtitle-1 mt-2"
      >
        {{ subtitle }}
      </div>
    </v-card-title>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import ContestPlatform from '../../common/ContestPlatform.vue'
import ContestStatusComponent from '../../common/ContestStatus.vue'
import { getDefaultImage } from '@/utils/platforms'
import { PlatformType, ContestStatus as ContestStatusEnum } from '@/constants/contest'

// Определение props с типизацией
const props = defineProps({
  /** URL изображения конкурса */
  image: {
    type: String,
    default: ''
  },
  /** Платформа проведения конкурса */
  platform: {
    type: String,
    required: true,
    validator: (value) => Object.values(PlatformType).includes(value)
  },
  /** Название конкурса */
  title: {
    type: String,
    required: true
  },
  /** Подзаголовок конкурса */
  subtitle: {
    type: String,
    default: ''
  },
  /** Статус конкурса */
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(ContestStatusEnum).includes(value)
  }
})

// Вычисляемые свойства
const headerImage = computed(() => {
  return props.image || getDefaultImage(props.platform)
})
</script>

<style scoped>
.contest-header {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.header-image {
  position: relative;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.4)
  );
}

.header-content {
  position: relative;
  z-index: 1;
}

@media (max-width: 600px) {
  .v-card-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .contest-status {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style> 