import { Sparkles } from 'lucide-react'

/**
 * Бейдж совпадения кандидат<->вакансия (ИИ-матчинг).
 * Цвет по порогам: >=75 зелёный, 50-74 янтарный, <50 серый.
 */
export default function MatchBadge({ score, showLabel = true, size = 13 }) {
  const s = Math.max(0, Math.min(100, Math.round(score ?? 0)))
  const color = s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#6b7280'
  const bg = s >= 75 ? 'rgba(22,163,74,0.12)' : s >= 50 ? 'rgba(217,119,6,0.12)' : 'rgba(107,114,128,0.12)'
  return (
    <span
      title="Совпадение рассчитано ИИ ProLink"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 999,
        background: bg, color, fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap',
      }}
    >
      <Sparkles size={size} /> {s}%{showLabel ? ' совпадение' : ''}
    </span>
  )
}
