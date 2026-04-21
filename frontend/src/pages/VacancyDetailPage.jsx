import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, Users, Eye, Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, Share2, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { vacancyApi, applicationApi, chatApi, profileApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import { SkeletonText } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function VacancyDetailPage() {
  const { id } = useParams()
    const t = useT()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applicationId, setApplicationId] = useState(null)
  const [saved, setSaved] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [workerProfile, setWorkerProfile] = useState(null)

  useEffect(() => {
    vacancyApi.getById(id)
      .then(r => setVacancy(r.data))
      .catch(() => setError(t.noData))
      .finally(() => setLoading(false))

    if (user?.role === 'WORKER') {
      applicationApi.check(Number(id)).then(r => {
        if (r.data.applied) {
          setApplied(true)
          setApplicationId(r.data.applicationId)
        }
      }).catch(() => {})
      // Загружаем профиль работника для проверки опыта
      profileApi.getWorker().then(r => setWorkerProfile(r.data)).catch(() => {})
    }
  }, [id])

  const hasEnoughExp = !vacancy?.autoRejectMinExp || !workerProfile || workerProfile.experienceYears >= vacancy.autoRejectMinExp

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    if (!hasEnoughExp) {
      toast.error(`Недостаточно опыта. Требуется от ${vacancy.autoRejectMinExp} лет, у вас ${workerProfile?.experienceYears} лет.`)
      return
    }
    if (showApplyForm) {
      setApplying(true)
      try {
        const { data } = await applicationApi.apply({ vacancyId: Number(id), coverLetter })
        setApplied(true)
        setApplicationId(data.id)
        setShowApplyForm(false)
        toast.success(t.applicationSent)
      } catch (e) {
        toast.error(e.response?.data?.message || t.error)
      } finally { setApplying(false) }
    } else {
      setShowApplyForm(true)
    }
  }

  const handleOpenChat = async () => {
    if (!applicationId) return
    if (!hasEnoughExp) {
      toast.error(`Недостаточно опыта. Требуется от ${vacancy.autoRejectMinExp} лет.`)
      return
    }
    try {
      const { data } = await chatApi.getOrCreateRoom(applicationId)
      navigate(`/chat/${data.id}`)
    } catch { toast.error(t.error + ': ' + t.noData) }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Ссылка скопирована!')
  }

  const handleSave = async () => {
    if (!user) { navigate('/login'); return }
    try { await vacancyApi.toggleSave(id); setSaved(v => !v) } catch {}
  }

  const formatSalary = () => {
    if (!vacancy) return ''
    if (!vacancy.salaryFrom && !vacancy.salaryTo) return t.salaryNotSpecified
    const c = vacancy.currency || 'KGS'
    if (vacancy.salaryFrom && vacancy.salaryTo) return `${vacancy.salaryFrom.toLocaleString()} – ${vacancy.salaryTo.toLocaleString()} ${c}`
    if (vacancy.salaryFrom) return `${t.from} ${vacancy.salaryFrom.toLocaleString()} ${c}`
    return `${t.to} ${vacancy.salaryTo.toLocaleString()} ${c}`
  }

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: 32 }}>
        <SkeletonText width="60%" height={28} />
        <div style={{ marginTop: 12 }}><SkeletonText width="40%" height={18} /></div>
        <div style={{ marginTop: 24 }}><SkeletonText height={16} /></div>
        <div style={{ marginTop: 8 }}><SkeletonText height={16} /></div>
        <div style={{ marginTop: 8 }}><SkeletonText width="80%" height={16} /></div>
      </div>
    </div>
  )

  if (!vacancy && !loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{error || 'Вакансия не найдена'}</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> {t.back}
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user?.role === 'EMPLOYER' && vacancy.employerUserId === user.id && (
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
              onClick={() => navigate(`/vacancies/${id}/edit`)}>
              <Edit2 size={16} /> Изменить
            </button>
          )}
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={handleShare}>
            <Share2 size={16} /> Поделиться
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Main content */}
        <div>
          <div className="card" style={{ padding: 32, marginBottom: 20 }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {vacancy.isHot && <span className="badge badge-hot">{t.hot}</span>}
              {vacancy.isUrgent && <span className="badge badge-urgent">{t.urgent}</span>}
              {vacancy.employer?.isVerified && <span className="badge badge-success">{t.verified}</span>}
              {vacancy.employer?.isBlacklisted && <span className="badge badge-danger">{t.blacklisted}</span>}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{vacancy.title}</h1>

            <Link to={`/employers/${vacancy.employer?.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
              {vacancy.employer?.companyName} <ExternalLink size={14} />
            </Link>

            {/* Salary */}
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', marginBottom: 20 }}>
              {formatSalary()}
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
              {vacancy.city && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={15} /> {vacancy.city}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={15} /> {vacancy.applicantsCount || 0} {t.applicants}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={15} /> {vacancy.viewsCount || 0} {t.views}</span>
              {vacancy.responseDeadlineDays && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> {t.responseDeadline} {vacancy.responseDeadlineDays} {t.days}</span>
              )}
              {vacancy.autoRejectMinExp > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontWeight: 600 }}>
                  💼 Опыт от {vacancy.autoRejectMinExp} лет
                </span>
              )}
              {vacancy.autoRejectMinAge > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontWeight: 600 }}>
                  👤 Возраст от {vacancy.autoRejectMinAge} лет
                </span>
              )}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              <span className="badge badge-primary">{t[vacancy.employmentType]}</span>
              {vacancy.category && <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{vacancy.category.icon} {vacancy.category.name}</span>}
            </div>

            {/* Description */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t.description}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 24 }}>{vacancy.description}</p>

            {/* Requirements */}
            {vacancy.requirements && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t.requirements}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 24 }}>{vacancy.requirements}</p>
              </>
            )}

            {/* Skills */}
            {vacancy.skills?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t.skills}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {vacancy.skills.map(s => (
                    <span key={s} className="badge badge-primary">{s}</span>
                  ))}
                </div>
              </>
            )}

            {/* Auto reject requirements */}
            {vacancy.autoRejectMinExp > 0 && (
              <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 10, background: 'var(--warning-50, #fffbeb)', border: '1.5px solid var(--warning)' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--warning-700, #b45309)', marginBottom: 6 }}>
                  ⚠️ Требования для отклика
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  💼 Опыт работы: строго от <strong>{vacancy.autoRejectMinExp} лет</strong>
                </p>
              </div>
            )}
          </div>

          {/* Apply form */}
          {showApplyForm && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t.coverLetter}</h3>
              <textarea className="input" value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder={t.coverLetterPlaceholder}
                style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 84 }}>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            {user?.role === 'WORKER' && (
              <>
                {vacancy.autoRejectMinExp > 0 && workerProfile && workerProfile.experienceYears < vacancy.autoRejectMinExp && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-50, #fef2f2)', border: '1.5px solid var(--danger)', marginBottom: 10, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
                    ⚠️ У вас {workerProfile.experienceYears} лет опыта, требуется от {vacancy.autoRejectMinExp} лет. Отклик будет автоматически отклонён.
                  </div>
                )}
                <button className="btn-primary" style={{ width: '100%', marginBottom: 10, fontSize: 16, padding: '12px 20px', opacity: !hasEnoughExp ? 0.5 : 1 }}
                  onClick={handleApply} disabled={applied || applying}>
                  {applied ? t.applied : applying ? t.loading : showApplyForm ? t.sendApplication : t.apply}
                </button>
                {applied && applicationId && (
                  <button className="btn-outline" style={{ width: '100%', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={handleOpenChat}>
                    {t.writeToEmployer}
                  </button>
                )}
                {showApplyForm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ 
                      width: '100%', 
                      marginBottom: 10,
                      padding: '12px 20px',
                      borderRadius: 8,
                      border: '2px solid var(--danger)',
                      background: 'var(--danger-50, #fef2f2)',
                      color: 'var(--danger)',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-50, #fef2f2)'; e.currentTarget.style.color = 'var(--danger)' }}
                    onClick={() => setShowApplyForm(false)}>
                    ❌ {t.cancel}
                  </motion.button>
                )}
                <button className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleSave}>
                  {saved ? <><BookmarkCheck size={16} /> {t.saved}</> : <><Bookmark size={16} /> {t.save}</>}
                </button>
              </>
            )}
            {user?.role === 'EMPLOYER' && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>{t.youAreEmployer}</p>
            )}
            {!user && (
              <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '12px 20px' }}
                onClick={() => navigate('/login')}>{t.apply}</button>
            )}
          </div>

          {/* Employer card */}
          {vacancy.employer && (
            <Link to={`/employers/${vacancy.employer.id}`} style={{ display: 'block' }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {vacancy.employer.logoUrl ? (
                    <img src={vacancy.employer.logoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                      {vacancy.employer.companyName?.[0]}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{vacancy.employer.companyName}</div>
                    {vacancy.employer.rating > 0 && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⭐ {Number(vacancy.employer.rating).toFixed(1)}</div>
                    )}
                  </div>
                </div>
                {vacancy.employer.isBlacklisted && (
                  <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '6px 0' }}>
                    {t.blacklisted}
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
