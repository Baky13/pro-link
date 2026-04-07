import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, Users, Briefcase, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { vacancyApi, applicationApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'

export default function EmployerDashboard() {
  const { user } = useAuthStore()
  const t = useT()
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'EMPLOYER') { navigate('/'); return }
    vacancyApi.getMy({ size: 50 })
      .then(r => setVacancies(r.data.content || []))
      .finally(() => setLoading(false))
  }, [user])

  const totalViews = vacancies.reduce((s, v) => s + (v.viewsCount || 0), 0)
  const totalApplicants = vacancies.reduce((s, v) => s + (v.applicantsCount || 0), 0)
  const activeVacancies = vacancies.filter(v => v.isActive).length

  const stats = [
    { icon: <Briefcase size={22} />, value: activeVacancies, label: 'Активных вакансий', color: '#5b5ef4', bg: '#eeeeff' },
    { icon: <Users size={22} />, value: totalApplicants, label: 'Всего откликов', color: '#10b981', bg: '#d1fae5' },
    { icon: <Eye size={22} />, value: totalViews, label: 'Просмотров', color: '#f59e0b', bg: '#fef3c7' },
    { icon: <TrendingUp size={22} />, value: vacancies.length, label: 'Всего вакансий', color: '#8b5cf6', bg: '#ede9fe' },
  ]

  if (loading) return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, marginBottom: 4 }}>
            Добро пожаловать, {user?.firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Вот что происходит с вашими вакансиями</p>
        </div>
        <Link to="/vacancies/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Новая вакансия
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Vacancies table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Мои вакансии</h2>
          <Link to="/my-vacancies" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            Все вакансии <ArrowRight size={14} />
          </Link>
        </div>

        {vacancies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Нет вакансий</p>
            <Link to="/vacancies/create" className="btn-primary">Создать первую вакансию</Link>
          </div>
        ) : (
          <div>
            {vacancies.slice(0, 5).map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ padding: '16px 24px', borderBottom: i < Math.min(vacancies.length, 5) - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Link to={`/vacancies/${v.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{v.title}</Link>
                    {v.isHot && <span className="badge badge-hot" style={{ fontSize: 11 }}>🔥</span>}
                    {v.isUrgent && <span className="badge badge-urgent" style={{ fontSize: 11 }}>⚡</span>}
                    {!v.isActive && <span className="badge badge-danger" style={{ fontSize: 11 }}>Неактивна</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.city} · {t[v.employmentType]}</div>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} /> {v.viewsCount || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {v.applicantsCount || 0}</span>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => navigate(`/vacancies/${v.id}/applications`)}>
                    Отклики
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
