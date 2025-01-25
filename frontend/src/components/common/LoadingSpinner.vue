<template>
    <div class="loading-container">
      <v-progress-circular
        :size="size"
        :width="width"
        :color="color"
        indeterminate
      ></v-progress-circular>
      <div v-if="text" class="loading-text">
        {{ text }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoadingSpinner',
    props: {
      size: {
        type: Number,
        default: 32
      },
      width: {
        type: Number,
        default: 4
      },
      color: {
        type: String,
        default: 'primary'
      },
      text: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style scoped>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  
  .loading-text {
    margin-top: 8px;
    color: rgba(0, 0, 0, 0.6);
  }
  </style>
