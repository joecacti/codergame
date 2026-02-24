<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['complete'])

// ── Debug State ───────────────────────────────────────────────────────────────

const BUGGY_LINE = 2 // 0-indexed line number with the bug (line 3 = index 2)
const CORRECT_VALUE = 10

const step = ref(1) // 1 | 2 | 3
const phase = ref('active') // 'active' | 'complete'
const selectedLine = ref(null) // which line the player clicked
const wrongLineHint = ref(false)
const fixedValue = ref(null)
const isFixed = ref(false)

// ── Code Lines ────────────────────────────────────────────────────────────────

const codeLines = computed(() => [
  { text: 'OPEN treasure_vault', lineNum: 1 },
  { text: 'CHECK security_code = "GOLD"', lineNum: 2 },
  { text: 'SET treasure_count = 5', lineNum: 3, isBuggy: true },
  { text: 'LOAD treasure_count items', lineNum: 4 },
  { text: 'CLOSE treasure_vault', lineNum: 5 },
])

const valueOptions = [10, 15, 20]

// ── Computed ──────────────────────────────────────────────────────────────────

const stepLabel = computed(() => `${step.value} / 3`)

const displayedValue = computed(() => {
  if (isFixed.value) return CORRECT_VALUE
  return 5
})

// ── Actions ───────────────────────────────────────────────────────────────────

function acknowledgeError() {
  step.value = 2
}

function selectLine(lineIndex) {
  if (step.value !== 2) return

  if (lineIndex === BUGGY_LINE) {
    selectedLine.value = lineIndex
    wrongLineHint.value = false
    // Short delay then advance
    setTimeout(() => {
      step.value = 3
    }, 600)
  } else {
    // Wrong line
    wrongLineHint.value = true
    selectedLine.value = lineIndex
    setTimeout(() => {
      wrongLineHint.value = false
      selectedLine.value = null
    }, 1200)
  }
}

function chooseValue(val) {
  if (step.value !== 3 || isFixed.value) return

  fixedValue.value = val

  if (val === CORRECT_VALUE) {
    // Animate the fix
    isFixed.value = true
    setTimeout(() => {
      phase.value = 'complete'
    }, 1000)
  } else {
    // Wrong value: flash and reset
    setTimeout(() => {
      fixedValue.value = null
    }, 800)
  }
}

function handleContinue() {
  emit('complete')
}
</script>

<template>
  <div class="debug-overlay" role="dialog" aria-modal="true" aria-label="Debug Challenge">
    <div class="debug-backdrop" aria-hidden="true"></div>

    <div class="debug-panel">
      <!-- Top stone decoration -->
      <div class="temple-edge" aria-hidden="true">
        <span class="temple-glyph" aria-hidden="true">⚙</span>
        <span class="temple-glyph" aria-hidden="true">⚙</span>
        <span class="temple-glyph" aria-hidden="true">⚙</span>
      </div>

      <!-- Header -->
      <div class="debug-header">
        <h2 class="debug-title">Temple Mechanism</h2>
        <div class="step-indicator" aria-label="Debug step progress">
          <span class="step-label">Step</span>
          <span class="step-count" aria-live="polite">{{ stepLabel }}</span>
          <div class="step-pips" aria-hidden="true">
            <span v-for="n in 3" :key="n" class="step-pip" :class="{ 'step-pip--done': step > n, 'step-pip--active': step === n }"></span>
          </div>
        </div>
      </div>

      <!-- Error Banner (Step 1 only) -->
      <Transition name="banner-slide">
        <div v-if="step >= 1" class="error-banner" role="alert" aria-live="polite">
          <span class="error-icon" aria-hidden="true">⚠</span>
          <span class="error-text">
            <strong>Error:</strong> Expected 10 items in the vault — but the mechanism loaded only 5!
          </span>
        </div>
      </Transition>

      <!-- Code Display -->
      <div class="code-display" aria-label="Broken mechanism code">
        <div class="code-display-header">
          <span class="code-filename">mechanism.code</span>
          <span class="code-hint" v-if="step === 2">Click the buggy line!</span>
        </div>
        <div class="code-body">
          <div
            v-for="(line, idx) in codeLines"
            :key="idx"
            class="code-line"
            :class="{
              'code-line--clickable': step === 2,
              'code-line--selected-wrong': selectedLine === idx && idx !== BUGGY_LINE && wrongLineHint,
              'code-line--selected-correct': selectedLine === idx && idx === BUGGY_LINE && step >= 3,
              'code-line--fixed': idx === BUGGY_LINE && isFixed,
              'code-line--buggy-revealed': idx === BUGGY_LINE && step >= 2 && !isFixed,
            }"
            :tabindex="step === 2 ? 0 : -1"
            :role="step === 2 ? 'button' : undefined"
            :aria-label="step === 2 ? `Click to select line ${line.lineNum}: ${line.text}` : undefined"
            :aria-pressed="selectedLine === idx && step >= 3 ? true : undefined"
            @click="selectLine(idx)"
            @keydown.enter="selectLine(idx)"
            @keydown.space.prevent="selectLine(idx)"
          >
            <span class="line-num" aria-hidden="true">{{ String(line.lineNum).padStart(2, '0') }}</span>
            <span class="line-code">
              <template v-if="idx === BUGGY_LINE">
                <span class="code-keyword">SET</span>
                <span> treasure_count = </span>
                <span
                  class="code-value"
                  :class="{
                    'code-value--buggy': !isFixed,
                    'code-value--fixed': isFixed
                  }"
                >
                  <Transition name="value-swap" mode="out-in">
                    <span :key="displayedValue">{{ displayedValue }}</span>
                  </Transition>
                </span>
              </template>
              <template v-else>{{ line.text }}</template>
            </span>

            <!-- Bug marker (shown in steps 2+) -->
            <span
              v-if="idx === BUGGY_LINE && step >= 2 && !isFixed"
              class="bug-marker"
              aria-hidden="true"
            >BUG</span>

            <!-- Fix marker -->
            <span
              v-if="idx === BUGGY_LINE && isFixed"
              class="fix-marker"
              aria-hidden="true"
            >FIXED</span>
          </div>
        </div>
      </div>

      <!-- Step Instructions + Actions -->
      <div class="debug-actions">

        <!-- Step 1: Read the error -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="step === 1" class="step-content" key="step1">
            <div class="step-icon" aria-hidden="true">🔍</div>
            <h3 class="step-name">Step 1: Read the Error</h3>
            <p class="step-desc">
              The mechanism expected <strong>10</strong> treasure items but only got <strong>5</strong>.
              Something is wrong in the code above!
            </p>
            <button class="debug-btn debug-btn--primary" @click="acknowledgeError">
              I Understand the Error
            </button>
          </div>
        </Transition>

        <!-- Step 2: Find the line -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="step === 2" class="step-content" key="step2">
            <div class="step-icon" aria-hidden="true">👆</div>
            <h3 class="step-name">Step 2: Find the Bug</h3>
            <p class="step-desc">
              Click on the line of code that contains the bug.
              Look carefully — which line sets the wrong number?
            </p>
            <Transition name="hint-pop">
              <p v-if="wrongLineHint" class="wrong-line-hint" role="alert" aria-live="assertive">
                That line looks fine... try another one!
              </p>
            </Transition>
          </div>
        </Transition>

        <!-- Step 3: Fix the value -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="step === 3 && !isFixed" class="step-content" key="step3">
            <div class="step-icon" aria-hidden="true">🔧</div>
            <h3 class="step-name">Step 3: Fix the Value</h3>
            <p class="step-desc">
              The vault needs <strong>10</strong> items. What should <code>treasure_count</code> be set to?
            </p>
            <div class="value-options" role="group" aria-label="Choose the correct value">
              <button
                v-for="val in valueOptions"
                :key="val"
                class="value-btn"
                :class="{
                  'value-btn--wrong': fixedValue === val && val !== CORRECT_VALUE,
                  'value-btn--correct': fixedValue === val && val === CORRECT_VALUE
                }"
                @click="chooseValue(val)"
                :aria-label="`Set treasure_count to ${val}`"
                :disabled="isFixed"
              >
                {{ val }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Complete -->
        <Transition name="complete-pop">
          <div v-if="phase === 'complete'" class="complete-panel" key="complete" aria-live="assertive">
            <div class="complete-icon" aria-hidden="true">⚙️</div>
            <h3 class="complete-title">Bug Fixed!</h3>
            <p class="complete-text">
              The mechanism whirs to life! <code>treasure_count</code> is now correctly set to <strong>10</strong>.
              The vault is opening!
            </p>
            <button class="debug-btn debug-btn--continue" @click="handleContinue">
              Enter the Vault
            </button>
          </div>
        </Transition>
      </div>

      <!-- Bottom temple edge -->
      <div class="temple-edge temple-edge--bottom" aria-hidden="true">
        <span class="temple-glyph" aria-hidden="true">⚙</span>
        <span class="temple-glyph" aria-hidden="true">⚙</span>
        <span class="temple-glyph" aria-hidden="true">⚙</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */

.debug-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.debug-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 22, 40, 0.88);
  backdrop-filter: blur(3px);
}

/* ── Panel ───────────────────────────────────────────────────────────────── */

.debug-panel {
  position: relative;
  z-index: 1;
  width: min(620px, 100%);
  max-height: 90vh;
  background: linear-gradient(
    160deg,
    #3a3020 0%,
    #252010 40%,
    #1a1808 100%
  );
  border: 3px solid #7a6040;
  border-radius: var(--border-radius-lg);
  box-shadow:
    inset 0 2px 6px rgba(255,255,220,0.05),
    inset 0 -2px 8px rgba(0,0,0,0.5),
    0 0 50px rgba(212, 160, 23, 0.12),
    var(--shadow-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Stone texture */
.debug-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 24px,
    rgba(255,255,255,0.015) 24px,
    rgba(255,255,255,0.015) 25px
  );
  pointer-events: none;
  border-radius: inherit;
}

/* ── Temple Edge ─────────────────────────────────────────────────────────── */

.temple-edge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.35rem 1rem;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(212, 160, 23, 0.2);
  flex-shrink: 0;
}

.temple-edge--bottom {
  border-bottom: none;
  border-top: 1px solid rgba(212, 160, 23, 0.2);
}

.temple-glyph {
  font-size: 0.9rem;
  color: rgba(212, 160, 23, 0.3);
}

/* ── Header ──────────────────────────────────────────────────────────────── */

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  border-bottom: 1px solid rgba(212, 160, 23, 0.2);
  flex-shrink: 0;
}

.debug-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 0 15px rgba(212, 160, 23, 0.5);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-label {
  font-family: var(--font-code);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-parchment);
  opacity: 0.4;
}

.step-count {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-gold);
  background: rgba(212, 160, 23, 0.12);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-sm);
  padding: 0.1em 0.5em;
}

.step-pips {
  display: flex;
  gap: 4px;
}

.step-pip {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(244, 228, 193, 0.15);
  border: 1px solid rgba(244, 228, 193, 0.2);
  transition: all var(--transition-speed);
}

.step-pip--active {
  background: var(--color-gold);
  border-color: var(--color-gold-light);
  box-shadow: 0 0 8px rgba(212, 160, 23, 0.6);
}

.step-pip--done {
  background: var(--color-emerald);
  border-color: var(--color-emerald-light);
}

/* ── Error Banner ────────────────────────────────────────────────────────── */

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1.25rem;
  background: rgba(139, 0, 0, 0.25);
  border-bottom: 1px solid rgba(139, 0, 0, 0.4);
  flex-shrink: 0;
}

.error-icon {
  font-size: 1rem;
  color: #ff8888;
  flex-shrink: 0;
}

.error-text {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: #ffaaaa;
  line-height: 1.4;
}

.error-text strong {
  color: #ff8888;
}

/* ── Code Display ────────────────────────────────────────────────────────── */

.code-display {
  margin: 0.75rem 1.25rem;
  border: 1px solid rgba(212, 160, 23, 0.25);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0,0,0,0.45);
}

.code-display-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.75rem;
  background: rgba(212, 160, 23, 0.08);
  border-bottom: 1px solid rgba(212, 160, 23, 0.15);
}

.code-filename {
  font-family: var(--font-code);
  font-size: 0.65rem;
  color: var(--color-gold);
  opacity: 0.6;
}

.code-hint {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.7rem;
  color: var(--color-gold-light);
  animation: hint-pulse 1.5s ease infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.code-body {
  padding: 0.4rem 0;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3em 0.75rem;
  border-left: 3px solid transparent;
  font-family: var(--font-code);
  font-size: 0.82rem;
  color: var(--color-parchment);
  opacity: 0.75;
  transition: all var(--transition-fast);
  cursor: default;
  position: relative;
}

.code-line--clickable {
  cursor: pointer;
  opacity: 0.9;
}

.code-line--clickable:hover {
  background: rgba(212, 160, 23, 0.08);
  opacity: 1;
  border-left-color: rgba(212, 160, 23, 0.3);
}

.code-line--clickable:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: -2px;
}

.code-line--selected-wrong {
  background: rgba(139, 0, 0, 0.2) !important;
  border-left-color: var(--color-blood-light) !important;
  animation: wrong-flash 0.4s ease;
}

@keyframes wrong-flash {
  0%, 100% { background: rgba(139, 0, 0, 0.2); }
  50% { background: rgba(139, 0, 0, 0.4); }
}

.code-line--selected-correct {
  background: rgba(212, 160, 23, 0.15) !important;
  border-left-color: var(--color-gold) !important;
}

.code-line--buggy-revealed {
  background: rgba(139, 0, 0, 0.12);
  border-left-color: rgba(139, 0, 0, 0.5);
  opacity: 1;
}

.code-line--fixed {
  background: rgba(46, 139, 87, 0.2) !important;
  border-left-color: var(--color-emerald) !important;
  opacity: 1;
  animation: fix-glow 1s ease;
}

@keyframes fix-glow {
  0% { background: rgba(46, 139, 87, 0.5); box-shadow: 0 0 20px rgba(46, 139, 87, 0.4); }
  100% { background: rgba(46, 139, 87, 0.2); box-shadow: none; }
}

.line-num {
  font-size: 0.62rem;
  color: rgba(212, 160, 23, 0.3);
  min-width: 1.3rem;
  user-select: none;
  flex-shrink: 0;
}

.line-code {
  flex: 1;
  white-space: pre;
}

.code-keyword {
  color: #c792ea;
}

.code-value {
  transition: color var(--transition-speed);
}

.code-value--buggy {
  color: #ff8888;
  text-decoration: underline wavy rgba(255, 100, 100, 0.6);
}

.code-value--fixed {
  color: #b5e853;
  font-weight: bold;
}

.bug-marker {
  font-family: var(--font-code);
  font-size: 0.55rem;
  font-weight: 700;
  color: #ff8888;
  background: rgba(139, 0, 0, 0.3);
  border: 1px solid rgba(255, 100, 100, 0.4);
  border-radius: 3px;
  padding: 0.1em 0.3em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.fix-marker {
  font-family: var(--font-code);
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--color-emerald-light);
  background: rgba(46, 139, 87, 0.25);
  border: 1px solid rgba(46, 139, 87, 0.4);
  border-radius: 3px;
  padding: 0.1em 0.3em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

/* ── Debug Actions ───────────────────────────────────────────────────────── */

.debug-actions {
  padding: 0.6rem 1.25rem 0.75rem;
  flex-shrink: 0;
  min-height: 160px;
  display: flex;
  align-items: stretch;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  text-align: center;
  width: 100%;
}

.step-icon {
  font-size: 2rem;
}

.step-name {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-gold);
  margin: 0;
}

.step-desc {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--color-parchment);
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
  max-width: 420px;
}

.step-desc strong {
  color: var(--color-gold-light);
}

.step-desc code {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,160,23,0.2);
  border-radius: 3px;
  padding: 0.05em 0.35em;
  color: #b5e853;
  font-size: 0.9em;
}

.debug-btn {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  padding: 0.55em 1.4em;
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

.debug-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.debug-btn--primary {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark), var(--shadow-dark);
}

.debug-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--color-gold-dark), var(--shadow-gold);
}

.debug-btn--primary:active {
  transform: translateY(1px);
}

.debug-btn--continue {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark), var(--shadow-dark);
  font-size: 1rem;
}

.debug-btn--continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--color-gold-dark), var(--shadow-gold);
}

/* ── Wrong Line Hint ─────────────────────────────────────────────────────── */

.wrong-line-hint {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.8rem;
  color: #ff9999;
  margin: 0;
  animation: fade-in 0.3s ease;
}

/* ── Value Options ───────────────────────────────────────────────────────── */

.value-options {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.value-btn {
  font-family: var(--font-code);
  font-size: 1.1rem;
  font-weight: 700;
  width: 70px;
  height: 70px;
  border-radius: var(--border-radius-md);
  border: 2px solid rgba(212, 160, 23, 0.3);
  background: rgba(0,0,0,0.3);
  color: var(--color-parchment);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: none;
  letter-spacing: normal;
  box-shadow: 0 3px 0 rgba(0,0,0,0.5), var(--shadow-dark);
  position: relative;
  overflow: hidden;
}

.value-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}

.value-btn:hover:not(:disabled) {
  border-color: var(--color-gold);
  background: rgba(212, 160, 23, 0.15);
  transform: translateY(-3px);
  box-shadow: 0 6px 0 rgba(0,0,0,0.5), var(--shadow-gold);
  color: var(--color-gold-light);
}

.value-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.5);
}

.value-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.value-btn--wrong {
  border-color: var(--color-blood-light) !important;
  background: rgba(139, 0, 0, 0.3) !important;
  color: #ff8888 !important;
  animation: value-wrong 0.4s ease;
}

@keyframes value-wrong {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.value-btn--correct {
  border-color: var(--color-emerald) !important;
  background: rgba(46, 139, 87, 0.3) !important;
  color: var(--color-emerald-light) !important;
  box-shadow: 0 0 20px rgba(46, 139, 87, 0.5) !important;
}

/* ── Complete Panel ──────────────────────────────────────────────────────── */

.complete-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.55rem;
  width: 100%;
}

.complete-icon {
  font-size: 2.5rem;
  animation: gear-spin 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes gear-spin {
  0% { transform: rotate(-180deg) scale(0); }
  100% { transform: rotate(0deg) scale(1); }
}

.complete-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--color-emerald-light);
  text-shadow: 0 0 15px rgba(46, 139, 87, 0.5);
  margin: 0;
}

.complete-text {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--color-parchment);
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
}

.complete-text code {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,160,23,0.2);
  border-radius: 3px;
  padding: 0.05em 0.35em;
  color: #b5e853;
  font-size: 0.9em;
}

.complete-text strong {
  color: var(--color-gold-light);
}

/* ── Value Swap Transition ───────────────────────────────────────────────── */

.value-swap-enter-active,
.value-swap-leave-active {
  transition: all 0.3s ease;
}

.value-swap-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.value-swap-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── Other Transitions ───────────────────────────────────────────────────── */

.banner-slide-enter-active {
  transition: all 0.4s ease;
}

.banner-slide-enter-from {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.step-fade-enter-active,
.step-fade-leave-active {
  transition: all 0.3s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.hint-pop-enter-active {
  animation: hint-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes hint-pop {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.complete-pop-enter-active {
  animation: complete-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes complete-pop {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
