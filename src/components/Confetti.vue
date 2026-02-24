<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  x: { type: Number, default: 50 },
  y: { type: Number, default: 30 },
  count: { type: Number, default: 30 },
})

const COLORS = ['#fbbf24', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ec4899']

const particles = Array.from({ length: props.count }, (_, i) => ({
  id: i,
  x: props.x,
  y: props.y,
  vx: (Math.random() - 0.5) * 12,
  vy: -Math.random() * 10 - 3,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  size: Math.random() * 6 + 3,
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
    <rect
      v-for="p in particles"
      :key="p.id"
      v-show="opacity(p) > 0"
      :x="px(p)"
      :y="py(p)"
      :width="p.size * 0.4"
      :height="p.size * 0.3"
      :fill="p.color"
      :opacity="opacity(p)"
      :transform="`rotate(${rotation(p)} ${px(p)} ${py(p)})`"
    />
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
