<script setup>
import { ref } from 'vue'
import LoginScreen from './components/LoginScreen.vue'
import Level1 from './components/Level1.vue'
import Level2 from './components/Level2.vue'
import Level3 from './components/Level3.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import IslandOfGary from './components/IslandOfGary.vue'
import { useSound } from './composables/useSound.js'

const screen = ref('login')
const playerInitials = ref('')
const { startMusic, stopMusic } = useSound()

function handleLogin(initials) {
  playerInitials.value = initials
  screen.value = 'level1'
  startMusic('level1')
}

function goAdmin() {
  stopMusic()
  screen.value = 'admin'
}

function adminBack() {
  const target = playerInitials.value ? 'level1' : 'login'
  screen.value = target
  startMusic(target)
}
</script>

<template>
  <div class="app-root">
    <LoginScreen
      v-if="screen === 'login'"
      @login="handleLogin"
      @admin="goAdmin"
    />
    <Level1
      v-else-if="screen === 'level1'"
      :initials="playerInitials"
      @complete="screen = 'level2'; startMusic('level2')"
      @admin="goAdmin"
    />
    <Level2
      v-else-if="screen === 'level2'"
      :initials="playerInitials"
      @complete="screen = 'level3'; startMusic('level3')"
      @admin="goAdmin"
      @gary-island="screen = 'garyIsland'; startMusic('garyIsland')"
    />
    <Level3
      v-else-if="screen === 'level3'"
      :initials="playerInitials"
      @admin="goAdmin"
      @gary-island="screen = 'garyIsland'; startMusic('garyIsland')"
    />
    <IslandOfGary
      v-else-if="screen === 'garyIsland'"
      :initials="playerInitials"
      @back="screen = 'level2'; startMusic('level2')"
    />
    <AdminDashboard
      v-else-if="screen === 'admin'"
      :current-player="playerInitials ? { initials: playerInitials, level: 1, badges: 0, time: '--:--' } : null"
      @back="adminBack"
    />
  </div>
</template>

<style>
.app-root {
  width: 100%;
  min-height: 100vh;
  background-color: #0a1628;
}
</style>
