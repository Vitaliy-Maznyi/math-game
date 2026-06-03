// Settings stored in Firebase + localStorage
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import { DEFAULT_SETTINGS } from './gameLogic'

const firebaseConfig = {
  apiKey: "AIzaSyCKiIEhv3_xXEarvsttEjJDo_krs9e_IBA",
  authDomain: "math-game-vm.firebaseapp.com",
  projectId: "math-game-vm",
  storageBucket: "math-game-vm.firebasestorage.app",
  messagingSenderId: "460625624553",
  appId: "1:460625624553:web:0649e9e12250146447df78"
}

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  return getFirestore(app)
}

const SETTINGS_KEY = 'mathGameSettings'

export async function loadSettings() {
  try {
    const db = getDb()
    const snap = await getDoc(doc(db, 'settings', 'main'))
    if (snap.exists()) {
      const data = snap.data()
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
      return data
    }
  } catch (e) {
    console.warn('Firebase settings load failed, using localStorage', e)
  }
  const local = localStorage.getItem(SETTINGS_KEY)
  return local ? JSON.parse(local) : { ...DEFAULT_SETTINGS }
}

export async function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  try {
    const db = getDb()
    await setDoc(doc(db, 'settings', 'main'), settings)
  } catch (e) {
    console.warn('Firebase settings save failed', e)
  }
}
