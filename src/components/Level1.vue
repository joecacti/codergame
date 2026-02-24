<script setup>
import { ref, computed } from 'vue'
import { CORRECT, DISTRACTORS, SLOTS, SLOT_LABELS, FUNNY_MESSAGES, GOOD_MESSAGES, shuffle } from '../data/codeBlocks.js'
import Confetti from './Confetti.vue'
import ShipVisual from './ShipVisual.vue'

const props = defineProps({
  initials: { type: String, required: true },
})
const emit = defineEmits(['complete', 'admin'])

const allBlocks = ref(shuffle([...Object.values(CORRECT), ...DISTRACTORS]))
const toolbox = ref([...allBlocks.value])
const slots = ref({ hull: null, sails: null, crew: null, anchor: null })
const dragging = ref(null)
const wrongSlot = ref(null)
const confettiList = ref([])
const failState = ref(0)
const miniSink = ref(0)
const successState = ref(false)
const msg = ref("Ahoy! I've fallen in the water! Build me a ship, quick!")
const launched = ref(false)
let confettiId = 0

const built = computed(() => ({
  hull: slots.value.hull === CORRECT.hull,
  sails: slots.value.sails === CORRECT.sails,
  crew: slots.value.crew === CORRECT.crew,
  anchor: slots.value.anchor === CORRECT.anchor,
}))

const filledCount = computed(() => Object.values(slots.value).filter(Boolean).length)
const activeFailState = computed(() => launched.value ? failState.value : miniSink.value)

function fireConfetti(cx, cy) {
  const id = ++confettiId
  confettiList.value.push({ id, x: cx, y: cy })
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
  if (!slots.value[slot] && !launched.value && !miniSink.value) e.preventDefault()
}

function handleDrop(slot) {
  if (!dragging.value || slots.value[slot] || launched.value || miniSink.value) return
  const block = dragging.value
  if (!block.includes(slot)) {
    msg.value = `That's for a different part! Try ${slot}.`
    dragging.value = null
    return
  }
  slots.value[slot] = block
  toolbox.value = toolbox.value.filter(b => b !== block)
  dragging.value = null

  if (block === CORRECT[slot]) {
    msg.value = GOOD_MESSAGES[slot]
    fireConfetti(50, 40)
  } else {
    msg.value = FUNNY_MESSAGES[slot]
    wrongSlot.value = slot
    const hasShip = Object.values(slots.value).some((v, i) => v !== null && v !== block) || built.value.hull
    if (hasShip) {
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
        msg.value = 'Back to square one... try again, ' + props.initials + '!'
      }, 7000)
    } else {
      setTimeout(() => {
        toolbox.value.push(slots.value[slot])
        slots.value[slot] = null
        wrongSlot.value = null
        msg.value = 'Not right! Try another block, ' + props.initials + '!'
      }, 1500)
    }
  }
}

function handleRemove(slot) {
  if (launched.value || miniSink.value || !slots.value[slot]) return
  toolbox.value.push(slots.value[slot])
  slots.value[slot] = null
  msg.value = 'Block removed!'
}

function handleLaunch() {
  if (filledCount.value < 4) { msg.value = 'Need all 4 parts!'; return }
  launched.value = true
  if (Object.entries(slots.value).every(([k, v]) => v === CORRECT[k])) {
    msg.value = "ALL CANNONS FIRE! 🎉 She's perfect, Captain " + props.initials + '!'
    successState.value = true
    fireConfetti(25, 30); fireConfetti(50, 20); fireConfetti(75, 30)
  } else {
    msg.value = 'Uh oh... 😰'
    failState.value = 1
    setTimeout(() => { failState.value = 2; msg.value = 'CRACK! 💥' }, 1200)
    setTimeout(() => { failState.value = 3; msg.value = 'SINKING! 🫧' }, 2400)
    setTimeout(() => { failState.value = 4; msg.value = 'Captain overboard! 🏊' }, 3600)
    setTimeout(() => { failState.value = 5; msg.value = 'Is that a FIN?! 😱' }, 5000)
    setTimeout(() => { failState.value = 6; msg.value = "CHOMP! 🦈 Let's see what went wrong..." }, 6500)
  }
}

function handleReset() {
  allBlocks.value = shuffle([...Object.values(CORRECT), ...DISTRACTORS])
  toolbox.value = [...allBlocks.value]
  slots.value = { hull: null, sails: null, crew: null, anchor: null }
  dragging.value = null; wrongSlot.value = null
  failState.value = 0; miniSink.value = 0
  successState.value = false; launched.value = false
  confettiList.value = []
  msg.value = 'Back in the water... BUILD FASTER, ' + props.initials + '!'
}

const wrongEntries = computed(() => {
  if (!launched.value || failState.value !== 6) return []
  return Object.entries(slots.value).filter(([k, v]) => v !== CORRECT[k])
})
</script>

<template>
  <div class="level1">
    <!-- Header -->
    <div class="header">
      <div class="header-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="header-right">
        <span class="header-info">Captain <b class="gold">{{ initials }}</b></span>
        <span class="header-sep">|</span>
        <span class="header-info">Level 1: Build Your Ship</span>
      </div>
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

    <!-- 3-column layout -->
    <div class="game-columns">
      <!-- Toolbox -->
      <div class="toolbox">
        <div class="column-label">⚙️ Code Toolbox — Drag →</div>
        <div
          v-for="(block, i) in toolbox"
          :key="block + i"
          class="code-block"
          :class="{ dragging: dragging === block, disabled: launched || miniSink }"
          :draggable="!launched && !miniSink"
          @dragstart="onDragStart(block)"
          @dragend="onDragEnd"
        >
          <span class="grip">⠿</span>{{ block }}
        </div>
        <div v-if="toolbox.length === 0" class="empty-toolbox">All blocks placed!</div>
      </div>

      <!-- Ship visual -->
      <div class="ship-area">
        <Confetti v-for="c in confettiList" :key="c.id" :x="c.x" :y="c.y" :count="40" />
        <ShipVisual :built="built" :fail-state="activeFailState" :success-state="successState" :initials="initials" />
      </div>

      <!-- Drop zones -->
      <div class="drop-zones">
        <div class="column-label">🔧 Ship Parts — Drop here</div>
        <div
          v-for="slot in SLOTS"
          :key="slot"
          class="drop-slot"
          :class="{
            filled: slots[slot],
            correct: slots[slot] && slots[slot] === CORRECT[slot],
            wrong: wrongSlot === slot,
            'drag-hover': dragging && !slots[slot],
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
          <div v-else class="slot-empty">[ drop {{ slot }} code ]</div>
        </div>

        <div class="concepts-section">
          <div class="column-label">Concepts</div>
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
        <div class="wrong-line"><span class="x-mark">✗</span><code class="wrong-code">{{ val }}</code><span class="hint">← wrong!</span></div>
        <div class="wrong-line correct-line"><span class="check-mark">✓</span><code class="correct-code">{{ CORRECT[slot] }}</code><span class="hint">← try this!</span></div>
      </div>
    </div>

    <!-- Success banner -->
    <div v-if="successState" class="success-panel">
      <div class="success-emoji">🎉</div>
      <div class="success-title">Variables Unlocked!</div>
      <div class="success-sub">Captain {{ initials }}, you used variables to build a ship!</div>
    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button v-if="!launched && !miniSink" @click="handleLaunch" class="launch-btn" :class="{ ready: filledCount === 4 }">⛵ Launch Ship!</button>
      <template v-if="launched">
        <button @click="handleReset" class="reset-btn">🔄 Try Again</button>
        <button v-if="successState" @click="$emit('complete')" class="next-btn">⛵ Set Sail → Level 2</button>
      </template>
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

.progress-bar { padding: 8px 16px; display: flex; align-items: center; gap: 8px; }
.progress-label { font-size: 11px; color: #888; }
.progress-track { flex: 1; height: 6px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #fbbf24; border-radius: 3px; transition: width .4s; }
.progress-fill.success { background: #22c55e; }
.progress-count { font-size: 11px; color: #fbbf24; }

.captain-msg {
  margin: 0 16px 10px;
  padding: 10px 14px;
  background: rgba(251,191,36,.1);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 8px;
  font-size: 13px;
  color: #fbbf24;
  font-family: Georgia, serif;
  font-style: italic;
}

.game-columns {
  display: flex;
  gap: 0;
  margin: 0 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  height: 520px;
}

.toolbox {
  width: 195px;
  background: rgba(0,0,0,.3);
  border-right: 1px solid rgba(255,255,255,.1);
  padding: 12px;
  overflow-y: auto;
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
  transition: all .15s;
}
.code-block.dragging { background: rgba(74,144,217,.3); border: 1px solid #4a90d9; }
.code-block.disabled { opacity: .4; cursor: default; }
.grip { color: #555; margin-right: 6px; }
.empty-toolbox { font-size: 12px; color: #555; text-align: center; padding: 20px; }

.ship-area { flex: 1; position: relative; background: rgba(0,0,0,.15); }

.drop-zones {
  width: 210px;
  background: rgba(0,0,0,.3);
  border-left: 1px solid rgba(255,255,255,.1);
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
}
.drop-slot.filled { border-color: rgba(255,255,255,.3); background: rgba(255,255,255,.04); cursor: pointer; }
.drop-slot.correct { border-color: #22c55e; background: rgba(34,197,94,.08); }
.drop-slot.wrong { border-color: #ef4444; background: rgba(239,68,68,.1); animation: shake .4s; }
.drop-slot.drag-hover { border-color: #4a90d9; background: rgba(74,144,217,.08); }
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

.actions { padding: 14px 16px; display: flex; justify-content: center; gap: 10px; }
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
</style>
