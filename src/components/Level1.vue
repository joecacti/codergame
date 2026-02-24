<script setup>
import { ref, computed } from 'vue'
import { CORRECT, DISTRACTORS, SLOTS, SLOT_LABELS, FUNNY_MESSAGES, GOOD_MESSAGES, WRONG_EXPLANATIONS, HINTS, CODE_BREAKDOWNS, shuffle } from '../data/codeBlocks.js'
import Confetti from './Confetti.vue'
import ShipVisual from './ShipVisual.vue'
import CodeExplainer from './CodeExplainer.vue'
import VariableWatch from './VariableWatch.vue'
import ConceptCard from './ConceptCard.vue'
import HintButton from './HintButton.vue'
import { useSound } from '../composables/useSound.js'
import { useProgress } from '../composables/useProgress.js'

const props = defineProps({
  initials: { type: String, required: true },
})
const emit = defineEmits(['complete', 'admin'])

const { click: sClick, correct: sCorrect, wrong: sWrong, drop: sDrop, badge: sBadge, splash: sSplash, launch: sLaunch, muted, toggleMute, voiceMightyVessel, voiceShark, voiceKilledUs } = useSound()
const { xp, rank, xpProgress, floats, awardCorrectDrop, awardFirstTry, awardLevelComplete, spendHint } = useProgress()

// Tutorial state
const tutorialStep = ref(0)
const tutorialActive = ref(true)

const TUTORIAL_STEPS = [
  {
    title: "Welcome aboard, Captain!",
    text: "Before we build your ship, let's learn about VARIABLES — the building blocks of code!",
    icon: "🏴‍☠️",
    highlight: null,
  },
  {
    title: "What's a Variable?",
    text: "A variable is like a labeled treasure chest. You give it a NAME and put a VALUE inside.\n\nFor example: let hull = \"oak\" creates a chest labeled \"hull\" with \"oak\" inside!",
    icon: "📦",
    highlight: null,
  },
  {
    title: "Different Types of Treasure",
    text: "Variables can hold different types of values:\n\n• Text (strings): \"oak\" — always in quotes\n• Numbers: 3, 12 — no quotes needed\n• True/False (booleans): true or false",
    icon: "💎",
    highlight: null,
  },
  {
    title: "The Code Toolbox",
    text: "Over here you'll find code blocks — some are correct and some are WRONG! Drag the right ones to build your ship.",
    icon: "⚙️",
    highlight: "toolbox",
  },
  {
    title: "The Ship Parts",
    text: "Drop each code block into its matching ship part. Look at the variable NAME to figure out where it goes — \"hull\" goes in Hull, \"sails\" goes in Sails, etc.",
    icon: "🔧",
    highlight: "dropzones",
  },
  {
    title: "Watch Out for Bad Code!",
    text: "Some blocks have silly values that won't work — like a hull of 0 or fish for sails! Pick the values that make sense for a real ship.",
    icon: "🦈",
    highlight: null,
  },
  {
    title: "Ready to Build!",
    text: "Drag the correct code blocks into each ship part, then hit Launch! If the code is wrong... the ship sinks! Good luck, Captain!",
    icon: "⛵",
    highlight: null,
  },
]

function nextTutorialStep() {
  sClick()
  if (tutorialStep.value < TUTORIAL_STEPS.length - 1) {
    tutorialStep.value++
  } else {
    tutorialActive.value = false
  }
}

function prevTutorialStep() {
  sClick()
  if (tutorialStep.value > 0) tutorialStep.value--
}

function skipTutorial() {
  tutorialActive.value = false
}

const currentTutorial = computed(() => TUTORIAL_STEPS[tutorialStep.value])

const allBlocks = ref(shuffle([...Object.values(CORRECT), ...DISTRACTORS]))
const toolbox = ref([...allBlocks.value])
const slots = ref({ hull: null, sails: null, crew: null, anchor: null })
const dragging = ref(null)
const touchDragEl = ref(null)
const touchOffset = ref({ x: 0, y: 0 })
const wrongSlot = ref(null)
const confettiList = ref([])
const failState = ref(0)
const miniSink = ref(0)
const successState = ref(false)
const msg = ref("Ahoy! I've fallen in the water! Build me a ship, quick!")
const launched = ref(false)
const showConceptCard = ref(false)
const lastPlacedSlot = ref(null)
const firstTrySlots = ref({ hull: true, sails: true, crew: true, anchor: true })
let confettiId = 0

const built = computed(() => ({
  hull: slots.value.hull === CORRECT.hull,
  sails: slots.value.sails === CORRECT.sails,
  crew: slots.value.crew === CORRECT.crew,
  anchor: slots.value.anchor === CORRECT.anchor,
}))

const filledCount = computed(() => Object.values(slots.value).filter(Boolean).length)

// Enforce build order: hull → sails → crew → anchor
const nextSlotIndex = computed(() => {
  for (let i = 0; i < SLOTS.length; i++) {
    if (!slots.value[SLOTS[i]]) return i
  }
  return SLOTS.length
})

function isSlotUnlocked(slot) {
  const idx = SLOTS.indexOf(slot)
  return idx <= nextSlotIndex.value
}
const activeFailState = computed(() => launched.value ? failState.value : miniSink.value)

// CodeExplainer: show breakdown for last placed slot
const activeBreakdown = computed(() => {
  if (!lastPlacedSlot.value) return []
  const bd = CODE_BREAKDOWNS[lastPlacedSlot.value]
  return bd ? bd.parts : []
})

// HintButton: current slot needing hint (first empty slot)
const hintSlot = computed(() => {
  for (const s of SLOTS) {
    if (!slots.value[s]) return s
  }
  return null
})

const currentHints = computed(() => {
  if (!hintSlot.value) return []
  return HINTS[hintSlot.value] || []
})

function fireConfetti(cx, cy, variant = 'confetti') {
  const id = ++confettiId
  confettiList.value.push({ id, x: cx, y: cy, variant })
  setTimeout(() => { confettiList.value = confettiList.value.filter(c => c.id !== id) }, 2500)
}

function onDragStart(block) {
  if (launched.value || miniSink.value) return
  dragging.value = block
}
function onDragEnd() {
  if (!Object.values(slots.value).includes(dragging.value)) dragging.value = null
}
function onDragOver(e, slot) {
  if (!slots.value[slot] && !launched.value && !miniSink.value && isSlotUnlocked(slot)) e.preventDefault()
}

// Touch drag-and-drop for iPad/mobile
function onTouchStart(e, block) {
  if (launched.value || miniSink.value) return
  dragging.value = block
  const touch = e.touches[0]
  const rect = e.target.getBoundingClientRect()
  touchOffset.value = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }

  // Create floating clone
  const clone = e.target.cloneNode(true)
  clone.classList.add('touch-clone')
  clone.style.width = rect.width + 'px'
  clone.style.left = (touch.clientX - touchOffset.value.x) + 'px'
  clone.style.top = (touch.clientY - touchOffset.value.y) + 'px'
  document.body.appendChild(clone)
  touchDragEl.value = clone

  e.preventDefault()
}

function onTouchMove(e) {
  if (!dragging.value || !touchDragEl.value) return
  const touch = e.touches[0]
  touchDragEl.value.style.left = (touch.clientX - touchOffset.value.x) + 'px'
  touchDragEl.value.style.top = (touch.clientY - touchOffset.value.y) + 'px'
  e.preventDefault()
}

function onTouchEnd(e) {
  if (!dragging.value) return
  // Remove clone
  if (touchDragEl.value) {
    touchDragEl.value.remove()
    touchDragEl.value = null
  }

  // Find which drop slot the touch ended over
  const touch = e.changedTouches[0]
  const dropEls = document.querySelectorAll('.drop-slot')
  let dropped = false
  for (const el of dropEls) {
    const rect = el.getBoundingClientRect()
    if (
      touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom
    ) {
      const slot = el.dataset.slot
      if (slot && !slots.value[slot] && isSlotUnlocked(slot)) {
        handleDrop(slot)
        dropped = true
      }
      break
    }
  }
  if (!dropped) {
    dragging.value = null
  }
}

function handleDrop(slot) {
  if (!dragging.value || slots.value[slot] || launched.value || miniSink.value) return
  if (!isSlotUnlocked(slot)) {
    const prevSlot = SLOTS[SLOTS.indexOf(slot) - 1]
    msg.value = `Build the ${prevSlot} first, Captain!`
    dragging.value = null
    return
  }
  const block = dragging.value
  if (!block.includes(slot)) {
    msg.value = `That's for a different part! Try ${slot}.`
    dragging.value = null
    return
  }
  slots.value[slot] = block
  toolbox.value = toolbox.value.filter(b => b !== block)
  dragging.value = null
  lastPlacedSlot.value = slot
  sDrop()

  if (block === CORRECT[slot]) {
    msg.value = GOOD_MESSAGES[slot]
    sCorrect()
    awardCorrectDrop()
    if (firstTrySlots.value[slot]) {
      awardFirstTry()
      fireConfetti(50, 40, 'sparkle')
    } else {
      fireConfetti(50, 40)
    }
  } else {
    msg.value = WRONG_EXPLANATIONS[slot] || FUNNY_MESSAGES[slot]
    sWrong()
    wrongSlot.value = slot
    firstTrySlots.value[slot] = false
    const hasShip = Object.values(slots.value).some((v, i) => v !== null && v !== block) || built.value.hull
    if (hasShip) {
      sSplash()
      voiceKilledUs()
      miniSink.value = 1
      setTimeout(() => { miniSink.value = 2; msg.value = "She's cracking apart! 💥" }, 1000)
      setTimeout(() => { miniSink.value = 3; msg.value = "She's going down! 🫧" }, 2000)
      setTimeout(() => { miniSink.value = 4; msg.value = "Captain overboard! SWIM! 🏊" }, 3000)
      setTimeout(() => { miniSink.value = 5; msg.value = "Is that a... FIN?! 😱" }, 4200)
      setTimeout(() => { miniSink.value = 6; msg.value = "CHOMP! 🦈 Bad code sinks ships!" }, 5400)
      setTimeout(() => {
        slots.value = { hull: null, sails: null, crew: null, anchor: null }
        const a = shuffle([...Object.values(CORRECT), ...DISTRACTORS])
        toolbox.value = a; allBlocks.value = a
        wrongSlot.value = null; miniSink.value = 0
        lastPlacedSlot.value = null
        msg.value = 'Back to square one... try again, ' + props.initials + '!'
      }, 7000)
    } else {
      setTimeout(() => {
        toolbox.value.push(slots.value[slot])
        slots.value[slot] = null
        wrongSlot.value = null
        msg.value = 'Not quite, ' + props.initials + '! Read the hint above and try a different block.'
      }, 3500)
    }
  }
}

function handleRemove(slot) {
  if (launched.value || miniSink.value || !slots.value[slot]) return
  // Remove this slot and all slots after it (to maintain build order)
  const idx = SLOTS.indexOf(slot)
  for (let i = SLOTS.length - 1; i >= idx; i--) {
    if (slots.value[SLOTS[i]]) {
      toolbox.value.push(slots.value[SLOTS[i]])
      slots.value[SLOTS[i]] = null
    }
  }
  lastPlacedSlot.value = null
  msg.value = 'Block removed!'
}

function handleLaunch() {
  if (filledCount.value < 4) { msg.value = 'Need all 4 parts!'; return }
  launched.value = true
  sLaunch()
  if (Object.entries(slots.value).every(([k, v]) => v === CORRECT[k])) {
    msg.value = "ALL CANNONS FIRE! 🎉 She's perfect, Captain " + props.initials + '!'
    successState.value = true
    sCorrect()
    sBadge()
    voiceMightyVessel()
    awardLevelComplete()
    fireConfetti(25, 30, 'golden-burst')
    fireConfetti(50, 20, 'golden-burst')
    fireConfetti(75, 30, 'golden-burst')
    setTimeout(() => { showConceptCard.value = true }, 1500)
  } else {
    msg.value = 'Uh oh... 😰'
    sWrong()
    voiceKilledUs()
    failState.value = 1
    setTimeout(() => { failState.value = 2; msg.value = 'CRACK! 💥' }, 1200)
    setTimeout(() => { failState.value = 3; msg.value = 'SINKING! 🫧' }, 2400)
    setTimeout(() => { failState.value = 4; msg.value = 'Captain overboard! 🏊' }, 3600)
    setTimeout(() => { failState.value = 5; msg.value = 'Is that a FIN?! 😱'; voiceShark() }, 5000)
    setTimeout(() => { sSplash(); failState.value = 6; msg.value = "CHOMP! 🦈 Let's see what went wrong..." }, 6500)
  }
}

function handleReset() {
  allBlocks.value = shuffle([...Object.values(CORRECT), ...DISTRACTORS])
  toolbox.value = [...allBlocks.value]
  slots.value = { hull: null, sails: null, crew: null, anchor: null }
  dragging.value = null; wrongSlot.value = null
  failState.value = 0; miniSink.value = 0
  successState.value = false; launched.value = false
  confettiList.value = []; lastPlacedSlot.value = null
  showConceptCard.value = false
  msg.value = 'Back in the water... BUILD FASTER, ' + props.initials + '!'
}

function handleHint() {
  spendHint()
  sClick()
}

const wrongEntries = computed(() => {
  if (!launched.value || failState.value !== 6) return []
  return Object.entries(slots.value).filter(([k, v]) => v !== CORRECT[k])
})
</script>

<template>
  <div class="level1">
    <!-- ConceptCard overlay -->
    <ConceptCard v-if="showConceptCard" :level="1" :initials="initials" @dismiss="showConceptCard = false" />

    <!-- Tutorial Overlay -->
    <div v-if="tutorialActive" class="tutorial-overlay">
      <div class="tutorial-card">
        <button class="tutorial-skip" @click="skipTutorial">Skip Tutorial →</button>
        <div class="tutorial-icon">{{ currentTutorial.icon }}</div>
        <div class="tutorial-title">{{ currentTutorial.title }}</div>
        <div class="tutorial-text">{{ currentTutorial.text }}</div>
        <div class="tutorial-dots">
          <span
            v-for="(_, i) in TUTORIAL_STEPS"
            :key="i"
            class="tutorial-dot"
            :class="{ active: i === tutorialStep, done: i < tutorialStep }"
          />
        </div>
        <div class="tutorial-buttons">
          <button v-if="tutorialStep > 0" class="tutorial-btn tutorial-btn-back" @click="prevTutorialStep">← Back</button>
          <button class="tutorial-btn tutorial-btn-next" @click="nextTutorialStep">
            {{ tutorialStep === TUTORIAL_STEPS.length - 1 ? "Let's Go! ⛵" : 'Next →' }}
          </button>
        </div>
      </div>

      <!-- Highlight arrows for toolbox/dropzones steps -->
      <div v-if="currentTutorial.highlight === 'toolbox'" class="tutorial-highlight tutorial-highlight-left">
        <div class="tutorial-arrow">👈 Over here!</div>
      </div>
      <div v-if="currentTutorial.highlight === 'dropzones'" class="tutorial-highlight tutorial-highlight-right">
        <div class="tutorial-arrow">Over here! 👉</div>
      </div>
    </div>

    <!-- Header -->
    <div class="header">
      <div class="header-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="header-right">
        <span class="rank-badge">{{ rank.emoji }} {{ rank.title }}</span>
        <button class="mute-btn" @click="toggleMute" :title="muted ? 'Unmute' : 'Mute'">{{ muted ? '🔇' : '🔊' }}</button>
        <span class="header-info">Captain <b class="gold">{{ initials }}</b></span>
        <span class="header-sep">|</span>
        <span class="header-info">Level 1: Build Your Ship</span>
      </div>
    </div>

    <!-- XP Bar -->
    <div class="xp-bar">
      <span class="xp-label">XP:</span>
      <div class="xp-track">
        <div class="xp-fill" :style="{ width: xpProgress + '%' }" />
      </div>
      <span class="xp-count">{{ xp }} XP</span>
    </div>

    <!-- XP Floats -->
    <div class="xp-floats">
      <div v-for="f in floats" :key="f.id" class="xp-float">{{ f.label }}</div>
    </div>

    <!-- Progress -->
    <div class="progress-bar">
      <span class="progress-label">Progress:</span>
      <div class="progress-track">
        <div class="progress-fill" :class="{ success: successState }" :style="{ width: (filledCount / 4) * 100 + '%' }" />
      </div>
      <span class="progress-count">{{ filledCount }}/4</span>
    </div>

    <!-- Captain message -->
    <div class="captain-msg">🧑‍✈️ "{{ msg }}"</div>

    <!-- Main game area: left (interaction) + right (ship) -->
    <div class="game-layout">
      <!-- LEFT: Code interaction -->
      <div class="game-left">
        <!-- Step guide -->
        <div class="step-guide">
          <span class="step-num">1</span> Pick a block
          <span class="step-arrow">→</span>
          <span class="step-num">2</span> Drop on part
          <span class="step-arrow">→</span>
          <span class="step-num">3</span> Launch!
        </div>

        <!-- Toolbox + Drop Zones side by side -->
        <div class="game-columns">
          <!-- Toolbox -->
          <div class="toolbox">
            <div class="column-label">⚙️ Code Blocks</div>
            <div
              v-for="(block, i) in toolbox"
              :key="block + i"
              class="code-block"
              :class="{ dragging: dragging === block, disabled: launched || miniSink }"
              :draggable="!launched && !miniSink"
              @dragstart="onDragStart(block)"
              @dragend="onDragEnd"
              @touchstart="onTouchStart($event, block)"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
            >
              <span class="grip">⠇</span>{{ block }}
            </div>
            <div v-if="toolbox.length === 0" class="empty-toolbox">All placed!</div>
          </div>

          <!-- Arrow divider -->
          <div class="drag-arrow-col">
            <div class="drag-arrow" :class="{ active: dragging }">→</div>
          </div>

          <!-- Drop zones -->
          <div class="drop-zones">
            <div class="column-label">🔧 Drop here</div>
            <div
              v-for="slot in SLOTS"
              :key="slot"
              :data-slot="slot"
              class="drop-slot"
              :class="{
                filled: slots[slot],
                correct: slots[slot] && slots[slot] === CORRECT[slot],
                wrong: wrongSlot === slot,
                'drag-hover': dragging && !slots[slot] && isSlotUnlocked(slot),
                locked: !slots[slot] && !isSlotUnlocked(slot),
              }"
              @dragover="onDragOver($event, slot)"
              @drop="handleDrop(slot)"
              @click="handleRemove(slot)"
            >
              <div class="slot-label">{{ SLOT_LABELS[slot] }}</div>
              <div v-if="slots[slot]" class="slot-filled">
                <span>{{ slots[slot] }}</span>
                <span v-if="!launched && !miniSink" class="remove-x">✕</span>
              </div>
              <div v-else class="slot-empty">{{ isSlotUnlocked(slot) ? `[ ${slot} ]` : `🔒 ${SLOTS[SLOTS.indexOf(slot) - 1]} first` }}</div>
            </div>
          </div>
        </div>

        <!-- Hint + Launch row -->
        <div class="action-row">
          <div class="hint-row"><img src="/images/pirate-kit/bottle.png" alt="" class="hint-bottle" /><HintButton :hints="currentHints" :xp="xp" @use-hint="handleHint" /></div>
          <button v-if="!launched && !miniSink" @click="handleLaunch" class="launch-btn" :class="{ ready: filledCount === 4 }">⛵ Launch Ship!</button>
          <template v-if="launched">
            <button @click="handleReset" class="reset-btn">🔄 Try Again</button>
            <button v-if="successState" @click="$emit('complete')" class="next-btn">⛵ Level 2 →</button>
          </template>
        </div>
      </div>

      <!-- RIGHT: Ship + info panels -->
      <div class="game-right">
        <div class="ship-area">
          <img src="/images/pirate-kit/barrel.png" alt="" class="deco-barrel-l1" />
          <Confetti v-for="c in confettiList" :key="c.id" :x="c.x" :y="c.y" :count="40" :variant="c.variant || 'confetti'" />
          <ShipVisual :built="built" :fail-state="activeFailState" :success-state="successState" :initials="initials" />
        </div>

        <!-- Variable Watch -->
        <VariableWatch :slots="slots" :correct="CORRECT" />

        <!-- Code Explainer (collapsible, only after first placement) -->
        <CodeExplainer :parts="activeBreakdown" :visible="!!lastPlacedSlot" />

        <!-- Concepts badge -->
        <div class="concepts-section">
          <div class="concept-badge" :class="{ unlocked: successState }">
            {{ successState ? '✅' : '🔒' }} Variables
          </div>
        </div>
      </div>
    </div>

    <!-- Wrong entries explanation -->
    <div v-if="failState === 6 && wrongEntries.length > 0" class="wrong-panel">
      <div class="wrong-title">🧑‍✈️ "Here's what went wrong..."</div>
      <div v-for="[slot, val] in wrongEntries" :key="slot" class="wrong-entry">
        <div class="wrong-line"><span class="x-mark">✗</span><code class="wrong-code">{{ val }}</code><span class="hint">{{ WRONG_EXPLANATIONS[slot] || '← wrong!' }}</span></div>
        <div class="wrong-line correct-line"><span class="check-mark">✓</span><code class="correct-code">{{ CORRECT[slot] }}</code><span class="hint">← try this!</span></div>
      </div>
    </div>

    <!-- Success banner -->
    <div v-if="successState && !showConceptCard" class="success-panel">
      <div class="success-emoji">🎉</div>
      <div class="success-title">Variables Unlocked!</div>
      <div class="success-sub">Captain {{ initials }}, you used variables to build a ship!</div>
    </div>

  </div>
</template>

<style scoped>
.level1 {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a1628 0%, #1a2a4a 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
}
.header {
  background: rgba(0,0,0,.3);
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title { font-size: 16px; font-weight: 700; color: #fbbf24; font-family: Georgia, serif; }
.header-right { display: flex; align-items: center; gap: 12px; }
.header-info { font-size: 12px; color: #888; }
.header-sep { font-size: 12px; color: #555; }
.gold { color: #fbbf24; }

.rank-badge {
  font-size: 11px;
  background: rgba(251,191,36,.1);
  border: 1px solid rgba(251,191,36,.25);
  border-radius: 4px;
  padding: 2px 8px;
  color: #fbbf24;
}

.mute-btn {
  background: none;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 14px;
  cursor: pointer;
  color: #888;
  line-height: 1;
}
.mute-btn:hover { border-color: rgba(255,255,255,.25); }

.xp-bar { padding: 4px 16px; display: flex; align-items: center; gap: 8px; }
.xp-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
.xp-track { flex: 1; height: 4px; background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden; }
.xp-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 2px; transition: width .5s; }
.xp-count { font-size: 11px; color: #a855f7; font-weight: 600; }

.xp-floats { position: fixed; top: 60px; right: 20px; z-index: 200; pointer-events: none; }
.xp-float {
  color: #fbbf24;
  font-size: 14px;
  font-weight: 700;
  font-family: Georgia, serif;
  animation: floatUp 1.5s ease forwards;
  margin-bottom: 4px;
}
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}

.progress-bar { padding: 4px 16px; display: flex; align-items: center; gap: 8px; }
.progress-label { font-size: 11px; color: #888; }
.progress-track { flex: 1; height: 6px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #fbbf24; border-radius: 3px; transition: width .4s; }
.progress-fill.success { background: #22c55e; }
.progress-count { font-size: 11px; color: #fbbf24; }

.captain-msg {
  margin: 0 16px 6px;
  padding: 10px 14px;
  background: rgba(251,191,36,.1);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 8px;
  font-size: 13px;
  color: #fbbf24;
  font-family: Georgia, serif;
  font-style: italic;
}

/* Two-column master layout */
.game-layout {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  min-height: 0;
}
.game-left {
  flex: 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.game-right {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Ship area — inside game-right, most prominent element */
.ship-area {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(251,191,36,.25);
  height: 360px;
  position: relative;
  background: rgba(0,0,0,.15);
  box-shadow: 0 4px 20px rgba(0,0,0,.3), 0 0 30px rgba(251,191,36,.08);
}

/* Step guide — inside game-left */
.step-guide {
  padding: 6px 12px;
  background: rgba(74,144,217,.08);
  border: 1px solid rgba(74,144,217,.2);
  border-radius: 8px;
  font-size: 12px;
  color: #a5f3fc;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(74,144,217,.2);
  border: 1px solid rgba(74,144,217,.4);
  font-size: 11px;
  font-weight: 700;
  color: #60a5fa;
}
.step-arrow { color: #555; font-size: 14px; }

.game-columns {
  display: flex;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  flex: 1;
  min-height: 0;
}

/* Action row inside game-left */
.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbox {
  flex: 1;
  background: rgba(0,0,0,.3);
  padding: 12px;
  overflow-y: auto;
}

/* Arrow divider between toolbox and drop zones */
.drag-arrow-col {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  background: rgba(0,0,0,.2);
  border-left: 1px solid rgba(255,255,255,.06);
  border-right: 1px solid rgba(255,255,255,.06);
}
.drag-arrow {
  color: #555;
  font-size: 18px;
  text-align: center;
  line-height: 1.3;
  transition: all .3s;
}
.drag-arrow.active {
  color: #4a90d9;
  animation: arrowPulse .8s ease-in-out infinite;
}
@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); opacity: .6; }
  50% { transform: translateX(4px); opacity: 1; }
}
.column-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
.code-block {
  background: rgba(255,255,255,.06);
  border: 1px dashed rgba(255,255,255,.15);
  border-radius: 6px;
  padding: 7px 10px;
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
  color: #a5f3fc;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  transition: all .15s;
}
.code-block.dragging { background: rgba(74,144,217,.3); border: 1px solid #4a90d9; }
.code-block.disabled { opacity: .4; cursor: default; }
.grip { color: #555; margin-right: 6px; }
.empty-toolbox { font-size: 12px; color: #555; text-align: center; padding: 20px; }

.label-icon { width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.4)); }
.btn-icon { width: 22px; height: 22px; vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
.hint-row { display: flex; align-items: center; gap: 6px; }
.hint-bottle { width: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.4)); opacity: .7; }
.deco-barrel-l1 { position: absolute; bottom: 4px; right: 6px; width: 36px; opacity: .2; pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,.5)); z-index: 0; }
.success-chest { width: 64px; filter: drop-shadow(0 4px 12px rgba(251,191,36,.3)); margin-bottom: 6px; }

.drop-zones {
  flex: 1;
  background: rgba(0,0,0,.3);
  padding: 12px;
}
.drop-slot {
  border: 2px dashed rgba(255,255,255,.12);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 8px;
  background: rgba(255,255,255,.02);
  transition: all .2s;
  min-height: 42px;
  cursor: default;
  touch-action: manipulation;
}
.drop-slot.filled { border-color: rgba(255,255,255,.3); background: rgba(255,255,255,.04); cursor: pointer; }
.drop-slot.correct { border-color: #22c55e; background: rgba(34,197,94,.08); }
.drop-slot.wrong { border-color: #ef4444; background: rgba(239,68,68,.1); animation: shake .4s; }
.drop-slot.drag-hover { border-color: #4a90d9; background: rgba(74,144,217,.08); }
.drop-slot.locked { opacity: .4; border-color: rgba(255,255,255,.06); }
.slot-label { font-size: 10px; color: #888; margin-bottom: 3px; }
.slot-filled { font-family: monospace; font-size: 11px; display: flex; justify-content: space-between; align-items: center; }
.drop-slot.correct .slot-filled { color: #86efac; }
.drop-slot.wrong .slot-filled { color: #fca5a5; }
.remove-x { font-size: 9px; color: #888; }
.slot-empty { font-family: monospace; font-size: 11px; color: #555; }

.concepts-section { margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.08); }
.concept-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,.04);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: #666;
  font-family: monospace;
}
.concept-badge.unlocked { background: rgba(34,197,94,.12); border-color: #22c55e; color: #22c55e; }

.wrong-panel {
  margin: 12px 16px;
  padding: 14px;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.2);
  border-radius: 8px;
}
.wrong-title { font-size: 13px; font-weight: 600; color: #fca5a5; margin-bottom: 8px; }
.wrong-entry { margin-bottom: 8px; font-size: 12px; line-height: 1.6; }
.wrong-line { display: flex; gap: 8px; align-items: center; }
.correct-line { margin-top: 2px; }
.x-mark { color: #ef4444; }
.check-mark { color: #22c55e; }
.wrong-code { background: rgba(239,68,68,.15); padding: 2px 6px; border-radius: 3px; color: #fca5a5; font-size: 11px; }
.correct-code { background: rgba(34,197,94,.15); padding: 2px 6px; border-radius: 3px; color: #86efac; font-size: 11px; }
.hint { color: #888; font-size: 11px; }

.success-panel {
  margin: 12px 16px;
  padding: 14px;
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.2);
  border-radius: 8px;
  text-align: center;
}
.success-emoji { font-size: 18px; margin-bottom: 4px; }
.success-title { font-size: 15px; font-weight: 700; color: #22c55e; }
.success-sub { font-size: 12px; color: #888; margin-top: 4px; }

.launch-btn {
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,.08);
  color: #555;
  font-size: 14px;
  font-weight: 700;
  cursor: default;
  font-family: Georgia, serif;
  transition: all .3s;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.launch-btn::before { display: none; }
.launch-btn.ready { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #0a1628; cursor: pointer; }
.reset-btn {
  padding: 10px 28px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.05);
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
  font-family: Georgia, serif;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.reset-btn::before { display: none; }
.next-btn {
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Georgia, serif;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.next-btn::before { display: none; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

/* Tutorial Overlay */
.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, .75);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: tutorialFadeIn .4s ease;
}

@keyframes tutorialFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tutorial-card {
  position: relative;
  background: linear-gradient(135deg, #1a2a4a 0%, #0f1d35 100%);
  border: 2px solid rgba(251, 191, 36, .4);
  border-radius: 16px;
  padding: 32px 36px 28px;
  max-width: 460px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 40px rgba(251, 191, 36, .15), 0 20px 60px rgba(0, 0, 0, .5);
  animation: tutorialCardIn .4s ease;
}

@keyframes tutorialCardIn {
  from { opacity: 0; transform: scale(.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.tutorial-skip {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: #888;
  font-size: 11px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: color .2s;
}
.tutorial-skip:hover { color: #fbbf24; }

.tutorial-icon { font-size: 42px; margin-bottom: 12px; }

.tutorial-title {
  font-size: 20px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  margin-bottom: 12px;
}

.tutorial-text {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 20px;
}

.tutorial-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.tutorial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .15);
  transition: all .3s;
}
.tutorial-dot.active {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, .5);
  transform: scale(1.3);
}
.tutorial-dot.done { background: rgba(251, 191, 36, .4); }

.tutorial-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tutorial-btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: Georgia, serif;
  transition: all .2s;
}

.tutorial-btn-back {
  background: rgba(255, 255, 255, .08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, .15);
}
.tutorial-btn-back:hover { background: rgba(255, 255, 255, .12); }

.tutorial-btn-next {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0a1628;
}
.tutorial-btn-next:hover { filter: brightness(1.1); }

.tutorial-highlight {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  animation: tutorialBounce 1.2s ease-in-out infinite;
}
.tutorial-highlight-left { left: 24px; }
.tutorial-highlight-right { right: 24px; }

.tutorial-arrow {
  font-size: 18px;
  color: #fbbf24;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(251, 191, 36, .5);
}

@keyframes tutorialBounce {
  0%, 100% { transform: translateY(-50%) translateX(0); }
  50% { transform: translateY(-50%) translateX(8px); }
}
.tutorial-highlight-left .tutorial-arrow {
  animation: tutorialBounceLeft 1.2s ease-in-out infinite;
}
@keyframes tutorialBounceLeft {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-8px); }
}

/* iPad / tablet */
@media (max-width: 1024px) {
  .header { flex-wrap: wrap; gap: 6px; }
  .header-right { flex-wrap: wrap; gap: 8px; font-size: 11px; }

  .game-layout {
    flex-direction: column;
  }
  .game-left { flex: none; }
  .game-right { flex: none; }

  .ship-area { height: 180px; }

  .game-columns { min-height: 220px; }

  .code-block { font-size: 11px; padding: 6px 8px; }
  .drop-slot { padding: 6px 8px; min-height: 38px; }

  .captain-msg { font-size: 12px; }
  .tutorial-card { max-width: 90vw; padding: 24px 20px; }
}

@media (max-width: 768px) {
  .header-title { font-size: 14px; }
  .game-columns { flex-direction: column; }
  .drag-arrow-col {
    width: auto;
    height: 28px;
    border-left: none;
    border-right: none;
    border-top: 1px solid rgba(255,255,255,.06);
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .drag-arrow { transform: rotate(90deg); }
  .drag-arrow.active { animation: arrowPulseDown .8s ease-in-out infinite; }
  .action-row { justify-content: center; }
}
@keyframes arrowPulseDown {
  0%, 100% { transform: rotate(90deg) translateX(0); opacity: .6; }
  50% { transform: rotate(90deg) translateX(4px); opacity: 1; }
}
</style>

<style>
/* Touch drag clone — must be unscoped since it's appended to body */
.touch-clone {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  opacity: .85;
  transform: scale(1.05);
  background: rgba(74,144,217,.3);
  border: 1px solid #4a90d9;
  border-radius: 6px;
  padding: 7px 10px;
  font-family: monospace;
  font-size: 12px;
  color: #a5f3fc;
  box-shadow: 0 4px 20px rgba(74,144,217,.3);
}
</style>
