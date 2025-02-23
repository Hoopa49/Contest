<template>
  <div class="gift-box-container" ref="container">
    <svg
      class="gift-box"
      viewBox="0 0 200 200"
      :class="{ 'is-focused': isFocused, 'is-error': hasError }"
    >
      <!-- Коробка -->
      <rect
        ref="box"
        x="40"
        y="80"
        width="120"
        height="100"
        fill="var(--gift-box-color, #8B5CF6)"
        rx="10"
      />
      <!-- Крышка -->
      <rect
        ref="lid"
        x="30"
        y="60"
        width="140"
        height="30"
        fill="var(--gift-box-color, #8B5CF6)"
        rx="8"
      />
      <!-- Лента вертикальная -->
      <rect
        ref="ribbonVertical"
        x="90"
        y="60"
        width="20"
        height="120"
        fill="var(--gift-ribbon-color, #F59E0B)"
      />
      <!-- Лента горизонтальная -->
      <rect
        ref="ribbonHorizontal"
        x="40"
        y="110"
        width="120"
        height="20"
        fill="var(--gift-ribbon-color, #F59E0B)"
      />
      <!-- Бант -->
      <path
        ref="bow"
        d="M100,50 C110,50 120,45 120,35 C120,25 110,20 100,20 C90,20 80,25 80,35 C80,45 90,50 100,50"
        fill="var(--gift-ribbon-color, #F59E0B)"
      />
      <!-- Группа для шаров -->
      <g ref="balloons" opacity="0">
        <!-- Шары будут добавляться динамически -->
      </g>
      <!-- Группа для звездочек -->
      <g ref="stars" opacity="0">
        <!-- Звездочки будут добавляться динамически -->
      </g>
    </svg>
    <!-- Контейнер для конфетти -->
    <div ref="confetti" class="confetti-container"></div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

export default {
  name: 'GiftBoxAnimation',
  
  props: {
    isFocused: {
      type: Boolean,
      default: false
    },
    isPassword: {
      type: Boolean,
      default: false
    },
    hasError: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      animations: {},
      balloonsCount: 5,
      starsCount: 6
    }
  },

  watch: {
    isFocused(newVal) {
      if (this.isPassword) {
        this.animatePasswordField(newVal)
      } else {
        this.animateEmailField(newVal)
      }
    },
    
    hasError(newVal) {
      if (newVal) {
        this.playErrorAnimation()
      }
    },

    isSuccess(newVal) {
      if (newVal) {
        this.playSuccessAnimation()
      }
    }
  },

  mounted() {
    this.initializeAnimations()
    this.createBalloons()
    this.createStars()
  },

  methods: {
    initializeAnimations() {
      // Инициализация базовых анимаций
      this.animations.lid = gsap.to(this.$refs.lid, {
        y: -20,
        duration: 0.5,
        paused: true
      })

      this.animations.shake = gsap.to(this.$refs.container, {
        x: 2,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        paused: true
      })
    },

    createBalloons() {
      // Динамическое создание воздушных шаров
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']
      for (let i = 0; i < this.balloonsCount; i++) {
        const balloon = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        balloon.setAttribute('cx', 80 + i * 10)
        balloon.setAttribute('cy', 90)
        balloon.setAttribute('r', 5)
        balloon.setAttribute('fill', colors[i % colors.length])
        this.$refs.balloons.appendChild(balloon)
      }
    },

    createStars() {
      // Динамическое создание звездочек
      for (let i = 0; i < this.starsCount; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        const angle = (i / this.starsCount) * Math.PI * 2
        const x = 100 + Math.cos(angle) * 30
        const y = 100 + Math.sin(angle) * 30
        star.setAttribute('d', `M ${x},${y} l 2,0 l 1,-3 l 1,3 l 2,0 l -2,2 l 1,3 l -2,-2 l -2,2 l 1,-3 z`)
        star.setAttribute('fill', '#FFD700')
        this.$refs.stars.appendChild(star)
      }
    },

    animateEmailField(isFocused) {
      if (isFocused) {
        this.animations.lid.play()
        gsap.to(this.$refs.balloons, {
          opacity: 1,
          y: -30,
          stagger: 0.1,
          duration: 0.5
        })
      } else {
        this.animations.lid.reverse()
        gsap.to(this.$refs.balloons, {
          opacity: 0,
          y: 0,
          stagger: 0.1,
          duration: 0.3
        })
      }
    },

    animatePasswordField(isFocused) {
      if (isFocused) {
        gsap.to(this.$refs.stars, {
          opacity: 1,
          scale: 1.2,
          stagger: {
            each: 0.2,
            repeat: -1,
            yoyo: true
          }
        })
      } else {
        gsap.to(this.$refs.stars, {
          opacity: 0,
          scale: 1,
          stagger: 0
        })
      }
    },

    playErrorAnimation() {
      this.animations.shake.restart()
    },

    playSuccessAnimation() {
      // Анимация открытия коробки
      gsap.to(this.$refs.lid, {
        y: -50,
        rotation: -20,
        duration: 0.5
      })

      // Запуск конфетти
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }
}
</script>

<style scoped>
.gift-box-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.gift-box {
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

:root[theme="light"] {
  --gift-box-color: #8B5CF6;
  --gift-ribbon-color: #F59E0B;
}

:root[theme="dark"] {
  --gift-box-color: #6D28D9;
  --gift-ribbon-color: #D97706;
}

.is-focused {
  filter: drop-shadow(0 0 8px rgb(139 92 246 / 30%));
}

.is-error {
  --gift-box-color: #EF4444;
  --gift-ribbon-color: #DC2626;
}
</style> 