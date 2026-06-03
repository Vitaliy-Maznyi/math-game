// Generate math problems appropriate for 6 year olds
export function generateProblem() {
  const types = ['add', 'add', 'add', 'sub', 'sub'] // more addition
  const type = types[Math.floor(Math.random() * types.length)]

  let a, b, answer, expression

  if (type === 'add') {
    a = Math.floor(Math.random() * 15) + 1  // 1-15
    b = Math.floor(Math.random() * (20 - a)) + 1  // ensure sum <= 20
    answer = a + b
    expression = `${a} + ${b}`
  } else {
    a = Math.floor(Math.random() * 15) + 5  // 5-20
    b = Math.floor(Math.random() * (a - 1)) + 1  // ensure positive result
    answer = a - b
    expression = `${a} - ${b}`
  }

  const options = generateOptions(answer)

  return { expression, answer, options }
}

function generateOptions(correct) {
  const opts = new Set([correct])

  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 6) + 1
    const sign = Math.random() > 0.5 ? 1 : -1
    const wrong = correct + sign * delta
    if (wrong > 0 && wrong !== correct) {
      opts.add(wrong)
    }
  }

  // Shuffle
  return [...opts].sort(() => Math.random() - 0.5)
}

// Calculate stars based on remaining time (out of 30s)
// timeLeft: seconds remaining when answered
export function calculateStars(timeLeft) {
  if (timeLeft === 0) return 0        // timeout
  if (timeLeft > 20) return 5         // answered in first 10s (>20s left)
  if (timeLeft > 15) return 4         // answered in 10-15s
  if (timeLeft > 10) return 3         // answered in 15-20s
  if (timeLeft > 5) return 2          // answered in 20-25s
  return 1                            // answered in 25-30s
}

export function getScoreMessage(lang, avg) {
  if (avg >= 4.5) return lang === 'pl' ? 'excellent' : 'excellent'
  if (avg >= 3.5) return lang === 'pl' ? 'great' : 'great'
  if (avg >= 2.5) return 'good'
  if (avg >= 1.5) return 'ok'
  return 'tryAgain'
}

export const TOTAL_QUESTIONS = 10
export const TIMER_SECONDS = 30
