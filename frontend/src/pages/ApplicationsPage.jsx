import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, X } from 'lucide-react'
import { applicationApi, chatApi } from '../api'
import { useT } from '../utils/i18n'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { SkeletonList } from '../components/ui/Skeleton'
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
  const [cancelling, setCancelling] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, applicationId: null })

  useEffect(() => {
    applicationApi.getMy({ size: 50 })
      .then(r => setApplications(r.data.content || []))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = (id) => {
    setConfirmCancel({ isOpen: true, applicationId: id })
  }

  const confirmCancelApplication = async () => {
    const { applicationId } = confirmCancel
    setCancelling(applicationId)
    try {
      await applicationApi.cancel(applicationId)
      setApplications(prev => prev.filter(a => a.id !== applicationId))
      toast.success('Отклик отменён')
    } catch (e) {
      toast.error(e.response?.data?.message || t.error)
    } finally { 
      setCancelling(null)
      setConfirmCancel({ isOpen: false, applicationId: null })
    }
  }

  const handleOpenChat = async (app) => {
    try {
      const { data } = await chatApi.getOrCreateRoom(app.id)
      navigate(`/chat/${data.id}`)
    } catch {
      toast.error('Не удалось открыть чат')
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 24 }} />
      <SkeletonList count={3} />
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <ConfirmDialog
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, applicationId: null })}
        onConfirm={confirmCancelApplication}
        title="Отменить отклик?"
        message="Вы уверены, что хотите отменить отклик? Вы сможете откликнуться снова."
        confirmText="Отменить"
        cancelText="Оставить"
        type="warning"
      />
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
