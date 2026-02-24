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

export function useSound() {
  return {
    muted,
    toggleMute() { muted.value = !muted.value },

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
