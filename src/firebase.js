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

const defaultStats = {
  totalGames: 0,
  starCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  totalStars: 0,
  bestScore: 0,
}

export async function loadStats() {
  try {
    const snap = await getDoc(STATS_DOC)
    if (snap.exists()) {
      return snap.data()
    }
    return { ...defaultStats }
  } catch (e) {
    console.error('Firebase load error:', e)
    // fallback to localStorage
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
  const rounded = Math.round(avgStars * 2) / 2 // round to 0.5
  const flooredKey = Math.floor(avgStars)

  const updated = {
    ...stats,
    totalGames: (stats.totalGames || 0) + 1,
    totalStars: (stats.totalStars || 0) + avgStars,
    bestScore: Math.max(stats.bestScore || 0, avgStars),
    starCounts: {
      ...stats.starCounts,
      [flooredKey]: ((stats.starCounts?.[flooredKey] || 0) + 1),
    },
  }
  await saveStats(updated)
  return updated
}

export async function clearStats() {
  await saveStats({ ...defaultStats })
}
