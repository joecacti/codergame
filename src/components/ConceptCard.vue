<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  level: { type: Number, required: true },
  initials: { type: String, default: '' },
})

const emit = defineEmits(['dismiss'])

const visible = ref(false)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 200)
})

const CONCEPTS = {
  1: {
    title: 'VARIABLES',
    emoji: '📦',
    summary: 'A variable is a named box that holds a value.',
    details: [
      { label: 'String (Text)', example: '"oak"', color: '#4ade80' },
      { label: 'Number', example: '3, 12', color: '#fb923c' },
      { label: 'Boolean (Yes/No)', example: 'true', color: '#f472b6' },
    ],
    footer: 'You used all three types to build your ship!',
  },
  2: {
    title: 'IF / ELSE',
    emoji: '🔀',
    summary: 'Your code checked conditions and chose actions.',
    details: [
      { label: 'if (...)', example: 'Check a condition', color: '#60a5fa' },
      { label: '=== ', example: 'Is exactly equal to', color: '#c084fc' },
      { label: '{ action }', example: 'Do this if true', color: '#86efac' },
    ],
    footer: 'Every obstacle was an IF statement!',
  },
  3: {
    title: 'FOR LOOPS',
    emoji: '🔁',
    summary: 'Your code repeated actions using loops!',
    details: [
      { label: 'for', example: 'Start a loop (repeat)', color: '#c084fc' },
      { label: 'i < N', example: 'How many times to repeat', color: '#60a5fa' },
      { label: 'i++', example: 'Count up by 1 each time', color: '#fb923c' },
      { label: '{ action }', example: 'What to do each loop', color: '#86efac' },
    ],
    footer: 'Every obstacle used a loop to repeat!',
  },
}
</script>

<template>
  <div v-if="level in CONCEPTS" class="concept-overlay" :class="{ visible }">
    <div class="concept-card">
      <div class="concept-emoji">{{ CONCEPTS[level].emoji }}</div>
      <div class="concept-title">{{ CONCEPTS[level].title }}</div>
      <div class="concept-summary">{{ CONCEPTS[level].summary }}</div>
      <div class="concept-details">
        <div v-for="d in CONCEPTS[level].details" :key="d.label" class="concept-detail">
          <span class="detail-label" :style="{ color: d.color }">{{ d.label }}</span>
          <span class="detail-example">{{ d.example }}</span>
        </div>
      </div>
      <div class="concept-footer">{{ CONCEPTS[level].footer }}</div>
      <div class="concept-badge">Captain {{ initials }}</div>
      <button class="concept-dismiss" @click="$emit('dismiss')">Got it!</button>
    </div>
  </div>
</template>

<style scoped>
.concept-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0,0,0,.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .4s;
  pointer-events: none;
}
.concept-overlay.visible { opacity: 1; pointer-events: auto; }
.concept-card {
  background: linear-gradient(135deg, #1a2a4a 0%, #0f1d35 100%);
  border: 2px solid rgba(251,191,36,.4);
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 40px rgba(251,191,36,.15), 0 20px 60px rgba(0,0,0,.5);
  animation: cardIn .5s ease;
}
@keyframes cardIn {
  from { transform: scale(.85) translateY(30px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.concept-emoji { font-size: 42px; margin-bottom: 8px; }
.concept-title {
  font-size: 22px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.concept-summary { font-size: 14px; color: #e2e8f0; margin-bottom: 16px; }
.concept-details {
  background: rgba(0,0,0,.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.concept-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.concept-detail:last-child { border-bottom: none; }
.detail-label { font-family: monospace; font-size: 13px; font-weight: 700; }
.detail-example { font-size: 12px; color: #888; }
.concept-footer { font-size: 13px; color: #a5f3fc; font-style: italic; margin-bottom: 12px; }
.concept-badge {
  display: inline-block;
  background: rgba(251,191,36,.15);
  border: 1px solid rgba(251,191,36,.3);
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 12px;
  color: #fbbf24;
  font-family: Georgia, serif;
  margin-bottom: 16px;
}
.concept-dismiss {
  display: block;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0a1628;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Georgia, serif;
}
</style>
