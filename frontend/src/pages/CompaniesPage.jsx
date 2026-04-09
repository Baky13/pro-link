import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Users, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { profileApi, chatApi } from '../api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

function CompanyCard({ employer }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleChat = async (e) => {
    e.stopPropagation()
    try {
      const { data } = await chatApi.getOrCreateDirectRoom(employer.user?.id)
      navigate(`/chat/${data.id}`)
    } catch { toast.error('Ошибка') }
  }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.2 }}
      className="card"
      style={{ padding: 24, cursor: 'pointer' }}
      onClick={() => navigate(`/employers/${employer.id}`)}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {employer.logoUrl ? (
          <img src={employer.logoUrl} alt=""
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>
            {employer.companyName?.[0]?.toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{employer.companyName}</h3>
                {employer.isVerified && <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Проверено</span>}
                {employer.isBlacklisted && <span className="badge badge-danger" style={{ fontSize: 11 }}>⚠️ Ненадёжный</span>}
              </div>
              {employer.industry && (
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{employer.industry}</p>
              )}
            </div>
            {employer.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--warning)', fontWeight: 700 }}>
                <Star size={14} fill="currentColor" /> {Number(employer.rating).toFixed(1)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, flexWrap: 'wrap' }}>
            {employer.companySize && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> {employer.companySize} сотрудников
              </span>
            )}
            {employer.foundedYear && <span>📅 Основана в {employer.foundedYear}</span>}
            {employer.reviewsCount > 0 && <span>💬 {employer.reviewsCount} отзывов</span>}
          </div>

          {employer.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {employer.description}
            </p>
          )}

          {user?.role === 'WORKER' && (
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

export default function CompaniesPage() {
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)

  const fetchEmployers = useCallback(() => {
    if (loading) {
      setLoading(true)
    } else {
      setSearching(true)
    }
    const params = { page, size: 20 }
    if (search) params.search = search
    if (industry) params.industry = industry
    profileApi.searchEmployers(params)
      .then(r => { setEmployers(r.data.content || []); setTotalPages(r.data.totalPages || 0) })
      .finally(() => { setLoading(false); setSearching(false) })
  }, [search, industry, page])

  useEffect(() => { fetchEmployers() }, [fetchEmployers])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 4 }}>Компании</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Найдите работодателя и напишите им напрямую</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 14px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Название компании..."
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', background: 'transparent', color: 'var(--text)', padding: '10px 0' }} />
        </div>
        <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 14px' }}>
          <input value={industry} onChange={e => { setIndustry(e.target.value); setPage(0) }}
            placeholder="Отрасль..."
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', background: 'transparent', color: 'var(--text)', padding: '10px 0' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '25%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 13, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : employers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Компании не найдены</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: searching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {employers.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <CompanyCard employer={e} />
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: page === i ? 'var(--primary)' : 'var(--border)', background: page === i ? 'var(--primary)' : 'transparent', color: page === i ? 'white' : 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
