<script setup>
import { ref } from 'vue'

/**
 * ConceptToast — slides in from the top-right when a badge is earned.
 *
 * Props:
 *   badge: { id, name, concept, icon } — the badge that was just awarded.
 *
 * Emits:
 *   dismiss — fired when the toast closes (by timer or user click).
 *
 * Usage (from a parent):
 *   <ConceptToast ref="toastRef" @dismiss="onDismiss" />
 *   toastRef.value.show({ id: 'variables', name: 'Variable Vault', concept: 'variables', icon: '📦' })
 */

const emit = defineEmits(['dismiss'])

const visible = ref(false)

const badge = ref(null)

let hideTimer = null

/**
 * Show the toast for the given badge object.
 * @param {{ id: string, name: string, concept: string, icon: string }} badgeObj
 */
function show(badgeObj) {
  badge.value = badgeObj
  visible.value = true

  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    dismiss()
  }, 4000)
}

function dismiss() {
  visible.value = false
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  emit('dismiss')
}

defineExpose({ show })
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="visible && badge"
      class="concept-toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      @click="dismiss"
    >
      <!-- Sparkle ring around icon -->
      <div class="toast-icon-wrap" aria-hidden="true">
        <span class="toast-sparkle toast-sparkle--tl">✦</span>
        <span class="toast-sparkle toast-sparkle--tr">✦</span>
        <span class="toast-sparkle toast-sparkle--bl">✦</span>
        <span class="toast-sparkle toast-sparkle--br">✦</span>
        <span class="toast-icon">{{ badge.icon }}</span>
      </div>

      <!-- Text body -->
      <div class="toast-body">
        <p class="toast-label">Badge Earned!</p>
        <p class="toast-name">{{ badge.name }}</p>
        <p class="toast-concept">{{ badge.concept }}</p>
      </div>

      <!-- Dismiss button -->
      <button
        class="toast-close"
        @click.stop="dismiss"
        aria-label="Dismiss badge notification"
      >✕</button>

      <!-- Countdown bar -->
      <div class="toast-progress" aria-hidden="true">
        <div class="toast-progress__fill"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Toast container ──────────────────────────────────────────────────────── */

.concept-toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem 1.25rem;
  width: 280px;
  background: linear-gradient(
    135deg,
    #1e2a4a 0%,
    var(--color-navy) 100%
  );
  border: 2px solid var(--color-gold);
  border-radius: var(--border-radius-md);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.7),
    0 0 24px rgba(212, 160, 23, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  cursor: pointer;
  overflow: hidden;
  user-select: none;
}

/* Golden shimmer sweep across the toast */
.concept-toast::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(212, 160, 23, 0.08) 50%,
    transparent 70%
  );
  animation: shimmer 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ── Icon with sparkles ───────────────────────────────────────────────────── */

.toast-icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon {
  font-size: 2rem;
  line-height: 1;
  position: relative;
  z-index: 1;
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes icon-bounce {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg);   opacity: 1; }
}

.toast-sparkle {
  position: absolute;
  font-size: 0.5rem;
  color: var(--color-gold-light);
  animation: sparkle 1.2s ease-in-out infinite;
}

.toast-sparkle--tl { top: 2px;    left: 2px;    animation-delay: 0s;    }
.toast-sparkle--tr { top: 2px;    right: 2px;   animation-delay: 0.3s;  }
.toast-sparkle--bl { bottom: 2px; left: 2px;    animation-delay: 0.6s;  }
.toast-sparkle--br { bottom: 2px; right: 2px;   animation-delay: 0.9s;  }

@keyframes sparkle {
  0%, 100% { opacity: 0;   transform: scale(0.5); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

/* ── Text body ────────────────────────────────────────────────────────────── */

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-label {
  font-family: var(--font-code);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.8;
  margin-bottom: 0.15rem;
}

.toast-name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--color-parchment);
  margin-bottom: 0.1rem;
  line-height: 1.2;
}

.toast-concept {
  font-family: var(--font-code);
  font-size: 0.62rem;
  color: var(--color-gold);
  opacity: 0.55;
  margin-bottom: 0;
  text-transform: capitalize;
}

/* ── Close button ─────────────────────────────────────────────────────────── */

.toast-close {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--color-parchment);
  font-size: 0.65rem;
  padding: 0.15em 0.35em;
  opacity: 0.35;
  box-shadow: none;
  font-family: sans-serif;
  text-transform: none;
  letter-spacing: normal;
  min-height: auto;
  line-height: 1;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.toast-close::before {
  display: none;
}

.toast-close:hover {
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.08);
  transform: none;
  box-shadow: none;
  color: var(--color-parchment);
}

.toast-close:focus-visible {
  outline: 2px solid var(--color-gold-light);
  outline-offset: 2px;
  opacity: 1;
}

/* ── Countdown progress bar ───────────────────────────────────────────────── */

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(212, 160, 23, 0.15);
}

.toast-progress__fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gold-dark),
    var(--color-gold-light)
  );
  animation: countdown 4s linear forwards;
  transform-origin: left center;
}

@keyframes countdown {
  from { width: 100%; }
  to   { width: 0%; }
}

/* ── Enter / leave transition ─────────────────────────────────────────────── */

.toast-slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.3s ease;
}

.toast-slide-leave-active {
  transition: transform 0.25s ease-in,
              opacity 0.25s ease-in;
}

.toast-slide-enter-from {
  transform: translateX(120%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.toast-slide-enter-to,
.toast-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
