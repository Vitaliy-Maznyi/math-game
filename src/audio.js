const BASE = import.meta.env.BASE_URL

let bgm = null
let bgmStarted = false
let muted = localStorage.getItem('mathGameMuted') === 'true'
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  // Resume if suspended (iOS requires this after user gesture)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

export function isMuted() { return muted }

export function toggleMute() {
  muted = !muted
  localStorage.setItem('mathGameMuted', String(muted))
  if (bgm) bgm.volume = muted ? 0 : 0.35
  return muted
}

// Call on every user interaction — resumes BGM after iOS autoplay block
export function resumeBGM() {
  if (!bgm) {
    bgm = new Audio(`${BASE}audio/bg_music.ogg`)
    bgm.loop = true
    bgm.volume = muted ? 0 : 0.35
  }
  if (!bgmStarted || bgm.paused) {
    bgm.play().then(() => { bgmStarted = true }).catch(() => {})
  }
}

export function startBGM() { resumeBGM() }

export function stopBGM() {
  if (bgm) { bgm.pause(); bgm.currentTime = 0; bgmStarted = false }
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
    // Deep bass thud — low sine + sub-bass, friendly not harsh
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(120, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(60, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5)

    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.start(); osc1.stop(ctx.currentTime + 0.5)
    osc2.start(); osc2.stop(ctx.currentTime + 0.5)
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
    osc.start(); osc.stop(ctx.currentTime + 0.5)
  } catch (e) {}
}

export function playGameWin() {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0.35, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t); osc.stop(t + 0.3)
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
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t); osc.stop(t + 0.35)
    })
  } catch (e) {}
}
