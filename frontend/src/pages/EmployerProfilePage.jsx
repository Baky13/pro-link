import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, AlertTriangle, ExternalLink } from 'lucide-react'
import { profileApi, reviewApi, feedbackApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

const EXIT_REASONS = ['LOW_SALARY', 'BAD_MANAGEMENT', 'NO_GROWTH', 'TOXIC_CULTURE', 'RELOCATION', 'OTHER']
const EXIT_LABELS = { LOW_SALARY: 'Низкая зарплата', BAD_MANAGEMENT: 'Плохое руководство', NO_GROWTH: 'Нет роста', TOXIC_CULTURE: 'Токсичная культура', RELOCATION: 'Переезд', OTHER: 'Другое' }
const COMPLAINT_REASONS = ['FAKE_VACANCY', 'NO_PAYMENT', 'FRAUD', 'HARASSMENT', 'OTHER']
const COMPLAINT_LABELS = { FAKE_VACANCY: 'Фейковая вакансия', NO_PAYMENT: 'Не платят', FRAUD: 'Мошенничество', HARASSMENT: 'Харассмент', OTHER: 'Другое' }

export default function EmployerProfilePage() {
  const { id } = useParams()
    const t = useT()
  const { user } = useAuthStore()
  const [employer, setEmployer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [exitStats, setExitStats] = useState(null)
  const [tab, setTab] = useState('about')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', isAnonymous: true })
  const [complaintForm, setComplaintForm] = useState({ reason: 'FAKE_VACANCY', description: '' })
  const [exitForm, setExitForm] = useState({ reason: 'LOW_SALARY', comment: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      profileApi.getEmployerById(id),
      reviewApi.getAll(id, { size: 20 }),
      feedbackApi.getExitStats(id),
    ]).then(([emp, rev, exit]) => {
      if (emp.status === 'fulfilled') setEmployer(emp.value.data)
      if (rev.status === 'fulfilled') setReviews(rev.value.data.content || [])
      if (exit.status === 'fulfilled') setExitStats(exit.value.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleReview = async e => {
    e.preventDefault()
    try {
      const { data } = await reviewApi.add(id, reviewForm)
      setReviews(r => [data, ...r])
      toast.success('Отзыв добавлен')
    } catch (e) { toast.error(e.response?.data?.message || t.error) }
  }

  const handleComplaint = async e => {
    e.preventDefault()
    try {
      await feedbackApi.addComplaint(id, complaintForm)
      toast.success('Жалоба отправлена')
    } catch (e) { toast.error(e.response?.data?.message || t.error) }
  }

  const handleExitReason = async e => {
    e.preventDefault()
    try {
      await feedbackApi.addExitReason(id, exitForm)
      toast.success('Причина добавлена')
    } catch (e) { toast.error(e.response?.data?.message || t.error) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>Загрузка...</div>
  if (!employer) return null

  const tabs = ['about', 'reviews', 'exit', 'complaint']
  const tabLabels = { about: t.companyInfo, reviews: t.reviews, exit: t.exitReasons, complaint: t.addComplaint }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {employer.logoUrl ? (
            <img src={employer.logoUrl} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: '1px solid var(--border)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
              {employer.companyName?.[0]}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>{employer.companyName}</h1>
              {employer.isVerified && <span className="badge badge-success">{t.verified}</span>}
              {employer.isBlacklisted && <span className="badge badge-danger">{t.blacklisted}</span>}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)' }}>
              {employer.industry && <span>🏭 {employer.industry}</span>}
              {employer.companySize && <span>👥 {employer.companySize}</span>}
              {employer.foundedYear && <span>📅 {employer.foundedYear}</span>}
              {employer.website && <a href={employer.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={13} /> Сайт</a>}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 14 }}>
              {employer.rating > 0 && <span>⭐ <strong>{Number(employer.rating).toFixed(1)}</strong> ({employer.reviewsCount} {t.reviews})</span>}
              {employer.complaintsCount > 0 && (
                <span style={{ color: employer.isBlacklisted ? 'var(--danger)' : 'var(--warning)' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {employer.complaintsCount} {t.complaints}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              color: tab === tabKey ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === tabKey ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s'
            }}>
            {tabLabels[tabKey]}
          </button>
        ))}
      </div>

      {/* About */}
      {tab === 'about' && (
        <div className="card" style={{ padding: 28 }}>
          {employer.description ? (
            <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{employer.description}</p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>{t.noData}</p>
          )}
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div>
          {user && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.addReview}</h3>
              <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= reviewForm.rating ? 1 : 0.3 }}>⭐</button>
                  ))}
                </div>
                <textarea className="input" value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Ваш отзыв..." style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={reviewForm.isAnonymous} onChange={e => setReviewForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                  Анонимно
                </label>
                <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>Отправить</button>
              </form>
            </div>
          )}
          {reviews.map(r => (
            <div key={r.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.reviewerName}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.createdAt?.slice(0, 10)}</span>
              </div>
              <div style={{ marginBottom: 8 }}>{'⭐'.repeat(r.rating)}</div>
              {r.comment && <p style={{ fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>{t.noData}</p>}
        </div>
      )}

      {/* Exit reasons */}
      {tab === 'exit' && (
        <div>
          {exitStats && exitStats.totalExits > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.exitReasons} ({exitStats.totalExits})</h3>
              {Object.entries(exitStats.reasonCounts).map(([reason, count]) => (
                <div key={reason} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                    <span>{EXIT_LABELS[reason] || reason}</span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                    <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 3, width: `${Math.round((count / exitStats.totalExits) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {user && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.addExitReason}</h3>
              <form onSubmit={handleExitReason} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <select className="input" value={exitForm.reason} onChange={e => setExitForm(f => ({ ...f, reason: e.target.value }))}>
                  {EXIT_REASONS.map(r => <option key={r} value={r}>{EXIT_LABELS[r]}</option>)}
                </select>
                <textarea className="input" value={exitForm.comment} onChange={e => setExitForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Комментарий (необязательно)..." style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} />
                <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>Отправить</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Complaint */}
      {tab === 'complaint' && user && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.addComplaint}</h3>
          <form onSubmit={handleComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <select className="input" value={complaintForm.reason} onChange={e => setComplaintForm(f => ({ ...f, reason: e.target.value }))}>
              {COMPLAINT_REASONS.map(r => <option key={r} value={r}>{COMPLAINT_LABELS[r]}</option>)}
            </select>
            <textarea className="input" value={complaintForm.description} onChange={e => setComplaintForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Опишите ситуацию подробнее..." style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} />
            <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start', padding: '10px 24px', background: 'var(--danger)' }}>
              Отправить жалобу
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
