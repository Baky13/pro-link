import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, Circle } from 'lucide-react'

export default function ProfileProgress({ profile, role }) {
  const workerItems = [
    { label: 'Фото профиля', done: !!profile?.user?.avatarUrl },
    { label: 'Должность', done: !!profile?.title },
    { label: 'О себе', done: !!profile?.bio },
    { label: 'Навыки', done: profile?.skills?.length > 0 },
    { label: 'Опыт работы', done: profile?.experiences?.length > 0 },
    { label: 'Резюме', done: !!profile?.resumeUrl },
  ]

  const employerItems = [
    { label: 'Логотип компании', done: !!profile?.logoUrl },
    { label: 'Описание компании', done: !!profile?.description },
    { label: 'Сайт компании', done: !!profile?.website },
    { label: 'Отрасль', done: !!profile?.industry },
    { label: 'Размер компании', done: !!profile?.companySize },
  ]

  const items = role === 'WORKER' ? workerItems : employerItems
  const done = items.filter(i => i.done).length
  const percent = Math.round((done / items.length) * 100)

  if (percent === 100) return null

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20, border: '1.5px solid var(--primary)', background: 'var(--primary-light)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Заполните профиль</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {percent < 50 ? 'Заполненный профиль получает в 3 раза больше откликов' : 'Почти готово! Осталось совсем немного'}
          </p>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>{percent}%</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--primary-gradient)', borderRadius: 3 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: item.done ? 'var(--success)' : 'var(--text-secondary)', fontWeight: item.done ? 600 : 400 }}>
            {item.done
              ? <CheckCircle size={13} color="var(--success)" />
              : <Circle size={13} />
            }
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
