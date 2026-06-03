import { useState, useEffect, useRef, useCallback } from 'react'
import { generateProblem, calculateStars, TOTAL_QUESTIONS, TIMER_SECONDS } from '../gameLogic'
import { t } from '../i18n'
import Stars from './Stars'
import { playCorrect, playWrong, playTimeout as playSfxTimeout } from '../audio'

const ANSWER_COLORS = [
  { bg: 'from-pink-500 to-rose-500', border: 'border-rose-700' },
  { bg: 'from-blue-500 to-indigo-500', border: 'border-indigo-700' },
  { bg: 'from-green-500 to-emerald-500', border: 'border-emerald-700' },
  { bg: 'from-yellow-400 to-orange-400', border: 'border-orange-600' },
]

export default function GameScreen({ lang, settings, onGameEnd }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [problem, setProblem] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [results, setResults] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const [streak, setStreak] = useState(0)

  const timerRef = useRef(null)
  const timeLeftRef = useRef(TIMER_SECONDS)

  const loadQuestion = useCallback(() => {
    setAnimClass('animate-bounce-in')
    setProblem(generateProblem(settings))
    setTimeLeft(TIMER_SECONDS)
    timeLeftRef.current = TIMER_SECONDS
    setAnswered(false)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [])

  useEffect(() => {
    loadQuestion()
  }, [questionIndex])

  useEffect(() => {
    if (answered || !problem) return

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)

      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current)
        handleTimeout()
      }
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [problem, answered])

  const handleTimeout = () => {
    playSfxTimeout()
    setAnswered(true)
    setShowFeedback(true)
    setStreak(0)
    const newResults = [...results, { stars: 0, correct: false }]
    setResults(newResults)
    setTimeout(() => advance(newResults), 2000)
  }

  const handleAnswer = (option) => {
    if (answered) return
    clearInterval(timerRef.current)

    const isCorrect = option === problem.answer
    const stars = isCorrect ? calculateStars(timeLeftRef.current) : 0

    if (isCorrect) playCorrect()
    else playWrong()

    setAnswered(true)
    setSelectedAnswer(option)
    setShowFeedback(true)
    setAnimClass(isCorrect ? '' : 'animate-shake')

    if (isCorrect) {
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }

    const newResults = [...results, { stars, correct: isCorrect }]
    setResults(newResults)

    setTimeout(() => advance(newResults), 1800)
  }

  const advance = (currentResults) => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      onGameEnd(currentResults)
    } else {
      setQuestionIndex(i => i + 1)
    }
  }

  if (!problem) return (
    <div className="flex items-center justify-center min-h-screen bg-game">
      <div className="text-white text-3xl font-game animate-pulse">{t(lang, 'loading')}</div>
    </div>
  )

  const pct = (timeLeft / TIMER_SECONDS) * 100
  const isWarning = timeLeft <= 10
  const isDanger = timeLeft <= 5
  const barColor = isDanger ? '#EF4444' : isWarning ? '#F97316' : '#22C55E'
  const currentStarsPreview = answered ? (results[results.length - 1]?.stars || 0) : calculateStars(timeLeft)

  const isCorrect = answered && selectedAnswer === problem.answer
  const isWrong = answered && selectedAnswer !== null && selectedAnswer !== problem.answer
  const isTimeout = answered && selectedAnswer === null

  return (
    <div className="min-h-screen bg-game flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-white/20 rounded-2xl px-4 py-2">
          <span className="text-white font-game text-lg">
            {t(lang, 'question')} {questionIndex + 1}/{TOTAL_QUESTIONS}
          </span>
        </div>
        {streak >= 2 && (
          <div className="bg-yellow-400 rounded-2xl px-3 py-1 animate-pop">
            <span className="font-game text-yellow-900 text-sm">🔥 {streak}</span>
          </div>
        )}
        <div className="flex gap-1">
          {results.map((r, i) => (
            <span key={i} className="text-lg">{r.correct ? '✅' : '❌'}</span>
          ))}
          {Array.from({ length: TOTAL_QUESTIONS - results.length }).map((_, i) => (
            <span key={`empty-${i}`} className="text-lg opacity-30">⭕</span>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white/70 text-sm font-bold">⏱ {t(lang, 'timeLeft')}</span>
          <span className={`text-2xl font-black font-game ${isDanger ? 'text-red-300 timer-warning' : isWarning ? 'text-orange-300' : 'text-green-300'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full h-5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Stars preview */}
      <div className="text-center mb-2">
        <Stars count={answered ? (results[results.length-1]?.stars || 0) : currentStarsPreview} size="sm" />
      </div>

      {/* Problem card */}
      <div className={`card p-8 text-center mb-6 ${animClass}`}
           onAnimationEnd={() => setAnimClass('')}>

        {showFeedback ? (
          <div className="flex flex-col items-center gap-2">
            {isTimeout ? (
              <>
                <div className="text-5xl">⏰</div>
                <div className="text-2xl font-bold text-orange-500">{t(lang, 'timeUp')}</div>
                <div className="text-xl text-gray-600">{t(lang, 'correctAnswer')} <strong className="text-green-600">{problem.answer}</strong></div>
              </>
            ) : isCorrect ? (
              <>
                <div className="text-5xl">🎉</div>
                <div className="text-3xl font-game text-green-600">{t(lang, 'correct')}</div>
                <Stars count={results[results.length-1]?.stars || 0} size="lg" />
              </>
            ) : (
              <>
                <div className="text-5xl">😅</div>
                <div className="text-2xl font-bold text-red-500">{t(lang, 'wrong')}</div>
                <div className="text-xl text-gray-600">{t(lang, 'correctAnswer')} <strong className="text-green-600">{problem.answer}</strong></div>
              </>
            )}
          </div>
        ) : (
          <div className="text-7xl font-game text-purple-700 tracking-wider">
            {problem.expression} = ?
          </div>
        )}
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3">
        {problem.options.map((option, i) => {
          const color = ANSWER_COLORS[i]
          let btnClass = `btn-answer bg-gradient-to-br ${color.bg} ${color.border}`

          if (answered) {
            if (option === problem.answer) {
              btnClass += ' ring-4 ring-white scale-105'
            } else if (option === selectedAnswer) {
              btnClass += ' opacity-50'
            } else {
              btnClass += ' opacity-40'
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className={btnClass}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
