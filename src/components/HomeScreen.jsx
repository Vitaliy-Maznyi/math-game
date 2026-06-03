import { useState, useEffect } from 'react'
import { t } from '../i18n'
import { startBGM, isMuted, toggleMute, resumeBGM } from '../audio'

export default function HomeScreen({ lang, setLang, onNewGame, onStats, onSettings }) {
  const [muted, setMuted] = useState(isMuted())

  useEffect(() => {
    startBGM()
  }, [])

  const handleMute = () => {
    const m = toggleMute()
    setMuted(m)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-game p-4">
      {/* Settings button - top left */}
      <div className="absolute top-4 left-4">
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-full bg-white/20 text-white text-xl flex items-center justify-center active:bg-white/30 transition-all"
        >⚙️</button>
      </div>

      {/* Lang switcher + mute - top right */}
      <div className="absolute top-4 right-4 flex gap-2 items-center">
        <button
          onClick={handleMute}
          className="w-10 h-10 rounded-full bg-white/20 text-white text-xl flex items-center justify-center active:bg-white/30 transition-all"
        >{muted ? '🔇' : '🔊'}</button>
        <button
          onClick={() => setLang('pl')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${lang === 'pl' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white opacity-60'}`}
        >🇵🇱 PL</button>
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${lang === 'en' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white opacity-60'}`}
        >🇬🇧 EN</button>
      </div>

      {/* Title */}
      <div className="text-center mb-10 animate-bounce-in">
        <div className="text-8xl mb-4 animate-float">🔢</div>
        <h1 className="text-5xl font-game text-white drop-shadow-lg">
          {t(lang, 'appTitle')}
        </h1>
        <div className="flex justify-center gap-2 mt-3 text-4xl">
          {['➕','➖'].map((ch, i) => (
            <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{ch}</span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-4">
        <button
          onClick={() => { resumeBGM(); onNewGame() }}
          className="w-full py-6 rounded-3xl text-3xl font-game text-white shadow-2xl
                     bg-gradient-to-r from-yellow-400 to-orange-400
                     border-b-4 border-orange-600
                     active:border-b-2 active:translate-y-0.5 transition-all duration-100
                     hover:from-yellow-300 hover:to-orange-300"
        >
          {t(lang, 'newGame')}
        </button>

        <button
          onClick={() => { resumeBGM(); onStats() }}
          className="w-full py-5 rounded-3xl text-2xl font-game text-white shadow-xl
                     bg-gradient-to-r from-blue-500 to-cyan-400
                     border-b-4 border-blue-700
                     active:border-b-2 active:translate-y-0.5 transition-all duration-100"
        >
          {t(lang, 'statistics')}
        </button>
      </div>

      {/* Decorative */}
      <div className="mt-12 flex gap-6 text-5xl opacity-40">
        {['🌟', '🎯', '🏆'].map((em, i) => (
          <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{em}</span>
        ))}
      </div>
    </div>
  )
}
