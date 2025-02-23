<template>
  <div class="fortune-wheel-container" ref="container">
    <div class="wheel" ref="wheel">
      <div class="wheel-content">
        <slot></slot>
      </div>
    </div>
    <div class="confetti-container" ref="confetti"></div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

export default {
  name: 'FortuneWheel',

  props: {
    active: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: 'next',
      validator: value => ['next', 'prev'].includes(value)
    }
  },

  watch: {
    active(newVal) {
      if (newVal) {
        this.playTransition()
      }
    }
  },

  methods: {
    playTransition() {
      // Анимация вращения колеса
      gsap.to(this.$refs.wheel, {
        rotation: this.direction === 'next' ? 360 : -360,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          // Сброс вращения после анимации
          gsap.set(this.$refs.wheel, { rotation: 0 })
          
          // Запуск конфетти
          this.launchConfetti()
        }
      })

      // Анимация масштабирования
      gsap.to(this.$refs.wheel, {
        scale: 0.8,
        duration: 0.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      })
    },

    launchConfetti() {
      const count = 100
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 5
      }

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        })
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55
      })

      fire(0.2, {
        spread: 60
      })

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      })

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      })

      fire(0.1, {
        spread: 120,
        startVelocity: 45
      })
    }
  }
}
</script>

<style scoped>
.fortune-wheel-container {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 1000px;
}

.wheel {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.wheel-content {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Темная тема */
:root[theme="dark"] .fortune-wheel-container {
  background-color: var(--dark-bg-color, #1a1a1a);
}
</style> 