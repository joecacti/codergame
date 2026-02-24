<script setup>
import { useGameState } from '../../composables/useGameState.js'

const { state, setPhase } = useGameState()

function continueToBadges() {
  setPhase('badges')
}
</script>

<template>
  <div class="recap-screen" role="main">
    <div class="recap-content">
      <!-- Decorative scroll top -->
      <div class="scroll-top" aria-hidden="true"></div>

      <h1 class="recap-heading">The Golden Algorithm</h1>

      <div class="recap-body">
        <p>
          Against all odds, Captain {{ state.player.name }} has sailed through treacherous waters,
          outsmarted the pirates of the Coderibbean, and uncovered the legendary
          <strong>Golden Algorithm</strong> hidden deep within Gary's Island.
        </p>

        <p>
          The seas of code are vast, but ye have proven yourself a worthy captain.
          Variables bend to yer will, loops obey yer command, and arrays hold no secrets
          from thee any longer.
        </p>

        <p class="recap-quote">
          "The greatest treasure is not gold, but the code ye carry in yer mind."
          <br />
          <em>— Old Pete, Harbour Master of Port Compile</em>
        </p>
      </div>

      <!-- Stats summary -->
      <div class="recap-stats">
        <div class="stat-item">
          <span class="stat-label">Gold Earned</span>
          <span class="stat-value">{{ state.player.gold }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Reputation</span>
          <span class="stat-value">{{ state.player.reputation }}/100</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Items Found</span>
          <span class="stat-value">{{ state.inventory.length }}</span>
        </div>
      </div>

      <button class="continue-btn" @click="continueToBadges">
        View Your Badges
      </button>

      <!-- Decorative scroll bottom -->
      <div class="scroll-bottom" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.recap-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    ellipse at 50% 30%,
    var(--color-navy-light) 0%,
    var(--color-navy-dark) 100%
  );
  overflow-y: auto;
}

.recap-content {
  max-width: 700px;
  width: 90%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.scroll-top,
.scroll-bottom {
  width: 80%;
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-gold-dark) 0px,
    var(--color-gold) 2px,
    var(--color-gold-dark) 4px
  );
  border-radius: 10px;
  opacity: 0.3;
}

.recap-heading {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--color-gold);
  text-shadow:
    0 0 30px rgba(212, 160, 23, 0.6),
    0 3px 8px rgba(0, 0, 0, 0.8);
}

.recap-body {
  background: rgba(244, 228, 193, 0.07);
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: var(--border-radius-md);
  padding: 1.5rem 2rem;
  text-align: left;
}

.recap-body p {
  color: var(--color-parchment);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.recap-body p:last-child {
  margin-bottom: 0;
}

.recap-body strong {
  color: var(--color-gold-light);
}

.recap-quote {
  font-style: italic;
  color: var(--color-parchment-dark) !important;
  border-left: 3px solid var(--color-gold);
  padding-left: 1rem;
  opacity: 0.8;
}

.recap-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: rgba(212, 160, 23, 0.1);
  border: 1px solid rgba(212, 160, 23, 0.3);
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  min-width: 120px;
}

.stat-label {
  font-family: var(--font-code);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.7;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: var(--color-gold-light);
}

.continue-btn {
  font-size: 1.1rem;
  padding: 0.7em 2em;
}
</style>
