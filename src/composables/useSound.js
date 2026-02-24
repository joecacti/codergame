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

// --- Background pirate music (synthesized sea shanty loop) ---
let musicPlaying = false
let musicStarted = false // tracks if player has entered the game
let musicNodes = []

function stopMusic() {
  musicNodes.forEach((n) => {
    try { n.stop?.() } catch {}
    try { n.disconnect?.() } catch {}
  })
  musicNodes = []
  musicPlaying = false
}

function startMusic() {
  if (musicPlaying) return
  musicPlaying = true
  musicStarted = true

  const c = getCtx()
  const master = c.createGain()
  master.gain.value = 0.06
  master.connect(c.destination)

  // --- Melody: accordion/concertina feel (square wave, soft) ---
  // A gentle pentatonic sea-shanty phrase, 6/8 time feel
  //   D4  E4  G4  A4  B4  A4  G4  E4   (repeating, swung)
  const melodyNotes = [
    // phrase 1
    [293.66, 0.35], [329.63, 0.35], [392.00, 0.35], [440.00, 0.55],
    [493.88, 0.35], [440.00, 0.35], [392.00, 0.35], [329.63, 0.55],
    // phrase 2 (variation)
    [293.66, 0.35], [392.00, 0.35], [440.00, 0.35], [493.88, 0.55],
    [440.00, 0.35], [392.00, 0.35], [329.63, 0.35], [293.66, 0.55],
    // phrase 3 (higher)
    [392.00, 0.35], [440.00, 0.35], [493.88, 0.35], [587.33, 0.55],
    [493.88, 0.35], [440.00, 0.35], [392.00, 0.35], [329.63, 0.55],
    // phrase 4 (resolve)
    [440.00, 0.35], [392.00, 0.35], [329.63, 0.35], [293.66, 0.75],
    [0, 0.45], // rest
    [293.66, 0.35], [329.63, 0.55],
  ]

  // --- Bass: simple root notes, triangle wave ---
  const bassNotes = [
    [146.83, 1.4], [110.00, 1.4], [130.81, 1.4], [146.83, 1.4],
    [110.00, 1.4], [146.83, 1.4], [130.81, 1.4], [110.00, 1.4],
    [146.83, 1.4], [130.81, 1.4], [110.00, 1.4], [146.83, 1.6],
  ]

  function loopLine(notes, type, gain, detune = 0) {
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
        // soft attack/release envelope
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
    // schedule first two loops ahead, then keep scheduling
    schedule()
    schedule()
    const loopDur = notes.reduce((s, [, d]) => s + d, 0) * 2 * 1000
    const iv = setInterval(() => {
      if (!musicPlaying) { clearInterval(iv); return }
      schedule()
    }, loopDur * 0.8)
    musicNodes.push({ stop() {}, disconnect() { clearInterval(iv) } })
  }

  loopLine(melodyNotes, 'square', 0.09, 5)
  loopLine(bassNotes, 'triangle', 0.14, 0)

  // --- Gentle wave noise (filtered white noise, very soft) ---
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
  noiseFilter.frequency.value = 400
  const noiseGain = c.createGain()
  noiseGain.gain.value = 0.025
  noiseSource.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(master)
  noiseSource.start()
  musicNodes.push(noiseSource, master)
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
      if (muted.value) stopMusic()
      else if (musicStarted) startMusic()
    },

    startMusic() {
      if (!muted.value) startMusic()
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
