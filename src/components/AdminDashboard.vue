<script setup>
import { computed } from 'vue'
import { FAKE_PLAYERS } from '../data/codeBlocks.js'

const props = defineProps({
  currentPlayer: { type: Object, default: null },
})
const emit = defineEmits(['back'])

const sorted = computed(() => {
  const players = props.currentPlayer
    ? [{ initials: props.currentPlayer.initials, level: props.currentPlayer.level, badges: props.currentPlayer.badges, time: props.currentPlayer.time }, ...FAKE_PLAYERS]
    : [...FAKE_PLAYERS]
  return players.sort((a, b) => b.badges - a.badges || b.level - a.level)
})

const stats = computed(() => {
  const s = sorted.value
  return [
    { label: 'Total Students', val: s.length, icon: '👥' },
    { label: 'Avg Level', val: (s.reduce((a, p) => a + p.level, 0) / s.length).toFixed(1), icon: '📊' },
    { label: 'Avg Badges', val: (s.reduce((a, p) => a + p.badges, 0) / s.length).toFixed(1), icon: '🏅' },
  ]
})

const concepts = [
  { name: 'Variables', pct: 95 },
  { name: 'IF/ELSE', pct: 80 },
  { name: 'Loops', pct: 65 },
  { name: 'Functions', pct: 50 },
  { name: 'Arrays', pct: 30 },
  { name: 'Debugging', pct: 70 },
]

function rankDisplay(i) {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return `#${i + 1}`
}

function rankColor(i) {
  if (i === 0) return '#fbbf24'
  if (i === 1) return '#c0c0c0'
  if (i === 2) return '#cd7f32'
  return '#666'
}

function barColor(pct) {
  if (pct > 70) return '#22c55e'
  if (pct > 40) return '#fbbf24'
  return '#ef4444'
}
</script>

<template>
  <div class="admin">
    <!-- Header -->
    <div class="admin-header">
      <div class="admin-header-left">
        <img src="/images/pirate-kit/flag-pirate-high.png" alt="" class="admin-flag" />
        <div>
          <div class="admin-title">🔑 Admin Dashboard</div>
          <div class="admin-subtitle">Pirates of the Coderbbean — Class Progress</div>
        </div>
      </div>
      <button @click="$emit('back')" class="back-btn">← Back</button>
    </div>

    <div class="admin-body">
      <!-- Stats cards -->
      <div class="stats-row">
        <img src="/images/pirate-kit/tower-complete-large.png" alt="" class="stats-tower" />
        <div v-for="(s, i) in stats" :key="i" class="stat-card">
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-val">{{ s.val }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="leaderboard">
        <div class="lb-header"><img src="/images/pirate-kit/chest.png" alt="" class="lb-chest" /> Leaderboard</div>
        <div class="lb-columns">
          <span>Rank</span><span>Ship</span><span>Captain</span><span>Level</span><span>Badges</span><span>Time</span>
        </div>
        <div
          v-for="(p, i) in sorted" :key="i"
          class="lb-row"
          :class="{ first: i === 0 }"
        >
          <span class="lb-rank" :style="{ color: rankColor(i) }">{{ rankDisplay(i) }}</span>
          <span class="lb-ship">
            <img src="/images/pirate-kit/ship-pirate-small.png" alt="" class="lb-ship-img" />
          </span>
          <span class="lb-name">Captain {{ p.initials }}</span>
          <span class="lb-level">Level {{ p.level }}</span>
          <span><span class="badge-pill">{{ p.badges }}/6</span></span>
          <span class="lb-time">{{ p.time }}</span>
        </div>
      </div>

      <!-- Concept Mastery -->
      <div class="mastery">
        <div class="mastery-title"><img src="/images/pirate-kit/cannon-ball.png" alt="" class="mastery-icon" /> Concept Mastery</div>
        <div v-for="c in concepts" :key="c.name" class="mastery-row">
          <div class="mastery-label">
            <span>{{ c.name }}</span>
            <span class="mastery-pct">{{ c.pct }}% mastered</span>
          </div>
          <div class="mastery-track">
            <div class="mastery-fill" :style="{ width: c.pct + '%', background: barColor(c.pct) }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a1628 0%, #1a2a4a 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
}
.admin-header {
  background: rgba(0,0,0,.3);
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.admin-title { font-size: 16px; font-weight: 700; color: #fbbf24; font-family: Georgia, serif; }
.admin-subtitle { font-size: 11px; color: #888; }
.back-btn {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 6px;
  padding: 6px 14px;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}
.back-btn::before { display: none; }

.admin-body { padding: 20px; max-width: 700px; margin: 0 auto; }

.stats-row { display: flex; gap: 12px; margin-bottom: 24px; }
.stat-card {
  flex: 1;
  background: rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 16px 14px;
  text-align: center;
}
.stat-icon { font-size: 24px; }
.stat-val { font-size: 22px; font-weight: 700; color: #fbbf24; margin-top: 4px; }
.stat-label { font-size: 11px; color: #888; }

.leaderboard {
  background: rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  overflow: hidden;
}
.lb-header { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 14px; font-weight: 600; color: #fbbf24; }
.lb-columns {
  display: grid;
  grid-template-columns: 40px 60px 1fr 70px 70px 70px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #666;
}
.lb-row {
  display: grid;
  grid-template-columns: 40px 60px 1fr 70px 70px 70px;
  padding: 10px 16px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.lb-row.first { background: rgba(251,191,36,.05); }
.lb-rank { font-size: 14px; font-weight: 700; }
.lb-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.lb-level { font-size: 12px; color: #888; }
.badge-pill {
  background: rgba(251,191,36,.12);
  border: 1px solid rgba(251,191,36,.3);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  color: #fbbf24;
}
.lb-time { font-size: 12px; color: #888; font-family: monospace; }

.mastery {
  margin-top: 16px;
  background: rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 16px;
}
.mastery-title { font-size: 14px; font-weight: 600; color: #fbbf24; margin-bottom: 12px; }
.mastery-row { margin-bottom: 10px; }
.mastery-label { display: flex; justify-content: space-between; font-size: 12px; color: #ccc; margin-bottom: 3px; }
.mastery-pct { color: #888; }
.mastery-track { height: 8px; background: rgba(255,255,255,.06); border-radius: 4px; overflow: hidden; }
.mastery-fill { height: 100%; border-radius: 4px; }

/* Pirate kit asset styles */
.admin-header-left { display: flex; align-items: center; gap: 12px; }
.admin-flag { width: 40px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.4)); }
.stats-tower { width: 40px; opacity: .25; filter: drop-shadow(0 2px 6px rgba(0,0,0,.4)); align-self: center; }
.lb-chest { width: 24px; vertical-align: middle; margin-right: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
.lb-ship-img { width: 44px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.4)); }
.mastery-icon { width: 20px; vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 1px 3px rgba(0,0,0,.3)); }

/* iPad / tablet */
@media (max-width: 1024px) {
  .admin-body { padding: 16px; max-width: 100%; }
  .stats-row { flex-wrap: wrap; }
  .stat-card { min-width: 120px; }
  .lb-columns, .lb-row {
    grid-template-columns: 36px 50px 1fr 56px 56px 56px;
    padding: 8px 12px;
    font-size: 11px;
  }
  .lb-ship-img { width: 36px; }
}

@media (max-width: 768px) {
  .lb-columns, .lb-row {
    grid-template-columns: 32px 40px 1fr 50px 50px;
  }
  .lb-columns span:last-child, .lb-row .lb-time { display: none; }
}
</style>
