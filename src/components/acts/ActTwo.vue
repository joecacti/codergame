<script setup>
import { onMounted, computed } from 'vue'
import SceneRenderer from '../game/SceneRenderer.vue'
import CombatLoop from '../mini-games/CombatLoop.vue'
import { useScene } from '../../composables/useScene.js'
import { useGameState } from '../../composables/useGameState.js'

const { currentScene, loadScene, handleHotspot } = useScene()
const { state, setFlag } = useGameState()

const showCombat = computed(() => !!state.flags.showCombat)

function onCombatComplete() {
  setFlag('showCombat', false)
  // Advance to victory scene after winning combat
  loadScene('bay-victory')
}

onMounted(() => {
  loadScene('bay-shore')
})
</script>

<template>
  <div class="act-two">
    <SceneRenderer
      :scene="currentScene"
      @hotspot-click="handleHotspot"
    />

    <!-- CombatLoop mini-game overlay -->
    <CombatLoop
      v-if="showCombat"
      @complete="onCombatComplete"
    />
  </div>
</template>

<style scoped>
.act-two {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  position: relative;
}
</style>
