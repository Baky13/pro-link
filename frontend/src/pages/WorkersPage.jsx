import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Briefcase, SlidersHorizontal, X, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { profileApi, chatApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

function WorkerCard({ worker }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const t = useT()

  const handleChat = async (e) => {
    e.stopPropagation()
    try {
      const { data } = await chatApi.getOrCreateDirectRoom(worker.user.id)
      navigate(`/chat/${data.id}`)
    } catch { toast.error('Ошибка') }
  }

  const statusColors = {
    ACTIVELY_LOOKING: { bg: '#d1fae5', color: '#065f46', label: '🟢 Активно ищет' },
    OPEN_TO_OFFERS: { bg: '#fef3c7', color: '#92400e', label: '🟡 Открыт к предложениям' },
    NOT_LOOKING: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Не ищет' },
  }
  const status = statusColors[worker.jobSearchStatus] || statusColors.OPEN_TO_OFFERS

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.2 }}
      className="card"
      style={{ padding: 24, cursor: 'pointer' }}
      onClick={() => navigate(`/workers/${worker.id}`)}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {worker.user?.avatarUrl ? (
            <img src={worker.user.avatarUrl} alt=""
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>
              {worker.user?.firstName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                {worker.user?.firstName} {worker.user?.lastName}
              </h3>
              {worker.title && (
                <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>{worker.title}</p>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: status.bg, color: status.color, whiteSpace: 'nowrap' }}>
              {status.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, flexWrap: 'wrap' }}>
            {worker.user?.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {worker.user.city}
              </span>
            )}
            {worker.experienceYears > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Briefcase size={12} /> {worker.experienceYears} {t.years} опыта
              </span>
            )}
            {worker.expectedSalary && (
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                от {worker.expectedSalary.toLocaleString()} KGS
              </span>
            )}
          </div>

          {worker.bio && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {worker.bio}
            </p>
          )}

          {worker.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {worker.skills.slice(0, 5).map(s => (
                <span key={s} className="badge badge-primary" style={{ fontSize: 11 }}>{s}</span>
              ))}
              {worker.skills.length > 5 && (
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11 }}>
                  +{worker.skills.length - 5}
                </span>
              )}
            </div>
          )}
          {user?.role === 'EMPLOYER' && (
            <button className="btn-outline" onClick={handleChat}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px' }}>
              <MessageCircle size={14} /> Написать
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function WorkersPage() {
  const t = useT()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ search: '', city: '', minExp: '', maxSalary: '', page: 0 })
  const [totalPages, setTotalPages] = useState(0)

  const fetchWorkers = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    profileApi.searchWorkers({ ...params, size: 20 })
      .then(r => { setWorkers(r.data.content || []); setTotalPages(r.data.totalPages || 0) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchWorkers() }, [fetchWorkers])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }))
  const clearFilters = () => setFilters({ search: '', city: '', minExp: '', maxSalary: '', page: 0 })
  const activeCount = [filters.city, filters.minExp, filters.maxSalary].filter(Boolean).length

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 4 }}>Поиск сотрудников</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Найдите подходящего кандидата среди активных соискателей</p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 14px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
            placeholder="Должность, навык..."
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', background: 'transparent', color: 'var(--text)', padding: '10px 0' }} />
        </div>
        <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 14px' }}>
          <MapPin size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input value={filters.city} onChange={e => setFilter('city', e.target.value)}
            placeholder="Город"
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', background: 'transparent', color: 'var(--text)', padding: '10px 0' }} />
        </div>
        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
          onClick={() => setShowFilters(v => !v)}>
          <SlidersHorizontal size={15} />
          Фильтры
          {activeCount > 0 && <span className="badge badge-primary" style={{ padding: '1px 7px' }}>{activeCount}</span>}
        </button>
        {activeCount > 0 && (
          <button className="btn-ghost" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={15} /> Сбросить
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Мин. опыт (лет)</label>
            <input className="input" type="number" min={0} value={filters.minExp}
              onChange={e => setFilter('minExp', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Макс. зарплата (KGS)</label>
            <input className="input" type="number" value={filters.maxSalary}
              onChange={e => setFilter('maxSalary', e.target.value)} placeholder="∞" />
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '25%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 13, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Соискатели не найдены</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workers.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <WorkerCard worker={w} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button key={i} onClick={() => setFilters(f => ({ ...f, page: i }))}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: filters.page === i ? 'var(--primary)' : 'var(--border)', background: filters.page === i ? 'var(--primary)' : 'transparent', color: filters.page === i ? 'white' : 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
