<script setup>
import { ref, computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

const emit = defineEmits(['complete'])

const { awardBadge } = useGameState()

// ── Chest Data ────────────────────────────────────────────────────────────────

const chests = [
  { index: 0, contents: 'rocks',      emoji: '🪨', description: 'Just a pile of boring rocks!' },
  { index: 1, contents: 'gold',       emoji: '💰', description: 'Shining gold coins!', isTarget: true },
  { index: 2, contents: 'cursed gem', emoji: '💀', description: 'A cursed gemstone — bad luck!' },
  { index: 3, contents: 'silver',     emoji: '🥈', description: 'Silver coins, but not the prize.' },
]

const TARGET_INDEX = 1

// ── State ─────────────────────────────────────────────────────────────────────

const phase = ref('picking')       // 'picking' | 'wrong' | 'correct' | 'revealed'
const openedIndex = ref(null)      // which chest was just opened
const wrongHint = ref(null)        // hint text for wrong pick
const allRevealed = ref(false)     // reveal all after correct
const goldParticles = ref(false)   // trigger gold sparkle effect

// ── Computed ──────────────────────────────────────────────────────────────────

const instruction = computed(() => {
  if (phase.value === 'correct' || phase.value === 'revealed') return null
  return `Pick the chest at index ${TARGET_INDEX}`
})

const pseudocodeLines = [
  { text: 'chests = ["rocks", "gold", "cursed gem", "silver"]', isActive: false },
  { text: '', isActive: false },
  { text: `// Pick the right chest:`, isActive: false },
  { text: `treasure = chests[1]`, isActive: true },
  { text: `// treasure = "gold"`, isActive: false },
]

// ── Actions ───────────────────────────────────────────────────────────────────

function pickChest(idx) {
  if (phase.value !== 'picking' && phase.value !== 'wrong') return

  openedIndex.value = idx

  if (idx === TARGET_INDEX) {
    phase.value = 'correct'
    goldParticles.value = true
    awardBadge('arrays')

    // Reveal all chests after a moment
    setTimeout(() => {
      allRevealed.value = true
      phase.value = 'revealed'
    }, 1500)
  } else {
    phase.value = 'wrong'
    wrongHint.value = `That's index [${idx}] — "${chests[idx].contents}"! Try chests[1]!`

    setTimeout(() => {
      phase.value = 'picking'
      openedIndex.value = null
      wrongHint.value = null
    }, 1800)
  }
}

function handleContinue() {
  emit('complete')
}

function getChestState(idx) {
  if (allRevealed.value) return 'revealed'
  if (openedIndex.value === idx) {
    if (idx === TARGET_INDEX) return 'correct'
    return 'wrong'
  }
  return 'closed'
}
</script>

<template>
  <div class="array-overlay" role="dialog" aria-modal="true" aria-label="Array Index Puzzle">
    <div class="array-backdrop" aria-hidden="true"></div>

    <div class="array-panel">
      <!-- Cave stalactite decoration -->
      <div class="cave-top" aria-hidden="true">
        <span v-for="n in 8" :key="n" class="stalactite" :style="{ height: (20 + (n * 7) % 25) + 'px', left: ((n - 1) * 12.5) + '%' }"></span>
      </div>

      <!-- Header -->
      <div class="array-header">
        <span class="cave-icon" aria-hidden="true">🕯️</span>
        <h2 class="array-title">The Treasure Cave</h2>
        <span class="cave-icon" aria-hidden="true">🕯️</span>
      </div>

      <!-- Pseudocode Banner -->
      <div class="pseudo-banner" aria-label="Array pseudocode">
        <pre class="pseudo-code">
          <code>
            <span
              v-for="(line, idx) in pseudocodeLines"
              :key="idx"
              class="pseudo-line"
              :class="{
                'pseudo-line--active': line.isActive,
                'pseudo-line--comment': line.text.trim().startsWith('//'),
                'pseudo-line--empty': line.text === ''
              }"
            >{{ line.text }}</span>
          </code>
        </pre>
      </div>

      <!-- Instruction -->
      <Transition name="instruction-fade">
        <p v-if="instruction && phase === 'picking'" class="instruction" aria-live="polite">
          <span class="instruction-arrow" aria-hidden="true">▼</span>
          {{ instruction }}
          <span class="instruction-arrow" aria-hidden="true">▼</span>
        </p>
      </Transition>

      <!-- Wrong Hint -->
      <Transition name="hint-slide">
        <div v-if="wrongHint" class="wrong-hint" role="alert" aria-live="assertive">
          <span aria-hidden="true">❌</span> {{ wrongHint }}
        </div>
      </Transition>

      <!-- Chests Row -->
      <div class="chests-row" role="group" aria-label="Four treasure chests — pick index 1">
        <div
          v-for="chest in chests"
          :key="chest.index"
          class="chest-wrapper"
        >
          <button
            class="chest-btn"
            :class="{
              'chest-btn--correct': getChestState(chest.index) === 'correct',
              'chest-btn--wrong': getChestState(chest.index) === 'wrong',
              'chest-btn--revealed': getChestState(chest.index) === 'revealed',
              'chest-btn--target-hint': phase === 'picking' && chest.isTarget,
              'chest-btn--disabled': phase === 'correct' || phase === 'revealed',
            }"
            :disabled="phase === 'correct' || phase === 'revealed'"
            @click="pickChest(chest.index)"
            :aria-label="`Treasure chest at index ${chest.index}`"
            :aria-pressed="openedIndex === chest.index ? true : undefined"
          >
            <!-- Chest lid -->
            <div class="chest-lid" :class="{ 'chest-lid--open': getChestState(chest.index) !== 'closed' }" aria-hidden="true">
              <div class="chest-lid-stripe"></div>
            </div>

            <!-- Chest body -->
            <div class="chest-body" aria-hidden="true">
              <div class="chest-lock" :class="{ 'chest-lock--open': getChestState(chest.index) !== 'closed' }">🔒</div>
            </div>

            <!-- Contents (shown when opened) -->
            <Transition name="contents-pop">
              <div
                v-if="getChestState(chest.index) !== 'closed'"
                class="chest-contents"
                :class="{
                  'chest-contents--correct': chest.isTarget,
                  'chest-contents--wrong': !chest.isTarget && getChestState(chest.index) === 'wrong',
                  'chest-contents--revealed': getChestState(chest.index) === 'revealed'
                }"
                aria-hidden="true"
              >
                {{ chest.emoji }}
              </div>
            </Transition>

            <!-- Gold particles on correct -->
            <Transition name="particles-pop">
              <div v-if="chest.isTarget && goldParticles" class="gold-particles" aria-hidden="true">
                <span v-for="n in 8" :key="n" class="particle" :style="{ '--angle': (n * 45) + 'deg', '--delay': (n * 0.05) + 's' }">✦</span>
              </div>
            </Transition>
          </button>

          <!-- Index label -->
          <div
            class="chest-index"
            :class="{
              'chest-index--target': chest.isTarget && (phase === 'correct' || phase === 'revealed'),
              'chest-index--highlight': chest.isTarget && phase === 'picking'
            }"
            aria-hidden="true"
          >
            [{{ chest.index }}]
          </div>

          <!-- Contents label (shown when revealed) -->
          <Transition name="label-pop">
            <div
              v-if="getChestState(chest.index) !== 'closed'"
              class="chest-label"
              :class="{
                'chest-label--correct': chest.isTarget,
                'chest-label--wrong': !chest.isTarget && getChestState(chest.index) === 'wrong',
                'chest-label--revealed': getChestState(chest.index) === 'revealed' && !chest.isTarget
              }"
              :aria-label="`chests[${chest.index}] contains ${chest.contents}`"
            >
              "{{ chest.contents }}"
            </div>
          </Transition>
        </div>
      </div>

      <!-- Result Panel -->
      <div class="result-area">
        <!-- Correct result -->
        <Transition name="result-pop">
          <div v-if="phase === 'correct' || phase === 'revealed'" class="result-panel" aria-live="assertive">
            <div class="result-icon" aria-hidden="true">🎉</div>
            <div class="result-text">
              <p class="result-title">Correct! <code class="result-code">chests[1] = "gold"</code></p>
              <p class="result-desc">
                Arrays start at index <strong>0</strong>, so <code>chests[1]</code> is the second chest!
              </p>
            </div>
            <div class="result-badge" aria-label="Badge earned: Arrays">
              <span aria-hidden="true">📦</span>
              <span>Arrays Badge Earned!</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Continue Button -->
      <Transition name="btn-pop">
        <div v-if="phase === 'revealed'" class="continue-row">
          <button class="array-btn array-btn--continue" @click="handleContinue">
            Claim the Treasure!
          </button>
        </div>
      </Transition>

      <!-- Cave stalagmite decoration -->
      <div class="cave-bottom" aria-hidden="true">
        <span v-for="n in 6" :key="n" class="stalagmite" :style="{ height: (18 + (n * 9) % 22) + 'px', left: ((n - 1) * 16.66 + 2) + '%' }"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */

.array-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.array-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 22, 40, 0.9);
  backdrop-filter: blur(4px);
}

/* ── Panel (Cave) ────────────────────────────────────────────────────────── */

.array-panel {
  position: relative;
  z-index: 1;
  width: min(700px, 100%);
  max-height: 90vh;
  background: linear-gradient(
    180deg,
    #1a1210 0%,
    #120e0a 50%,
    #1a1210 100%
  );
  border: 3px solid #5a4030;
  border-radius: var(--border-radius-lg);
  box-shadow:
    inset 0 0 40px rgba(0,0,0,0.6),
    inset 0 2px 4px rgba(255,180,60,0.05),
    0 0 50px rgba(212, 160, 23, 0.1),
    var(--shadow-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 0;
}

/* Rock texture */
.array-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(255,180,60,0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(255,180,60,0.02) 0%, transparent 50%);
  pointer-events: none;
}

/* ── Cave Decorations ────────────────────────────────────────────────────── */

.cave-top {
  position: relative;
  height: 32px;
  background: linear-gradient(180deg, #0a0806 0%, #1a1210 100%);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(90, 64, 48, 0.4);
}

.stalactite {
  position: absolute;
  top: 0;
  width: 10px;
  background: linear-gradient(180deg, #2a1a10 0%, #1a1008 100%);
  border-radius: 0 0 5px 5px;
  transform: translateX(-50%);
}

.cave-bottom {
  position: relative;
  height: 24px;
  background: linear-gradient(0deg, #0a0806 0%, #1a1210 100%);
  flex-shrink: 0;
  border-top: 1px solid rgba(90, 64, 48, 0.3);
}

.stalagmite {
  position: absolute;
  bottom: 0;
  width: 9px;
  background: linear-gradient(0deg, #2a1a10 0%, #1a1008 100%);
  border-radius: 5px 5px 0 0;
  transform: translateX(-50%);
}

/* ── Header ──────────────────────────────────────────────────────────────── */

.array-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem 0.4rem;
  flex-shrink: 0;
}

.cave-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 0 6px rgba(255, 160, 40, 0.4));
}

.array-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 0 20px rgba(212, 160, 23, 0.5);
}

/* ── Pseudocode Banner ───────────────────────────────────────────────────── */

.pseudo-banner {
  margin: 0 1rem 0.4rem;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem 0.75rem;
  flex-shrink: 0;
}

.pseudo-code {
  margin: 0;
  font-family: var(--font-code);
  font-size: 0.78rem;
  line-height: 1.6;
}

.pseudo-code code {
  display: flex;
  flex-direction: column;
}

.pseudo-line {
  color: var(--color-parchment);
  opacity: 0.65;
  transition: all var(--transition-fast);
  white-space: pre;
  padding: 0.05em 0;
}

.pseudo-line--active {
  color: var(--color-gold-light);
  opacity: 1;
  background: rgba(212, 160, 23, 0.12);
  border-left: 2px solid var(--color-gold);
  padding-left: 0.4em;
  animation: active-glow 2s ease infinite;
}

@keyframes active-glow {
  0%, 100% { text-shadow: none; }
  50% { text-shadow: 0 0 8px rgba(212, 160, 23, 0.5); }
}

.pseudo-line--comment {
  color: rgba(212, 160, 23, 0.5);
  font-style: italic;
}

.pseudo-line--empty {
  height: 0.4em;
}

/* ── Instruction ─────────────────────────────────────────────────────────── */

.instruction {
  text-align: center;
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold-light);
  margin: 0 1rem 0.3rem;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.instruction-arrow {
  font-size: 0.7rem;
  animation: arrow-bounce 1s ease infinite;
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* ── Wrong Hint ──────────────────────────────────────────────────────────── */

.wrong-hint {
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #ff9999;
  margin: 0 1rem 0.3rem;
  padding: 0.3em 0.75em;
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(139, 0, 0, 0.35);
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

/* ── Chests Row ──────────────────────────────────────────────────────────── */

.chests-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 1rem 0.25rem;
  flex-shrink: 0;
}

.chest-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

/* ── Chest Button ────────────────────────────────────────────────────────── */

.chest-btn {
  position: relative;
  width: 100px;
  height: 90px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transition: transform var(--transition-fast);
  text-transform: none;
  letter-spacing: normal;
  font-size: 1rem;
}

.chest-btn::before {
  display: none;
}

.chest-btn:not(.chest-btn--disabled):hover {
  transform: translateY(-4px);
}

.chest-btn:not(.chest-btn--disabled):active {
  transform: translateY(0);
}

.chest-btn:focus-visible {
  outline: 3px solid var(--color-gold);
  outline-offset: 4px;
  border-radius: var(--border-radius-sm);
}

.chest-btn--disabled {
  cursor: default;
}

/* Target hint glow */
.chest-btn--target-hint {
  filter: drop-shadow(0 0 8px rgba(212, 160, 23, 0.3));
}

/* ── Chest Lid ───────────────────────────────────────────────────────────── */

.chest-lid {
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  height: 38px;
  background: linear-gradient(180deg, #8b5e3c 0%, #6b4423 100%);
  border-radius: 6px 6px 0 0;
  border: 2px solid #3a2210;
  transform-origin: bottom center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
  overflow: hidden;
}

.chest-lid::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    88deg,
    transparent 0px,
    transparent 14px,
    rgba(0,0,0,0.12) 14px,
    rgba(0,0,0,0.12) 15px
  );
  border-radius: inherit;
}

.chest-lid-stripe {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  background: linear-gradient(90deg, #3a2210, #6b4423 10%, #8b5e3c 50%, #6b4423 90%, #3a2210);
  border-top: 1px solid rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(0,0,0,0.3);
}

.chest-lid--open {
  transform: rotateX(-110deg);
}

/* ── Chest Body ──────────────────────────────────────────────────────────── */

.chest-body {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: linear-gradient(180deg, #6b4423 0%, #4a2e15 100%);
  border-radius: 0 0 6px 6px;
  border: 2px solid #3a2210;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chest-body::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    88deg,
    transparent 0px,
    transparent 16px,
    rgba(0,0,0,0.08) 16px,
    rgba(0,0,0,0.08) 17px
  );
}

.chest-lock {
  font-size: 0.9rem;
  transition: all var(--transition-speed);
  position: relative;
  z-index: 1;
}

.chest-lock--open {
  opacity: 0;
  transform: scale(0.5);
}

/* Correct chest glow */
.chest-btn--correct .chest-body,
.chest-btn--correct .chest-lid {
  border-color: var(--color-gold);
  box-shadow: 0 0 16px rgba(212, 160, 23, 0.5);
}

/* Wrong chest */
.chest-btn--wrong .chest-body,
.chest-btn--wrong .chest-lid {
  border-color: var(--color-blood-light);
  animation: chest-shake 0.4s ease;
}

@keyframes chest-shake {
  0%, 100% { transform: translateX(0) translateY(-4px); }
  25% { transform: translateX(-6px) translateY(-4px); }
  75% { transform: translateX(6px) translateY(-4px); }
}

/* Revealed chests */
.chest-btn--revealed .chest-body,
.chest-btn--revealed .chest-lid {
  opacity: 0.7;
}

/* ── Chest Contents ──────────────────────────────────────────────────────── */

.chest-contents {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  z-index: 3;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
}

.chest-contents--correct {
  animation: treasure-float 1.5s ease infinite;
  filter: drop-shadow(0 0 10px rgba(212, 160, 23, 0.6));
}

@keyframes treasure-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

/* ── Gold Particles ──────────────────────────────────────────────────────── */

.gold-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 0.7rem;
  color: var(--color-gold-light);
  animation: particle-burst 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px);
  }
}

/* ── Index Label ─────────────────────────────────────────────────────────── */

.chest-index {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-parchment);
  opacity: 0.5;
  transition: all var(--transition-speed);
  letter-spacing: 0.02em;
}

.chest-index--target {
  color: var(--color-gold);
  opacity: 1;
  text-shadow: 0 0 8px rgba(212, 160, 23, 0.5);
}

.chest-index--highlight {
  color: var(--color-gold-light);
  opacity: 0.9;
  animation: index-pulse 1.5s ease infinite;
}

@keyframes index-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; text-shadow: 0 0 10px rgba(212, 160, 23, 0.6); }
}

/* ── Chest Label ─────────────────────────────────────────────────────────── */

.chest-label {
  font-family: var(--font-code);
  font-size: 0.65rem;
  padding: 0.15em 0.45em;
  border-radius: 3px;
  white-space: nowrap;
  max-width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
}

.chest-label--correct {
  background: rgba(212, 160, 23, 0.2);
  border: 1px solid rgba(212, 160, 23, 0.4);
  color: var(--color-gold-light);
}

.chest-label--wrong {
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(139, 0, 0, 0.35);
  color: #ff9999;
}

.chest-label--revealed {
  background: rgba(244, 228, 193, 0.05);
  border: 1px solid rgba(244, 228, 193, 0.1);
  color: var(--color-parchment);
  opacity: 0.5;
}

/* ── Result Panel ────────────────────────────────────────────────────────── */

.result-area {
  min-height: 70px;
  display: flex;
  align-items: center;
  padding: 0.3rem 1rem 0;
  flex-shrink: 0;
}

.result-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(212, 160, 23, 0.1);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem;
  width: 100%;
}

.result-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
  animation: result-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes result-bounce {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.result-text {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  color: var(--color-gold-light);
  margin: 0 0 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-code {
  font-family: var(--font-code);
  font-size: 0.8rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,160,23,0.3);
  border-radius: 3px;
  padding: 0.05em 0.35em;
  color: #b5e853;
}

.result-desc {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-parchment);
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
}

.result-desc strong {
  color: var(--color-gold);
}

.result-desc code {
  font-family: var(--font-code);
  font-size: 0.85em;
  background: rgba(0,0,0,0.3);
  padding: 0.05em 0.3em;
  border-radius: 2px;
  color: #b5e853;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(212, 160, 23, 0.12);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-sm);
  padding: 0.3em 0.6em;
  font-family: var(--font-heading);
  font-size: 0.72rem;
  color: var(--color-gold-light);
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Continue Row ────────────────────────────────────────────────────────── */

.continue-row {
  padding: 0.5rem 1rem 0.65rem;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.array-btn {
  font-family: var(--font-heading);
  font-size: 1rem;
  padding: 0.6em 2em;
  border-radius: var(--border-radius-sm);
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

.array-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.array-btn--continue {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark), var(--shadow-dark);
}

.array-btn--continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--color-gold-dark), var(--shadow-gold);
}

.array-btn--continue:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 var(--color-gold-dark);
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

.instruction-fade-enter-active,
.instruction-fade-leave-active {
  transition: all 0.3s ease;
}

.instruction-fade-enter-from,
.instruction-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.hint-slide-enter-active {
  animation: hint-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hint-slide-leave-active {
  transition: all 0.3s ease;
}

.hint-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes hint-slide-in {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.contents-pop-enter-active {
  animation: contents-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes contents-pop {
  0% { opacity: 0; transform: translateX(-50%) scale(0.3) translateY(20px); }
  100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
}

.label-pop-enter-active {
  animation: label-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes label-pop {
  0% { opacity: 0; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
}

.result-pop-enter-active {
  animation: result-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes result-pop {
  0% { opacity: 0; transform: scale(0.9) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.btn-pop-enter-active {
  animation: btn-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes btn-pop {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

.particles-pop-enter-active {
  animation: fade-out-delay 1s ease forwards;
}

@keyframes fade-out-delay {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
