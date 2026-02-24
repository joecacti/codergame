<script setup>
import { computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

const { state } = useGameState()

const badgeDefinitions = [
  { id: 'variables', label: 'Variables', icon: '📦' },
  { id: 'ifElse', label: 'If/Else', icon: '⚖️' },
  { id: 'whileLoops', label: 'While Loops', icon: '🔄' },
  { id: 'functions', label: 'Functions', icon: '🔧' },
  { id: 'forLoops', label: 'For Loops', icon: '🔢' },
  { id: 'arrays', label: 'Arrays', icon: '🗂️' },
]

const earnedCount = computed(
  () => badgeDefinitions.filter((b) => state.badges[b.id]).length
)
</script>

<template>
  <div class="badge-shelf" aria-label="Badge shelf">
    <h3 class="badge-shelf__title">Badge Shelf</h3>
    <p class="badge-shelf__count">{{ earnedCount }}/{{ badgeDefinitions.length }} earned</p>

    <div class="badge-shelf__grid" role="list">
      <div
        v-for="badge in badgeDefinitions"
        :key="badge.id"
        class="badge-slot"
        :class="{ 'badge-slot--earned': state.badges[badge.id] }"
        role="listitem"
        :aria-label="`${badge.label}: ${state.badges[badge.id] ? 'earned' : 'locked'}`"
        :title="badge.label"
      >
        <span class="badge-slot__icon" aria-hidden="true">
          {{ state.badges[badge.id] ? badge.icon : '🔒' }}
        </span>
        <span class="badge-slot__label">{{ badge.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-shelf {
  padding: 1rem;
}

.badge-shelf__title {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold);
  margin-bottom: 0.25rem;
}

.badge-shelf__count {
  font-family: var(--font-code);
  font-size: 0.72rem;
  color: var(--color-parchment);
  opacity: 0.5;
  margin-bottom: 0.75rem;
}

.badge-shelf__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.badge-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: var(--border-radius-sm);
  opacity: 0.4;
  filter: grayscale(1);
  transition: all var(--transition-speed);
}

.badge-slot--earned {
  opacity: 1;
  filter: none;
  background: rgba(212, 160, 23, 0.08);
  border-color: rgba(212, 160, 23, 0.35);
  box-shadow: 0 0 8px rgba(212, 160, 23, 0.1);
}

.badge-slot__icon {
  font-size: 1.4rem;
  line-height: 1;
}

.badge-slot__label {
  font-family: var(--font-code);
  font-size: 0.6rem;
  color: var(--color-parchment);
  text-align: center;
  opacity: 0.7;
  line-height: 1.2;
}
</style>
