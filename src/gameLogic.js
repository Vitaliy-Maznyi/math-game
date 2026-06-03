export const TOTAL_QUESTIONS = 10
export const TIMER_SECONDS = 30
export const PIN = '1992'

// Default settings
export const DEFAULT_SETTINGS = {
  addSub20: true,
  addSub50: false,
  addSub100: false,
  mulDiv20: false,
  mulDiv50: false,
  mulDiv100: false,
}

// Build pool of enabled operation types from settings
function buildPool(settings) {
  const pool = []

  // Add/sub: higher limit includes lower ones
  const addSubLimit = settings.addSub100 ? 100 : settings.addSub50 ? 50 : settings.addSub20 ? 20 : 0
  if (addSubLimit > 0) {
    pool.push({ type: 'add', limit: addSubLimit })
    pool.push({ type: 'add', limit: addSubLimit })
    pool.push({ type: 'sub', limit: addSubLimit })
    pool.push({ type: 'sub', limit: addSubLimit })
  }

  // Mul/div: higher limit includes lower ones
  const mulDivLimit = settings.mulDiv100 ? 100 : settings.mulDiv50 ? 50 : settings.mulDiv20 ? 20 : 0
  if (mulDivLimit > 0) {
    pool.push({ type: 'mul', limit: mulDivLimit })
    pool.push({ type: 'div', limit: mulDivLimit })
  }

  // Fallback if nothing enabled
  if (pool.length === 0) {
    pool.push({ type: 'add', limit: 20 })
    pool.push({ type: 'sub', limit: 20 })
  }

  return pool
}

function generateAdd(limit) {
  const a = Math.floor(Math.random() * (limit - 1)) + 1
  const maxB = limit - a
  if (maxB < 1) return generateAdd(limit)
  const b = Math.floor(Math.random() * maxB) + 1
  return { expression: `${a} + ${b}`, answer: a + b }
}

function generateSub(limit) {
  // a is result + b, ensure result >= 1
  const result = Math.floor(Math.random() * (limit - 1)) + 1
  const b = Math.floor(Math.random() * (limit - result)) + 1
  const a = result + b
  if (a > limit) return generateSub(limit)
  return { expression: `${a} - ${b}`, answer: result }
}

function generateMul(limit) {
  // Both factors and result must be <= limit
  const pairs = []
  for (let a = 2; a <= limit; a++) {
    for (let b = 2; b <= a; b++) { // b<=a to avoid duplicates
      if (a * b <= limit) pairs.push([a, b])
    }
  }
  if (pairs.length === 0) return { expression: `2 × 2`, answer: 4 }
  const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]
  // randomize order
  return Math.random() > 0.5
    ? { expression: `${a} × ${b}`, answer: a * b }
    : { expression: `${b} × ${a}`, answer: a * b }
}

function generateDiv(limit) {
  // dividend <= limit, divisor <= limit, result <= limit, no remainder
  const pairs = []
  for (let divisor = 2; divisor <= limit; divisor++) {
    for (let result = 2; result <= limit; result++) {
      const dividend = divisor * result
      if (dividend <= limit) {
        pairs.push({ dividend, divisor, result })
      }
    }
  }
  if (pairs.length === 0) return { expression: `4 ÷ 2`, answer: 2 }
  const p = pairs[Math.floor(Math.random() * pairs.length)]
  return { expression: `${p.dividend} ÷ ${p.divisor}`, answer: p.result }
}

export function generateProblem(settings = DEFAULT_SETTINGS) {
  const pool = buildPool(settings)
  const { type, limit } = pool[Math.floor(Math.random() * pool.length)]

  let problem
  if (type === 'add') problem = generateAdd(limit)
  else if (type === 'sub') problem = generateSub(limit)
  else if (type === 'mul') problem = generateMul(limit)
  else problem = generateDiv(limit)

  return { ...problem, options: generateOptions(problem.answer) }
}

function generateOptions(correct) {
  const opts = new Set([correct])
  let attempts = 0
  while (opts.size < 4 && attempts < 100) {
    attempts++
    const delta = Math.floor(Math.random() * 8) + 1
    const sign = Math.random() > 0.5 ? 1 : -1
    const wrong = correct + sign * delta
    if (wrong > 0 && wrong !== correct) opts.add(wrong)
  }
  return [...opts].sort(() => Math.random() - 0.5)
}

export function calculateStars(timeLeft) {
  if (timeLeft === 0) return 0
  if (timeLeft > 20) return 5
  if (timeLeft > 15) return 4
  if (timeLeft > 10) return 3
  if (timeLeft > 5) return 2
  return 1
}

export function getScoreMessage(lang, avg) {
  if (avg >= 4.5) return 'excellent'
  if (avg >= 3.5) return 'great'
  if (avg >= 2.5) return 'good'
  if (avg >= 1.5) return 'ok'
  return 'tryAgain'
}
