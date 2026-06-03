import { useState, useEffect } from 'react'
import { t } from '../i18n'
import { loadSettings, saveSettings } from '../settings'
import { DEFAULT_SETTINGS, PIN } from '../gameLogic'

const LOCK_KEY = 'settingsUnlocked'

export default function SettingsScreen({ lang, onBack, onSettingsChanged }) {
  const [pinInput, setPinInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings().then(s => { setSettings(s); setLoading(false) })
  }, [])

  const handlePin = (digit) => {
    const next = pinInput + digit
    setPinInput(next)
    setPinError(false)
    if (next.length === 4) {
      if (next === PIN) {
        setUnlocked(true)
      } else {
        setPinError(true)
        setTimeout(() => setPinInput(''), 600)
      }
    }
  }

  const handleBackspace = () => {
    setPinInput(p => p.slice(0, -1))
    setPinError(false)
  }

  const handleToggle = async (key, value) => {
    const next = { ...settings }

    // Handle dependency logic
    if (key === 'addSub100' && value) {
      next.addSub20 = true; next.addSub50 = true; next.addSub100 = true
    } else if (key === 'addSub50' && value) {
      next.addSub20 = true; next.addSub50 = true
    } else if (key === 'addSub50' && !value) {
      next.addSub50 = false; next.addSub100 = false
    } else if (key === 'addSub20' && !value) {
      next.addSub20 = false; next.addSub50 = false; next.addSub100 = false
    } else if (key === 'mulDiv100' && value) {
      next.mulDiv20 = true; next.mulDiv50 = true; next.mulDiv100 = true
    } else if (key === 'mulDiv50' && value) {
      next.mulDiv20 = true; next.mulDiv50 = true
    } else if (key === 'mulDiv50' && !value) {
      next.mulDiv50 = false; next.mulDiv100 = false
    } else if (key === 'mulDiv20' && !value) {
      next.mulDiv20 = false; next.mulDiv50 = false; next.mulDiv100 = false
    } else {
      next[key] = value
    }

    // Ensure at least addSub20 is on
    if (!next.addSub20 && !next.addSub50 && !next.addSub100 &&
        !next.mulDiv20 && !next.mulDiv50 && !next.mulDiv100) {
      next.addSub20 = true
    }

    setSettings(next)
    setSaved(false)
  }

  const handleSave = async () => {
    await saveSettings(settings)
    onSettingsChanged(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // PIN screen
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-game flex flex-col items-center justify-center p-4">
        <div className="card w-full max-w-xs p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-game text-purple-700 mb-6">{t(lang, 'enterPin')}</h2>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-6">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
                i < pinInput.length
                  ? pinError ? 'bg-red-500 border-red-500' : 'bg-purple-600 border-purple-600'
                  : 'bg-gray-200 border-gray-300'
              }`} />
            ))}
          </div>

          {pinError && (
            <p className="text-red-500 text-sm font-bold mb-4">{t(lang, 'pinWrong')}</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1,2,3,4,5,6,7,8,9].map(d => (
              <button
                key={d}
                onClick={() => handlePin(String(d))}
                disabled={pinInput.length >= 4}
                className="py-4 rounded-2xl text-2xl font-game text-purple-700 bg-purple-50
                           border-b-4 border-purple-200 active:border-b-2 active:translate-y-0.5
                           transition-all disabled:opacity-40"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="py-4 rounded-2xl text-xl font-game text-gray-500 bg-gray-100
                         border-b-4 border-gray-200 active:border-b-2 active:translate-y-0.5 transition-all"
            >⌫</button>
            <button
              onClick={() => handlePin('0')}
              disabled={pinInput.length >= 4}
              className="py-4 rounded-2xl text-2xl font-game text-purple-700 bg-purple-50
                         border-b-4 border-purple-200 active:border-b-2 active:translate-y-0.5
                         transition-all disabled:opacity-40"
            >0</button>
            <button
              onClick={onBack}
              className="py-4 rounded-2xl text-sm font-game text-gray-500 bg-gray-100
                         border-b-4 border-gray-200 active:border-b-2 active:translate-y-0.5 transition-all"
            >✕</button>
          </div>
        </div>
      </div>
    )
  }

  // Settings screen
  const groups = [
    {
      label: t(lang, 'addSubGroup'),
      emoji: '➕➖',
      color: 'blue',
      items: [
        { key: 'addSub20', label: t(lang, 'upTo20') },
        { key: 'addSub50', label: t(lang, 'upTo50') },
        { key: 'addSub100', label: t(lang, 'upTo100') },
      ],
      // A higher checkbox forces lower ones ON and locked
      isForced: (key) => {
        if (key === 'addSub20') return settings.addSub50 || settings.addSub100
        if (key === 'addSub50') return settings.addSub100
        return false
      }
    },
    {
      label: t(lang, 'mulDivGroup'),
      emoji: '✖️➗',
      color: 'green',
      items: [
        { key: 'mulDiv20', label: t(lang, 'upTo20') },
        { key: 'mulDiv50', label: t(lang, 'upTo50') },
        { key: 'mulDiv100', label: t(lang, 'upTo100') },
      ],
      isForced: (key) => {
        if (key === 'mulDiv20') return settings.mulDiv50 || settings.mulDiv100
        if (key === 'mulDiv50') return settings.mulDiv100
        return false
      }
    },
  ]

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', title: 'text-blue-700', check: 'bg-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-100', title: 'text-green-700', check: 'bg-green-600' },
  }

  return (
    <div className="min-h-screen bg-game flex flex-col p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="bg-white/20 text-white font-game text-lg px-4 py-2 rounded-2xl active:bg-white/30"
        >
          {t(lang, 'back')}
        </button>
        <h1 className="text-3xl font-game text-white ml-4">{t(lang, 'settingsTitle')}</h1>
      </div>

      {loading ? (
        <div className="text-white text-2xl text-center mt-20 animate-pulse">{t(lang, 'loading')}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(group => {
            const c = colorMap[group.color]
            return (
              <div key={group.label} className={`card p-5 ${c.bg} border ${c.border}`}>
                <h3 className={`font-game text-xl mb-4 ${c.title}`}>
                  {group.emoji} {group.label}
                </h3>
                <div className="flex flex-col gap-3">
                  {group.items.map(({ key, label }) => {
                    const forced = group.isForced(key)
                    const checked = settings[key]
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-4 p-3 rounded-2xl bg-white shadow-sm
                                    ${forced ? 'opacity-70' : 'cursor-pointer active:bg-gray-50'}`}
                      >
                        <div
                          onClick={() => !forced && handleToggle(key, !checked)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all flex-shrink-0
                                      ${checked ? `${c.check} border-transparent` : 'bg-white border-gray-300'}
                                      ${forced ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {checked && <span className="text-white text-lg font-bold">✓</span>}
                          {forced && checked && <span className="text-white text-base">🔒</span>}
                        </div>
                        <span className="text-lg font-bold text-gray-700">{label}</span>
                        {forced && (
                          <span className="ml-auto text-xs text-gray-400">{t(lang, 'forcedOn')}</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`w-full py-5 rounded-3xl text-2xl font-game text-white shadow-xl transition-all
                        ${saved
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-emerald-700'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-400 border-b-4 border-orange-600 active:border-b-2 active:translate-y-0.5'
                        }`}
          >
            {saved ? `✅ ${t(lang, 'saved')}` : `💾 ${t(lang, 'save')}`}
          </button>
        </div>
      )}
    </div>
  )
}
