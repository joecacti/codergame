<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  hints: { type: Array, default: () => [] },
  xp: { type: Number, default: 0 },
  freeHint: { type: Boolean, default: false },
})

const emit = defineEmits(['useHint'])

const hintLevel = ref(0)
const showHint = ref(false)

watch(() => props.hints, () => {
  hintLevel.value = 0
  showHint.value = false
})

const currentHint = computed(() => {
  if (hintLevel.value === 0 || !props.hints.length) return null
  return props.hints[Math.min(hintLevel.value - 1, props.hints.length - 1)]
})

const canAfford = computed(() => props.xp >= 5)
const allUsed = computed(() => hintLevel.value >= props.hints.length)

function requestHint() {
  if (allUsed.value || !canAfford.value) return
  hintLevel.value++
  showHint.value = true
  emit('useHint')
}

watch(() => props.freeHint, (val) => {
  if (val && !allUsed.value) {
    hintLevel.value++
    showHint.value = true
  }
})
</script>

<template>
  <div v-if="hints.length > 0" class="hint-area">
    <button
      class="hint-btn"
      :class="{ disabled: allUsed || !canAfford }"
      @click="requestHint"
      :title="allUsed ? 'No more hints' : !canAfford ? 'Need 5 XP' : 'Get a hint (-5 XP)'"
    >
      {{ allUsed ? 'No more hints' : '💡 Hint (-5 XP)' }}
    </button>
    <div v-if="showHint && currentHint" class="hint-text">
      <span class="hint-tier">Hint {{ hintLevel }}/{{ hints.length }}:</span>
      {{ currentHint }}
    </div>
  </div>
</template>

<style scoped>
.hint-area { margin: 6px 16px; }
.hint-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(251,191,36,.25);
  background: rgba(251,191,36,.08);
  color: #fbbf24;
  font-size: 12px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all .2s;
}
.hint-btn:hover:not(.disabled) { background: rgba(251,191,36,.15); }
.hint-btn.disabled { opacity: .4; cursor: default; color: #888; border-color: rgba(255,255,255,.1); }
.hint-text {
  margin-top: 6px;
  padding: 8px 12px;
  background: rgba(251,191,36,.08);
  border: 1px solid rgba(251,191,36,.15);
  border-radius: 6px;
  font-size: 12px;
  color: #e2e8f0;
  animation: hintIn .3s ease;
}
.hint-tier { color: #fbbf24; font-weight: 600; margin-right: 4px; }

@keyframes hintIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
