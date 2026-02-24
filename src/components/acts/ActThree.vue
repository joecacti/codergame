<script setup>
import { onMounted, computed } from 'vue'
import SceneRenderer from '../game/SceneRenderer.vue'
import RiddlePuzzle from '../mini-games/RiddlePuzzle.vue'
import DebugChallenge from '../mini-games/DebugChallenge.vue'
import { useScene } from '../../composables/useScene.js'
import { useGameState } from '../../composables/useGameState.js'

const { currentScene, loadScene, handleHotspot } = useScene()
const { state, setFlag } = useGameState()

const showRiddle = computed(() => !!state.flags.showRiddle)
const showDebug = computed(() => !!state.flags.showDebug)

function onRiddleComplete() {
  setFlag('showRiddle', false)
  setFlag('riddleSolved', true)
  loadScene('isle-temple')
}

function onDebugComplete() {
  setFlag('showDebug', false)
  setFlag('debugSolved', true)
  loadScene('isle-victory')
}

onMounted(() => {
  loadScene('isle-gate')
})
</script>

<template>
  <div class="act-three">
    <SceneRenderer
      :scene="currentScene"
      @hotspot-click="handleHotspot"
    />

    <!-- RiddlePuzzle mini-game overlay (FOR loop counting challenge) -->
    <RiddlePuzzle
      v-if="showRiddle"
      @complete="onRiddleComplete"
    />

    <!-- DebugChallenge mini-game overlay -->
    <DebugChallenge
      v-if="showDebug"
      @complete="onDebugComplete"
    />
  </div>
</template>

<style scoped>
.act-three {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  position: relative;
}
</style>
