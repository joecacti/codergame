<script setup>
import { computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

const { state, resetGame } = useGameState()

const badgeDefinitions = [
  {
    id: 'variables',
    label: 'Variable Vanguard',
    description: 'Mastered the art of storing and retrieving values',
    icon: '📦',
  },
  {
    id: 'ifElse',
    label: 'Decision Dasher',
    description: 'Learned to branch paths with if/else logic',
    icon: '⚖️',
  },
  {
    id: 'whileLoops',
    label: 'Loop Leviathan',
    description: 'Harnessed the power of while loops',
    icon: '🔄',
  },
  {
    id: 'functions',
    label: 'Function Phantom',
    description: 'Bundled code into reusable functions',
    icon: '🔧',
  },
  {
    id: 'forLoops',
    label: 'For Loop Freebooter',
    description: 'Counted and iterated with for loops',
    icon: '🔢',
  },
  {
    id: 'arrays',
    label: 'Array Admiral',
    description: 'Conquered collections with arrays',
    icon: '🗂️',
  },
]

const earnedCount = computed(() =>
  badgeDefinitions.filter((b) => state.badges[b.id]).length
)
</script>

<template>
  <div class="badge-screen" role="main">
    <div class="badge-content">
      <h1 class="badge-heading">Your Badges</h1>

      <p class="badge-summary-text">
        {{ earnedCount }} of {{ badgeDefinitions.length }} badges earned
      </p>

      <div class="badge-grid" role="list" aria-label="Badge collection">
        <article
          v-for="badge in badgeDefinitions"
          :key="badge.id"
          class="badge-card"
          :class="{ 'badge-card--earned': state.badges[badge.id] }"
          role="listitem"
          :aria-label="`${badge.label}: ${state.badges[badge.id] ? 'Earned' : 'Locked'}`"
        >
          <div class="badge-icon" aria-hidden="true">
            <span v-if="state.badges[badge.id]">{{ badge.icon }}</span>
            <span v-else class="badge-lock">🔒</span>
          </div>

          <div class="badge-info">
            <h3 class="badge-label">{{ badge.label }}</h3>
            <p class="badge-desc">{{ badge.description }}</p>
          </div>

          <div
            class="badge-status"
            :aria-hidden="true"
          >
            <span v-if="state.badges[badge.id]" class="status-earned">Earned</span>
            <span v-else class="status-locked">Locked</span>
          </div>
        </article>
      </div>

      <div class="badge-actions">
        <button class="play-again-btn" @click="resetGame">
          &#9875; Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    ellipse at 50% 20%,
    var(--color-navy-light) 0%,
    var(--color-navy-dark) 100%
  );
  overflow-y: auto;
}

.badge-content {
  max-width: 780px;
  width: 90%;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.badge-heading {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--color-gold);
  text-shadow:
    0 0 30px rgba(212, 160, 23, 0.6),
    0 3px 8px rgba(0, 0, 0, 0.8);
  margin-bottom: 0;
}

.badge-summary-text {
  font-family: var(--font-code);
  font-size: 0.9rem;
  color: var(--color-parchment);
  opacity: 0.6;
  letter-spacing: 0.05em;
}

.badge-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-speed);
  opacity: 0.6;
  filter: grayscale(0.8);
}

.badge-card--earned {
  opacity: 1;
  filter: none;
  background: rgba(212, 160, 23, 0.08);
  border-color: rgba(212, 160, 23, 0.4);
  box-shadow: 0 0 12px rgba(212, 160, 23, 0.1);
}

.badge-icon {
  font-size: 2.2rem;
  min-width: 2.5rem;
  text-align: center;
  line-height: 1;
}

.badge-lock {
  font-size: 1.6rem;
  opacity: 0.4;
}

.badge-info {
  flex: 1;
}

.badge-label {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--color-gold);
  margin-bottom: 0.15rem;
}

.badge-desc {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-parchment);
  opacity: 0.65;
  line-height: 1.4;
  margin-bottom: 0;
  font-style: italic;
}

.badge-status {
  text-align: right;
  min-width: 56px;
}

.status-earned {
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: var(--color-emerald-light);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(46, 139, 87, 0.2);
  border: 1px solid rgba(46, 139, 87, 0.4);
  padding: 0.2em 0.6em;
  border-radius: 20px;
}

.status-locked {
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: var(--color-parchment);
  opacity: 0.3;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-actions {
  margin-top: 0.5rem;
}

.play-again-btn {
  font-size: 1.1rem;
  padding: 0.7em 2.2em;
}
</style>
