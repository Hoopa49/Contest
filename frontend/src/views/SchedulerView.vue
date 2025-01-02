<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <scheduler-control />
      </v-col>
      <v-col cols="12">
        <scheduler-settings />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SchedulerControl from '@/components/SchedulerControl.vue'
import SchedulerSettings from '@/components/SchedulerSettings.vue'

export default {
  components: {
    SchedulerControl,
    SchedulerSettings
  }
}
</script> 