<script setup>
import { computed } from 'vue'
import { useGameState } from './composables/useGameState.js'

import TitleScreen from './components/screens/TitleScreen.vue'
import ActIntro from './components/screens/ActIntro.vue'
import GameShell from './components/game/GameShell.vue'
import RecapScreen from './components/screens/RecapScreen.vue'
import BadgeSummary from './components/screens/BadgeSummary.vue'

const { state } = useGameState()

const currentPhase = computed(() => state.gamePhase)
</script>

<template>
  <div class="app-root">
    <Transition name="fade" mode="out-in">
      <TitleScreen v-if="currentPhase === 'title'" key="title" />
      <ActIntro v-else-if="currentPhase === 'act-intro'" key="act-intro" />
      <GameShell v-else-if="currentPhase === 'playing'" key="playing" />
      <RecapScreen v-else-if="currentPhase === 'recap'" key="recap" />
      <BadgeSummary v-else-if="currentPhase === 'badges'" key="badges" />
    </Transition>
  </div>
</template>

<style>
.app-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-navy-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
