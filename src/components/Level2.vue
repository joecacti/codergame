<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { OBSTACLES } from '../data/obstacles.js'
import { shuffle } from '../data/codeBlocks.js'
import Confetti from './Confetti.vue'

const props = defineProps({
  initials: { type: String, required: true },
})
const emit = defineEmits(['admin'])

const score = ref(0)
const obstacleIdx = ref(0)
const phase = ref('sailing') // sailing, challenge, dodging, crash, win
const shipX = ref(50)
const selected = ref(null)
const feedback = ref('')
const obstacles = ref(shuffle([...OBSTACLES]).slice(0, 5))
const crashState = ref(0)
const confettiList = ref([])
const msg = ref('Smooth sailing, Captain ' + props.initials + '! Keep your eyes on the horizon...')
let confettiId = 0
let timerRef = null

const currentObs = computed(() => obstacles.value[obstacleIdx.value % obstacles.value.length])

function fireConfetti(cx, cy) {
  const id = ++confettiId
  confettiList.value.push({ id, x: cx, y: cy })
  setTimeout(() => { confettiList.value = confettiList.value.filter(c => c.id !== id) }, 2500)
}

// Auto-trigger next obstacle
watch([phase, score, obstacleIdx], () => {
  clearTimeout(timerRef)
  if (phase.value === 'sailing' && score.value < 5) {
    timerRef = setTimeout(() => {
      phase.value = 'challenge'
      msg.value = currentObs.value.prompt
      selected.value = null
      feedback.value = ''
    }, 2000)
  }
}, { immediate: true })

onBeforeUnmount(() => clearTimeout(timerRef))

function handleAnswer(idx) {
  if (selected.value !== null) return
  selected.value = idx
  if (idx === currentObs.value.correct) {
    const dir = currentObs.value.pos === 'left' ? 'right' : 'left'
    feedback.value = '✅ Correct! Steering ' + dir + '!'
    msg.value = 'Nice dodge, Captain! 🎉'
    phase.value = 'dodging'
    shipX.value = currentObs.value.pos === 'left' ? Math.min(85, shipX.value + 15) : Math.max(15, shipX.value - 15)
    fireConfetti(50, 30)
    setTimeout(() => {
      const newScore = score.value + 1
      score.value = newScore
      shipX.value = 50
      if (newScore >= 5) {
        phase.value = 'win'
        msg.value = "5 POINTS! You've mastered IF/ELSE, Captain " + props.initials + '! 🏆'
      } else {
        obstacleIdx.value++
        phase.value = 'sailing'
        msg.value = "Smooth sailing... what's next? (" + newScore + '/5)'
      }
    }, 1500)
  } else {
    feedback.value = '❌ Wrong! That sends us straight into the ' + currentObs.value.name + '!'
    msg.value = 'BRACE FOR IMPACT! 💥'
    phase.value = 'crash'
    crashState.value = 1
    setTimeout(() => { crashState.value = 2 }, 800)
    setTimeout(() => { crashState.value = 3 }, 1600)
    setTimeout(() => {
      crashState.value = 0
      phase.value = 'sailing'
      msg.value = 'Ship repaired! Let\'s try again... (' + score.value + '/5)'
      obstacleIdx.value++
    }, 3500)
  }
}

const obsY = computed(() => phase.value === 'challenge' ? 30 : phase.value === 'dodging' ? -10 : 15)
const obsXPos = computed(() => currentObs.value.pos === 'left' ? 25 : 75)
</script>

<template>
  <div class="level2">
    <!-- Header -->
    <div class="header">
      <div class="header-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="header-right">
        <span class="header-info">Captain <b class="gold">{{ initials }}</b></span>
        <span class="header-sep">|</span>
        <span class="header-info">Level 2: First Sail</span>
      </div>
    </div>

    <!-- Score -->
    <div class="score-bar">
      <span class="score-label">Score:</span>
      <div class="score-track">
        <div class="score-fill" :class="{ won: score >= 5 }" :style="{ width: (score / 5) * 100 + '%' }" />
      </div>
      <span class="score-count">{{ score }}/5</span>
    </div>

    <!-- Captain message -->
    <div class="captain-msg">🧑‍✈️ "{{ msg }}"</div>

    <!-- Ocean view -->
    <div class="ocean-view">
      <Confetti v-for="c in confettiList" :key="c.id" :x="c.x" :y="c.y" :count="35" />

      <!-- Water lines -->
      <svg class="water-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path v-for="y in [20, 40, 60, 80]" :key="y"
          :d="`M0,${y} Q10,${y-2} 20,${y} Q30,${y+2} 40,${y} Q50,${y-2} 60,${y} Q70,${y+2} 80,${y} Q90,${y-2} 100,${y}`"
          fill="none" stroke="#fff" stroke-width=".3" opacity=".2"
        />
      </svg>

      <!-- Obstacle -->
      <div
        v-if="phase !== 'win' && phase !== 'sailing' && crashState === 0"
        class="obstacle"
        :style="{ left: obsXPos + '%', top: obsY + '%' }"
      >
        {{ currentObs.emoji }}
        <div class="obstacle-label">{{ currentObs.name }}</div>
      </div>

      <!-- Crash effects -->
      <div v-if="crashState === 1" class="crash-effect">💥</div>
      <div v-if="crashState === 2" class="crash-effect bubble">
        <div class="crash-emoji">🫧</div>
        <div class="crash-text">CRASH!</div>
      </div>
      <div v-if="crashState === 3" class="crash-effect repair">
        <div class="repair-emoji">🔧</div>
        <div class="repair-text">Repairing...</div>
      </div>

      <!-- Ship or Win trophy -->
      <div v-if="phase === 'win'" class="win-trophy">
        <div class="trophy-emoji">🏆</div>
        <div class="trophy-text">LEVEL COMPLETE!</div>
      </div>
      <div v-else class="ship" :style="{ left: shipX + '%' }">
        <svg viewBox="0 0 60 50" width="80" height="66">
          <polygon points="15,25 45,25 42,40 18,40" fill="#8B4513" stroke="#5C2E00" stroke-width=".8" />
          <text x="30" y="35" text-anchor="middle" font-size="6" fill="#fbbf24" font-weight="bold" font-family="Georgia,serif">{{ initials }}</text>
          <rect x="28" y="8" width="2.5" height="17" fill="#5C2E00" />
          <polygon points="30.5,8 30.5,20 48,17" fill="#fff" stroke="#ddd" stroke-width=".3" />
          <polygon points="30,10 30,18 16,16" fill="#ffe" stroke="#ddd" stroke-width=".3" />
          <text x="30" y="24" text-anchor="middle" font-size="6">🏴‍☠️</text>
        </svg>
      </div>
    </div>

    <!-- Code challenge -->
    <div v-if="phase === 'challenge'" class="challenge-panel">
      <div class="challenge-title">⚠️ {{ currentObs.emoji }} {{ currentObs.name }} ahead! Complete the code:</div>
      <pre class="challenge-code">{{ currentObs.code }}</pre>
      <div class="options">
        <button
          v-for="(opt, i) in currentObs.options" :key="i"
          @click="handleAnswer(i)"
          :disabled="selected !== null"
          class="option-btn"
          :class="{
            correct: selected === i && i === currentObs.correct,
            wrong: selected === i && i !== currentObs.correct,
            'show-correct': selected !== null && i === currentObs.correct && selected !== i,
            dimmed: selected !== null && i !== selected && i !== currentObs.correct,
          }"
        >{{ opt }}</button>
      </div>
      <div v-if="feedback" class="feedback" :class="{ 'fb-correct': selected === currentObs.correct, 'fb-wrong': selected !== currentObs.correct }">{{ feedback }}</div>
    </div>

    <!-- Win state -->
    <div v-if="phase === 'win'" class="win-panel">
      <div class="win-emojis">🎉🏆🎉</div>
      <div class="win-title">IF/ELSE Unlocked!</div>
      <div class="win-sub">Captain {{ initials }}, you navigated 5 obstacles using conditional logic!</div>
      <div class="badges">
        <span class="badge unlocked">✅ Variables</span>
        <span class="badge unlocked">✅ IF/ELSE</span>
        <span class="badge locked">🔒 Loops</span>
      </div>
      <button @click="$emit('admin')" class="leaderboard-btn">🏆 View Leaderboard</button>
    </div>

    <!-- Sailing state -->
    <div v-if="phase === 'sailing' && score < 5" class="sailing-info">
      ⛵ Sailing... next obstacle approaching...
    </div>
  </div>
</template>

<style scoped>
.level2 {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a1628 0%, #0d2137 50%, #0a1628 100%);
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

.score-bar { padding: 8px 16px; display: flex; align-items: center; gap: 8px; }
.score-label { font-size: 11px; color: #888; }
.score-track { flex: 1; height: 8px; background: rgba(255,255,255,.1); border-radius: 4px; overflow: hidden; }
.score-fill { height: 100%; background: #fbbf24; border-radius: 4px; transition: width .5s; }
.score-fill.won { background: #22c55e; }
.score-count { font-size: 13px; font-weight: 700; color: #fbbf24; }

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

.ocean-view {
  margin: 0 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  height: 360px;
  position: relative;
  background: linear-gradient(180deg, #1a5276, #2980b9 40%, #1a6e9e);
}
.water-lines { position: absolute; inset: 0; pointer-events: none; }

.obstacle {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 48px;
  transition: top .8s ease-in;
  z-index: 10;
  text-shadow: 0 4px 12px rgba(0,0,0,.5);
  text-align: center;
}
.obstacle-label {
  font-size: 11px;
  color: #fff;
  text-align: center;
  background: rgba(0,0,0,.5);
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: -4px;
}

.crash-effect { position: absolute; left: 50%; top: 55%; transform: translate(-50%, -50%); font-size: 64px; z-index: 20; }
.crash-effect.bubble { text-align: center; font-size: 48px; }
.crash-text { font-size: 14px; color: #fca5a5; font-weight: 700; }
.crash-emoji { font-size: 48px; }
.crash-effect.repair { top: 60%; text-align: center; }
.repair-emoji { font-size: 32px; }
.repair-text { font-size: 12px; color: #fbbf24; }

.win-trophy { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); text-align: center; z-index: 15; }
.trophy-emoji { font-size: 64px; }
.trophy-text { font-size: 20px; font-weight: 700; color: #fbbf24; font-family: Georgia, serif; text-shadow: 0 2px 8px rgba(0,0,0,.8); margin-top: 8px; }

.ship {
  position: absolute;
  bottom: 8%;
  transform: translateX(-50%);
  transition: left .8s ease, bottom .3s;
  z-index: 15;
  text-align: center;
}

.challenge-panel {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(0,0,0,.4);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
}
.challenge-title { font-size: 13px; font-weight: 600; color: #fbbf24; margin-bottom: 10px; }
.challenge-code {
  background: rgba(0,0,0,.4);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #a5f3fc;
  line-height: 1.8;
  margin: 0 0 12px;
  white-space: pre-wrap;
}
.options { display: flex; gap: 8px; }
.option-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  color: #e2e8f0;
  font-size: 14px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.option-btn::before { display: none; }
.option-btn:disabled { cursor: default; }
.option-btn.correct { border-color: #22c55e; background: rgba(34,197,94,.15); color: #22c55e; }
.option-btn.wrong { border-color: #ef4444; background: rgba(239,68,68,.15); }
.option-btn.show-correct { color: #22c55e; }
.option-btn.dimmed { opacity: .4; }
.feedback { margin-top: 10px; font-size: 13px; font-weight: 600; }
.fb-correct { color: #22c55e; }
.fb-wrong { color: #ef4444; }

.win-panel {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.2);
  border-radius: 10px;
  text-align: center;
}
.win-emojis { font-size: 22px; margin-bottom: 4px; }
.win-title { font-size: 17px; font-weight: 700; color: #22c55e; }
.win-sub { font-size: 13px; color: #888; margin-top: 6px; }
.badges { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-family: monospace;
}
.badge.unlocked { background: rgba(34,197,94,.12); border: 1px solid #22c55e; color: #22c55e; }
.badge.locked { background: rgba(255,255,255,.04); border: 1px solid #444; color: #666; }
.leaderboard-btn {
  margin-top: 16px;
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0a1628;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Georgia, serif;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.leaderboard-btn::before { display: none; }

.sailing-info {
  margin: 12px 16px;
  padding: 12px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  color: #555;
}
</style>
