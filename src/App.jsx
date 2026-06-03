import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import StatsScreen from './components/StatsScreen'
import { addGameResult } from './firebase'

const SCREENS = { HOME: 'home', GAME: 'game', RESULT: 'result', STATS: 'stats' }

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [lang, setLang] = useState('pl')
  const [gameResults, setGameResults] = useState([])

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
        />
      )}
      {screen === SCREENS.GAME && (
        <GameScreen lang={lang} onGameEnd={handleGameEnd} />
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
    </>
  )
}
