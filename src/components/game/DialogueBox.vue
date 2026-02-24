<script setup>
import { useDialogue } from '../../composables/useDialogue.js'
import { useGameState } from '../../composables/useGameState.js'

const { state } = useGameState()
const { typewriterText, isTyping, handleClick } = useDialogue()
</script>

<template>
  <Transition name="dialogue">
    <div
      v-if="state.dialogue.active"
      class="dialogue-box"
      role="dialog"
      aria-live="polite"
      aria-label="Character dialogue"
      @click="handleClick"
    >
      <!-- Decorative top border -->
      <div class="dialogue-border-top" aria-hidden="true"></div>

      <!-- Speaker name -->
      <div
        v-if="state.dialogue.speaker"
        class="dialogue-speaker"
      >
        <span class="dialogue-speaker-name">{{ state.dialogue.speaker }}</span>
        <span class="dialogue-speaker-line" aria-hidden="true"></span>
      </div>

      <!-- Text area -->
      <p class="dialogue-text" aria-live="polite">
        {{ typewriterText }}
        <span
          v-if="isTyping"
          class="dialogue-cursor"
          aria-hidden="true"
        >|</span>
      </p>

      <!-- Continue hint -->
      <div
        v-if="!isTyping"
        class="dialogue-hint"
        aria-hidden="true"
      >
        <span v-if="state.dialogue.queue.length > 0">Click to continue &#9654;</span>
        <span v-else>Click to close &#10005;</span>
      </div>

      <!-- Queue indicator dots -->
      <div
        v-if="state.dialogue.queue.length > 0"
        class="dialogue-queue-dots"
        aria-label="More dialogue remaining"
      >
        <span
          v-for="i in Math.min(state.dialogue.queue.length, 5)"
          :key="i"
          class="queue-dot"
        ></span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialogue-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-dialogue);
  padding: 1rem 1.5rem 1rem;
  background: linear-gradient(
    180deg,
    rgba(244, 228, 193, 0.92) 0%,
    rgba(232, 212, 160, 0.96) 100%
  );
  backdrop-filter: blur(4px);
  border-top: 3px solid var(--color-gold-dark);
  cursor: pointer;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
}

.dialogue-border-top {
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-gold) 0px,
    var(--color-gold) 6px,
    var(--color-gold-dark) 6px,
    var(--color-gold-dark) 8px,
    var(--color-gold) 8px
  );
}

/* ── Speaker Name ─────────────────────────────────────────────────────────── */

.dialogue-speaker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.1rem;
}

.dialogue-speaker-name {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--color-gold-dark);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.dialogue-speaker-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    var(--color-gold-dark) 0%,
    transparent 100%
  );
  opacity: 0.4;
}

/* ── Dialogue Text ────────────────────────────────────────────────────────── */

.dialogue-text {
  font-family: var(--font-body);
  font-size: clamp(0.88rem, 1.4vw, 1rem);
  color: var(--color-navy-dark);
  line-height: 1.65;
  flex: 1;
  margin-bottom: 0;
  min-height: 3.3em;
}

.dialogue-cursor {
  display: inline-block;
  color: var(--color-gold-dark);
  animation: cursor-blink 0.6s step-end infinite;
  font-weight: bold;
  margin-left: 1px;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── Continue Hint ────────────────────────────────────────────────────────── */

.dialogue-hint {
  text-align: right;
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--color-navy);
  opacity: 0.5;
  animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* ── Queue Dots ───────────────────────────────────────────────────────────── */

.dialogue-queue-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 0.1rem;
}

.queue-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-gold-dark);
  opacity: 0.4;
}
</style>
