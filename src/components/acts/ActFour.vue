<script setup>
import { onMounted, computed } from 'vue'
import SceneRenderer from '../game/SceneRenderer.vue'
import ArrayPicker from '../mini-games/ArrayPicker.vue'
import { useScene } from '../../composables/useScene.js'
import { useGameState } from '../../composables/useGameState.js'

const { currentScene, loadScene, handleHotspot } = useScene()
const { state, setFlag } = useGameState()

const showArrayPicker = computed(() => !!state.flags.showArrayPicker)

function onArrayPickerComplete() {
  setFlag('showArrayPicker', false)
  loadScene('cave-treasure')
}

onMounted(() => {
  loadScene('cave-entrance')
})
</script>

<template>
  <div class="act-four">
    <SceneRenderer
      :scene="currentScene"
      @hotspot-click="handleHotspot"
    />

    <!-- ArrayPicker mini-game overlay -->
    <ArrayPicker
      v-if="showArrayPicker"
      @complete="onArrayPickerComplete"
    />
  </div>
</template>

<style scoped>
.act-four {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  position: relative;
}
</style>
