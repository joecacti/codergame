import { ref, watch } from 'vue'

const muted = ref(localStorage.getItem('pirates-muted') === 'true')

watch(muted, (v) => localStorage.setItem('pirates-muted', v))

let ctx = null
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(freq, duration, type = 'sine', gain = 0.15) {
  if (muted.value) return
  const c = getCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

function playSequence(notes, type = 'sine', gain = 0.12) {
  if (muted.value) return
  const c = getCtx()
  let t = c.currentTime
  for (const [freq, dur] of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = gain
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(t)
    osc.stop(t + dur)
    t += dur * 0.7
  }
}

function playNoise(duration, gain = 0.08) {
  if (muted.value) return
  const c = getCtx()
  const bufferSize = c.sampleRate * duration
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = c.createBufferSource()
  source.buffer = buffer
  const g = c.createGain()
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  source.connect(g)
  g.connect(c.destination)
  source.start()
}

// --- Background music system (per-screen synthesized tracks) ---
let musicPlaying = false
let currentTrack = null
let musicNodes = []

function stopMusic() {
  musicNodes.forEach((n) => {
    try { n.stop?.() } catch {}
    try { n.disconnect?.() } catch {}
  })
  musicNodes = []
  musicPlaying = false
  currentTrack = null
}

function addNoise(c, master, filterFreq = 400, gain = 0.025) {
  const noiseLen = 4
  const bufferSize = c.sampleRate * noiseLen
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noiseSource = c.createBufferSource()
  noiseSource.buffer = buffer
  noiseSource.loop = true
  const noiseFilter = c.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = filterFreq
  const noiseGain = c.createGain()
  noiseGain.gain.value = gain
  noiseSource.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(master)
  noiseSource.start()
  musicNodes.push(noiseSource)
}

function loopLine(c, master, notes, type, gain, detune = 0) {
  let t = c.currentTime + 0.1
  function schedule() {
    for (const [freq, dur] of notes) {
      if (!musicPlaying) return
      if (freq === 0) { t += dur; continue }
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = type
      osc.frequency.value = freq
      osc.detune.value = detune
      g.gain.value = gain
      g.gain.setValueAtTime(0.001, t)
      g.gain.linearRampToValueAtTime(gain, t + 0.04)
      g.gain.linearRampToValueAtTime(gain * 0.7, t + dur * 0.6)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.01)
      osc.connect(g)
      g.connect(master)
      osc.start(t)
      osc.stop(t + dur)
      musicNodes.push(osc)
      t += dur
    }
  }
  schedule()
  schedule()
  const loopDur = notes.reduce((s, [, d]) => s + d, 0) * 2 * 1000
  const iv = setInterval(() => {
    if (!musicPlaying) { clearInterval(iv); return }
    schedule()
  }, loopDur * 0.8)
  musicNodes.push({ stop() {}, disconnect() { clearInterval(iv) } })
}

// --- Track: Login (gentle harbor tavern — slow, warm, inviting) ---
function playLoginMusic() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.05
  master.connect(c.destination)
  musicNodes.push(master)

  // Slow, warm melody — C major, music-box feel (sine wave)
  const melody = [
    [261.63, 0.5], [329.63, 0.5], [392.00, 0.5], [329.63, 0.5],
    [261.63, 0.5], [293.66, 0.5], [349.23, 0.7], [0, 0.3],
    [329.63, 0.5], [392.00, 0.5], [440.00, 0.5], [392.00, 0.5],
    [349.23, 0.5], [329.63, 0.5], [261.63, 0.7], [0, 0.3],
    [392.00, 0.5], [440.00, 0.5], [523.25, 0.7], [440.00, 0.3],
    [392.00, 0.5], [349.23, 0.5], [329.63, 0.7], [0, 0.3],
    [293.66, 0.5], [329.63, 0.5], [261.63, 0.7], [0, 0.5],
  ]
  const bass = [
    [130.81, 2.0], [146.83, 2.0], [164.81, 2.0], [130.81, 2.0],
    [174.61, 2.0], [164.81, 2.0], [146.83, 2.0], [130.81, 2.2],
  ]

  loopLine(c, master, melody, 'sine', 0.10, 0)
  loopLine(c, master, bass, 'triangle', 0.12, 0)
  addNoise(c, master, 300, 0.02)
}

// --- Track: Level 1 (upbeat building theme — bouncy, energetic) ---
function playLevel1Music() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.06
  master.connect(c.destination)
  musicNodes.push(master)

  // Shanty work-song feel, D major pentatonic, square wave accordion
  const melody = [
    [293.66, 0.3], [329.63, 0.3], [392.00, 0.3], [440.00, 0.5],
    [493.88, 0.3], [440.00, 0.3], [392.00, 0.3], [329.63, 0.5],
    [293.66, 0.3], [392.00, 0.3], [440.00, 0.3], [493.88, 0.5],
    [440.00, 0.3], [392.00, 0.3], [329.63, 0.3], [293.66, 0.5],
    [392.00, 0.3], [440.00, 0.3], [493.88, 0.3], [587.33, 0.5],
    [493.88, 0.3], [440.00, 0.3], [392.00, 0.3], [329.63, 0.5],
    [440.00, 0.3], [392.00, 0.3], [329.63, 0.3], [293.66, 0.7],
    [0, 0.4], [293.66, 0.3], [329.63, 0.5],
  ]
  const bass = [
    [146.83, 1.2], [110.00, 1.2], [130.81, 1.2], [146.83, 1.2],
    [110.00, 1.2], [146.83, 1.2], [130.81, 1.2], [110.00, 1.2],
    [146.83, 1.2], [130.81, 1.2], [110.00, 1.2], [146.83, 1.4],
  ]

  loopLine(c, master, melody, 'square', 0.09, 5)
  loopLine(c, master, bass, 'triangle', 0.14, 0)
  addNoise(c, master, 400, 0.025)
}

// --- Track: Level 2 (adventurous sailing — faster, driving rhythm) ---
function playLevel2Music() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.06
  master.connect(c.destination)
  musicNodes.push(master)

  // Fast-paced adventure in G major, sawtooth for urgency
  const melody = [
    [392.00, 0.25], [440.00, 0.25], [493.88, 0.25], [587.33, 0.4],
    [523.25, 0.25], [493.88, 0.25], [440.00, 0.25], [392.00, 0.4],
    [493.88, 0.25], [587.33, 0.25], [659.25, 0.25], [587.33, 0.4],
    [523.25, 0.25], [493.88, 0.25], [440.00, 0.25], [392.00, 0.4],
    [587.33, 0.25], [659.25, 0.25], [783.99, 0.4], [659.25, 0.25],
    [587.33, 0.25], [523.25, 0.25], [493.88, 0.25], [440.00, 0.4],
    [493.88, 0.25], [440.00, 0.25], [392.00, 0.4], [0, 0.35],
    [392.00, 0.25], [440.00, 0.4],
  ]
  const bass = [
    [196.00, 1.0], [220.00, 1.0], [246.94, 1.0], [196.00, 1.0],
    [246.94, 1.0], [261.63, 1.0], [220.00, 1.0], [196.00, 1.0],
    [246.94, 1.0], [220.00, 1.0], [196.00, 1.2],
  ]
  // Rhythmic percussion layer — short triangle pops
  const perc = [
    [80, 0.08], [0, 0.17], [80, 0.08], [0, 0.17],
    [120, 0.08], [0, 0.17], [80, 0.08], [0, 0.17],
    [80, 0.08], [0, 0.17], [80, 0.08], [0, 0.17],
    [120, 0.08], [0, 0.17], [80, 0.08], [0, 0.42],
  ]

  loopLine(c, master, melody, 'square', 0.08, 3)
  loopLine(c, master, bass, 'triangle', 0.13, 0)
  loopLine(c, master, perc, 'triangle', 0.10, 0)
  addNoise(c, master, 500, 0.02)
}

// --- Track: Gary's Island (mysterious, eerie — minor key, slow) ---
function playGaryIslandMusic() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.05
  master.connect(c.destination)
  musicNodes.push(master)

  // E minor / phrygian, slow and haunting, sine wave
  const melody = [
    [329.63, 0.7], [311.13, 0.7], [293.66, 0.7], [329.63, 0.9],
    [0, 0.4],
    [392.00, 0.7], [369.99, 0.7], [329.63, 0.9], [0, 0.4],
    [293.66, 0.7], [329.63, 0.7], [311.13, 0.7], [293.66, 0.9],
    [0, 0.4],
    [246.94, 0.7], [261.63, 0.7], [293.66, 0.7], [329.63, 1.1],
    [0, 0.6],
  ]
  const bass = [
    [164.81, 2.8], [146.83, 2.8], [155.56, 2.8], [164.81, 3.0],
  ]
  // Eerie pad — detuned sine drones
  const pad = [
    [164.81, 5.6], [155.56, 5.6],
  ]

  loopLine(c, master, melody, 'sine', 0.08, 0)
  loopLine(c, master, bass, 'triangle', 0.10, 0)
  loopLine(c, master, pad, 'sine', 0.05, 8)
  addNoise(c, master, 250, 0.03)
}

// --- Track: Victory (triumphant fanfare — plays once, then gentle loop) ---
function playVictoryMusic() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.07
  master.connect(c.destination)
  musicNodes.push(master)

  // Fanfare intro (plays once) — C major triumphant
  const fanfare = [
    [523.25, 0.3], [523.25, 0.15], [523.25, 0.15], [659.25, 0.4],
    [587.33, 0.3], [659.25, 0.3], [783.99, 0.6],
    [0, 0.2],
    [783.99, 0.3], [880.00, 0.3], [1046.50, 0.8],
    [0, 0.3],
  ]

  let t = c.currentTime + 0.1
  for (const [freq, dur] of fanfare) {
    if (freq === 0) { t += dur; continue }
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    g.gain.value = 0.10
    g.gain.setValueAtTime(0.001, t)
    g.gain.linearRampToValueAtTime(0.10, t + 0.03)
    g.gain.linearRampToValueAtTime(0.07, t + dur * 0.6)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.01)
    osc.connect(g)
    g.connect(master)
    osc.start(t)
    osc.stop(t + dur)
    musicNodes.push(osc)
    t += dur
  }

  // After fanfare, start a gentle celebratory loop
  const fanfareDur = fanfare.reduce((s, [, d]) => s + d, 0) * 1000
  const loopTimeout = setTimeout(() => {
    if (!musicPlaying) return
    const celebMelody = [
      [523.25, 0.45], [587.33, 0.45], [659.25, 0.45], [523.25, 0.6],
      [659.25, 0.45], [783.99, 0.45], [659.25, 0.45], [587.33, 0.6],
      [523.25, 0.45], [659.25, 0.45], [783.99, 0.6], [0, 0.3],
      [659.25, 0.45], [587.33, 0.45], [523.25, 0.7], [0, 0.4],
    ]
    const celebBass = [
      [261.63, 1.8], [293.66, 1.8], [261.63, 1.8], [246.94, 1.8],
      [261.63, 1.8], [293.66, 1.8], [246.94, 2.0],
    ]
    loopLine(c, master, celebMelody, 'sine', 0.08, 0)
    loopLine(c, master, celebBass, 'triangle', 0.10, 0)
  }, fanfareDur + 200)
  musicNodes.push({ stop() {}, disconnect() { clearTimeout(loopTimeout) } })
}

// --- Track: Level 3 (intense challenge — minor key, driving, dramatic) ---
function playLevel3Music() {
  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.06
  master.connect(c.destination)
  musicNodes.push(master)

  // A minor, intense and dramatic, square wave with urgency
  const melody = [
    [440.00, 0.22], [493.88, 0.22], [523.25, 0.22], [587.33, 0.35],
    [523.25, 0.22], [493.88, 0.22], [440.00, 0.35], [0, 0.15],
    [523.25, 0.22], [587.33, 0.22], [659.25, 0.35], [587.33, 0.22],
    [523.25, 0.22], [493.88, 0.22], [440.00, 0.35], [0, 0.15],
    [659.25, 0.22], [698.46, 0.22], [659.25, 0.22], [587.33, 0.35],
    [523.25, 0.22], [493.88, 0.22], [440.00, 0.22], [415.30, 0.35],
    [440.00, 0.35], [493.88, 0.22], [523.25, 0.35], [440.00, 0.5],
    [0, 0.3],
  ]
  const bass = [
    [220.00, 0.9], [196.00, 0.9], [174.61, 0.9], [220.00, 0.9],
    [196.00, 0.9], [174.61, 0.9], [164.81, 0.9], [220.00, 1.1],
  ]
  // Fast rhythmic pulse
  const perc = [
    [100, 0.06], [0, 0.12], [100, 0.06], [0, 0.12],
    [150, 0.06], [0, 0.12], [100, 0.06], [0, 0.06],
    [100, 0.06], [0, 0.12], [100, 0.06], [0, 0.12],
    [150, 0.06], [0, 0.12], [100, 0.06], [0, 0.12],
  ]

  loopLine(c, master, melody, 'square', 0.08, 4)
  loopLine(c, master, bass, 'sawtooth', 0.07, 0)
  loopLine(c, master, perc, 'triangle', 0.09, 0)
  addNoise(c, master, 350, 0.02)
}

const TRACKS = {
  login: playLoginMusic,
  level1: playLevel1Music,
  level2: playLevel2Music,
  level3: playLevel3Music,
  garyIsland: playGaryIslandMusic,
  victory: playVictoryMusic,
}

function startMusic(track = 'login') {
  if (currentTrack === track && musicPlaying) return
  stopMusic()
  musicPlaying = true
  currentTrack = track
  const play = TRACKS[track]
  if (play) play()
}

// React to mute changes
watch(muted, (v) => {
  if (v) stopMusic()
})

export function useSound() {
  return {
    muted,
    toggleMute() {
      muted.value = !muted.value
      if (muted.value) {
        stopMusic()
      } else if (currentTrack) {
        const track = currentTrack
        stopMusic()
        startMusic(track)
      }
    },

    startMusic(track = 'login') {
      if (!muted.value) startMusic(track)
      else currentTrack = track // remember for when unmuted
    },

    stopMusic,

    click() { playTone(880, 0.08, 'sine', 0.1) },

    correct() { playSequence([[523, 0.12], [659, 0.12], [784, 0.18]], 'sine', 0.12) },

    wrong() { playSequence([[400, 0.15], [300, 0.2]], 'sawtooth', 0.08) },

    drop() { playTone(200, 0.12, 'triangle', 0.15) },

    badge() {
      playSequence([
        [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.2],
      ], 'sine', 0.1)
    },

    splash() { playNoise(0.4, 0.1) },

    launch() {
      if (muted.value) return
      const c = getCtx()
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = 200
      osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.3)
      g.gain.value = 0.08
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35)
      osc.connect(g)
      g.connect(c.destination)
      osc.start()
      osc.stop(c.currentTime + 0.35)
    },
  }
}
