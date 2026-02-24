<script setup>
import { ref } from 'vue'

const props = defineProps({
  hotspot: {
    type: Object,
    required: true,
    // Expected shape:
    // { id, x, y, width, height, label, icon }
  },
})

const emit = defineEmits(['click'])

const isHovered = ref(false)

const positionStyle = {
  left: `${props.hotspot.x}%`,
  top: `${props.hotspot.y}%`,
  width: `${props.hotspot.width}%`,
  height: `${props.hotspot.height}%`,
}

function handleClick() {
  emit('click', props.hotspot.id)
}
</script>

<template>
  <button
    class="hotspot"
    :class="{ 'hotspot--hovered': isHovered }"
    :style="positionStyle"
    :aria-label="hotspot.label"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="isHovered = true"
    @focusout="isHovered = false"
  >
    <!-- Pulse ring -->
    <span class="hotspot__pulse" aria-hidden="true"></span>

    <!-- Icon -->
    <span
      v-if="hotspot.icon"
      class="hotspot__icon"
      aria-hidden="true"
    >{{ hotspot.icon }}</span>

    <!-- Tooltip -->
    <span
      class="hotspot__tooltip"
      role="tooltip"
      :id="`tooltip-${hotspot.id}`"
    >
      {{ hotspot.label }}
    </span>
  </button>
</template>

<style scoped>
.hotspot {
  position: absolute;
  cursor: pointer;
  background: rgba(212, 160, 23, 0.08);
  border: 2px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  /* Override global button styles */
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}

/* Remove inherited button styles */
.hotspot::before {
  display: none;
}

.hotspot:hover,
.hotspot--hovered {
  background: rgba(212, 160, 23, 0.2);
  border-color: rgba(212, 160, 23, 0.7);
  box-shadow:
    0 0 0 3px rgba(212, 160, 23, 0.15),
    inset 0 0 20px rgba(212, 160, 23, 0.1);
  transform: none;
}

.hotspot:active {
  background: rgba(212, 160, 23, 0.35);
  transform: none;
  box-shadow: inset 0 0 20px rgba(212, 160, 23, 0.2);
}

.hotspot:focus-visible {
  outline: 3px solid var(--color-gold-light);
  outline-offset: 2px;
}

/* ── Pulse Ring ───────────────────────────────────────────────────────────── */

.hotspot__pulse {
  position: absolute;
  inset: -6px;
  border: 2px solid var(--color-gold);
  border-radius: inherit;
  opacity: 0;
  animation: hotspot-pulse 2.5s ease-out infinite;
  pointer-events: none;
}

@keyframes hotspot-pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  70% {
    opacity: 0;
    transform: scale(1.12);
  }
  100% {
    opacity: 0;
    transform: scale(1.12);
  }
}

/* ── Icon ─────────────────────────────────────────────────────────────────── */

.hotspot__icon {
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
  transition: transform var(--transition-fast);
  user-select: none;
}

.hotspot:hover .hotspot__icon,
.hotspot--hovered .hotspot__icon {
  transform: scale(1.2) translateY(-2px);
}

/* ── Tooltip ──────────────────────────────────────────────────────────────── */

.hotspot__tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    var(--color-navy-light) 0%,
    var(--color-navy) 100%
  );
  color: var(--color-parchment);
  font-family: var(--font-body);
  font-size: 0.78rem;
  padding: 0.35em 0.8em;
  border: 1px solid var(--color-gold);
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
  z-index: var(--z-hotspot);
  box-shadow: var(--shadow-dark);
}

/* Tooltip arrow */
.hotspot__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--color-gold);
}

.hotspot:hover .hotspot__tooltip,
.hotspot--hovered .hotspot__tooltip,
.hotspot:focus-visible .hotspot__tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
