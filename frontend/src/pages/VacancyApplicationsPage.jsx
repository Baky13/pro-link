import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { applicationApi, chatApi } from '../api'

import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  VIEWED: 'badge-primary',
  INVITED: 'badge-success',
  REJECTED: 'badge-danger',
}

const STATUSES = ['VIEWED', 'INVITED', 'REJECTED']

export default function VacancyApplicationsPage() {
  const { id } = useParams()
    const t = useT()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationApi.getByVacancy(id, { size: 50 })
      .then(r => setApplications(r.data.content || []))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (appId, status) => {
    try {
      const { data } = await applicationApi.updateStatus(appId, status)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: data.status } : a))
      toast.success('Статус обновлён')
    } catch { toast.error(t.error) }
  }

  const handleChat = async (app) => {
    try {
      const { data } = await chatApi.getOrCreateRoom(app.id)
      navigate(`/chat/${data.id}`)
    } catch { toast.error('Не удалось открыть чат') }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <button className="btn-ghost" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => navigate('/my-vacancies')}>
        <ArrowLeft size={16} /> {t.back}
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>
        Отклики на вакансию <span style={{ color: 'var(--primary)' }}>({applications.length})</span>
      </h1>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Откликов пока нет</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, flexShrink: 0 }}>
                      {app.worker?.user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/workers/${app.worker?.id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}>
                        {app.worker?.user?.firstName} {app.worker?.user?.lastName}
                      </Link>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {app.worker?.title} · {app.worker?.experienceYears} лет опыта
                        {app.worker?.expectedSalary && ` · от ${app.worker.expectedSalary.toLocaleString()} KGS`}
                      </p>
                    </div>
                  </div>
                  {app.coverLetter && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5, marginTop: 8 }}>
                      "{app.coverLetter.slice(0, 150)}{app.coverLetter.length > 150 ? '...' : ''}"
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    {new Date(app.createdAt).toLocaleDateString('ru')}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${STATUS_COLORS[app.status]}`}>{t[app.status]}</span>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn-outline" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => handleChat(app)}>
                      <MessageCircle size={13} /> Написать
                    </button>
                    {STATUSES.filter(s => s !== app.status).map(s => (
                      <button key={s} className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px',
                        color: s === 'INVITED' ? 'var(--success)' : s === 'REJECTED' ? 'var(--danger)' : 'var(--primary)' }}
                        onClick={() => handleStatus(app.id, s)}>
                        {t[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
