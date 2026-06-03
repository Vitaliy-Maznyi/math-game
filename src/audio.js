// Audio manager — handles BGM + SFX with mute toggle
// BGM: Children's March Theme (OGG loop)
// SFX correct: Win sound (WAV)
// SFX wrong: Web Audio API generated buzz
// SFX game end: fanfare via Web Audio API

const BASE = import.meta.env.BASE_URL

let bgm = null
let muted = localStorage.getItem('mathGameMuted') === 'true'
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

export function isMuted() {
  return muted
}

export function toggleMute() {
  muted = !muted
  localStorage.setItem('mathGameMuted', String(muted))
  if (bgm) bgm.volume = muted ? 0 : 0.35
  return muted
}

export function startBGM() {
  if (bgm) return
  bgm = new Audio(`${BASE}audio/bg_music.ogg`)
  bgm.loop = true
  bgm.volume = muted ? 0 : 0.35
  bgm.play().catch(() => {}) // ignore autoplay block
}

export function stopBGM() {
  if (bgm) { bgm.pause(); bgm.currentTime = 0 }
}

// Preload win sound
let winBuffer = null
async function loadWin() {
  if (winBuffer) return winBuffer
  try {
    const ctx = getAudioCtx()
    const resp = await fetch(`${BASE}audio/win.wav`)
    const arr = await resp.arrayBuffer()
    winBuffer = await ctx.decodeAudioData(arr)
  } catch (e) { console.warn('win sound load failed', e) }
  return winBuffer
}
loadWin()

export function playCorrect() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    if (winBuffer) {
      const src = ctx.createBufferSource()
      src.buffer = winBuffer
      // Shorten to ~0.8s by speeding up slightly
      src.playbackRate.value = 1.3
      const gain = ctx.createGain()
      gain.gain.value = 0.7
      src.connect(gain)
      gain.connect(ctx.destination)
      src.start()
      src.stop(ctx.currentTime + 0.8)
    }
  } catch (e) {}
}

export function playWrong() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {}
}

export function playTimeout() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15)
    osc.frequency.setValueAtTime(220, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch (e) {}
}

export function playGameWin() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    // Little fanfare: C-E-G-C
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0.35, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch (e) {}
}

export function playGameLose() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    const notes = [523, 415, 330]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    })
  } catch (e) {}
}
