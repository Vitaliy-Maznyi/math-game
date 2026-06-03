export default function Stars({ count, max = 5, size = 'md' }) {
  const sizeClass = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  }[size] || 'text-4xl'

  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${sizeClass} transition-all duration-300 ${i < count ? 'star-filled' : 'star-empty'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}
