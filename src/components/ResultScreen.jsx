import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { t } from '../i18n'
import { getScoreMessage } from '../gameLogic'
import Stars from './Stars'

export default function ResultScreen({ lang, results, onPlayAgain, onMenu }) {
  const totalStars = results.reduce((s, r) => s + r.stars, 0)
  const avgStars = totalStars / results.length
  const correct = results.filter(r => r.correct).length
  const msgKey = getScoreMessage(lang, avgStars)
  const displayAvg = Math.round(avgStars * 10) / 10

  useEffect(() => {
    if (avgStars >= 3) {
      const end = Date.now() + 3000
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#7C3AED','#F59E0B','#EC4899'] })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#7C3AED','#F59E0B','#EC4899'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [])

  return (
    <div className="min-h-screen bg-game flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8 text-center animate-bounce-in">
        {/* Title */}
        <h1 className="text-4xl font-game text-purple-700 mb-2">{t(lang, 'gameOver')}</h1>

        {/* Emoji */}
        <div className="text-7xl my-4 animate-float">
          {avgStars >= 4.5 ? '🏆' : avgStars >= 3.5 ? '🌟' : avgStars >= 2.5 ? '👍' : avgStars >= 1.5 ? '😊' : '💪'}
        </div>

        {/* Message */}
        <p className="text-xl font-bold text-gray-700 mb-4">{t(lang, msgKey)}</p>

        {/* Stars */}
        <div className="bg-purple-50 rounded-2xl p-4 mb-4">
          <p className="text-gray-500 text-sm mb-2">{t(lang, 'yourScore')}</p>
          <Stars count={Math.round(avgStars)} size="xl" />
          <p className="text-4xl font-game text-purple-700 mt-2">{displayAvg} / 5</p>
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-3xl font-game text-green-600">{correct}</div>
            <div className="text-xs text-gray-500 mt-1">✅ {t(lang, 'correctCount')}</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <div className="text-3xl font-game text-orange-500">{results.length - correct}</div>
            <div className="text-xs text-gray-500 mt-1">❌ {t(lang, 'wrongCount')}</div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-6">
          {results.map((r, i) => (
            <div key={i} className="flex flex-col items-center w-9">
              <span className="text-xs text-gray-400">{i+1}</span>
              <span className="text-yellow-400 text-xs leading-tight">
                {'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}
              </span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-5 rounded-3xl text-2xl font-game text-white shadow-xl
                       bg-gradient-to-r from-yellow-400 to-orange-400
                       border-b-4 border-orange-600
                       active:border-b-2 active:translate-y-0.5 transition-all"
          >
            {t(lang, 'playAgain')}
          </button>
          <button
            onClick={onMenu}
            className="w-full py-4 rounded-3xl text-xl font-game text-white shadow-lg
                       bg-gradient-to-r from-purple-600 to-indigo-500
                       border-b-4 border-indigo-700
                       active:border-b-2 active:translate-y-0.5 transition-all"
          >
            {t(lang, 'backToMenu')}
          </button>
        </div>
      </div>
    </div>
  )
}
