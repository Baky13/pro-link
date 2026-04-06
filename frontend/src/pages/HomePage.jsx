import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Zap, Flame, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { vacancyApi, categoryApi } from '../api'

import { useT } from '../utils/i18n'
import VacancyCard from '../components/ui/VacancyCard'
import { SkeletonCard } from '../components/ui/Skeleton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
})

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const itemVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function HomePage() {
    const t = useT()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [hotVacancies, setHotVacancies] = useState([])
  const [urgentVacancies, setUrgentVacancies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [catsLoading, setCatsLoading] = useState(true)

  useEffect(() => {
    categoryApi.getAll().then(r => {
      setCategories((r.data || []).filter(c => !c.parentId).slice(0, 10))
    }).finally(() => setCatsLoading(false))

    Promise.allSettled([
      vacancyApi.getHot({ size: 6 }),
      vacancyApi.getUrgent({ size: 4 }),
    ]).then(([hot, urgent]) => {
      if (hot.status === 'fulfilled') setHotVacancies(hot.value.data.content || [])
      if (urgent.status === 'fulfilled') setUrgentVacancies(urgent.value.data.content || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    navigate(`/vacancies?${params}`)
  }

  const stats = []

  return (
    <div>
      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #5b5ef4 0%, #8b5cf6 55%, #ec4899 100%)',
        padding: 'clamp(60px, 10vw, 100px) 20px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blobs */}
        {[
          { top: '-8%', left: '-6%', size: '40vw', opacity: 0.07 },
          { bottom: '-12%', right: '-8%', size: '50vw', opacity: 0.05 },
          { top: '25%', left: '8%', size: '14vw', opacity: 0.06 },
          { top: '15%', right: '12%', size: '10vw', opacity: 0.08 },
        ].map((b, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.1, 1], opacity: [b.opacity, b.opacity * 1.6, b.opacity] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
            style={{ position: 'absolute', borderRadius: '50%', background: 'white', pointerEvents: 'none', width: b.size, height: b.size, top: b.top, bottom: b.bottom, left: b.left, right: b.right }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          {/* Badge */}
          <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 13, color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Платформа №1 в Кыргызстане
          </motion.div>

          {/* Title */}
          <motion.h1 {...fadeUp(0.1)} style={{ fontSize: 'clamp(30px, 5.5vw, 60px)', fontWeight: 900, color: 'white', marginBottom: 20, lineHeight: 1.1, letterSpacing: -1.5 }}>
            Найди работу{' '}
            <span style={{ background: 'linear-gradient(90deg, #fde68a, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>мечты</span>
            <br />в Кыргызстане
          </motion.h1>

          {/* Search */}
          <motion.form {...fadeUp(0.2)} onSubmit={handleSearch} style={{
            maxWidth: 680, margin: '0 auto',
            display: 'flex', gap: 0,
            background: 'white', borderRadius: 16, padding: 6,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '2 1 180px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent', color: '#111' }} />
            </div>
            <div style={{ width: 1, background: '#e5e7eb', margin: '8px 0' }} className="hide-mobile" />
            <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }} className="hide-mobile">
              <MapPin size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder={t.cityPlaceholder}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent', color: '#111' }} />
            </div>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '12px 28px', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(91,94,244,0.4)',
              transition: 'opacity 0.15s, transform 0.1s',
              flex: '0 0 auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}>
              {t.search}
            </button>
          </motion.form>

          {/* Quick tags */}
          <motion.div {...fadeUp(0.3)} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {['💻 IT', '🏥 Медицина', '💰 Финансы', '🎨 Дизайн', '🚗 Транспорт'].map(tag => (
              <motion.button key={tag}
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.22)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/vacancies?search=${tag.split(' ')[1]}`)}
                style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                {tag}
              </motion.button>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) 20px' }}>

        {/* Categories */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          style={{ marginBottom: 64 }}>
          <motion.div variants={itemVariant} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, marginBottom: 4 }}>{t.categories}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Найди работу в своей сфере</p>
          </motion.div>
          <div className="category-grid">
            {catsLoading
              ? Array(10).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
              ))
              : categories.map(cat => (
                <motion.button key={cat.id} variants={itemVariant}
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/vacancies?categoryId=${cat.id}`)}
                  className="card"
                  style={{ padding: '18px 12px', textAlign: 'center', border: 'none', cursor: 'pointer', background: 'var(--bg-card)', width: '100%' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{cat.name}</div>
                </motion.button>
              ))
            }
          </div>
        </motion.section>

        {/* Urgent */}
        {urgentVacancies.length > 0 && (
          <motion.section
            initial="initial"
            animate="animate"
            variants={stagger}
            style={{ marginBottom: 64 }}>
            <motion.div variants={itemVariant} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Zap size={22} color="#f59e0b" fill="#f59e0b" /> {t.urgentVacancies}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Нужны сотрудники прямо сейчас</p>
              </div>
              <motion.button whileHover={{ x: 4 }} className="btn-ghost" style={{ fontWeight: 600 }}
                onClick={() => navigate('/vacancies?isUrgent=true')}>
                {t.allVacancies} <ArrowRight size={16} />
              </motion.button>
            </motion.div>
            <div className="vacancy-grid">
              {urgentVacancies.map(v => (
                <motion.div key={v.id} variants={itemVariant}>
                  <VacancyCard vacancy={v} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Hot */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}>
          <motion.div variants={itemVariant} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Flame size={22} color="#ef4444" fill="#ef4444" /> {t.hotVacancies}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Самые популярные вакансии</p>
            </div>
            <motion.button whileHover={{ x: 4 }} className="btn-ghost" style={{ fontWeight: 600 }}
              onClick={() => navigate('/vacancies?isHot=true')}>
              {t.allVacancies} <ArrowRight size={16} />
            </motion.button>
          </motion.div>
          <div className="vacancy-grid">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : hotVacancies.map(v => (
                <motion.div key={v.id} variants={itemVariant}>
                  <VacancyCard vacancy={v} />
                </motion.div>
              ))
            }
          </div>
        </motion.section>
      </div>
    </div>
  )
}
