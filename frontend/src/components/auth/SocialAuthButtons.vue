<template>
  <div class="social-buttons">
    <!-- Google -->
    <button
      class="social-button google"
      @click="$emit('auth', 'google')"
      @mouseenter="playButtonAnimation('google')"
      @mouseleave="stopButtonAnimation('google')"
      ref="googleButton"
    >
      <div class="button-content">
        <div class="icon-wrapper">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
            />
          </svg>
        </div>
        <span>Google</span>
      </div>
      <div class="rainbow-effect"></div>
    </button>

    <!-- VK -->
    <button
      class="social-button vk"
      @click="$emit('auth', 'vk')"
      @mouseenter="playButtonAnimation('vk')"
      @mouseleave="stopButtonAnimation('vk')"
      ref="vkButton"
    >
      <div class="button-content">
        <div class="icon-wrapper">
          <svg class="vk-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93V15.07C2 20.67 3.33 22 8.93 22H15.07C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2M18.15 16.27H16.69C16.14 16.27 15.97 15.82 14.92 14.77C14 13.91 13.61 13.79 13.37 13.79C13.03 13.79 12.93 13.89 12.93 14.37V15.76C12.93 16.07 12.81 16.27 11.8 16.27C10.22 16.27 8.47 15.32 7.22 13.51C5.36 10.94 4.79 9.04 4.79 8.69C4.79 8.5 4.89 8.32 5.24 8.32H6.7C7.03 8.32 7.17 8.47 7.33 8.89C8.13 11.05 9.36 12.95 9.87 12.95C10.08 12.95 10.18 12.85 10.18 12.31V10.02C10.13 9.12 9.72 9.05 9.72 8.74C9.72 8.59 9.84 8.44 10.04 8.44H12.37C12.66 8.44 12.77 8.59 12.77 9V11.79C12.77 12.08 12.91 12.19 13.03 12.19C13.24 12.19 13.41 12.08 13.8 11.69C14.87 10.52 15.65 8.79 15.65 8.79C15.75 8.57 15.93 8.37 16.27 8.37H17.73C18.14 8.37 18.24 8.57 18.14 8.89C17.9 9.67 16.28 12.08 16.28 12.08C16.13 12.34 16.08 12.44 16.28 12.69C16.43 12.89 16.9 13.31 17.21 13.67C17.85 14.37 18.35 14.97 18.5 15.37C18.63 15.77 18.42 16.27 18.15 16.27Z"
            />
          </svg>
        </div>
        <span>VK</span>
      </div>
      <div class="wave-effect"></div>
    </button>

    <!-- Instagram -->
    <button
      class="social-button instagram"
      @click="$emit('auth', 'instagram')"
      @mouseenter="playButtonAnimation('instagram')"
      @mouseleave="stopButtonAnimation('instagram')"
      ref="instagramButton"
    >
      <div class="button-content">
        <div class="icon-wrapper">
          <svg class="instagram-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
            />
          </svg>
        </div>
        <span>Instagram</span>
      </div>
      <div class="gradient-effect"></div>
    </button>

    <!-- Telegram -->
    <button
      class="social-button telegram"
      @click="$emit('auth', 'telegram')"
      @mouseenter="playButtonAnimation('telegram')"
      @mouseleave="stopButtonAnimation('telegram')"
      ref="telegramButton"
    >
      <div class="button-content">
        <div class="icon-wrapper">
          <svg class="telegram-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.78,18.65L10.06,14.42L17.74,7.5C18.08,7.19 17.67,7.04 17.22,7.31L7.74,13.3L3.64,12C2.76,11.75 2.75,11.14 3.84,10.7L19.81,4.54C20.54,4.21 21.24,4.72 20.96,5.84L18.24,18.65C18.05,19.56 17.5,19.78 16.74,19.36L12.6,16.3L10.61,18.23C10.38,18.46 10.19,18.65 9.78,18.65Z"
            />
          </svg>
        </div>
        <span>Telegram</span>
      </div>
      <div class="plane-effect" ref="telegramPlane"></div>
    </button>
  </div>
</template>

<script>
import { gsap } from 'gsap'

export default {
  name: 'SocialAuthButtons',
  
  data() {
    return {
      animations: {}
    }
  },

  methods: {
    playButtonAnimation(type) {
      switch (type) {
        case 'google':
          gsap.to(this.$refs.googleButton.querySelector('.rainbow-effect'), {
            opacity: 1,
            duration: 0.3
          })
          break
        case 'vk':
          gsap.to(this.$refs.vkButton.querySelector('.wave-effect'), {
            x: '100%',
            duration: 0.8,
            ease: 'power1.inOut'
          })
          break
        case 'instagram':
          gsap.to(this.$refs.instagramButton.querySelector('.gradient-effect'), {
            opacity: 1,
            scale: 1.1,
            duration: 0.3
          })
          break
        case 'telegram':
          gsap.to(this.$refs.telegramPlane, {
            x: 10,
            y: -10,
            rotation: -15,
            duration: 0.3
          })
          break
      }
    },

    stopButtonAnimation(type) {
      switch (type) {
        case 'google':
          gsap.to(this.$refs.googleButton.querySelector('.rainbow-effect'), {
            opacity: 0,
            duration: 0.3
          })
          break
        case 'vk':
          gsap.to(this.$refs.vkButton.querySelector('.wave-effect'), {
            x: '-100%',
            duration: 0
          })
          break
        case 'instagram':
          gsap.to(this.$refs.instagramButton.querySelector('.gradient-effect'), {
            opacity: 0,
            scale: 1,
            duration: 0.3
          })
          break
        case 'telegram':
          gsap.to(this.$refs.telegramPlane, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.3
          })
          break
      }
    }
  }
}
</script>

<style scoped>
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.social-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--button-text);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s;
}

.social-button:hover {
  transform: translateY(-2px);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Google Button */
.google {
  --button-bg: #fff;
  --button-text: #757575;
  border: 1px solid #ddd;
}

.rainbow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    124deg,
    #ff2400,
    #e81d1d,
    #e8b71d,
    #e3e81d,
    #1de840,
    #1ddde8,
    #2b1de8,
    #dd00f3,
    #dd00f3
  );
  background-size: 1800% 1800%;
  opacity: 0;
  animation: rainbow 18s ease infinite;
  z-index: 0;
}

/* VK Button */
.vk {
  --button-bg: #4C75A3;
  --button-text: white;
}

.wave-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

/* Instagram Button */
.instagram {
  --button-bg: #fff;
  --button-text: #000;
  border: 1px solid #ddd;
}

.gradient-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  opacity: 0;
  z-index: 0;
}

/* Telegram Button */
.telegram {
  --button-bg: #0088cc;
  --button-text: white;
}

.plane-effect {
  display: none;
  position: absolute;
  width: 24px;
  height: 24px;
  
  &.active {
    display: block;
  }
}

@keyframes rainbow {
  0% { background-position: 0% 82% }
  50% { background-position: 100% 19% }
  100% { background-position: 0% 82% }
}

:root[theme="dark"] .social-button {
  --button-bg: #2d2d2d;
  --button-text: #fff;
  border-color: #444;
}

:root[theme="dark"] .google,
:root[theme="dark"] .instagram {
  --button-bg: #2d2d2d;
  --button-text: #fff;
}
</style> 