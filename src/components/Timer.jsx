import { useEffect, useRef, useState } from 'react'
import { TIMER_SECONDS } from '../gameLogic'

export default function Timer({ onTimeUp, isPaused, onTick }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimeLeft(TIMER_SECONDS)
  }, [])

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (onTick) onTick(next)
        if (next <= 0) {
          clearInterval(intervalRef.current)
          onTimeUp()
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isPaused])

  const pct = (timeLeft / TIMER_SECONDS) * 100
  const isWarning = timeLeft <= 10
  const isDanger = timeLeft <= 5

  const barColor = isDanger ? '#EF4444' : isWarning ? '#F97316' : '#22C55E'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-bold ${isDanger ? 'text-red-500' : 'text-gray-500'}`}>⏱</span>
        <span className={`text-2xl font-black font-game ${isDanger ? 'text-red-500 timer-warning' : isWarning ? 'text-orange-500' : 'text-green-600'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
