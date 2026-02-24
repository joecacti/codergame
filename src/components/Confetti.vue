<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  x: { type: Number, default: 50 },
  y: { type: Number, default: 30 },
  count: { type: Number, default: 30 },
  variant: { type: String, default: 'confetti' }, // confetti | sparkle | golden-burst
})

const COLORS_MAP = {
  confetti: ['#fbbf24', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ec4899'],
  sparkle: ['#fbbf24', '#fde68a', '#fff', '#fef3c7'],
  'golden-burst': ['#fbbf24', '#f59e0b', '#d97706', '#fde68a', '#fff'],
}

const colors = computed(() => COLORS_MAP[props.variant] || COLORS_MAP.confetti)

const isSparkle = computed(() => props.variant === 'sparkle')
const isBurst = computed(() => props.variant === 'golden-burst')

const particles = Array.from({ length: props.count }, (_, i) => ({
  id: i,
  x: props.x,
  y: props.y,
  vx: (Math.random() - 0.5) * (isBurst.value ? 16 : 12),
  vy: -Math.random() * (isBurst.value ? 14 : 10) - 3,
  color: colors.value[Math.floor(Math.random() * colors.value.length)],
  size: isSparkle.value ? Math.random() * 3 + 1 : Math.random() * 6 + 3,
  rot: Math.random() * 360,
}))

const frame = ref(0)
let intervalId = null
let timeoutId = null

onMounted(() => {
  intervalId = setInterval(() => { frame.value++ }, 30)
  timeoutId = setTimeout(() => clearInterval(intervalId), 2000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
  clearTimeout(timeoutId)
})

function px(p) { return p.x + p.vx * frame.value * 0.15 }
function py(p) { return p.y + p.vy * frame.value * 0.15 + 0.15 * frame.value * frame.value * 0.04 }
function opacity(p) { return Math.max(0, 1 - frame.value * 0.025) }
function rotation(p) { return p.rot + frame.value * 8 }
</script>

<template>
  <svg class="confetti-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <template v-if="isSparkle">
      <circle
        v-for="p in particles"
        :key="p.id"
        v-show="opacity(p) > 0"
        :cx="px(p)"
        :cy="py(p)"
        :r="p.size * 0.3"
        :fill="p.color"
        :opacity="opacity(p)"
      />
    </template>
    <template v-else>
      <rect
        v-for="p in particles"
        :key="p.id"
        v-show="opacity(p) > 0"
        :x="px(p)"
        :y="py(p)"
        :width="p.size * (isBurst ? 0.5 : 0.4)"
        :height="p.size * (isBurst ? 0.4 : 0.3)"
        :fill="p.color"
        :opacity="opacity(p)"
        :transform="`rotate(${rotation(p)} ${px(p)} ${py(p)})`"
      />
    </template>
  </svg>
</template>

<style scoped>
.confetti-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 100;
}
</style>
