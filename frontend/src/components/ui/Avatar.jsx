import { useState, useEffect } from 'react'

export default function Avatar({ src, name = '', size = 40, square = false, style = {}, bg }) {
  const [error, setError] = useState(false)

  useEffect(() => { setError(false) }, [src])

  const initial = (name || '?').trim()[0]?.toUpperCase() || '?'
  const radius = square ? 10 : '50%'
  const fontSize = Math.max(12, Math.round(size * 0.4))

  if (!src || error) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: bg || 'linear-gradient(135deg, var(--primary), #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize, color: 'white',
        flexShrink: 0, userSelect: 'none',
        ...style,
      }}>{initial}</div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setError(true)}
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: 'cover', flexShrink: 0, ...style,
      }}
    />
  )
}
