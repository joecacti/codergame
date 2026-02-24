<script setup>
import { ref, computed } from 'vue'
import { getPlaceholderStyle, getPlaceholderLabelStyle } from '../../utils/placeholder.js'
import Hotspot from './Hotspot.vue'

const props = defineProps({
  scene: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['hotspot-click'])

/** Whether the background image failed to load */
const imageError = ref(false)

const showPlaceholder = computed(() => {
  return !props.scene.background || imageError.value
})

const placeholderStyle = computed(() =>
  getPlaceholderStyle(
    props.scene.placeholderColor ?? '#4a6741',
    props.scene.placeholderLabel ?? 'Scene'
  )
)

const placeholderLabelStyle = computed(() => getPlaceholderLabelStyle())

function onImageError() {
  imageError.value = true
}

function onHotspotClick(hotspotId) {
  emit('hotspot-click', hotspotId)
}
</script>

<template>
  <div class="scene-renderer scene-container" role="img" :aria-label="`Scene: ${scene.placeholderLabel ?? scene.id}`">
    <!-- Background image -->
    <img
      v-if="scene.background && !imageError"
      :src="scene.background"
      :alt="scene.placeholderLabel ?? scene.id"
      class="scene-bg-image"
      @error="onImageError"
    />

    <!-- Placeholder background -->
    <div
      v-if="showPlaceholder"
      class="scene-placeholder"
      :style="placeholderStyle"
      aria-hidden="true"
    >
      <span :style="placeholderLabelStyle">{{ scene.placeholderLabel ?? 'Scene' }}</span>
    </div>

    <!-- Hotspots -->
    <Hotspot
      v-for="hotspot in scene.hotspots"
      :key="hotspot.id"
      :hotspot="hotspot"
      @click="onHotspotClick(hotspot.id)"
    />
  </div>
</template>

<style scoped>
.scene-renderer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

.scene-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.scene-placeholder {
  position: absolute;
  inset: 0;
}
</style>
