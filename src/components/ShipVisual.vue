<script setup>
import Confetti from './Confetti.vue'

defineProps({
  built: { type: Object, default: () => ({ hull: false, sails: false, crew: false, anchor: false }) },
  failState: { type: Number, default: 0 },
  successState: { type: Boolean, default: false },
  initials: { type: String, default: '' },
})
</script>

<template>
  <!-- SUCCESS STATE -->
  <div v-if="successState" class="ship-visual">
    <Confetti :x="30" :y="20" :count="50" />
    <Confetti :x="60" :y="25" :count="50" />
    <svg viewBox="0 0 100 100" class="ship-svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#b6e3f4" /></linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2980b9" /><stop offset="100%" stop-color="#1a5276" /></linearGradient>
      </defs>
      <rect width="100" height="68" fill="url(#sky)" />
      <rect y="68" width="100" height="32" fill="url(#sea)" />
      <text x="50" y="18" text-anchor="middle" font-size="5" fill="#2c3e50" font-weight="bold">🎉 SHE'S SEAWORTHY! 🎉</text>
      <g>
        <polygon points="30,62 70,62 65,75 35,75" fill="#8B4513" stroke="#5C2E00" stroke-width=".5" />
        <text x="50" y="71" text-anchor="middle" font-size="4" fill="#fbbf24" font-weight="bold" font-family="Georgia,serif">{{ initials }}</text>
        <rect x="48" y="35" width="2" height="27" fill="#5C2E00" />
        <polygon points="50,35 50,55 72,50" fill="#fff" stroke="#ddd" stroke-width=".3" />
        <polygon points="50,37 50,52 32,48" fill="#ffe" stroke="#ddd" stroke-width=".3" />
        <text x="40" y="60" font-size="4">🏴‍☠️</text>
        <text x="52" y="60" font-size="4">🏴‍☠️</text>
        <text x="46" y="60" font-size="3">🏴‍☠️</text>
      </g>
      <path d="M0,70 Q10,67 20,70 Q30,73 40,70 Q50,67 60,70 Q70,73 80,70 Q90,67 100,70" fill="none" stroke="#fff" stroke-width=".5" opacity=".5" />
    </svg>
  </div>

  <!-- FAIL STATE -->
  <svg v-else-if="failState" viewBox="0 0 100 100" class="ship-svg">
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#b6e3f4" /></linearGradient>
      <linearGradient id="sea2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2980b9" /><stop offset="100%" stop-color="#1a5276" /></linearGradient>
    </defs>
    <rect width="100" height="68" fill="url(#sky2)" />
    <rect y="68" width="100" height="32" fill="url(#sea2)" />

    <!-- Fail 1: tilting -->
    <g v-if="failState === 1" transform="rotate(8 50 65)">
      <polygon points="30,60 70,60 65,73 35,73" fill="#8B4513" stroke="#5C2E00" stroke-width=".5" />
      <text x="50" y="69" text-anchor="middle" font-size="4" fill="#fbbf24" font-weight="bold" font-family="Georgia,serif">{{ initials }}</text>
      <rect x="48" y="38" width="2" height="22" fill="#5C2E00" />
      <polygon points="50,38 50,52 68,48" fill="#fff" stroke="#ddd" stroke-width=".3" opacity=".7" />
      <text x="50" y="20" text-anchor="middle" font-size="4" fill="#c0392b">Uh oh... 😰</text>
      <text x="50" y="55" text-anchor="middle" font-size="5">😱</text>
    </g>

    <!-- Fail 2: cracking -->
    <template v-if="failState === 2">
      <polygon points="30,63 48,63 44,73 34,73" fill="#8B4513" opacity=".8" transform="rotate(-15 40 68)" />
      <polygon points="52,63 70,63 66,73 54,73" fill="#8B4513" opacity=".8" transform="rotate(12 60 68)" />
      <line x1="48" y1="40" x2="50" y2="63" stroke="#5C2E00" stroke-width="1.5" transform="rotate(5 49 50)" />
      <text x="50" y="20" text-anchor="middle" font-size="4" fill="#c0392b">CRACK! 💥</text>
      <text x="35" y="57" font-size="3">🪵</text>
      <text x="60" y="55" font-size="3">🪵</text>
      <text x="50" y="50" font-size="5">💥</text>
    </template>

    <!-- Fail 3: sinking -->
    <template v-if="failState === 3">
      <polygon points="38,72 62,72 60,80 40,80" fill="#8B4513" opacity=".4" />
      <circle cx="45" cy="65" r="1.5" fill="#fff" opacity=".6" />
      <circle cx="50" cy="62" r="2" fill="#fff" opacity=".5" />
      <circle cx="55" cy="64" r="1" fill="#fff" opacity=".7" />
      <text x="50" y="20" text-anchor="middle" font-size="4" fill="#c0392b">SINKING! 🫧</text>
      <text x="50" y="50" font-size="6">🫧</text>
    </template>

    <!-- Fail 4: overboard -->
    <template v-if="failState === 4">
      <text x="50" y="58" text-anchor="middle" font-size="5">🏊</text>
      <text x="50" y="20" text-anchor="middle" font-size="4" fill="#c0392b">Captain overboard! 😰</text>
      <circle cx="42" cy="68" r="1.5" fill="#fff" opacity=".5" />
      <circle cx="58" cy="68" r="1.5" fill="#fff" opacity=".5" />
    </template>

    <!-- Fail 5: shark approaching -->
    <template v-if="failState === 5">
      <text x="42" y="60" text-anchor="middle" font-size="5">🏊</text>
      <text x="65" y="75" text-anchor="middle" font-size="12">🦈</text>
      <text x="50" y="20" text-anchor="middle" font-size="4" fill="#c0392b">Uh oh... 😱</text>
      <path d="M55,72 Q50,65 44,62" fill="none" stroke="#fff" stroke-width=".4" stroke-dasharray="1" opacity=".5" />
    </template>

    <!-- Fail 6: chomp -->
    <template v-if="failState === 6">
      <text x="55" y="75" text-anchor="middle" font-size="16">🦈</text>
      <text x="50" y="20" text-anchor="middle" font-size="5" fill="#c0392b" font-weight="bold">CHOMP! 😋</text>
      <text x="40" y="62" font-size="2" opacity=".5">🫧</text>
      <text x="48" y="58" font-size="2" opacity=".3">🫧</text>
      <text x="50" y="90" text-anchor="middle" font-size="3" fill="#fff" opacity=".6">burp</text>
    </template>

    <path d="M0,70 Q10,67 20,70 Q30,73 40,70 Q50,67 60,70 Q70,73 80,70 Q90,67 100,70" fill="none" stroke="#fff" stroke-width=".5" opacity=".5" />
  </svg>

  <!-- BUILD STATE -->
  <div v-else class="ship-visual">
    <svg viewBox="0 0 100 100" class="ship-svg">
      <defs>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#b6e3f4" /></linearGradient>
        <linearGradient id="sea3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2980b9" /><stop offset="100%" stop-color="#1a5276" /></linearGradient>
      </defs>
      <rect width="100" height="68" fill="url(#sky3)" />
      <rect y="68" width="100" height="32" fill="url(#sea3)" />
      <path d="M0,70 Q10,67 20,70 Q30,73 40,70 Q50,67 60,70 Q70,73 80,70 Q90,67 100,70" fill="none" stroke="#fff" stroke-width=".5" opacity=".5" />

      <!-- Empty state -->
      <template v-if="!built.hull && !built.sails && !built.crew && !built.anchor">
        <text x="50" y="38" text-anchor="middle" font-size="4" fill="#7f8c8d">Drag code to build your ship!</text>
        <text x="50" y="55" text-anchor="middle" font-size="7">🏴‍☠️</text>
        <text x="50" y="64" text-anchor="middle" font-size="3" fill="#fff" opacity=".7">SPLASH!</text>
        <circle cx="42" cy="68" r="1.5" fill="#fff" opacity=".5" />
        <circle cx="50" cy="69" r="2" fill="#fff" opacity=".4" />
        <circle cx="58" cy="68" r="1.5" fill="#fff" opacity=".5" />
        <text x="50" y="78" text-anchor="middle" font-size="3" fill="#fbbf24">Build me a ship, quick!</text>
      </template>

      <!-- Hull -->
      <polygon v-if="built.hull" points="30,62 70,62 65,75 35,75" fill="#8B4513" stroke="#5C2E00" stroke-width=".5" />
      <text v-if="built.hull" x="50" y="71" text-anchor="middle" font-size="4" fill="#fbbf24" font-weight="bold" font-family="Georgia,serif">{{ initials }}</text>
      <rect v-if="built.hull" x="48" :y="built.sails ? 35 : 45" width="2" :height="built.sails ? 27 : 17" fill="#5C2E00" />

      <!-- Sails -->
      <template v-if="built.sails">
        <polygon points="50,35 50,55 72,50" fill="#fff" stroke="#ddd" stroke-width=".3" />
        <polygon points="50,37 50,52 32,48" fill="#ffe" stroke="#ddd" stroke-width=".3" />
      </template>

      <!-- Crew -->
      <template v-if="built.crew">
        <text x="40" y="60" font-size="4">🏴‍☠️</text>
        <text x="52" y="60" font-size="4">🏴‍☠️</text>
        <text x="46" y="60" font-size="3">🏴‍☠️</text>
      </template>

      <!-- Anchor -->
      <text v-if="built.anchor" x="33" y="72" font-size="5">⚓</text>

      <!-- Captain on hull -->
      <text v-if="built.hull" x="50" y="59" font-size="5">🏴‍☠️</text>
    </svg>
  </div>
</template>

<style scoped>
.ship-visual {
  position: relative;
  width: 100%;
  height: 100%;
}
.ship-svg {
  width: 100%;
  height: 100%;
}
</style>
