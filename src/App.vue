<script setup>
import { ref } from 'vue'
import LoginScreen from './components/LoginScreen.vue'
import Level1 from './components/Level1.vue'
import Level2 from './components/Level2.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import IslandOfGary from './components/IslandOfGary.vue'
import { useSound } from './composables/useSound.js'

const screen = ref('login')
const playerInitials = ref('')
const { startMusic } = useSound()

function handleLogin(initials) {
  playerInitials.value = initials
  screen.value = 'level1'
  startMusic()
}

function goAdmin() {
  screen.value = 'admin'
}

function adminBack() {
  screen.value = playerInitials.value ? 'level1' : 'login'
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
      @complete="screen = 'level2'"
      @admin="goAdmin"
    />
    <Level2
      v-else-if="screen === 'level2'"
      :initials="playerInitials"
      @admin="goAdmin"
      @gary-island="screen = 'garyIsland'"
    />
    <IslandOfGary
      v-else-if="screen === 'garyIsland'"
      :initials="playerInitials"
      @back="screen = 'level2'"
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
