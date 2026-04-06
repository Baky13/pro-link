import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Users, Pencil, Trash2 } from 'lucide-react'
import { vacancyApi, applicationApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import { useConfirm } from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function MyVacanciesPage() {
  const { user } = useAuthStore()
    const t = useT()
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const [deleting, setDeleting] = useState(null)
  const [applicantsMap, setApplicantsMap] = useState({})

  useEffect(() => {
    if (user?.role !== 'EMPLOYER') { navigate('/'); return }
    vacancyApi.getMy({ size: 50 })
      .then(r => setVacancies(r.data.content || []))
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id) => {
    const ok = await confirm('Удалить вакансию? Это действие нельзя отменить.')
    if (!ok) return
    setDeleting(id)
    try {
      await vacancyApi.delete(id)
      setVacancies(prev => prev.filter(v => v.id !== id))
      toast.success('Вакансия удалена')
    } catch (e) {
      toast.error(e.response?.data?.message || t.error)
    } finally { setDeleting(null) }
  }

  const viewApplications = (vacancyId) => {
    navigate(`/vacancies/${vacancyId}/applications`)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      {ConfirmDialogComponent}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{t.myVacancies}</h1>
        <Link to="/vacancies/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> {t.postVacancy}
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 20 }}>У вас нет вакансий</p>
          <Link to="/vacancies/create" className="btn-primary">{t.postVacancy}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vacancies.map(v => (
            <div key={v.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Link to={`/vacancies/${v.id}`} style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                      {v.title}
                    </Link>
                    {v.isHot && <span className="badge badge-hot">{t.hot}</span>}
                    {v.isUrgent && <span className="badge badge-urgent">{t.urgent}</span>}
                    {!v.isActive && <span className="badge badge-danger">Неактивна</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {v.salaryFrom?.toLocaleString()} – {v.salaryTo?.toLocaleString()} {v.currency}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={13} /> {v.viewsCount || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} /> {v.applicantsCount || 0} откликов
                    </span>
                    <span>{t[v.employmentType]}</span>
                    {v.city && <span>📍 {v.city}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn-outline" style={{ fontSize: 13, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => navigate(`/vacancies/${v.id}/applications`)}>
                    <Users size={13} /> Отклики
                  </button>
                  <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => navigate(`/vacancies/${v.id}/edit`)}>
                    <Pencil size={13} />
                  </button>
                  <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => handleDelete(v.id)} disabled={deleting === v.id}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
