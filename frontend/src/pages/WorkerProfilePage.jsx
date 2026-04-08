import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, MapPin, Briefcase, Calendar } from 'lucide-react'
import { profileApi } from '../api'

import { useT } from '../utils/i18n'

export default function WorkerProfilePage() {
  const { id } = useParams()
    const t = useT()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.getWorkerById(id)
      .then(r => setProfile(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>
  if (!profile) return null

  const STATUS_COLORS = {
    ACTIVELY_LOOKING: 'badge-success',
    OPEN_TO_OFFERS: 'badge-warning',
    NOT_LOOKING: 'badge-danger',
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <button className="btn-ghost" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> {t.back}
      </button>

      {/* Header */}
      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {profile.user?.avatarUrl ? (
            <img src={profile.user.avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', flexShrink: 0 }}>
              {profile.user?.firstName?.[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{profile.user?.firstName} {profile.user?.lastName}</h1>
              {profile.jobSearchStatus && (
                <span className={`badge ${STATUS_COLORS[profile.jobSearchStatus]}`}>
                  {t[profile.jobSearchStatus]}
                </span>
              )}
            </div>
            {profile.title && <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>{profile.title}</p>}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)' }}>
              {profile.user?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {profile.user.city}</span>}
              {profile.experienceYears > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={13} /> {profile.experienceYears} {t.years} опыта</span>}
              {profile.expectedSalary && <span style={{ fontWeight: 700, color: 'var(--primary)' }}>от {profile.expectedSalary.toLocaleString()} KGS</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{t.bio}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
        </div>
      )}

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{t.skills}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.skills.map(s => <span key={s} className="badge badge-primary" style={{ padding: '5px 12px' }}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Experience */}
      {profile.experiences?.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.workExperience}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {profile.experiences.map(exp => (
              <div key={exp.id} style={{ paddingLeft: 16, borderLeft: '2px solid var(--primary)' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.position}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{exp.companyName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <Calendar size={12} />
                  {exp.startDate} — {exp.isCurrent ? t.present : exp.endDate}
                </div>
                {exp.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(profile.githubUrl || profile.portfolioUrl || profile.linkedinUrl) && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Ссылки</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { url: profile.githubUrl, label: 'GitHub' },
              { url: profile.portfolioUrl, label: t.portfolio },
              { url: profile.linkedinUrl, label: 'LinkedIn' },
            ].filter(l => l.url).map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>
                <Globe size={14} /> {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
