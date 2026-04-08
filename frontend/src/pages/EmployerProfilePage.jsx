import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, ExternalLink, MessageCircle } from 'lucide-react'
import { profileApi, reviewApi, chatApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

export default function EmployerProfilePage() {
  const { id } = useParams()
  const t = useT()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [employer, setEmployer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [tab, setTab] = useState('about')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', isAnonymous: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      profileApi.getEmployerById(id),
      reviewApi.getAll(id, { size: 20 }),
    ]).then(([emp, rev]) => {
      if (emp.status === 'fulfilled') setEmployer(emp.value.data)
      if (rev.status === 'fulfilled') setReviews(rev.value.data.content || [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleChat = async () => {
    try {
      const { data } = await chatApi.getOrCreateDirectRoom(employer.user?.id)
      navigate(`/chat/${data.id}`)
    } catch { toast.error('Ошибка') }
  }

  const handleReview = async e => {
    e.preventDefault()
    try {
      const { data } = await reviewApi.add(id, reviewForm)
      setReviews(r => [data, ...r])
      toast.success('Отзыв добавлен')
    } catch (e) { toast.error(e.response?.data?.message || t.error) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>
  if (!employer) return null

  const tabs = [
    { key: 'about', label: t.companyInfo },
    { key: 'reviews', label: `${t.reviews} (${employer.reviewsCount || 0})` },
  ]

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
              {employer.website && (
                <a href={employer.website} target="_blank" rel="noreferrer"
                  style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={13} /> Сайт
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              {employer.rating > 0 && (
                <span>⭐ <strong>{Number(employer.rating).toFixed(1)}</strong> ({employer.reviewsCount} {t.reviews})</span>
              )}
              {employer.complaintsCount > 0 && (
                <span style={{ color: employer.isBlacklisted ? 'var(--danger)' : 'var(--warning)' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {employer.complaintsCount} {t.complaints}
                </span>
              )}
              {user?.role === 'WORKER' && (
                <button className="btn-primary" onClick={handleChat}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: 14 }}>
                  <MessageCircle size={15} /> Написать
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              color: tab === key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s'
            }}>
            {label}
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
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= reviewForm.rating ? 1 : 0.3 }}>⭐</button>
                  ))}
                </div>
                <textarea className="input" value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Ваш отзыв..." style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={reviewForm.isAnonymous}
                    onChange={e => setReviewForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                  Анонимно
                </label>
                <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                  Отправить
                </button>
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
          {reviews.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>{t.noData}</p>
          )}
        </div>
      )}
    </div>
  )
}
