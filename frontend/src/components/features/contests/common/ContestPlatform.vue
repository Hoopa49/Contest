<template>
  <div class="d-flex align-center">
    <component
      :is="getPlatformIcon(platform)"
      v-if="getPlatformIcon(platform)"
      :size="size"
      class="mr-2"
    />
    <v-icon
      v-else
      :color="platformInfo.color"
      :size="size"
      class="mr-2"
    >
      {{ platformInfo.icon }}
    </v-icon>
    <span v-if="showName" :class="textClass">
      {{ platformInfo.name }}
    </span>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getPlatformInfo } from '@/utils/platforms'
import YouTubeIcon from '@/components/icons/YouTubeIcon.vue'
import InstagramIcon from '@/components/icons/InstagramIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import VKIcon from '@/components/icons/VKIcon.vue'

export default {
  name: 'ContestPlatform',
  
  components: {
    YouTubeIcon,
    InstagramIcon,
    TelegramIcon,
    VKIcon
  },
  
  props: {
    platform: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: 24
    },
    showName: {
      type: Boolean,
      default: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const platformInfo = computed(() => getPlatformInfo(props.platform))
    const textClass = computed(() => props.small ? 'text-caption' : 'text-body-1')

    const getPlatformIcon = (platform) => {
      const icons = {
        youtube: YouTubeIcon,
        instagram: InstagramIcon,
        telegram: TelegramIcon,
        vk: VKIcon
      }
      return icons[platform.toLowerCase()]
    }

    return {
      platformInfo,
      textClass,
      getPlatformIcon
    }
  }
}
</script>
