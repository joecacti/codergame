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
    feedback.value = '\u2705 Correct!'
    explanation.value = currentObs.value.explanation || ''
    msg.value = 'Nice coding, Captain! \u{1F389}'
    phase.value = 'dodging'
    sCorrect()
    awardCorrectDodge()

    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value

    if (!firstTryTracker.value[obsKey]) {
      firstTryTracker.value[obsKey] = true
      awardFirstTry()
      fireConfetti(50, 30, 'sparkle')
    } else {
      fireConfetti(50, 30)
    }

    if (streak.value >= 3) fireConfetti(30, 20, 'golden-burst')

    shipX.value = currentObs.value.pos === 'left' ? Math.min(85, shipX.value + 15) : Math.max(15, shipX.value - 15)

    setTimeout(() => {
      const newScore = score.value + 1
      score.value = newScore
      shipX.value = 50
      explanation.value = ''
      if (newScore >= 5) {
        phase.value = 'win'
        msg.value = "5 POINTS! You've mastered IF/ELSE, Captain " + props.initials + '! \u{1F3C6}'
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
    feedback.value = '\u274C ' + (wrongExp || 'Not quite!')
    explanation.value = currentObs.value.explanation || ''
    msg.value = 'BRACE FOR IMPACT! \u{1F4A5}'
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
  escaped = escaped.replace(/___/g, '<span class="code-blank">___</span>')
  escaped = escaped.replace(/(&quot;|")(.*?)(\1)/g, '<span class="code-string">"$2"</span>')
  keywords.forEach(kw => {
    escaped = escaped.replace(new RegExp('\\b' + kw + '\\b', 'g'), '<span class="code-keyword">' + kw + '</span>')
  })
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
  return escaped
}

const obsY = computed(() => phase.value === 'challenge' || phase.value === 'prediction' ? 30 : phase.value === 'dodging' ? -10 : 15)
const obsXPos = computed(() => currentObs.value.pos === 'left' ? 25 : 75)

// Map obstacle names to pirate kit images where possible
const obstacleImage = computed(() => {
  const name = currentObs.value.name
  if (name === 'Rock') return '/images/pirate-kit/rocks-a.png'
  if (name === 'Enemy Ship') return '/images/pirate-kit/ship-ghost.png'
  return null
})

// Phase label for the status indicator
const phaseLabel = computed(() => {
  if (phase.value === 'sailing') return 'Sailing...'
  if (phase.value === 'prediction') return 'Think First'
  if (phase.value === 'challenge') return 'Write Code'
  if (phase.value === 'dodging') return 'Dodging!'
  if (phase.value === 'crash') return 'Crash!'
  if (phase.value === 'win') return 'Victory!'
  return ''
})
</script>

<template>
  <div class="level2">
    <!-- ConceptCard overlay -->
    <ConceptCard v-if="showConceptCard" :level="2" :initials="initials" @dismiss="showConceptCard = false" />

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <img src="/images/pirate-kit/flag-pirate.png" alt="" class="header-flag" />
        <div class="header-title">Pirates of the Coderbbean</div>
      </div>
      <div class="header-right">
        <span class="rank-badge">{{ rank.emoji }} {{ rank.title }}</span>
        <button class="mute-btn" @click="toggleMute" :title="muted ? 'Unmute' : 'Mute'">{{ muted ? '\u{1F507}' : '\u{1F50A}' }}</button>
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
      <span v-if="streak >= 2" class="streak-badge">&#x1F525; {{ streak }} streak!</span>
    </div>

    <!-- XP Floats -->
    <div class="xp-floats">
      <div v-for="f in floats" :key="f.id" class="xp-float">{{ f.label }}</div>
    </div>

    <!-- Obstacle progress dots -->
    <div class="obstacle-progress">
      <div class="progress-dots">
        <span
          v-for="i in 5" :key="i"
          class="dot"
          :class="{
            done: i <= score,
            active: i === score + 1 && phase !== 'win',
            future: i > score + 1,
          }"
        >
          <template v-if="i <= score">&#x2713;</template>
          <template v-else>{{ i }}</template>
        </span>
      </div>
      <span class="score-text">{{ score }}/5 obstacles cleared</span>
    </div>

    <!-- Captain message -->
    <div class="captain-msg">
      <img src="/images/pirate-kit/bottle.png" alt="" class="msg-bottle" />
      <span>{{ msg }}</span>
    </div>

    <!-- Main game area: side-by-side layout -->
    <div class="game-layout">
      <!-- Ocean view (left) -->
      <div class="ocean-view" :class="{ 'streak-glow': streak >= 3 }">
        <Confetti v-for="c in confettiList" :key="c.id" :x="c.x" :y="c.y" :count="35" :variant="c.variant || 'confetti'" />

        <!-- Phase indicator -->
        <div class="phase-badge" :class="'phase-' + phase">{{ phaseLabel }}</div>

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
          <img v-if="obstacleImage" :src="obstacleImage" :alt="currentObs.name" class="obstacle-img" :class="{ 'obstacle-img-ship': currentObs.name === 'Enemy Ship' }" />
          <span v-else class="obstacle-emoji">{{ currentObs.emoji }}</span>
          <div class="obstacle-label">{{ currentObs.name }}</div>
        </div>

        <!-- Crash effects -->
        <div v-if="crashState === 1" class="crash-effect crash-boom">&#x1F4A5;</div>
        <div v-if="crashState === 2" class="crash-effect crash-wreck-state">
          <img src="/images/pirate-kit/ship-wreck.png" alt="Wrecked ship" class="crash-wreck-img" />
          <div class="crash-text">CRASH!</div>
        </div>
        <div v-if="crashState === 3" class="crash-effect crash-repair">
          <div class="repair-emoji">&#x1F527;</div>
          <div class="repair-text">Repairing...</div>
        </div>

        <!-- Ship or Win scene -->
        <div v-if="phase === 'win'" class="win-trophy">
          <img src="/images/pirate-kit/chest.png" alt="Treasure" class="trophy-chest" />
          <div class="trophy-text">LEVEL COMPLETE!</div>
        </div>
        <div v-else class="ship" :style="{ left: shipX + '%' }" :class="{ 'ship-sailing': phase === 'sailing' }">
          <div class="ship-wrap">
            <img src="/images/pirate-kit/ship-pirate-small.png" alt="Your ship" class="ship-img" />
            <span class="ship-initials">{{ initials }}</span>
          </div>
        </div>
      </div>

      <!-- Right panel: changes based on phase -->
      <div class="side-panel">
        <!-- Sailing: show what's coming -->
        <div v-if="phase === 'sailing' && score < 5" class="panel-sailing">
          <img src="/images/pirate-kit/ship-pirate-large.png" alt="" class="sailing-ship-img" />
          <div class="sailing-title">Sailing ahead...</div>
          <div class="sailing-sub">Next obstacle approaching</div>
          <div class="sailing-dots">
            <span class="sailing-dot" /><span class="sailing-dot" /><span class="sailing-dot" />
          </div>
        </div>

        <!-- Prediction step -->
        <div v-if="phase === 'prediction'" class="panel-prediction">
          <div class="panel-header prediction-header">&#x1F914; Think First</div>
          <div class="prediction-question">{{ currentObs.prediction.question }}</div>
          <div class="prediction-visual">{{ currentObs.prediction.visual }}</div>
          <div class="prediction-actions">
            <button class="prediction-btn" @click="handlePrediction('yes')">
              {{ predictionAnswer === 'yes' ? '\u2705 ' : '' }}I think so!
            </button>
            <button class="prediction-btn" @click="handlePrediction('no')">
              {{ predictionAnswer === 'no' ? '\u2705 ' : '' }}Not sure...
            </button>
          </div>
          <div v-if="predictionAnswer" class="prediction-feedback">
            Great thinking! Now let's write the code...
          </div>
        </div>

        <!-- Code challenge -->
        <div v-if="phase === 'challenge'" class="panel-challenge">
          <div class="panel-header challenge-header">&#x26A0;&#xFE0F; {{ currentObs.name }} ahead!</div>
          <div class="challenge-prompt">{{ currentObs.prompt }}</div>
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

          <!-- Hint Button -->
          <HintButton
            v-if="selected === null"
            :hints="currentObs.hints || []"
            :xp="xp"
            @use-hint="handleHint"
          />
        </div>

        <!-- Dodging result -->
        <div v-if="phase === 'dodging'" class="panel-dodging">
          <div class="panel-header dodge-header">&#x2705; Dodged!</div>
          <div v-if="feedback" class="feedback fb-correct">{{ feedback }}</div>
          <div v-if="explanation" class="explanation">{{ explanation }}</div>
          <CodeExplainer
            :parts="currentObs.codeBreakdown || []"
            :visible="true"
          />
        </div>

        <!-- Crash result -->
        <div v-if="phase === 'crash'" class="panel-crash">
          <div class="panel-header crash-header">&#x1F4A5; Hit!</div>
          <div v-if="feedback" class="feedback fb-wrong">{{ feedback }}</div>
          <div v-if="explanation" class="explanation">{{ explanation }}</div>
          <CodeExplainer
            :parts="currentObs.codeBreakdown || []"
            :visible="true"
          />
        </div>

        <!-- Win state -->
        <div v-if="phase === 'win' && !showConceptCard" class="panel-win">
          <div class="win-emojis">&#x1F389;&#x1F3C6;&#x1F389;</div>
          <div class="win-title">IF/ELSE Unlocked!</div>
          <div class="win-sub">Captain {{ initials }}, you navigated {{ score }} obstacles using conditional logic!</div>
          <div v-if="bestStreak >= 3" class="win-streak">&#x1F525; Best streak: {{ bestStreak }} in a row!</div>
          <div class="badges">
            <span class="badge unlocked">&#x2705; Variables</span>
            <span class="badge unlocked">&#x2705; IF/ELSE</span>
            <span class="badge locked">&#x1F512; Loops</span>
          </div>
          <button @click="$emit('admin')" class="leaderboard-btn">
            <img src="/images/pirate-kit/chest.png" alt="" class="btn-chest" /> View Leaderboard
          </button>
        </div>
      </div>
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

/* Header */
.header {
  background: rgba(0,0,0,.3);
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-flag { width: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.4)); }
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

/* XP */
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

/* Obstacle progress dots */
.obstacle-progress {
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-dots { display: flex; gap: 6px; }
.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all .3s;
}
.dot.done {
  background: rgba(34,197,94,.2);
  border: 2px solid #22c55e;
  color: #22c55e;
}
.dot.active {
  background: rgba(251,191,36,.15);
  border: 2px solid #fbbf24;
  color: #fbbf24;
  animation: dotPulse 1.5s ease-in-out infinite;
}
.dot.future {
  background: rgba(255,255,255,.04);
  border: 2px solid rgba(255,255,255,.15);
  color: #555;
}
@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.3); }
  50% { box-shadow: 0 0 0 4px rgba(251,191,36,0); }
}
.score-text { font-size: 12px; color: #888; }

/* Captain message */
.captain-msg {
  margin: 0 16px 8px;
  padding: 10px 14px;
  background: rgba(251,191,36,.1);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 8px;
  font-size: 13px;
  color: #fbbf24;
  font-family: Georgia, serif;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 10px;
}
.msg-bottle { width: 28px; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }

/* Main game layout */
.game-layout {
  display: flex;
  gap: 0;
  margin: 0 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  min-height: 400px;
}

/* Ocean view */
.ocean-view {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, #1a5276, #2980b9 40%, #1a6e9e);
  transition: box-shadow .3s;
  min-width: 0;
}
.ocean-view.streak-glow {
  box-shadow: inset 0 0 20px rgba(251,191,36,.1);
}
.water-lines { position: absolute; inset: 0; pointer-events: none; }

/* Phase badge */
.phase-badge {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 12px;
  border-radius: 10px;
  z-index: 20;
  pointer-events: none;
}
.phase-sailing { background: rgba(255,255,255,.15); color: rgba(255,255,255,.7); }
.phase-prediction { background: rgba(168,85,247,.3); color: #d8b4fe; }
.phase-challenge { background: rgba(251,191,36,.3); color: #fbbf24; }
.phase-dodging { background: rgba(34,197,94,.3); color: #86efac; }
.phase-crash { background: rgba(239,68,68,.3); color: #fca5a5; }
.phase-win { background: rgba(251,191,36,.4); color: #fbbf24; }

/* Obstacle */
.obstacle {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: top .8s ease-in;
  z-index: 10;
  text-align: center;
}
.obstacle-emoji {
  font-size: 48px;
  text-shadow: 0 4px 12px rgba(0,0,0,.5);
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
.obstacle-img { width: 72px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.5)); }
.obstacle-img-ship { width: 88px; }

/* Crash effects */
.crash-effect {
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%, -50%);
  z-index: 20;
  text-align: center;
}
.crash-boom { font-size: 64px; }
.crash-wreck-state { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.crash-wreck-img { width: 80px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.6)); }
.crash-text { font-size: 14px; color: #fca5a5; font-weight: 700; }
.crash-repair { top: 60%; text-align: center; }
.repair-emoji { font-size: 32px; }
.repair-text { font-size: 12px; color: #fbbf24; }

/* Win trophy in ocean */
.win-trophy {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 15;
}
.trophy-chest {
  width: 80px;
  filter: drop-shadow(0 6px 20px rgba(251,191,36,.4));
  animation: chestBounce 1s ease-in-out infinite;
}
@keyframes chestBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.trophy-text {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  text-shadow: 0 2px 8px rgba(0,0,0,.8);
  margin-top: 8px;
}

/* Ship */
.ship {
  position: absolute;
  bottom: 8%;
  transform: translateX(-50%);
  transition: left .8s ease, bottom .3s;
  z-index: 15;
  text-align: center;
}
.ship-sailing { animation: shipBob 2s ease-in-out infinite; }
@keyframes shipBob {
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(-1deg); }
  50% { transform: translateX(-50%) translateY(-4px) rotate(1deg); }
}
.ship-wrap { position: relative; display: inline-block; }
.ship-img {
  width: 80px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,.5));
}
.ship-initials {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
  letter-spacing: 1px;
}

/* Side panel */
.side-panel {
  width: 320px;
  background: rgba(0,0,0,.35);
  border-left: 1px solid rgba(255,255,255,.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.prediction-header { color: #a855f7; background: rgba(168,85,247,.06); }
.challenge-header { color: #fbbf24; background: rgba(251,191,36,.06); }
.dodge-header { color: #22c55e; background: rgba(34,197,94,.06); }
.crash-header { color: #ef4444; background: rgba(239,68,68,.06); }

/* Sailing state */
.panel-sailing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  gap: 8px;
}
.sailing-ship-img {
  width: 100px;
  opacity: .3;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.3));
  animation: shipBob 3s ease-in-out infinite;
}
.sailing-title { font-size: 14px; color: #888; font-weight: 600; }
.sailing-sub { font-size: 12px; color: #555; }
.sailing-dots { display: flex; gap: 6px; margin-top: 8px; }
.sailing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  animation: sailingPulse 1.4s ease-in-out infinite;
}
.sailing-dot:nth-child(2) { animation-delay: .2s; }
.sailing-dot:nth-child(3) { animation-delay: .4s; }
@keyframes sailingPulse {
  0%, 100% { opacity: .2; }
  50% { opacity: .8; }
}

/* Prediction panel */
.panel-prediction {
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: panelIn .3s ease;
}
.prediction-question {
  padding: 12px 16px 8px;
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.5;
}
.prediction-visual {
  margin: 0 16px 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #a5f3fc;
  background: rgba(0,0,0,.3);
  padding: 6px 14px;
  border-radius: 6px;
}
.prediction-actions { display: flex; gap: 8px; padding: 0 16px; }
.prediction-btn {
  flex: 1;
  padding: 8px 12px;
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
  padding: 10px 16px;
  font-size: 12px;
  color: #a855f7;
  font-style: italic;
  animation: panelIn .3s ease;
}

/* Challenge panel */
.panel-challenge {
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: panelIn .3s ease;
}
.challenge-prompt {
  padding: 10px 16px;
  font-size: 13px;
  color: #ccc;
  line-height: 1.4;
}
.challenge-code {
  margin: 0 16px 12px;
  background: rgba(0,0,0,.4);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #a5f3fc;
  line-height: 1.8;
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

.options { display: flex; flex-direction: column; gap: 6px; padding: 0 16px; }
.option-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  color: #e2e8f0;
  font-size: 13px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  text-align: left;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.option-btn::before { display: none; }
.option-btn:hover:not(:disabled) { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); }
.option-btn:disabled { cursor: default; }
.option-btn.correct { border-color: #22c55e; background: rgba(34,197,94,.15); color: #22c55e; }
.option-btn.wrong { border-color: #ef4444; background: rgba(239,68,68,.15); }
.option-btn.show-correct { color: #22c55e; border-color: rgba(34,197,94,.3); }
.option-btn.dimmed { opacity: .4; }

.feedback { padding: 8px 16px; font-size: 13px; font-weight: 600; line-height: 1.5; }
.fb-correct { color: #22c55e; }
.fb-wrong { color: #ef4444; }
.explanation {
  margin: 4px 16px 8px;
  padding: 10px 12px;
  background: rgba(251,191,36,.08);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 6px;
  font-size: 12px;
  color: #fbbf24;
  line-height: 1.5;
  font-style: italic;
}

/* Dodging / crash result panels */
.panel-dodging, .panel-crash {
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: panelIn .3s ease;
}

/* Win panel */
.panel-win {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  animation: panelIn .3s ease;
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
  padding: 10px 24px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}
.leaderboard-btn::before { display: none; }
.btn-chest { width: 24px; }

@keyframes panelIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
