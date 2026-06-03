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

// Today's date as YYYY-MM-DD key
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const defaultStats = {
  totalGames: 0,
  starCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  totalStars: 0,
  bestScore: 0,
  daily: {}, // { "2026-06-03": { games: 3, totalStars: 12.5 }, ... }
}

export async function loadStats() {
  try {
    const snap = await getDoc(STATS_DOC)
    if (snap.exists()) {
      const data = snap.data()
      localStorage.setItem('mathGameStats', JSON.stringify(data))
      return data
    }
    return { ...defaultStats }
  } catch (e) {
    console.error('Firebase load error:', e)
    const local = localStorage.getItem('mathGameStats')
    return local ? JSON.parse(local) : { ...defaultStats }
  }
}

export async function saveStats(stats) {
  try {
    await setDoc(STATS_DOC, stats)
    localStorage.setItem('mathGameStats', JSON.stringify(stats))
  } catch (e) {
    console.error('Firebase save error:', e)
    localStorage.setItem('mathGameStats', JSON.stringify(stats))
  }
}

export async function addGameResult(avgStars) {
  const stats = await loadStats()
  const flooredKey = Math.floor(avgStars)
  const today = todayKey()
  const prevDaily = stats.daily?.[today] || { games: 0, totalStars: 0 }

  const updated = {
    ...stats,
    totalGames: (stats.totalGames || 0) + 1,
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
  }
}
