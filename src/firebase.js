import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCKiIEhv3_xXEarvsttEjJDo_krs9e_IBA",
  authDomain: "math-game-vm.firebaseapp.com",
  projectId: "math-game-vm",
  storageBucket: "math-game-vm.firebasestorage.app",
  messagingSenderId: "460625624553",
  appId: "1:460625624553:web:0649e9e12250146447df78"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const STATS_DOC = doc(db, 'stats', 'main')
const LS_KEY = 'mathGameStats'
const LS_PENDING = 'mathGamePending' // flag: needs sync to Firebase

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const defaultStats = {
  totalGames: 0,
  totalCorrect: 0,
  totalWrong: 0,
  starCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  totalStars: 0,
  bestScore: 0,
  daily: {},
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { ...defaultStats }
  } catch { return { ...defaultStats } }
}

function lsSave(stats) {
  localStorage.setItem(LS_KEY, JSON.stringify(stats))
}

function setPending(v) {
  localStorage.setItem(LS_PENDING, v ? '1' : '0')
}

export function isPending() {
  return localStorage.getItem(LS_PENDING) === '1'
}

// ── Firebase helpers ──────────────────────────────────────────────────────────

async function fbLoad() {
  const snap = await getDoc(STATS_DOC)
  return snap.exists() ? snap.data() : null
}

async function fbSave(stats) {
  await setDoc(STATS_DOC, stats)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function loadStats() {
  // Always read localStorage first (instant)
  const local = lsLoad()

  // Try to sync from Firebase if we have network
  try {
    const remote = await fbLoad()
    if (remote) {
      // Merge: take whichever has more games (handles multi-device)
      const merged = (remote.totalGames || 0) >= (local.totalGames || 0) ? remote : local
      lsSave(merged)
      setPending(false)
      return merged
    }
  } catch { /* offline — use local */ }

  return local
}

export async function saveStats(stats) {
  // 1. Save to localStorage immediately
  lsSave(stats)

  // 2. Try Firebase
  try {
    await fbSave(stats)
    setPending(false)
  } catch {
    // Mark as pending sync
    setPending(true)
  }
}

// Called on app start — push any pending local data to Firebase
export async function syncPending() {
  if (!isPending()) return false
  try {
    const local = lsLoad()
    await fbSave(local)
    setPending(false)
    return true
  } catch {
    return false
  }
}

export async function addGameResult(avgStars, correct, wrong) {
  const stats = lsLoad() // read locally — no await needed
  const flooredKey = Math.floor(avgStars)
  const today = todayKey()
  const prevDaily = stats.daily?.[today] || { games: 0, totalStars: 0, correct: 0, wrong: 0 }

  const updated = {
    ...stats,
    totalGames: (stats.totalGames || 0) + 1,
    totalCorrect: (stats.totalCorrect || 0) + correct,
    totalWrong: (stats.totalWrong || 0) + wrong,
    totalStars: (stats.totalStars || 0) + avgStars,
    bestScore: Math.max(stats.bestScore || 0, avgStars),
    starCounts: {
      ...stats.starCounts,
      [flooredKey]: ((stats.starCounts?.[flooredKey] || 0) + 1),
    },
    daily: {
      ...stats.daily,
      [today]: {
        games: prevDaily.games + 1,
        totalStars: prevDaily.totalStars + avgStars,
        correct: (prevDaily.correct || 0) + correct,
        wrong: (prevDaily.wrong || 0) + wrong,
      },
    },
  }

  await saveStats(updated)
  return updated
}

export async function clearStats() {
  await saveStats({ ...defaultStats })
}

export function getTodayStats(stats) {
  const today = todayKey()
  const d = stats?.daily?.[today]
  if (!d || d.games === 0) return null
  return {
    games: d.games,
    avgStars: Math.round((d.totalStars / d.games) * 10) / 10,
    correct: d.correct || 0,
    wrong: d.wrong || 0,
  }
}
