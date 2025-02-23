<template>
  <div class="platform-integrations">
    <platform-integrations-component />
  </div>
</template>

<script>
import PlatformIntegrationsComponent from '@/components/features/platforms/PlatformIntegrations.vue'

export default {
  name: 'AdminPlatformIntegrationsView',
  
  components: {
    PlatformIntegrationsComponent
  }
}
</script>

<style lang="scss" scoped>
.platform-integrations {
  width: 100%;
  height: 100%;
}
</style> 