import { useState, useEffect } from 'react'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import StatsScreen from './components/StatsScreen'
import SettingsScreen from './components/SettingsScreen'
import { addGameResult } from './firebase'
import { loadSettings } from './settings'
import { DEFAULT_SETTINGS } from './gameLogic'

const SCREENS = { HOME: 'home', GAME: 'game', RESULT: 'result', STATS: 'stats', SETTINGS: 'settings' }

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [lang, setLang] = useState('pl')
  const [gameResults, setGameResults] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    loadSettings().then(setSettings)
  }, [])

  const handleGameEnd = async (results) => {
    setGameResults(results)
    const avg = results.reduce((s, r) => s + r.stars, 0) / results.length
    await addGameResult(avg)
    setScreen(SCREENS.RESULT)
  }

  return (
    <>
      {screen === SCREENS.HOME && (
        <HomeScreen
          lang={lang}
          setLang={setLang}
          onNewGame={() => setScreen(SCREENS.GAME)}
          onStats={() => setScreen(SCREENS.STATS)}
          onSettings={() => setScreen(SCREENS.SETTINGS)}
        />
      )}
      {screen === SCREENS.GAME && (
        <GameScreen lang={lang} settings={settings} onGameEnd={handleGameEnd} />
      )}
      {screen === SCREENS.RESULT && (
        <ResultScreen
          lang={lang}
          results={gameResults}
          onPlayAgain={() => setScreen(SCREENS.GAME)}
          onMenu={() => setScreen(SCREENS.HOME)}
        />
      )}
      {screen === SCREENS.STATS && (
        <StatsScreen lang={lang} onBack={() => setScreen(SCREENS.HOME)} />
      )}
      {screen === SCREENS.SETTINGS && (
        <SettingsScreen
          lang={lang}
          onBack={() => setScreen(SCREENS.HOME)}
          onSettingsChanged={(s) => { setSettings(s); setScreen(SCREENS.HOME) }}
        />
      )}
    </>
  )
}
