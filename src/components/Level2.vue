<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { OBSTACLES } from '../data/obstacles.js'
import { shuffle } from '../data/codeBlocks.js'
import Confetti from './Confetti.vue'
import CodeExplainer from './CodeExplainer.vue'
import ConceptCard from './ConceptCard.vue'
import HintButton from './HintButton.vue'
import { useSound } from '../composables/useSound.js'
import { useProgress } from '../composables/useProgress.js'

const props = defineProps({
  initials: { type: String, required: true },
})
const emit = defineEmits(['admin'])

const { click: sClick, correct: sCorrect, wrong: sWrong, badge: sBadge, splash: sSplash, muted, toggleMute } = useSound()
const { xp, rank, xpProgress, floats, awardCorrectDodge, awardFirstTry, awardLevelComplete, spendHint } = useProgress()

const score = ref(0)
const obstacleIdx = ref(0)
const phase = ref('sailing') // sailing, prediction, challenge, dodging, crash, win
const shipX = ref(50)
const selected = ref(null)
const feedback = ref('')
const explanation = ref('')
const obstacles = ref(shuffle([...OBSTACLES]).slice(0, 5))
const crashState = ref(0)
const confettiList = ref([])
const msg = ref('Smooth sailing, Captain ' + props.initials + '! Keep your eyes on the horizon...')
const showConceptCard = ref(false)
const streak = ref(0)
const bestStreak = ref(0)
const firstTryTracker = ref({})
const predictionAnswer = ref(null)
let confettiId = 0
let timerRef = null

const currentObs = computed(() => obstacles.value[obstacleIdx.value % obstacles.value.length])

function fireConfetti(cx, cy, variant = 'confetti') {
  const id = ++confettiId
  confettiList.value.push({ id, x: cx, y: cy, variant })
  setTimeout(() => { confettiList.value = confettiList.value.filter(c => c.id !== id) }, 2500)
}

// Auto-trigger next obstacle
watch([phase, score, obstacleIdx], () => {
  clearTimeout(timerRef)
  if (phase.value === 'sailing' && score.value < 5) {
    timerRef = setTimeout(() => {
      // Show prediction step if obstacle has prediction data
      if (currentObs.value.prediction) {
        phase.value = 'prediction'
        msg.value = 'Before we code, let\'s think...'
        predictionAnswer.value = null
      } else {
        phase.value = 'challenge'
        msg.value = currentObs.value.prompt
        selected.value = null
        feedback.value = ''
        explanation.value = ''
      }
    }, 2000)
  }
}, { immediate: true })

onBeforeUnmount(() => clearTimeout(timerRef))

function handlePrediction(answer) {
  predictionAnswer.value = answer
  sClick()
  setTimeout(() => {
    phase.value = 'challenge'
    msg.value = currentObs.value.prompt
    selected.value = null
    feedback.value = ''
    explanation.value = ''
  }, 1500)
}

function handleAnswer(idx) {
  if (selected.value !== null) return
  selected.value = idx
  sClick()

  const obsKey = obstacleIdx.value
  if (idx === currentObs.value.correct) {
    feedback.value = '✅ Correct!'
    explanation.value = currentObs.value.explanation || ''
    msg.value = 'Nice coding, Captain! 🎉'
    phase.value = 'dodging'
    sCorrect()
    awardCorrectDodge()

    // Streak
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value

    // First-try bonus
    if (!firstTryTracker.value[obsKey]) {
      firstTryTracker.value[obsKey] = true
      awardFirstTry()
      fireConfetti(50, 30, 'sparkle')
    } else {
      fireConfetti(50, 30)
    }

    // Streak bonus
    if (streak.value >= 3) {
      fireConfetti(30, 20, 'golden-burst')
    }

    shipX.value = currentObs.value.pos === 'left' ? Math.min(85, shipX.value + 15) : Math.max(15, shipX.value - 15)

    setTimeout(() => {
      const newScore = score.value + 1
      score.value = newScore
      shipX.value = 50
      explanation.value = ''
      if (newScore >= 5) {
        phase.value = 'win'
        msg.value = "5 POINTS! You've mastered IF/ELSE, Captain " + props.initials + '! 🏆'
        sBadge()
        awardLevelComplete()
        fireConfetti(25, 30, 'golden-burst')
        fireConfetti(50, 20, 'golden-burst')
        fireConfetti(75, 30, 'golden-burst')
        setTimeout(() => { showConceptCard.value = true }, 1500)
      } else {
        obstacleIdx.value++
        phase.value = 'sailing'
        msg.value = "Smooth sailing... what's next? (" + newScore + '/5)'
      }
    }, 2500)
  } else {
    const wrongExp = currentObs.value.wrongExplanations && currentObs.value.wrongExplanations[idx]
    feedback.value = '❌ ' + (wrongExp || 'Not quite!')
    explanation.value = currentObs.value.explanation || ''
    msg.value = 'BRACE FOR IMPACT! 💥'
    phase.value = 'crash'
    sWrong()
    streak.value = 0
    firstTryTracker.value[obsKey] = 'attempted'
    crashState.value = 1
    setTimeout(() => { crashState.value = 2 }, 800)
    setTimeout(() => { crashState.value = 3 }, 1600)
    setTimeout(() => {
      crashState.value = 0
      explanation.value = ''
      phase.value = 'sailing'
      msg.value = 'Ship repaired! Let\'s try again... (' + score.value + '/5)'
      obstacleIdx.value++
    }, 4500)
  }
}

function handleHint() {
  spendHint()
  sClick()
}

function highlightCode(code) {
  const keywords = ['let', 'if', 'else', 'true', 'false']
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Highlight the blank
  escaped = escaped.replace(/___/g, '<span class="code-blank">___</span>')
  // Highlight strings
  escaped = escaped.replace(/(&quot;|")(.*?)(\1)/g, '<span class="code-string">"$2"</span>')
  // Highlight keywords
  keywords.forEach(kw => {
    escaped = escaped.replace(new RegExp('\\b' + kw + '\\b', 'g'), '<span class="code-keyword">' + kw + '</span>')
  })
  // Highlight numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
  return escaped
}

const obsY = computed(() => phase.value === 'challenge' || phase.value === 'prediction' ? 30 : phase.value === 'dodging' ? -10 : 15)
const obsXPos = computed(() => currentObs.value.pos === 'left' ? 25 : 75)
</script>

<template>
  <div class="level2">
    <!-- ConceptCard overlay -->
    <ConceptCard v-if="showConceptCard" :level="2" :initials="initials" @dismiss="showConceptCard = false" />

    <!-- Header -->
    <div class="header">
      <div class="header-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="header-right">
        <span class="rank-badge">{{ rank.emoji }} {{ rank.title }}</span>
        <button class="mute-btn" @click="toggleMute" :title="muted ? 'Unmute' : 'Mute'">{{ muted ? '🔇' : '🔊' }}</button>
        <span class="header-info">Captain <b class="gold">{{ initials }}</b></span>
        <span class="header-sep">|</span>
        <span class="header-info">Level 2: First Sail</span>
      </div>
    </div>

    <!-- XP Bar -->
    <div class="xp-bar">
      <span class="xp-label">XP:</span>
      <div class="xp-track">
        <div class="xp-fill" :style="{ width: xpProgress + '%' }" />
      </div>
      <span class="xp-count">{{ xp }} XP</span>
      <span v-if="streak >= 2" class="streak-badge">🔥 {{ streak }} streak!</span>
    </div>

    <!-- XP Floats -->
    <div class="xp-floats">
      <div v-for="f in floats" :key="f.id" class="xp-float">{{ f.label }}</div>
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
    <div class="ocean-view" :class="{ 'streak-glow': streak >= 3 }">
      <Confetti v-for="c in confettiList" :key="c.id" :x="c.x" :y="c.y" :count="35" :variant="c.variant || 'confetti'" />

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
        <img v-if="currentObs.name === 'Rock'" src="/images/pirate-kit/rocks-a.png" alt="Rock" class="obstacle-img" />
        <img v-else-if="currentObs.name === 'Enemy Ship'" src="/images/pirate-kit/ship-ghost.png" alt="Ghost Ship" class="obstacle-img obstacle-img-ship" />
        <span v-else class="obstacle-emoji">{{ currentObs.emoji }}</span>
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

    <!-- Prediction step -->
    <div v-if="phase === 'prediction'" class="prediction-panel">
      <div class="prediction-title">🤔 Think first!</div>
      <div class="prediction-question">{{ currentObs.prediction.question }}</div>
      <div class="prediction-visual">{{ currentObs.prediction.visual }}</div>
      <div class="prediction-actions">
        <button class="prediction-btn" @click="handlePrediction('yes')">
          {{ predictionAnswer === 'yes' ? '✅ ' : '' }}I think so!
        </button>
        <button class="prediction-btn" @click="handlePrediction('no')">
          {{ predictionAnswer === 'no' ? '✅ ' : '' }}Not sure...
        </button>
      </div>
      <div v-if="predictionAnswer" class="prediction-feedback">
        Great thinking! Now let's write the code...
      </div>
    </div>

    <!-- Code Explainer -->
    <CodeExplainer
      v-if="phase === 'challenge' || phase === 'dodging' || phase === 'crash'"
      :parts="currentObs.codeBreakdown || []"
      :visible="true"
    />

    <!-- Hint Button -->
    <HintButton
      v-if="phase === 'challenge' && selected === null"
      :hints="currentObs.hints || []"
      :xp="xp"
      @use-hint="handleHint"
    />

    <!-- Code challenge -->
    <div v-if="phase === 'challenge'" class="challenge-panel">
      <div class="challenge-title">⚠️ {{ currentObs.emoji }} {{ currentObs.name }} ahead! Complete the code:</div>
      <pre class="challenge-code" v-html="highlightCode(currentObs.code)"></pre>
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
      <div v-if="explanation" class="explanation">{{ explanation }}</div>
    </div>

    <!-- Win state -->
    <div v-if="phase === 'win' && !showConceptCard" class="win-panel">
      <div class="win-emojis">🎉🏆🎉</div>
      <div class="win-title">IF/ELSE Unlocked!</div>
      <div class="win-sub">Captain {{ initials }}, you navigated {{ score }} obstacles using conditional logic!</div>
      <div v-if="bestStreak >= 3" class="win-streak">🔥 Best streak: {{ bestStreak }} in a row!</div>
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

.streak-badge {
  font-size: 11px;
  background: rgba(239,68,68,.15);
  border: 1px solid rgba(239,68,68,.3);
  border-radius: 4px;
  padding: 2px 8px;
  color: #f87171;
  font-weight: 600;
  animation: streakPulse 1s ease-in-out infinite;
}
@keyframes streakPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .7; }
}

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

.score-bar { padding: 4px 16px; display: flex; align-items: center; gap: 8px; }
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
  height: 280px;
  position: relative;
  background: linear-gradient(180deg, #1a5276, #2980b9 40%, #1a6e9e);
  transition: box-shadow .3s;
}
.ocean-view.streak-glow {
  box-shadow: 0 0 20px rgba(251,191,36,.3), inset 0 0 20px rgba(251,191,36,.05);
  border-color: rgba(251,191,36,.3);
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
.obstacle-emoji { font-size: 48px; }
.obstacle-img { width: 72px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.5)); }
.obstacle-img-ship { width: 88px; }

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

/* Prediction step */
.prediction-panel {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(168,85,247,.08);
  border: 1px solid rgba(168,85,247,.2);
  border-radius: 10px;
  text-align: center;
  animation: panelIn .3s ease;
}
.prediction-title { font-size: 15px; font-weight: 700; color: #a855f7; margin-bottom: 8px; }
.prediction-question { font-size: 14px; color: #e2e8f0; margin-bottom: 8px; }
.prediction-visual {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #a5f3fc;
  background: rgba(0,0,0,.3);
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.prediction-actions { display: flex; gap: 8px; justify-content: center; }
.prediction-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(168,85,247,.3);
  background: rgba(168,85,247,.1);
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all .2s;
}
.prediction-btn:hover { background: rgba(168,85,247,.2); }
.prediction-feedback {
  margin-top: 10px;
  font-size: 12px;
  color: #a855f7;
  font-style: italic;
  animation: panelIn .3s ease;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
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
.challenge-code :deep(.code-blank) {
  background: rgba(251,191,36,.25);
  color: #fbbf24;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px dashed #fbbf24;
  font-weight: 700;
}
.challenge-code :deep(.code-keyword) { color: #c084fc; }
.challenge-code :deep(.code-string) { color: #86efac; }
.challenge-code :deep(.code-number) { color: #fdba74; }
.options { display: flex; gap: 8px; flex-wrap: wrap; }
.option-btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 8px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  color: #e2e8f0;
  font-size: 13px;
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
.feedback { margin-top: 10px; font-size: 13px; font-weight: 600; line-height: 1.5; }
.fb-correct { color: #22c55e; }
.fb-wrong { color: #ef4444; }
.explanation {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(251,191,36,.08);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 6px;
  font-size: 12px;
  color: #fbbf24;
  line-height: 1.5;
  font-style: italic;
}

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
.win-streak { font-size: 13px; color: #f87171; margin-top: 6px; font-weight: 600; }
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

/* Pirate kit asset styles */
.ocean-deco { position: absolute; pointer-events: none; z-index: 1; }
.ocean-rocks-left { left: 2%; bottom: 4%; width: 60px; opacity: .35; filter: drop-shadow(0 2px 6px rgba(0,0,0,.4)); }
.ocean-rocks-right { right: 2%; bottom: 6%; width: 50px; opacity: .3; filter: drop-shadow(0 2px 6px rgba(0,0,0,.4)); }
.ocean-palm { left: -8px; top: 0; width: 80px; opacity: .2; filter: drop-shadow(0 2px 8px rgba(0,0,0,.3)); }

.crash-wreck { width: 80px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.6)); }

.trophy-chest { width: 80px; filter: drop-shadow(0 6px 20px rgba(251,191,36,.4)); animation: chestBounce 1s ease-in-out infinite; }
@keyframes chestBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.ship-img-wrap { position: relative; display: inline-block; }
.ship-img { width: 80px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.5)); }
.ship-initials {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
  letter-spacing: 1px;
}
</style>
