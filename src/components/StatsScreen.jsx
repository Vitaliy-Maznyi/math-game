import { useEffect, useState } from 'react'
import { t } from '../i18n'
import { loadStats, clearStats } from '../firebase'
import Stars from './Stars'

export default function StatsScreen({ lang, onBack }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  const handleClear = async () => {
    if (window.confirm(t(lang, 'confirmClear'))) {
      await clearStats()
      const s = await loadStats()
      setStats(s)
    }
  }

  const avgScore = stats && stats.totalGames > 0
    ? Math.round((stats.totalStars / stats.totalGames) * 10) / 10
    : 0

  const starLabels = [
    { key: 5, emoji: '🌟', label: '5 ★', color: 'bg-yellow-400' },
    { key: 4, emoji: '😊', label: '4 ★', color: 'bg-green-400' },
    { key: 3, emoji: '👍', label: '3 ★', color: 'bg-blue-400' },
    { key: 2, emoji: '🙂', label: '2 ★', color: 'bg-purple-400' },
    { key: 1, emoji: '😐', label: '1 ★', color: 'bg-orange-400' },
    { key: 0, emoji: '💪', label: '0 ★', color: 'bg-red-400' },
  ]

  return (
    <div className="min-h-screen bg-game flex flex-col p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="bg-white/20 text-white font-game text-lg px-4 py-2 rounded-2xl active:bg-white/30"
        >
          {t(lang, 'back')}
        </button>
        <h1 className="text-3xl font-game text-white ml-4">{t(lang, 'statsTitle')}</h1>
      </div>

      {loading ? (
        <div className="text-white text-2xl text-center mt-20 animate-pulse">{t(lang, 'loading')}</div>
      ) : !stats || stats.totalGames === 0 ? (
        <div className="card p-10 text-center mt-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-xl whitespace-pre-line">{t(lang, 'noStats')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center">
              <div className="text-3xl font-game text-purple-700">{stats.totalGames}</div>
              <div className="text-xs text-gray-500 mt-1">{t(lang, 'totalGames')}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-game text-yellow-500">{avgScore}</div>
              <div className="text-xs text-gray-500 mt-1">{t(lang, 'avgScore')}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-game text-green-600">{Math.round((stats.bestScore || 0) * 10) / 10}</div>
              <div className="text-xs text-gray-500 mt-1">{t(lang, 'bestScore')}</div>
            </div>
          </div>

          {/* Average stars visual */}
          <div className="card p-4 text-center">
            <p className="text-gray-500 text-sm mb-2">{t(lang, 'avgScore')}</p>
            <Stars count={Math.round(avgScore)} size="lg" />
          </div>

          {/* Distribution */}
          <div className="card p-4">
            <h3 className="font-game text-purple-700 text-lg mb-3">{t(lang, 'distribution')}</h3>
            {starLabels.map(({ key, emoji, label, color }) => {
              const count = stats.starCounts?.[key] || 0
              const max = Math.max(...Object.values(stats.starCounts || {}), 1)
              const pct = (count / max) * 100
              return (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <span className="text-lg w-6">{emoji}</span>
                  <span className="text-sm font-bold w-8 text-gray-600">{label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600 w-6">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-full py-3 rounded-2xl font-game text-lg text-red-500 border-2 border-red-300 bg-white active:bg-red-50"
          >
            {t(lang, 'clearStats')}
          </button>
        </div>
      )}
    </div>
  )
}
