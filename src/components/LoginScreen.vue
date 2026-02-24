<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSound } from '../composables/useSound.js'
import { useProgress } from '../composables/useProgress.js'

const emit = defineEmits(['login', 'admin'])

const { click: sClick, launch: sLaunch, startMusic, voiceIntro } = useSound()

onMounted(() => { startMusic('login') })

let introPlayed = false
function playIntroOnce() {
  if (introPlayed) return
  introPlayed = true
  startMusic('login')
  voiceIntro()
}
const { xp, rank } = useProgress()

const hasProgress = computed(() => xp.value > 0)

const initialsInput = ref(null)
const val = ref('')
const err = ref('')

function focusInput() {
  initialsInput.value?.focus()
}

function handleInput(e) {
  val.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  err.value = ''
}

function handleLogin() {
  if (val.value.length < 2) {
    err.value = 'Need at least 2 letters!'
    return
  }
  sLaunch()
  emit('login', val.value)
}
</script>

<template>
  <div class="login-screen" @click="playIntroOnce" @touchstart.passive="playIntroOnce">
    <!-- Decorative background assets -->
    <img src="/images/pirate-kit/palm-bend.png" alt="" class="deco deco-palm-left" />
    <img src="/images/pirate-kit/palm-bend.png" alt="" class="deco deco-palm-right" />
    <img src="/images/pirate-kit/barrel.png" alt="" class="deco deco-barrel" />
    <img src="/images/pirate-kit/crate-bottles.png" alt="" class="deco deco-crate" />

    <!-- Hero ship image -->
    <img src="/images/pirate-kit/ship-pirate-large.png" alt="Pirate Ship" class="login-hero-ship" />

    <div class="login-card">
      <img src="/images/pirate-kit/flag-pirate.png" alt="" class="login-flag" />
      <div class="login-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="login-subtitle">The First Byte</div>
      <div class="login-label">Enter your initials, Captain:</div>
      <input
        ref="initialsInput"
        type="text"
        inputmode="text"
        autocapitalize="characters"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :value="val"
        @input="handleInput"
        @touchend.prevent="focusInput"
        placeholder="e.g. AJ"
        maxlength="3"
        class="login-input"
        :class="{ 'input-error': err }"
      />
      <div v-if="err" class="error-text">{{ err }}</div>
      <div class="input-hint">2–3 letters. These will appear on your ship!</div>
      <div v-if="hasProgress" class="returning-rank">
        Welcome back! {{ rank.emoji }} {{ rank.title }} — {{ xp }} XP
      </div>
      <button
        @click="handleLogin"
        @touchend.prevent="handleLogin"
        class="sail-btn"
        :class="{ active: val.length >= 2 }"
      >⛵ Set Sail!</button>
      <div class="admin-divider">
        <button @click="$emit('admin')" class="admin-btn">🔑 Admin Login</button>
      </div>
    </div>

    <div v-if="val.length >= 2" class="ship-preview">
      <div class="preview-label">Your ship preview:</div>
      <div class="preview-ship-wrap">
        <img src="/images/pirate-kit/ship-pirate-medium.png" alt="Your ship" class="preview-ship-img" />
        <div class="preview-initials">{{ val }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url('/images/pirates_coderibbean_loading_screen.png') center center / cover no-repeat, #0a1628;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
}

/* Decorative background assets */
.deco {
  position: absolute;
  pointer-events: none;
  opacity: .25;
  filter: drop-shadow(0 0 12px rgba(0,0,0,.5));
  z-index: 0;
}
.deco-palm-left { left: -20px; bottom: 0; width: 140px; transform: scaleX(1); }
.deco-palm-right { right: -20px; bottom: 0; width: 140px; transform: scaleX(-1); }
.deco-barrel { left: 8%; bottom: 10%; width: 60px; opacity: .15; }
.deco-crate { right: 8%; bottom: 8%; width: 70px; opacity: .15; }

.login-hero-ship {
  width: 180px;
  margin-bottom: -20px;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,.6));
  z-index: 1;
  animation: shipBob 3s ease-in-out infinite;
}
@keyframes shipBob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

.login-card {
  position: relative;
  background: rgba(10, 22, 40, .85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 16px;
  padding: 36px 40px;
  text-align: center;
  width: 340px;
  z-index: 1;
}
.login-flag {
  position: absolute;
  top: -28px;
  right: -24px;
  width: 56px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.5));
  pointer-events: none;
}
.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  margin-bottom: 4px;
}
.login-subtitle { font-size: 13px; color: #888; margin-bottom: 28px; }
.login-label { font-size: 13px; color: #ccc; margin-bottom: 10px; text-align: left; }
.login-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 8px;
  font-family: Georgia, serif;
  outline: none;
  box-sizing: border-box;
  /* Ensure touch/keyboard works on iPad/tablets */
  -webkit-user-select: text;
  user-select: text;
  touch-action: manipulation;
  -webkit-appearance: none;
  appearance: none;
}
.login-input.input-error { border-color: #ef4444; }
.error-text { color: #ef4444; font-size: 12px; margin-top: 6px; }
.input-hint { font-size: 11px; color: #666; margin-top: 6px; }
.returning-rank {
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(251,191,36,.08);
  border: 1px solid rgba(251,191,36,.15);
  border-radius: 6px;
  font-size: 12px;
  color: #fbbf24;
}
.sail-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,.08);
  color: #555;
  font-size: 16px;
  font-weight: 700;
  cursor: default;
  font-family: Georgia, serif;
  transition: all .3s;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.sail-btn::before { display: none; }
.sail-btn.active {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0a1628;
  cursor: pointer;
}
.admin-divider {
  border-top: 1px solid rgba(255,255,255,.08);
  margin-top: 24px;
  padding-top: 16px;
}
.admin-btn {
  background: none;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 6px;
  padding: 8px 16px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  box-shadow: none;
  text-transform: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: normal;
}
.admin-btn::before { display: none; }
.ship-preview { margin-top: 20px; text-align: center; z-index: 1; }
.preview-label { font-size: 11px; color: #888; margin-bottom: 6px; }
.preview-ship-wrap {
  position: relative;
  display: inline-block;
}
.preview-ship-img {
  width: 120px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,.5));
  animation: shipBob 3s ease-in-out infinite;
}
.preview-initials {
  position: absolute;
  bottom: 32%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  text-shadow: 0 1px 3px rgba(0,0,0,.8);
  letter-spacing: 2px;
}

/* iPad / tablet */
@media (max-width: 1024px) {
  .login-card { width: min(340px, 85vw); padding: 28px 24px; }
  .login-hero-ship { width: 140px; }
  .login-title { font-size: 24px; }
  .deco-palm-left, .deco-palm-right { width: 100px; }
}
</style>
