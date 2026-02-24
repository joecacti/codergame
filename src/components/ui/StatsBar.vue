<script setup>
import { computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'
import { getAct } from '../../data/acts.js'

const { state } = useGameState()

/* ── Computed helpers ────────────────────────────────────────────────────── */

const healthPercent = computed(() => `${Math.min(100, Math.max(0, state.player.health))}%`)
const reputationPercent = computed(() => `${Math.min(100, Math.max(0, state.player.reputation))}%`)

/**
 * Health bar color shifts from green → amber → red as health drops.
 */
const healthBarColor = computed(() => {
  const h = state.player.health
  if (h > 60) return '#c0392b'      // blood red (healthy pirate red)
  if (h > 30) return '#e8720a'      // orange warning
  return '#8b0000'                  // dark blood — critical
})

const currentActData = computed(() => getAct(state.currentAct))

const locationLabel = computed(() => {
  if (!currentActData.value) return 'Unknown Waters'
  return `Act ${state.currentAct}: ${currentActData.value.title}`
})
</script>

<template>
  <div class="stats-bar" role="banner" aria-label="Player statistics">

    <!-- ── Captain info ──────────────────────────────────────────────────── -->
    <div class="stats-bar__player">
      <span class="stats-bar__skull" aria-hidden="true">☠</span>
      <span class="stats-bar__name">{{ state.player.name }}</span>
    </div>

    <!-- ── Stat bars ─────────────────────────────────────────────────────── -->
    <div class="stats-bar__stats" role="group" aria-label="Stats">

      <!-- Health -->
      <div
        class="stat"
        role="meter"
        :aria-valuenow="state.player.health"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Health"
      >
        <span class="stat__icon" aria-hidden="true">❤</span>
        <span class="stat__label sr-only">Health</span>
        <div class="stat__track" aria-hidden="true">
          <div
            class="stat__fill stat__fill--health"
            :style="{ width: healthPercent, backgroundColor: healthBarColor }"
          ></div>
        </div>
        <span class="stat__value">{{ state.player.health }}</span>
      </div>

      <!-- Separator -->
      <span class="stat-sep" aria-hidden="true">|</span>

      <!-- Gold -->
      <div class="stat stat--gold" aria-label="Gold coins">
        <span class="stat__icon" aria-hidden="true">⚜</span>
        <span class="stat__label sr-only">Gold</span>
        <span class="stat__value stat__value--gold">{{ state.player.gold }}</span>
        <span class="stat__unit" aria-hidden="true">gp</span>
      </div>

      <!-- Separator -->
      <span class="stat-sep" aria-hidden="true">|</span>

      <!-- Reputation -->
      <div
        class="stat"
        role="meter"
        :aria-valuenow="state.player.reputation"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reputation"
      >
        <span class="stat__icon" aria-hidden="true">⭐</span>
        <span class="stat__label sr-only">Reputation</span>
        <div class="stat__track" aria-hidden="true">
          <div
            class="stat__fill stat__fill--rep"
            :style="{ width: reputationPercent }"
          ></div>
        </div>
        <span class="stat__value">{{ state.player.reputation }}</span>
      </div>
    </div>

    <!-- ── Location ──────────────────────────────────────────────────────── -->
    <div class="stats-bar__location" aria-label="Current act and location">
      <span class="stats-bar__location-icon" aria-hidden="true">⚓</span>
      <span class="stats-bar__location-text">{{ locationLabel }}</span>
    </div>

    <!-- ── Inventory badge ───────────────────────────────────────────────── -->
    <div class="stats-bar__inventory" aria-label="Inventory item count">
      <span class="inv-icon" aria-hidden="true">🎒</span>
      <span
        class="inv-count"
        :aria-label="`${state.inventory.length} items`"
      >{{ state.inventory.length }}</span>
    </div>

  </div>
</template>

<style scoped>
/* ── Bar shell ────────────────────────────────────────────────────────────── */

.stats-bar {
  height: var(--stats-bar-height);
  background: linear-gradient(
    180deg,
    var(--color-navy-light) 0%,
    var(--color-navy-dark) 100%
  );
  border-bottom: 2px solid rgba(212, 160, 23, 0.35);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 1rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

/* ── Captain info ─────────────────────────────────────────────────────────── */

.stats-bar__player {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.stats-bar__skull {
  font-size: 1rem;
  color: var(--color-gold);
  filter: drop-shadow(0 0 4px rgba(212, 160, 23, 0.4));
}

.stats-bar__name {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  color: var(--color-parchment);
  white-space: nowrap;
}

/* ── Stats group ──────────────────────────────────────────────────────────── */

.stats-bar__stats {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
  justify-content: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stat__icon {
  font-size: 0.8rem;
  flex-shrink: 0;
  line-height: 1;
}

/* ── Progress tracks ──────────────────────────────────────────────────────── */

.stat__track {
  width: 80px;
  height: 7px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.stat__fill {
  height: 100%;
  border-radius: 4px;
  /* Smooth transitions when values change */
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.5s ease;
}

.stat__fill--health {
  /* Color is set inline via :style binding */
  box-shadow: 0 0 6px rgba(192, 57, 43, 0.5);
}

.stat__fill--rep {
  background: linear-gradient(
    90deg,
    var(--color-emerald) 0%,
    var(--color-emerald-light) 100%
  );
  box-shadow: 0 0 6px rgba(46, 139, 87, 0.5);
}

/* ── Numeric values ───────────────────────────────────────────────────────── */

.stat__value {
  font-family: var(--font-code);
  font-size: 0.72rem;
  color: var(--color-parchment);
  min-width: 1.8rem;
  opacity: 0.75;
  line-height: 1;
}

.stat__value--gold {
  font-family: var(--font-heading);
  font-size: 0.92rem;
  color: var(--color-gold);
  opacity: 1;
  min-width: auto;
  line-height: 1;
}

.stat__unit {
  font-family: var(--font-code);
  font-size: 0.6rem;
  color: var(--color-gold);
  opacity: 0.5;
  line-height: 1;
}

/* ── Separator ────────────────────────────────────────────────────────────── */

.stat-sep {
  color: rgba(255, 255, 255, 0.1);
  font-size: 0.7rem;
  line-height: 1;
  user-select: none;
}

/* ── Gold stat (no bar) ───────────────────────────────────────────────────── */

.stat--gold {
  gap: 0.3rem;
}

/* ── Location ─────────────────────────────────────────────────────────────── */

.stats-bar__location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.74rem;
  color: var(--color-parchment);
  opacity: 0.5;
  flex-shrink: 0;
  white-space: nowrap;
}

.stats-bar__location-icon {
  font-size: 0.8rem;
  line-height: 1;
}

/* ── Inventory ────────────────────────────────────────────────────────────── */

.stats-bar__inventory {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  flex-shrink: 0;
}

.inv-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.inv-count {
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: var(--color-gold);
  background: rgba(212, 160, 23, 0.12);
  border: 1px solid rgba(212, 160, 23, 0.28);
  border-radius: 20px;
  padding: 0.05em 0.5em;
  min-width: 1.4rem;
  text-align: center;
  line-height: 1.6;
}

/* ── Accessibility ────────────────────────────────────────────────────────── */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
