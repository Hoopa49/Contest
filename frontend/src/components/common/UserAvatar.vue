<template>
  <v-avatar :size="size">
    <v-img
      v-if="src"
      :src="src"
      :alt="alt"
    ></v-img>
    <v-icon
      v-else
      :size="iconSize"
      color="grey"
    >
      mdi-account
    </v-icon>
  </v-avatar>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'UserAvatar',

  props: {
    src: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: 'User avatar'
    },
    size: {
      type: [Number, String],
      default: 40
    }
  },

  setup(props) {
    const iconSize = computed(() => {
      const avatarSize = typeof props.size === 'number' ? props.size : parseInt(props.size)
      return Math.floor(avatarSize * 0.7)
    })

    return {
      iconSize
    }
  }
}
</script> 