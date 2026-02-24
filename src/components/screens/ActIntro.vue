<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useGameState } from '../../composables/useGameState.js'
import { getAct } from '../../data/acts.js'

const { state, setPhase } = useGameState()

const currentActData = computed(() => getAct(state.currentAct))

let autoAdvanceTimer = null

function advance() {
  setPhase('playing')
}

onMounted(() => {
  autoAdvanceTimer = setTimeout(advance, 3500)
})

onUnmounted(() => {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer)
  }
})
</script>

<template>
  <div
    class="act-intro"
    :style="{ '--act-color': currentActData?.color ?? '#4a6741' }"
    role="main"
    @click="advance"
    aria-label="Click to continue to the game"
  >
    <!-- Background glow -->
    <div class="act-intro-glow" aria-hidden="true"></div>

    <!-- Content -->
    <div class="act-intro-content">
      <p class="act-label">Act {{ state.currentAct }}</p>

      <h1 class="act-title">{{ currentActData?.title ?? 'Unknown Waters' }}</h1>

      <p class="act-subtitle">{{ currentActData?.subtitle ?? '' }}</p>

      <p class="act-description">{{ currentActData?.description ?? '' }}</p>

      <!-- Concepts list -->
      <div v-if="currentActData?.concepts?.length" class="concepts-list" aria-label="Concepts covered in this act">
        <span class="concepts-label">Skills you'll learn:</span>
        <ul class="concepts">
          <li
            v-for="concept in currentActData.concepts"
            :key="concept"
            class="concept-badge"
          >
            {{ concept }}
          </li>
        </ul>
      </div>

      <p class="click-hint">Click anywhere to begin</p>
    </div>
  </div>
</template>

<style scoped>
.act-intro {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 50% 40%,
    color-mix(in srgb, var(--act-color) 40%, var(--color-navy) 60%) 0%,
    var(--color-navy) 50%,
    var(--color-navy-dark) 100%
  );
  cursor: pointer;
  animation: act-intro-in 0.7s ease forwards;
}

@keyframes act-intro-in {
  from {
    opacity: 0;
    transform: scale(1.04);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.act-intro-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 600px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--act-color) 60%, transparent) 0%,
    transparent 70%
  );
  opacity: 0.25;
  pointer-events: none;
}

.act-intro-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  max-width: 680px;
  padding: 2rem;
  animation: content-rise 0.9s ease 0.2s both;
}

@keyframes content-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.act-label {
  font-family: var(--font-code);
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  color: var(--color-gold);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.act-title {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 7vw, 5rem);
  color: var(--color-gold);
  text-shadow:
    0 0 40px rgba(212, 160, 23, 0.6),
    0 0 80px rgba(212, 160, 23, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.9);
  line-height: 1;
  margin-bottom: 0.1rem;
}

.act-subtitle {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: var(--color-parchment-dark);
  letter-spacing: 0.05em;
  opacity: 0.85;
  margin-bottom: 0.5rem;
}

.act-description {
  font-family: var(--font-body);
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  color: var(--color-parchment);
  opacity: 0.75;
  line-height: 1.7;
  max-width: 560px;
  margin-bottom: 1rem;
  font-style: italic;
}

.concepts-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.concepts-label {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: var(--color-gold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}

.concepts {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.concept-badge {
  font-family: var(--font-code);
  font-size: 0.78rem;
  padding: 0.25em 0.75em;
  background: rgba(212, 160, 23, 0.15);
  border: 1px solid rgba(212, 160, 23, 0.4);
  border-radius: 20px;
  color: var(--color-gold-light);
  letter-spacing: 0.05em;
}

.click-hint {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-parchment);
  opacity: 0.35;
  margin-top: 0.5rem;
  animation: pulse-hint 2s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.6; }
}
</style>
