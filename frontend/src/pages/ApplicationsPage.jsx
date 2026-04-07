import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, X } from 'lucide-react'
import { applicationApi, chatApi } from '../api'

import { useT } from '../utils/i18n'
import { useConfirm } from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  VIEWED: 'badge-primary',
  INVITED: 'badge-success',
  REJECTED: 'badge-danger',
}

export default function ApplicationsPage() {
    const t = useT()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    applicationApi.getMy({ size: 50 })
      .then(r => setApplications(r.data.content || []))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    const ok = await confirm('Отменить отклик? Вы сможете откликнуться снова.')
    if (!ok) return
    setCancelling(id)
    try {
      await applicationApi.cancel(id)
      setApplications(prev => prev.filter(a => a.id !== id))
      toast.success('Отклик отменён')
    } catch (e) {
      toast.error(e.response?.data?.message || t.error)
    } finally { setCancelling(null) }
  }

  const handleOpenChat = async (app) => {
    try {
      const { data } = await chatApi.getOrCreateRoom(app.id)
      navigate(`/chat/${data.id}`)
    } catch {
      toast.error('Не удалось открыть чат')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      {ConfirmDialogComponent}
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.myApplications}</h1>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.noData}</p>
          <Link to="/vacancies" className="btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>{t.findJob}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/vacancies/${app.vacancy?.id}`} style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                    {app.vacancy?.title}
                  </Link>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {app.vacancy?.employer?.companyName}
                  </p>
                  {app.coverLetter && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{app.coverLetter.slice(0, 120)}{app.coverLetter.length > 120 ? '...' : ''}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${STATUS_COLORS[app.status] || 'badge-primary'}`}>
                    {t[app.status] || app.status}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>

                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {/* Кнопка чата — только если приглашён или просмотрено */}
                    {(app.status === 'INVITED' || app.status === 'VIEWED') && (
                      <button className="btn-outline" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleOpenChat(app)}>
                        <MessageCircle size={13} /> Написать
                      </button>
                    )}

                    {/* Кнопка отмены — только если не приглашён */}
                    {app.status !== 'INVITED' && (
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleCancel(app.id)}
                        disabled={cancelling === app.id}>
                        <X size={13} /> {cancelling === app.id ? '...' : 'Отменить'}
                      </button>
                    )}
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
