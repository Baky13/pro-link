import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react'
import { matchApi, applicationApi, chatApi } from '../api'
import MatchBadge from '../components/ui/MatchBadge'

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
    // Отклики приходят УЖЕ отсортированными по совпадению (ИИ-ранжирование)
    matchApi.applicants(id)
      .then(r => setApplications(r.data || []))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (appId, status) => {
    try {
      const { data } = await applicationApi.updateStatus(appId, status)
      setApplications(prev => prev.map(a => a.applicationId === appId ? { ...a, status: data.status } : a))
      toast.success('Статус обновлён')
    } catch { toast.error(t.error) }
  }

  const handleChat = async (app) => {
    try {
      const { data } = await chatApi.getOrCreateRoom(app.applicationId)
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

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        Отклики на вакансию <span style={{ color: 'var(--primary)' }}>({applications.length})</span>
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        ✨ Отсортированы по совпадению с вакансией — ИИ ProLink
      </p>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Откликов пока нет</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => (
            <div key={app.applicationId} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
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

                  {/* ИИ-резюме кандидата */}
                  {app.matchSummary && (
                    <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(30,79,214,0.06)', borderRadius: 12, border: '1px solid rgba(30,79,214,0.18)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        <Sparkles size={12} /> ИИ-оценка ProLink
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{app.matchSummary}</p>
                      {app.missingSkills?.length > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                          Не хватает: {app.missingSkills.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

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
                  <MatchBadge score={app.matchScore} />
                  <span className={`badge ${STATUS_COLORS[app.status]}`}>{t[app.status]}</span>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn-outline" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => handleChat(app)}>
                      <MessageCircle size={13} /> Написать
                    </button>
                    {STATUSES.filter(s => s !== app.status).map(s => (
                      <button key={s} className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px',
                        color: s === 'INVITED' ? 'var(--success)' : s === 'REJECTED' ? 'var(--danger)' : 'var(--primary)' }}
                        onClick={() => handleStatus(app.applicationId, s)}>
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
