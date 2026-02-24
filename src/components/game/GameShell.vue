<script setup>
import { ref, computed, watch } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

import StatsBar from '../ui/StatsBar.vue'
import PseudocodePanel from '../ui/PseudocodePanel.vue'
import ConceptToast from '../ui/ConceptToast.vue'
import DialogueBox from './DialogueBox.vue'
import ChoicePanel from './ChoicePanel.vue'

import ActOne from '../acts/ActOne.vue'
import ActTwo from '../acts/ActTwo.vue'
import ActThree from '../acts/ActThree.vue'
import ActFour from '../acts/ActFour.vue'

const { state } = useGameState()

/* ── Act routing ──────────────────────────────────────────────────────────── */

const currentActComponent = computed(() => {
  switch (state.currentAct) {
    case 1: return ActOne
    case 2: return ActTwo
    case 3: return ActThree
    case 4: return ActFour
    default: return ActOne
  }
})

/* ── Badge toast ──────────────────────────────────────────────────────────── */

/** Template ref for the ConceptToast component */
const toastRef = ref(null)

/**
 * Badge metadata used to build the toast payload.
 * Keys match state.badges keys.
 */
const badgeMeta = {
  variables:  { name: 'Variable Vault',    concept: 'Variables',   icon: '📦' },
  ifElse:     { name: 'Decision Maker',    concept: 'IF / ELSE',   icon: '⚖️' },
  whileLoops: { name: 'Loop Wrangler',     concept: 'WHILE Loops', icon: '🔄' },
  functions:  { name: 'Function Forger',   concept: 'Functions',   icon: '🔧' },
  forLoops:   { name: 'Count Commander',   concept: 'FOR Loops',   icon: '🔢' },
  arrays:     { name: 'Array Admiral',     concept: 'Arrays',      icon: '🗂️' },
}

/**
 * Watch every badge key. When one flips from false → true, fire the toast.
 * We track previously-seen values so we only toast on the actual transition.
 */
const previousBadges = ref({ ...state.badges })

watch(
  () => ({ ...state.badges }),
  (newBadges) => {
    for (const [id, earned] of Object.entries(newBadges)) {
      if (earned && !previousBadges.value[id]) {
        // Badge was just awarded
        const meta = badgeMeta[id]
        if (meta && toastRef.value) {
          toastRef.value.show({ id, ...meta })
        }
      }
    }
    previousBadges.value = { ...newBadges }
  },
  { deep: true }
)
</script>

<template>
  <div class="game-shell">

    <!-- ── Stats bar spanning full width ──────────────────────────────────── -->
    <header class="game-shell__stats">
      <StatsBar />
    </header>

    <!-- ── Main area: scene + panel ───────────────────────────────────────── -->
    <div class="game-shell__main">

      <!-- Left: Scene area with dialogue/choice overlays -->
      <section class="game-shell__scene-area" aria-label="Game scene">

        <!-- Act-specific content -->
        <div class="game-shell__act-content">
          <component :is="currentActComponent" />
        </div>

        <!-- Dialogue box overlaid at bottom of scene area -->
        <DialogueBox />

        <!-- Choice panel overlaid above dialogue -->
        <ChoicePanel />

      </section>

      <!-- Right: Pseudocode panel -->
      <aside
        class="game-shell__panel"
        aria-label="Captain's Codebook"
      >
        <PseudocodePanel />
      </aside>

    </div>

    <!-- ── Badge toast overlay (top-right, above everything) ──────────────── -->
    <div class="game-shell__toast-area" aria-live="polite" aria-atomic="true">
      <ConceptToast ref="toastRef" />
    </div>

  </div>
</template>

<style scoped>
/* ── Shell grid ───────────────────────────────────────────────────────────── */

.game-shell {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: var(--stats-bar-height) 1fr;
  background-color: var(--color-navy-dark);
  overflow: hidden;
  position: relative;
}

.game-shell__stats {
  grid-row: 1;
  z-index: 10;
}

/* ── Main content row ─────────────────────────────────────────────────────── */

.game-shell__main {
  grid-row: 2;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  /* Panel slides over content when collapsed; prevent any overflow bleed */
  position: relative;
}

/* ── Scene area ───────────────────────────────────────────────────────────── */

.game-shell__scene-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-navy-dark);
  min-width: 0;
}

.game-shell__act-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Panel sidebar ────────────────────────────────────────────────────────── */

.game-shell__panel {
  /* Let the PseudocodePanel control its own width via --panel-width */
  flex-shrink: 0;
  border-left: var(--border-gold);
  background: linear-gradient(
    180deg,
    var(--color-navy-light) 0%,
    var(--color-navy) 100%
  );
  overflow: visible;   /* allow the collapse tab to protrude left */
  position: relative;
  /* Match the panel component's own width so the aside doesn't collapse */
  width: var(--panel-width);
}

/* ── Toast overlay ────────────────────────────────────────────────────────── */

.game-shell__toast-area {
  position: absolute;
  top: calc(var(--stats-bar-height) + 0.875rem);
  right: calc(var(--panel-width) + 0.875rem);
  z-index: var(--z-toast);
  /* Pointer events only on actual toast content */
  pointer-events: none;
}

.game-shell__toast-area > * {
  pointer-events: auto;
}
</style>
