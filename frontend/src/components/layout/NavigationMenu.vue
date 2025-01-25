<template>
  <v-list density="compact" nav>
    <v-list-item
      v-for="item in items"
      :key="item.title || item.path"
      :prepend-icon="item.icon"
      :title="item.title"
      :to="item.to || item.path"
      :active="currentPath === item.path"
    >
      <template v-if="!item.to && item.title" v-slot:title>
        {{ item.title }}
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'NavigationMenu',
  
  props: {
    items: {
      type: Array,
      required: true
    }
  },

  setup() {
    const route = useRoute()
    const currentPath = computed(() => route.path)

    return {
      currentPath
    }
  }
}
</script> 