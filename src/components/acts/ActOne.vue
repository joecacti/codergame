<script setup>
import { onMounted } from 'vue'
import SceneRenderer from '../game/SceneRenderer.vue'
import { useScene } from '../../composables/useScene.js'
import { useGameState } from '../../composables/useGameState.js'

const { currentScene, loadScene, handleHotspot } = useScene()
const { state, setAct } = useGameState()

onMounted(() => {
  loadScene('port-arrival')
})
</script>

<template>
  <div class="act-one">
    <SceneRenderer
      :scene="currentScene"
      @hotspot-click="handleHotspot"
    />
  </div>
</template>

<style scoped>
.act-one {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}
</style>
