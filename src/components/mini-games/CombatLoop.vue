<script setup>
import { ref, computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

const emit = defineEmits(['complete'])

const { state, adjustStat, awardBadge } = useGameState()

// ── Battle State ──────────────────────────────────────────────────────────────

const GHOST_MAX_HP = 60
const PLAYER_MAX_HP = 100

const ghostHealth = ref(GHOST_MAX_HP)
const round = ref(0)
const battleLog = ref([])
const phase = ref('fighting') // 'fighting' | 'victory'
const lastAction = ref(null) // 'attack' | 'defend' | null
const highlightedLine = ref(0) // which pseudocode line is active
const isAnimating = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────────

const playerHealth = computed(() => state.player.health)

const ghostHealthPct = computed(() =>
  Math.max(0, Math.round((ghostHealth.value / GHOST_MAX_HP) * 100))
)

const playerHealthPct = computed(() =>
  Math.max(0, Math.round((playerHealth.value / PLAYER_MAX_HP) * 100))
)

const ghostBarColor = computed(() => {
  if (ghostHealthPct.value > 50) return '#2e8b57'
  if (ghostHealthPct.value > 25) return '#d4a017'
  return '#8b0000'
})

const playerBarColor = computed(() => {
  if (playerHealthPct.value > 50) return '#2e8b57'
  if (playerHealthPct.value > 25) return '#d4a017'
  return '#8b0000'
})

const recentLog = computed(() => battleLog.value.slice(-3))

// ── Pseudocode Lines ──────────────────────────────────────────────────────────

const pseudoLines = computed(() => [
  { text: `WHILE ghostHealth > 0 DO`, comment: `// Now: ${ghostHealth.value}` },
  { text: `  round = round + 1`, comment: `// Round: ${round.value}` },
  { text: `  CHOOSE action`, comment: `` },
  { text: `  IF action == "attack" THEN`, comment: `` },
  { text: `    ghostHealth = ghostHealth - damage`, comment: `` },
  { text: `  ELSE IF action == "defend" THEN`, comment: `` },
  { text: `    health = health + 10`, comment: `` },
  { text: `  END IF`, comment: `` },
  { text: `END WHILE`, comment: `` },
  { text: `// Battle complete!`, comment: `` },
])

// ── Actions ───────────────────────────────────────────────────────────────────

function addLog(message, type = 'neutral') {
  battleLog.value.push({ message, type, id: Date.now() + Math.random() })
}

async function performAction(action) {
  if (isAnimating.value || phase.value !== 'fighting') return

  isAnimating.value = true
  lastAction.value = action
  round.value += 1

  // Highlight: round counter line
  highlightedLine.value = 1
  await delay(400)

  // Highlight: CHOOSE action
  highlightedLine.value = 2
  await delay(400)

  if (action === 'attack') {
    const damage = Math.floor(Math.random() * 11) + 15 // 15–25
    highlightedLine.value = 3
    await delay(400)
    highlightedLine.value = 4
    await delay(500)

    ghostHealth.value = Math.max(0, ghostHealth.value - damage)
    addLog(`Round ${round.value}: Ye struck the Ghost Captain for ${damage} damage!`, 'attack')
  } else {
    highlightedLine.value = 5
    await delay(400)
    highlightedLine.value = 6
    await delay(500)

    adjustStat('health', 10)
    addLog(`Round ${round.value}: Ye raised yer shield and recovered 10 HP!`, 'defend')
  }

  highlightedLine.value = 7
  await delay(300)

  if (ghostHealth.value <= 0) {
    // Victory path
    highlightedLine.value = 8
    await delay(400)
    highlightedLine.value = 9
    await delay(600)
    addLog('The Ghost Captain fades into the mist!', 'victory')
    awardBadge('whileLoops')
    phase.value = 'victory'
  } else {
    // Ghost counter-attacks (5–15 damage)
    const counterDmg = Math.floor(Math.random() * 11) + 5
    adjustStat('health', -counterDmg)
    addLog(`The Ghost Captain strikes back for ${counterDmg} damage!`, 'ghost')

    // Loop back to top
    highlightedLine.value = 0
    await delay(400)
  }

  isAnimating.value = false
}

function handleContinue() {
  emit('complete')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<template>
  <div class="combat-overlay" role="dialog" aria-modal="true" aria-label="WHILE Loop Battle Arena">
    <div class="combat-backdrop" aria-hidden="true"></div>

    <div class="combat-panel">
      <!-- Header -->
      <div class="combat-header">
        <h2 class="combat-title">Battle Arena</h2>
        <span class="combat-round" aria-live="polite">Round {{ round }}</span>
      </div>

      <!-- Health Bars -->
      <div class="health-bars" aria-label="Health status">
        <div class="combatant">
          <div class="combatant-label">
            <span class="combatant-icon" aria-hidden="true">👻</span>
            <span class="combatant-name">Ghost Captain</span>
            <span class="combatant-hp" aria-label="Ghost health">{{ ghostHealth }} / {{ GHOST_MAX_HP }}</span>
          </div>
          <div class="health-bar-track" role="progressbar" :aria-valuenow="ghostHealth" :aria-valuemax="GHOST_MAX_HP" aria-label="Ghost Captain health">
            <div
              class="health-bar-fill health-bar-fill--ghost"
              :style="{ width: ghostHealthPct + '%', backgroundColor: ghostBarColor }"
            ></div>
          </div>
        </div>

        <div class="combatant">
          <div class="combatant-label">
            <span class="combatant-icon" aria-hidden="true">🏴‍☠️</span>
            <span class="combatant-name">{{ state.player.name }}</span>
            <span class="combatant-hp" aria-label="Player health">{{ playerHealth }} / {{ PLAYER_MAX_HP }}</span>
          </div>
          <div class="health-bar-track" role="progressbar" :aria-valuenow="playerHealth" :aria-valuemax="PLAYER_MAX_HP" aria-label="Player health">
            <div
              class="health-bar-fill health-bar-fill--player"
              :style="{ width: playerHealthPct + '%', backgroundColor: playerBarColor }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main content: actions + pseudocode -->
      <div class="combat-body">
        <!-- Left: Actions + Battle Log -->
        <div class="combat-left">
          <!-- Victory state -->
          <Transition name="victory-pop">
            <div v-if="phase === 'victory'" class="victory-panel" aria-live="assertive">
              <div class="victory-icon" aria-hidden="true">🏆</div>
              <h3 class="victory-title">Victory!</h3>
              <p class="victory-text">
                Ye defeated the Ghost Captain! The WHILE loop ran {{ round }} times — once for each round of battle!
              </p>
              <div class="victory-badge" aria-label="Badge earned: While Loops">
                <span class="badge-icon" aria-hidden="true">⚓</span>
                <span class="badge-label">WHILE Loops Badge Earned!</span>
              </div>
              <button class="combat-btn combat-btn--continue" @click="handleContinue">
                Continue Voyage
              </button>
            </div>
          </Transition>

          <!-- Fighting state -->
          <div v-if="phase === 'fighting'" class="action-area">
            <p class="action-prompt">Choose yer action, Captain!</p>
            <div class="action-buttons">
              <button
                class="combat-btn combat-btn--attack"
                :disabled="isAnimating"
                @click="performAction('attack')"
                aria-label="Attack the Ghost Captain"
              >
                <span aria-hidden="true">⚔️</span> Attack
              </button>
              <button
                class="combat-btn combat-btn--defend"
                :disabled="isAnimating"
                @click="performAction('defend')"
                aria-label="Defend and recover health"
              >
                <span aria-hidden="true">🛡️</span> Defend
              </button>
            </div>

            <!-- Battle Log -->
            <div class="battle-log" aria-live="polite" aria-label="Battle log">
              <p class="log-title">Battle Log</p>
              <TransitionGroup name="log-entry" tag="ul" class="log-list">
                <li
                  v-for="entry in recentLog"
                  :key="entry.id"
                  class="log-entry"
                  :class="`log-entry--${entry.type}`"
                >
                  {{ entry.message }}
                </li>
              </TransitionGroup>
              <p v-if="battleLog.length === 0" class="log-empty">The battle has not yet begun...</p>
            </div>
          </div>
        </div>

        <!-- Right: Live Pseudocode -->
        <div class="code-panel" aria-label="WHILE loop pseudocode">
          <p class="code-panel-title">WHILE Loop — Live</p>
          <pre class="code-block">
            <code>
              <div
                v-for="(line, idx) in pseudoLines"
                :key="idx"
                class="code-line"
                :class="{
                  'code-line--active': highlightedLine === idx && phase === 'fighting',
                  'code-line--complete': phase === 'victory' && idx === 9,
                  'code-line--comment-only': line.text.trim().startsWith('//')
                }"
                :aria-current="highlightedLine === idx ? 'step' : undefined"
              >
                <span class="line-num" aria-hidden="true">{{ String(idx + 1).padStart(2, '0') }}</span>
                <span class="line-code">{{ line.text }}</span>
                <span v-if="line.comment" class="line-comment" aria-hidden="true">{{ line.comment }}</span>
              </div>
            </code>
          </pre>

          <!-- Variable Watch -->
          <div class="var-watch" aria-label="Current variable values">
            <p class="var-watch-title">Variables</p>
            <div class="var-row">
              <span class="var-name">ghostHealth</span>
              <span class="var-eq">=</span>
              <span class="var-val" :class="{ 'var-val--danger': ghostHealth <= 15 }">{{ ghostHealth }}</span>
            </div>
            <div class="var-row">
              <span class="var-name">round</span>
              <span class="var-eq">=</span>
              <span class="var-val">{{ round }}</span>
            </div>
            <div class="var-row">
              <span class="var-name">lastAction</span>
              <span class="var-eq">=</span>
              <span class="var-val">{{ lastAction ? `"${lastAction}"` : 'null' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */

.combat-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.combat-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 22, 40, 0.88);
  backdrop-filter: blur(3px);
}

/* ── Panel ───────────────────────────────────────────────────────────────── */

.combat-panel {
  position: relative;
  z-index: 1;
  width: min(820px, 100%);
  max-height: 90vh;
  background: linear-gradient(160deg, var(--color-navy-light) 0%, var(--color-navy-dark) 100%);
  border: 2px solid var(--color-gold-dark);
  border-radius: var(--border-radius-lg);
  box-shadow:
    0 0 60px rgba(212, 160, 23, 0.2),
    var(--shadow-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────────────────────────── */

.combat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(90deg, rgba(212, 160, 23, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(212, 160, 23, 0.3);
  flex-shrink: 0;
}

.combat-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 0 20px rgba(212, 160, 23, 0.6);
}

.combat-round {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-gold);
  background: rgba(212, 160, 23, 0.12);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-sm);
  padding: 0.2em 0.75em;
}

/* ── Health Bars ─────────────────────────────────────────────────────────── */

.health-bars {
  padding: 0.85rem 1.25rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(212, 160, 23, 0.15);
}

.combatant-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
}

.combatant-icon {
  font-size: 1rem;
}

.combatant-name {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--color-parchment);
  flex: 1;
}

.combatant-hp {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: var(--color-gold);
  opacity: 0.8;
}

.health-bar-track {
  height: 14px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.health-bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.5s ease, background-color 0.5s ease;
  position: relative;
}

.health-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 7px 7px 0 0;
}

/* ── Body ────────────────────────────────────────────────────────────────── */

.combat-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

/* ── Left Panel ──────────────────────────────────────────────────────────── */

.combat-left {
  padding: 1rem 1rem 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(212, 160, 23, 0.2);
  overflow-y: auto;
}

.action-area {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
}

.action-prompt {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  color: var(--color-gold-light);
  text-align: center;
  margin: 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.combat-btn {
  font-family: var(--font-heading);
  font-size: 1rem;
  padding: 0.65em 1em;
  border-radius: var(--border-radius-md);
  border: 2px solid;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
}

.combat-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.combat-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.combat-btn--attack {
  background: linear-gradient(135deg, var(--color-blood-light), var(--color-blood));
  border-color: #600000;
  color: var(--color-parchment);
  box-shadow: 0 3px 0 #400000, var(--shadow-dark);
}

.combat-btn--attack:not(:disabled):hover {
  background: linear-gradient(135deg, #d00000, var(--color-blood-light));
  transform: translateY(-2px);
  box-shadow: 0 5px 0 #400000, 0 0 20px rgba(139, 0, 0, 0.5);
}

.combat-btn--attack:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #400000;
}

.combat-btn--defend {
  background: linear-gradient(135deg, var(--color-ocean-light), var(--color-ocean));
  border-color: #1a3d50;
  color: var(--color-parchment);
  box-shadow: 0 3px 0 #0d2030, var(--shadow-dark);
}

.combat-btn--defend:not(:disabled):hover {
  background: linear-gradient(135deg, #4a9abc, var(--color-ocean-light));
  transform: translateY(-2px);
  box-shadow: 0 5px 0 #0d2030, 0 0 20px rgba(44, 95, 124, 0.5);
}

.combat-btn--defend:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #0d2030;
}

.combat-btn--continue {
  width: 100%;
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark), var(--shadow-dark);
  margin-top: 0.5rem;
  font-size: 1.05rem;
}

.combat-btn--continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--color-gold-dark), var(--shadow-gold);
}

/* ── Battle Log ──────────────────────────────────────────────────────────── */

.battle-log {
  flex: 1;
  min-height: 0;
}

.log-title {
  font-family: var(--font-code);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-gold);
  opacity: 0.5;
  margin-bottom: 0.4rem;
}

.log-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0;
  margin: 0;
}

.log-entry {
  font-family: var(--font-body);
  font-size: 0.78rem;
  padding: 0.3em 0.6em;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid transparent;
  line-height: 1.4;
}

.log-entry--attack {
  background: rgba(139, 0, 0, 0.2);
  border-left-color: var(--color-blood-light);
  color: #ffaaaa;
}

.log-entry--defend {
  background: rgba(44, 95, 124, 0.2);
  border-left-color: var(--color-ocean-light);
  color: #aaddff;
}

.log-entry--ghost {
  background: rgba(100, 60, 140, 0.2);
  border-left-color: #9966cc;
  color: #ddb8ff;
}

.log-entry--victory {
  background: rgba(212, 160, 23, 0.15);
  border-left-color: var(--color-gold);
  color: var(--color-gold-light);
}

.log-entry--neutral {
  background: rgba(244, 228, 193, 0.05);
  border-left-color: rgba(244, 228, 193, 0.3);
  color: var(--color-parchment);
}

.log-empty {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--color-parchment);
  opacity: 0.3;
  margin: 0;
}

/* ── Pseudocode Panel ────────────────────────────────────────────────────── */

.code-panel {
  padding: 0.85rem 1.25rem 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.25);
}

.code-panel-title {
  font-family: var(--font-code);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-gold);
  opacity: 0.6;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.code-block {
  flex: 1;
  margin: 0;
  overflow-y: auto;
  font-family: var(--font-code);
  font-size: 0.75rem;
  line-height: 1.65;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: var(--border-radius-sm);
  min-height: 0;
}

.code-block code {
  display: block;
  padding: 0.4rem 0;
}

.code-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.1em 0.6rem;
  border-left: 2px solid transparent;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.code-line--active {
  background: rgba(212, 160, 23, 0.18);
  border-left-color: var(--color-gold);
  animation: line-pulse 0.5s ease;
}

.code-line--complete {
  background: rgba(46, 139, 87, 0.2);
  border-left-color: var(--color-emerald-light);
  color: var(--color-emerald-light);
}

.code-line--comment-only .line-code {
  color: rgba(212, 160, 23, 0.5);
  font-style: italic;
}

@keyframes line-pulse {
  0% { background: rgba(212, 160, 23, 0.4); }
  100% { background: rgba(212, 160, 23, 0.18); }
}

.line-num {
  font-size: 0.6rem;
  color: rgba(212, 160, 23, 0.3);
  min-width: 1.3rem;
  user-select: none;
  flex-shrink: 0;
}

.line-code {
  color: var(--color-parchment);
  white-space: pre;
  opacity: 0.9;
  flex-shrink: 0;
}

.line-comment {
  font-size: 0.7rem;
  color: rgba(212, 160, 23, 0.55);
  font-style: italic;
  white-space: nowrap;
  margin-left: auto;
}

/* ── Variable Watch ──────────────────────────────────────────────────────── */

.var-watch {
  margin-top: 0.6rem;
  padding: 0.5rem 0.65rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.var-watch-title {
  font-family: var(--font-code);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-gold);
  opacity: 0.45;
  margin-bottom: 0.35rem;
}

.var-row {
  display: flex;
  gap: 0.4rem;
  font-family: var(--font-code);
  font-size: 0.73rem;
  margin-bottom: 0.15rem;
  align-items: baseline;
}

.var-name {
  color: #7ecfff;
}

.var-eq {
  color: rgba(212, 160, 23, 0.5);
}

.var-val {
  color: #b5e853;
  transition: color var(--transition-fast);
}

.var-val--danger {
  color: #ff7777;
  animation: danger-pulse 0.8s ease infinite;
}

@keyframes danger-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Victory Panel ───────────────────────────────────────────────────────── */

.victory-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.65rem;
  padding: 0.5rem;
  flex: 1;
}

.victory-icon {
  font-size: 2.8rem;
  animation: victory-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes victory-bounce {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.victory-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-gold);
  text-shadow: var(--shadow-gold);
  margin: 0;
}

.victory-text {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-parchment);
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
}

.victory-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 160, 23, 0.15);
  border: 1px solid rgba(212, 160, 23, 0.4);
  border-radius: var(--border-radius-md);
  padding: 0.4em 0.9em;
}

.badge-icon {
  font-size: 1.2rem;
}

.badge-label {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  color: var(--color-gold-light);
  letter-spacing: 0.04em;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

.victory-pop-enter-active {
  animation: victory-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes victory-pop {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.log-entry-enter-active {
  transition: all 0.3s ease;
}

.log-entry-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.log-entry-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.log-entry-leave-to {
  opacity: 0;
}
</style>
