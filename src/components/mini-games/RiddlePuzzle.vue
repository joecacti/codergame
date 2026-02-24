<script setup>
import { ref, computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'

const emit = defineEmits(['complete'])

const { awardBadge } = useGameState()

// ── Puzzle State ──────────────────────────────────────────────────────────────

const MAX_STEPS = 5

// Each step: { i, total }
const steps = [
  { i: 1, total: 1 },
  { i: 2, total: 3 },
  { i: 3, total: 6 },
  { i: 4, total: 10 },
  { i: 5, total: 15 },
]

const currentStep = ref(0)      // 0 = not started, 1–5 = steps completed
const phase = ref('stepping')   // 'stepping' | 'answering' | 'success' | 'wrong'
const userAnswer = ref('')
const answerError = ref(false)

// Which pseudocode line is active (0-indexed)
const highlightedLine = ref(0)

// ── Computed ──────────────────────────────────────────────────────────────────

const isLoopDone = computed(() => currentStep.value >= MAX_STEPS)

const currentI = computed(() =>
  currentStep.value > 0 ? steps[currentStep.value - 1].i : 0
)

const currentTotal = computed(() =>
  currentStep.value > 0 ? steps[currentStep.value - 1].total : 0
)

// Pseudocode lines for the FOR loop
const pseudoLines = computed(() => [
  { text: 'total = 0', comment: `// total: ${currentTotal.value}` },
  { text: `FOR i FROM 1 TO 5 DO`, comment: `// i: ${currentI.value || '—'}` },
  { text: '  total = total + i', comment: `` },
  { text: 'END FOR', comment: `` },
  { text: '', comment: '' },
  { text: '// Answer: total = ?', comment: `` },
])

// ── Actions ───────────────────────────────────────────────────────────────────

function stepLoop() {
  if (isLoopDone.value || phase.value !== 'stepping') return

  currentStep.value += 1

  // Animate pseudocode: highlight FOR line, then body, then back
  if (currentStep.value < MAX_STEPS) {
    highlightedLine.value = 1 // FOR line
    setTimeout(() => {
      highlightedLine.value = 2 // body
      setTimeout(() => {
        highlightedLine.value = 1
      }, 400)
    }, 300)
  } else {
    // Last step: highlight END FOR then done
    highlightedLine.value = 2
    setTimeout(() => {
      highlightedLine.value = 3
      setTimeout(() => {
        highlightedLine.value = 5
        phase.value = 'answering'
      }, 500)
    }, 400)
  }
}

function submitAnswer() {
  const val = parseInt(userAnswer.value.trim(), 10)
  if (val === 15) {
    phase.value = 'success'
    awardBadge('forLoops')
  } else {
    answerError.value = true
    phase.value = 'wrong'
    setTimeout(() => {
      phase.value = 'answering'
      answerError.value = false
    }, 2000)
  }
}

function retryFromStart() {
  currentStep.value = 0
  phase.value = 'stepping'
  userAnswer.value = ''
  answerError.value = false
  highlightedLine.value = 0
}

function handleContinue() {
  emit('complete')
}
</script>

<template>
  <div class="riddle-overlay" role="dialog" aria-modal="true" aria-label="FOR Loop Riddle Puzzle">
    <div class="riddle-backdrop" aria-hidden="true"></div>

    <div class="riddle-panel">
      <!-- Stone tablet decorative edge -->
      <div class="stone-edge stone-edge--top" aria-hidden="true"></div>

      <!-- Header -->
      <div class="riddle-header">
        <span class="riddle-icon" aria-hidden="true">🗿</span>
        <h2 class="riddle-title">The Ancient Gate</h2>
        <span class="riddle-icon" aria-hidden="true">🗿</span>
      </div>

      <p class="riddle-question">
        "What is the sum of numbers from 1 to 5?"
      </p>

      <!-- Body: pseudocode left, tracker right -->
      <div class="riddle-body">
        <!-- Left: Pseudocode -->
        <div class="code-panel" aria-label="FOR loop pseudocode">
          <p class="panel-label">FOR Loop</p>
          <pre class="code-block">
            <code>
              <div
                v-for="(line, idx) in pseudoLines"
                :key="idx"
                class="code-line"
                :class="{
                  'code-line--active': highlightedLine === idx,
                  'code-line--empty': line.text === '',
                  'code-line--comment-only': line.text.trim().startsWith('//')
                }"
              >
                <span class="line-num" aria-hidden="true">{{ line.text !== '' ? String(idx + 1).padStart(2, '0') : '  ' }}</span>
                <span class="line-code">{{ line.text }}</span>
                <span v-if="line.comment" class="line-comment" aria-hidden="true">{{ line.comment }}</span>
              </div>
            </code>
          </pre>

          <!-- Variable Watch -->
          <div class="var-watch" aria-label="Variable values">
            <p class="var-watch-title">Variables</p>
            <div class="var-row">
              <span class="var-name">i</span>
              <span class="var-eq">=</span>
              <span class="var-val">{{ currentStep > 0 ? currentI : '—' }}</span>
            </div>
            <div class="var-row">
              <span class="var-name">total</span>
              <span class="var-eq">=</span>
              <span class="var-val" :class="{ 'var-val--highlight': isLoopDone }">
                {{ currentStep > 0 ? currentTotal : 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Step Tracker + Actions -->
        <div class="tracker-panel">
          <p class="panel-label">Loop Iterations</p>

          <!-- Step Circles -->
          <div class="step-track" aria-label="Loop iterations progress" role="list">
            <div
              v-for="step in steps"
              :key="step.i"
              class="step-item"
              :class="{
                'step-item--done': currentStep >= step.i,
                'step-item--current': currentStep === step.i
              }"
              role="listitem"
              :aria-label="`Step ${step.i}: i=${step.i}, total=${step.total}`"
            >
              <div class="step-circle">
                <span class="step-i" aria-hidden="true">i={{ step.i }}</span>
              </div>
              <div class="step-info">
                <span class="step-calc" aria-hidden="true">
                  <template v-if="currentStep >= step.i">
                    total = {{ step.total }}
                  </template>
                  <template v-else>
                    total = ?
                  </template>
                </span>
              </div>
              <div v-if="step.i < 5" class="step-arrow" aria-hidden="true">↓</div>
            </div>
          </div>

          <!-- Action Area -->
          <div class="action-area">
            <!-- Stepping phase -->
            <template v-if="phase === 'stepping'">
              <button
                class="riddle-btn riddle-btn--step"
                :disabled="isLoopDone"
                @click="stepLoop"
                aria-label="Execute next loop iteration"
              >
                <span aria-hidden="true">▶</span>
                {{ isLoopDone ? 'Loop Complete!' : 'Step Through Loop' }}
              </button>
              <p class="step-hint">
                Click to run iteration {{ currentStep + 1 }} of 5
              </p>
            </template>

            <!-- Answering phase -->
            <template v-else-if="phase === 'answering' || phase === 'wrong'">
              <p class="answer-prompt">Now tell the gate the answer!</p>
              <div class="answer-form" :class="{ 'answer-form--error': phase === 'wrong' }">
                <label for="gate-answer" class="answer-label">
                  total =
                </label>
                <input
                  id="gate-answer"
                  v-model="userAnswer"
                  type="number"
                  class="answer-input"
                  placeholder="?"
                  :disabled="phase === 'wrong'"
                  @keydown.enter="submitAnswer"
                  aria-label="Enter the sum of 1 to 5"
                  min="0"
                  max="99"
                />
              </div>
              <p v-if="phase === 'wrong'" class="wrong-hint" aria-live="assertive">
                Not quite... try stepping through again!
              </p>
              <div class="answer-actions">
                <button
                  class="riddle-btn riddle-btn--retry"
                  @click="retryFromStart"
                  aria-label="Start the loop over"
                >
                  ↺ Re-count
                </button>
                <button
                  class="riddle-btn riddle-btn--submit"
                  :disabled="!userAnswer || phase === 'wrong'"
                  @click="submitAnswer"
                  aria-label="Submit your answer"
                >
                  Submit Answer
                </button>
              </div>
            </template>

            <!-- Success phase -->
            <Transition name="success-pop">
              <div v-if="phase === 'success'" class="success-panel" aria-live="assertive">
                <div class="success-icon" aria-hidden="true">🚪</div>
                <h3 class="success-title">The gate opens!</h3>
                <p class="success-text">
                  The FOR loop ran 5 times, adding each number.<br>
                  1 + 2 + 3 + 4 + 5 = <strong>15</strong>
                </p>
                <div class="success-badge" aria-label="Badge earned: For Loops">
                  <span aria-hidden="true">🔢</span>
                  <span>FOR Loops Badge Earned!</span>
                </div>
                <button class="riddle-btn riddle-btn--continue" @click="handleContinue">
                  Enter the Temple
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="stone-edge stone-edge--bottom" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */

.riddle-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.riddle-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 22, 40, 0.88);
  backdrop-filter: blur(3px);
}

/* ── Panel (Stone Tablet) ────────────────────────────────────────────────── */

.riddle-panel {
  position: relative;
  z-index: 1;
  width: min(760px, 100%);
  max-height: 90vh;
  background: linear-gradient(
    155deg,
    #4a4040 0%,
    #2e2828 40%,
    #1e1a1a 100%
  );
  border: 3px solid #6a5a50;
  border-radius: var(--border-radius-lg);
  box-shadow:
    inset 0 2px 8px rgba(255,255,255,0.06),
    inset 0 -2px 8px rgba(0,0,0,0.4),
    0 0 50px rgba(212, 160, 23, 0.15),
    var(--shadow-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Stone texture effect */
.riddle-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 30px,
    rgba(255,255,255,0.015) 30px,
    rgba(255,255,255,0.015) 31px
  );
  pointer-events: none;
  border-radius: inherit;
}

.stone-edge {
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    #5a4a40 0px,
    #6a5a50 4px,
    #4a3a30 8px,
    #5a4a40 12px
  );
  flex-shrink: 0;
}

.stone-edge--top {
  border-bottom: 1px solid rgba(212, 160, 23, 0.2);
}

.stone-edge--bottom {
  border-top: 1px solid rgba(212, 160, 23, 0.2);
}

/* ── Header ──────────────────────────────────────────────────────────────── */

.riddle-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem 0.4rem;
  flex-shrink: 0;
}

.riddle-icon {
  font-size: 1.3rem;
  opacity: 0.7;
}

.riddle-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 0 20px rgba(212, 160, 23, 0.5);
}

.riddle-question {
  text-align: center;
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-parchment);
  opacity: 0.85;
  margin: 0 1rem 0.5rem;
  font-style: italic;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* ── Body ────────────────────────────────────────────────────────────────── */

.riddle-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

.panel-label {
  font-family: var(--font-code);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-gold);
  opacity: 0.5;
  margin-bottom: 0.45rem;
}

/* ── Code Panel ──────────────────────────────────────────────────────────── */

.code-panel {
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(212, 160, 23, 0.15);
}

.code-block {
  flex: 1;
  margin: 0;
  overflow-y: auto;
  font-family: var(--font-code);
  font-size: 0.78rem;
  line-height: 1.7;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(212, 160, 23, 0.18);
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
  animation: line-pop 0.4s ease;
}

.code-line--empty {
  height: 0.6em;
}

.code-line--comment-only .line-code {
  color: rgba(212, 160, 23, 0.5);
  font-style: italic;
}

@keyframes line-pop {
  0% { background: rgba(212, 160, 23, 0.45); }
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
  font-size: 0.68rem;
  color: rgba(212, 160, 23, 0.55);
  font-style: italic;
  white-space: nowrap;
  margin-left: auto;
}

/* ── Variable Watch ──────────────────────────────────────────────────────── */

.var-watch {
  margin-top: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.var-watch-title {
  font-family: var(--font-code);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-gold);
  opacity: 0.4;
  margin-bottom: 0.3rem;
}

.var-row {
  display: flex;
  gap: 0.4rem;
  font-family: var(--font-code);
  font-size: 0.73rem;
  margin-bottom: 0.12rem;
}

.var-name { color: #7ecfff; }
.var-eq { color: rgba(212, 160, 23, 0.5); }
.var-val {
  color: #b5e853;
  transition: color var(--transition-fast);
}

.var-val--highlight {
  color: var(--color-gold-light);
  animation: highlight-pulse 0.6s ease;
}

@keyframes highlight-pulse {
  0%, 100% { color: #b5e853; }
  50% { color: var(--color-gold-light); }
}

/* ── Tracker Panel ───────────────────────────────────────────────────────── */

.tracker-panel {
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.step-track {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 0.85rem;
  flex-shrink: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(244, 228, 193, 0.2);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-speed);
}

.step-item--done .step-circle {
  border-color: var(--color-emerald);
  background: rgba(46, 139, 87, 0.25);
  box-shadow: 0 0 10px rgba(46, 139, 87, 0.4);
}

.step-item--current .step-circle {
  border-color: var(--color-gold);
  background: rgba(212, 160, 23, 0.2);
  box-shadow: 0 0 14px rgba(212, 160, 23, 0.5);
  animation: current-pulse 1s ease infinite;
}

@keyframes current-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(212, 160, 23, 0.4); }
  50% { box-shadow: 0 0 20px rgba(212, 160, 23, 0.7); }
}

.step-i {
  font-family: var(--font-code);
  font-size: 0.65rem;
  color: var(--color-parchment);
  opacity: 0.7;
}

.step-item--done .step-i {
  color: var(--color-emerald-light);
  opacity: 1;
}

.step-info {
  flex: 1;
}

.step-calc {
  font-family: var(--font-code);
  font-size: 0.72rem;
  color: var(--color-parchment);
  opacity: 0.4;
  transition: all var(--transition-speed);
}

.step-item--done .step-calc {
  color: #b5e853;
  opacity: 1;
}

.step-arrow {
  position: absolute;
  left: 19px;
  bottom: -12px;
  font-size: 0.7rem;
  color: rgba(244, 228, 193, 0.2);
  z-index: 1;
}

.step-item--done .step-arrow {
  color: var(--color-emerald);
  opacity: 0.6;
}

/* ── Action Area ─────────────────────────────────────────────────────────── */

.action-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.riddle-btn {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  padding: 0.55em 1.1em;
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

.riddle-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.riddle-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.riddle-btn--step {
  background: linear-gradient(135deg, var(--color-emerald-light), var(--color-emerald));
  border-color: #1c5c38;
  color: #fff;
  box-shadow: 0 3px 0 #1c5c38, var(--shadow-dark);
  width: 100%;
}

.riddle-btn--step:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 #1c5c38, 0 0 18px rgba(46, 139, 87, 0.5);
}

.riddle-btn--submit {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark);
  flex: 1;
}

.riddle-btn--submit:not(:disabled):hover {
  transform: translateY(-2px);
}

.riddle-btn--retry {
  background: linear-gradient(135deg, var(--color-navy-light), var(--color-navy));
  border-color: var(--color-ocean);
  color: var(--color-parchment);
  box-shadow: 0 3px 0 var(--color-navy-dark);
}

.riddle-btn--retry:hover {
  transform: translateY(-2px);
}

.riddle-btn--continue {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-dark);
  color: var(--color-navy-dark);
  box-shadow: 0 3px 0 var(--color-gold-dark), var(--shadow-dark);
  width: 100%;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.riddle-btn--continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--color-gold-dark), var(--shadow-gold);
}

.step-hint {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--color-parchment);
  opacity: 0.4;
  text-align: center;
  margin: 0;
}

/* ── Answer Form ─────────────────────────────────────────────────────────── */

.answer-prompt {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  color: var(--color-gold-light);
  text-align: center;
  margin: 0;
}

.answer-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-sm);
  padding: 0.4em 0.7em;
  transition: border-color var(--transition-fast);
}

.answer-form--error {
  border-color: var(--color-blood-light);
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.answer-label {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: #7ecfff;
  white-space: nowrap;
}

.answer-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-code);
  font-size: 1rem;
  color: #b5e853;
  width: 60px;
  text-align: center;
}

.answer-input::placeholder {
  color: rgba(244, 228, 193, 0.25);
}

.answer-actions {
  display: flex;
  gap: 0.4rem;
}

.wrong-hint {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #ff9999;
  text-align: center;
  margin: 0;
  animation: fade-in 0.3s ease;
}

/* ── Success Panel ───────────────────────────────────────────────────────── */

.success-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.55rem;
}

.success-icon {
  font-size: 2.4rem;
  animation: door-open 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes door-open {
  0% { transform: scale(0) rotateY(90deg); }
  100% { transform: scale(1) rotateY(0deg); }
}

.success-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--color-gold);
  text-shadow: var(--shadow-gold);
  margin: 0;
}

.success-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-parchment);
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
}

.success-text strong {
  color: var(--color-gold-light);
  font-size: 1.05em;
}

.success-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(212, 160, 23, 0.15);
  border: 1px solid rgba(212, 160, 23, 0.4);
  border-radius: var(--border-radius-md);
  padding: 0.3em 0.75em;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  color: var(--color-gold-light);
  letter-spacing: 0.04em;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

.success-pop-enter-active {
  animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes success-pop {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
