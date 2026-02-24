import { ref, computed, watch } from 'vue'

const RANKS = [
  { min: 0, title: 'Deck Swabber', emoji: '\u{1F9F9}' },
  { min: 50, title: 'First Mate', emoji: '\u2693' },
  { min: 150, title: 'Captain', emoji: '\u{1F3F4}\u200D\u2620\uFE0F' },
  { min: 300, title: 'Admiral', emoji: '\u{1F451}' },
]

const stored = JSON.parse(localStorage.getItem('pirates-progress') || '{}')
const xp = ref(stored.xp || 0)
const floats = ref([])
let floatId = 0

function save() {
  localStorage.setItem('pirates-progress', JSON.stringify({ xp: xp.value }))
}

watch(xp, save)

const rank = computed(() => {
  let r = RANKS[0]
  for (const rank of RANKS) {
    if (xp.value >= rank.min) r = rank
  }
  return r
})

const nextRank = computed(() => {
  for (const r of RANKS) {
    if (xp.value < r.min) return r
  }
  return null
})

const xpToNext = computed(() => {
  if (!nextRank.value) return 0
  return nextRank.value.min - xp.value
})

const xpProgress = computed(() => {
  if (!nextRank.value) return 100
  const prev = rank.value.min
  const next = nextRank.value.min
  return ((xp.value - prev) / (next - prev)) * 100
})

function addXp(amount, label) {
  xp.value += amount
  const id = ++floatId
  floats.value.push({ id, amount, label: label || `+${amount} XP` })
  setTimeout(() => { floats.value = floats.value.filter(f => f.id !== id) }, 1500)
}

function awardCorrectDrop() { addXp(10, '+10 XP') }
function awardCorrectDodge() { addXp(15, '+15 XP') }
function awardFirstTry() { addXp(5, '+5 BONUS') }
function awardLevelComplete() { addXp(50, '+50 XP Level Complete!') }
function spendHint() { if (xp.value >= 5) { xp.value -= 5 } }

export function useProgress() {
  return {
    xp,
    rank,
    nextRank,
    xpToNext,
    xpProgress,
    floats,
    addXp,
    awardCorrectDrop,
    awardCorrectDodge,
    awardFirstTry,
    awardLevelComplete,
    spendHint,
    RANKS,
  }
}
