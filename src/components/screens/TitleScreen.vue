<script setup>
import { useGameState } from '../../composables/useGameState.js'

const { startGame } = useGameState()
</script>

<template>
  <div class="title-screen" role="main">
    <!-- Animated ocean waves at the bottom -->
    <div class="waves" aria-hidden="true">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>

    <!-- Decorative stars -->
    <div class="stars" aria-hidden="true">
      <span
        v-for="i in 40"
        :key="i"
        class="star"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
        }"
      ></span>
    </div>

    <!-- Main content -->
    <div class="title-content">
      <!-- Skull icon -->
      <div class="skull-icon" aria-hidden="true">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="50" cy="42" rx="32" ry="30" fill="currentColor" />
          <ellipse cx="38" cy="40" rx="10" ry="11" fill="var(--color-navy-dark)" />
          <ellipse cx="62" cy="40" rx="10" ry="11" fill="var(--color-navy-dark)" />
          <rect x="38" y="65" width="6" height="14" rx="2" fill="currentColor" />
          <rect x="47" y="65" width="6" height="14" rx="2" fill="currentColor" />
          <rect x="56" y="65" width="6" height="14" rx="2" fill="currentColor" />
          <rect x="43" y="68" width="14" height="5" rx="1" fill="currentColor" />
          <!-- Crossbones -->
          <line x1="10" y1="85" x2="90" y2="95" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
          <line x1="90" y1="85" x2="10" y2="95" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
          <circle cx="10" cy="85" r="5" fill="currentColor" />
          <circle cx="90" cy="85" r="5" fill="currentColor" />
          <circle cx="10" cy="95" r="5" fill="currentColor" />
          <circle cx="90" cy="95" r="5" fill="currentColor" />
        </svg>
      </div>

      <!-- Main heading -->
      <h1 class="title-heading">
        Pirates of the
        <span class="title-highlight">Coderibbean</span>
      </h1>

      <!-- Subtitle -->
      <p class="title-subtitle">Battle for Gary's Island</p>

      <!-- Tagline -->
      <p class="title-tagline">Learn to code like a pirate captain!</p>

      <!-- Divider rope -->
      <div class="rope-divider" aria-hidden="true">
        <span class="rope-knot">&#9679;</span>
        <span class="rope-line"></span>
        <span class="rope-knot">&#9679;</span>
        <span class="rope-line"></span>
        <span class="rope-knot">&#9679;</span>
      </div>

      <!-- Start button -->
      <button
        class="start-button"
        @click="startGame"
        aria-label="Start your pirate coding adventure"
      >
        <span class="start-button-icon" aria-hidden="true">&#9875;</span>
        Start Adventure
      </button>

      <!-- Footer credits -->
      <p class="title-footer">
        <span class="title-footer-text">Hoist the sails &amp; set thy course!</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.title-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 50% 30%,
    #243560 0%,
    var(--color-navy) 40%,
    var(--color-navy-dark) 100%
  );
}

/* ── Stars ────────────────────────────────────────────────────────────────── */

.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle var(--duration, 2.5s) ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.4); }
}

/* ── Ocean Waves ──────────────────────────────────────────────────────────── */

.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 220px;
  pointer-events: none;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: -100%;
  width: 300%;
  height: 100%;
  border-radius: 43% 57% 35% 65% / 50% 50% 50% 50%;
  opacity: 0.15;
}

.wave-1 {
  background: var(--color-ocean);
  animation: wave-move 8s linear infinite;
  height: 130px;
  bottom: -10px;
}

.wave-2 {
  background: var(--color-ocean-light);
  animation: wave-move 12s linear infinite reverse;
  height: 100px;
  bottom: -20px;
  opacity: 0.1;
}

.wave-3 {
  background: #4a9abe;
  animation: wave-move 6s linear infinite;
  height: 80px;
  bottom: 0;
  opacity: 0.08;
}

@keyframes wave-move {
  0% { transform: translateX(0) scaleY(1); }
  50% { transform: translateX(25%) scaleY(1.1); }
  100% { transform: translateX(50%) scaleY(1); }
}

/* ── Content ──────────────────────────────────────────────────────────────── */

.title-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
}

/* ── Skull Icon ───────────────────────────────────────────────────────────── */

.skull-icon {
  color: var(--color-gold);
  width: clamp(60px, 8vw, 100px);
  height: clamp(60px, 8vw, 100px);
  margin-bottom: 0.5rem;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 0 16px rgba(212, 160, 23, 0.5));
}

.skull-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-12px) rotate(3deg); }
}

/* ── Heading ──────────────────────────────────────────────────────────────── */

.title-heading {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 6vw, 4.5rem);
  color: var(--color-parchment);
  line-height: 1.1;
  margin-bottom: 0.25rem;
  text-shadow:
    0 0 40px rgba(212, 160, 23, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.02em;
}

.title-highlight {
  display: block;
  color: var(--color-gold);
  text-shadow:
    0 0 30px rgba(212, 160, 23, 0.8),
    0 0 60px rgba(212, 160, 23, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.8);
}

/* ── Subtitle ─────────────────────────────────────────────────────────────── */

.title-subtitle {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 2.5vw, 1.6rem);
  color: var(--color-parchment-dark);
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

/* ── Tagline ──────────────────────────────────────────────────────────────── */

.title-tagline {
  font-family: var(--font-body);
  font-style: italic;
  font-size: clamp(0.85rem, 1.5vw, 1.05rem);
  color: var(--color-gold-light);
  opacity: 0.8;
  margin-bottom: 1.25rem;
}

/* ── Rope Divider ─────────────────────────────────────────────────────────── */

.rope-divider {
  display: flex;
  align-items: center;
  gap: 0;
  width: 60%;
  max-width: 360px;
  margin: 0 auto 1.75rem;
  opacity: 0.5;
}

.rope-line {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-gold) 0px,
    var(--color-gold) 4px,
    transparent 4px,
    transparent 8px
  );
}

.rope-knot {
  color: var(--color-gold);
  font-size: 0.5rem;
  padding: 0 4px;
}

/* ── Start Button ─────────────────────────────────────────────────────────── */

.start-button {
  font-size: clamp(1rem, 2vw, 1.3rem);
  padding: 0.75em 2.5em;
  animation: button-float 3s ease-in-out infinite;
  letter-spacing: 0.08em;
  gap: 0.6em;
  margin-bottom: 1.5rem;
}

.start-button-icon {
  font-size: 1.2em;
  line-height: 1;
}

@keyframes button-float {
  0%, 100% {
    transform: translateY(0);
    box-shadow: 0 3px 0 var(--color-gold-dark), 0 8px 24px rgba(212, 160, 23, 0.3);
  }
  50% {
    transform: translateY(-6px);
    box-shadow: 0 9px 0 var(--color-gold-dark), 0 16px 32px rgba(212, 160, 23, 0.5);
  }
}

.start-button:hover {
  animation: none;
  transform: translateY(-3px);
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

.title-footer {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-parchment);
  opacity: 0.4;
  margin-bottom: 0;
}
</style>
