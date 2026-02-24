<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initials: { type: String, required: true },
})
const emit = defineEmits(['back'])

const revealed = ref(false)

onMounted(() => {
  setTimeout(() => { revealed.value = true }, 500)
})
</script>

<template>
  <div class="gary-island">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <img src="/images/pirate-kit/flag-pirate.png" alt="" class="header-flag" />
        <div class="header-title">Pirates of the Coderbbean</div>
      </div>
      <div class="header-right">
        <span class="header-info">Captain <b class="gold">{{ initials }}</b></span>
        <span class="header-sep">|</span>
        <span class="header-info">The Island of Gary</span>
      </div>
    </div>

    <!-- Island scene -->
    <div class="island-scene" :class="{ revealed }">
      <!-- Sky -->
      <div class="sky">
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>
      </div>

      <!-- Water -->
      <div class="water">
        <svg class="water-lines" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path v-for="y in [8, 16, 24, 32]" :key="y"
            :d="`M0,${y} Q10,${y-2} 20,${y} Q30,${y+2} 40,${y} Q50,${y-2} 60,${y} Q70,${y+2} 80,${y} Q90,${y-2} 100,${y}`"
            fill="none" stroke="#fff" stroke-width=".4" opacity=".15"
          />
        </svg>
      </div>

      <!-- Island -->
      <div class="island">
        <div class="island-ground"></div>
        <div class="palm-tree">
          <div class="palm-trunk"></div>
          <div class="palm-leaves">&#x1F334;</div>
        </div>
        <div class="gary-on-island">
          <div class="gary-sprite">&#x1F3F4;&#x200D;&#x2620;&#xFE0F;</div>
          <div class="gary-label">Gary</div>
        </div>
      </div>

      <!-- Message -->
      <div class="island-message">
        <div class="message-scroll">
          <div class="scroll-title">The Island of Gary</div>
          <div class="scroll-text">
            Gary watches from the shore as your ship approaches...
          </div>
          <div class="scroll-quote">
            "You found my island, Captain {{ initials }}. But you're not ready for what comes next..."
          </div>
          <div class="coming-soon">
            <div class="coming-soon-text">To Be Continued...</div>
            <div class="coming-soon-sub">New adventures are on the horizon!</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back button -->
    <div class="bottom-bar">
      <button @click="$emit('back')" class="back-btn">
        &#x2B05;&#xFE0F; Return to Sea
      </button>
    </div>
  </div>
</template>

<style scoped>
.gary-island {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a2e 0%, #16213e 40%, #0a1628 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: rgba(0,0,0,.3);
  border-bottom: 1px solid rgba(139,92,246,.2);
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-flag { width: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.4)); }
.header-title { font-size: 16px; font-weight: 700; color: #c4b5fd; font-family: Georgia, serif; }
.header-right { display: flex; align-items: center; gap: 12px; }
.header-info { font-size: 12px; color: #888; }
.header-sep { font-size: 12px; color: #555; }
.gold { color: #fbbf24; }

/* Island scene */
.island-scene {
  flex: 1;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.95);
  transition: all 1s ease;
}
.island-scene.revealed {
  opacity: 1;
  transform: scale(1);
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, #1a0a2e, #2d1b69 60%, #4c1d95);
}
.cloud {
  position: absolute;
  width: 80px;
  height: 24px;
  background: rgba(196,181,253,.08);
  border-radius: 12px;
  animation: cloudDrift 20s linear infinite;
}
.cloud-1 { top: 15%; left: -10%; animation-duration: 25s; }
.cloud-2 { top: 25%; left: 30%; animation-duration: 30s; animation-delay: -10s; width: 60px; }
.cloud-3 { top: 10%; left: 60%; animation-duration: 22s; animation-delay: -5s; width: 100px; }
@keyframes cloudDrift {
  from { transform: translateX(-100px); }
  to { transform: translateX(calc(100vw + 100px)); }
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(180deg, #1e3a5f, #0d2137);
}
.water-lines { position: absolute; inset: 0; }

/* Island */
.island {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.island-ground {
  width: 200px;
  height: 40px;
  background: linear-gradient(135deg, #d4a574, #c08a52);
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0,0,0,.4);
}
.palm-tree {
  position: absolute;
  bottom: 24px;
  left: 30px;
}
.palm-leaves {
  font-size: 40px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,.3));
  animation: palmSway 3s ease-in-out infinite;
}
@keyframes palmSway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
.gary-on-island {
  position: absolute;
  bottom: 28px;
  right: 30px;
  text-align: center;
}
.gary-on-island .gary-sprite {
  font-size: 48px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,.5));
  animation: garyIdle 2.5s ease-in-out infinite;
}
@keyframes garyIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.gary-label {
  font-size: 13px;
  font-weight: 700;
  color: #c4b5fd;
  font-family: Georgia, serif;
  text-shadow: 0 2px 6px rgba(0,0,0,.8);
}

/* Message scroll */
.island-message {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
}
.message-scroll {
  background: rgba(0,0,0,.5);
  border: 1px solid rgba(139,92,246,.3);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(8px);
}
.scroll-title {
  font-size: 22px;
  font-weight: 700;
  color: #c4b5fd;
  font-family: Georgia, serif;
  margin-bottom: 8px;
}
.scroll-text {
  font-size: 14px;
  color: #a5b4fc;
  margin-bottom: 12px;
}
.scroll-quote {
  font-size: 15px;
  color: #e2e8f0;
  font-style: italic;
  font-family: Georgia, serif;
  margin-bottom: 16px;
  line-height: 1.5;
}
.coming-soon {
  border-top: 1px solid rgba(139,92,246,.2);
  padding-top: 16px;
}
.coming-soon-text {
  font-size: 24px;
  font-weight: 700;
  color: #fbbf24;
  font-family: Georgia, serif;
  animation: continueGlow 2s ease-in-out infinite;
}
@keyframes continueGlow {
  0%, 100% { text-shadow: 0 0 8px rgba(251,191,36,.3); }
  50% { text-shadow: 0 0 20px rgba(251,191,36,.6); }
}
.coming-soon-sub {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* Bottom bar */
.bottom-bar {
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  background: rgba(0,0,0,.3);
  border-top: 1px solid rgba(139,92,246,.15);
}
.back-btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.08);
  color: #a5b4fc;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: Georgia, serif;
  transition: all .2s;
}
.back-btn:hover {
  background: rgba(255,255,255,.12);
  border-color: rgba(139,92,246,.4);
}
</style>
