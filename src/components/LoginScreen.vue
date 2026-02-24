<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login', 'admin'])

const val = ref('')
const err = ref('')

function handleInput(e) {
  val.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  err.value = ''
}

function handleLogin() {
  if (val.value.length < 2) {
    err.value = 'Need at least 2 letters!'
    return
  }
  emit('login', val.value)
}
</script>

<template>
  <div class="login-screen">
    <svg viewBox="0 0 200 60" class="login-banner">
      <defs>
        <linearGradient id="loginSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2980b9" />
          <stop offset="100%" stop-color="#1a5276" />
        </linearGradient>
      </defs>
      <rect y="25" width="200" height="35" fill="url(#loginSea)" rx="4" />
      <path d="M0,27 Q20,23 40,27 Q60,31 80,27 Q100,23 120,27 Q140,31 160,27 Q180,23 200,27" fill="none" stroke="#fff" stroke-width=".8" opacity=".4" />
      <text x="100" y="22" text-anchor="middle" font-size="18">🏴‍☠️</text>
      <circle cx="85" cy="30" r="2" fill="#fff" opacity=".5" />
      <circle cx="100" cy="32" r="2.5" fill="#fff" opacity=".4" />
      <circle cx="115" cy="30" r="2" fill="#fff" opacity=".5" />
    </svg>

    <div class="login-card">
      <div class="login-title">🏴‍☠️ Pirates of the Coderbbean</div>
      <div class="login-subtitle">The First Byte</div>
      <div class="login-label">Enter your initials, Captain:</div>
      <input
        :value="val"
        @input="handleInput"
        placeholder="e.g. AJ"
        maxlength="3"
        class="login-input"
        :class="{ 'input-error': err }"
      />
      <div v-if="err" class="error-text">{{ err }}</div>
      <div class="input-hint">2–3 letters. These will appear on your ship!</div>
      <button
        @click="handleLogin"
        class="sail-btn"
        :class="{ active: val.length >= 2 }"
      >⛵ Set Sail!</button>
      <div class="admin-divider">
        <button @click="$emit('admin')" class="admin-btn">🔑 Admin Login</button>
      </div>
    </div>

    <div v-if="val.length >= 2" class="ship-preview">
      <div class="preview-label">Your ship preview:</div>
      <svg viewBox="0 0 100 50" class="preview-svg">
        <defs>
          <linearGradient id="prevSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2980b9" />
            <stop offset="100%" stop-color="#1a5276" />
          </linearGradient>
        </defs>
        <rect y="30" width="100" height="20" fill="url(#prevSea)" />
        <polygon points="30,25 70,25 65,38 35,38" fill="#8B4513" stroke="#5C2E00" stroke-width=".5" />
        <text x="50" y="34" text-anchor="middle" font-size="5" fill="#fbbf24" font-weight="bold" font-family="Georgia,serif">{{ val }}</text>
        <rect x="48" y="8" width="2" height="17" fill="#5C2E00" />
        <polygon points="50,8 50,20 68,17" fill="#fff" stroke="#ddd" stroke-width=".2" />
        <path d="M0,32 Q15,29 30,32 Q45,35 60,32 Q75,29 90,32 Q95,33 100,32" fill="none" stroke="#fff" stroke-width=".5" opacity=".4" />
      </svg>
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
  background: linear-gradient(180deg, #0a1628 0%, #1a2a4a 50%, #0a1628 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
}
.login-banner { width: 320px; margin-bottom: -10px; }
.login-card {
  background: rgba(0,0,0,.4);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px;
  padding: 36px 40px;
  text-align: center;
  width: 340px;
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
}
.login-input.input-error { border-color: #ef4444; }
.error-text { color: #ef4444; font-size: 12px; margin-top: 6px; }
.input-hint { font-size: 11px; color: #666; margin-top: 6px; }
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
.ship-preview { margin-top: 20px; text-align: center; }
.preview-label { font-size: 11px; color: #888; margin-bottom: 6px; }
.preview-svg { width: 200px; }
</style>
