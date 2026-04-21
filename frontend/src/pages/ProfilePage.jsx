import { useState, useEffect } from 'react'
import { profileApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'
import { User, Briefcase, Globe, Plus, Trash2, Building2, Sparkles, X } from 'lucide-react'
import ProfileProgress from '../components/ProfileProgress'

const RESUME_EXAMPLE = `Должность: Senior Frontend Developer
Зарплата: 150000
Опыт: 5
О себе: Фронтенд-разработчик с 5 годами опыта. Специализация — React, TypeScript.
Навыки: React, TypeScript, Redux, Next.js, Node.js, Docker, Git
GitHub: github.com/ivan-ivanov
Портфолио: ivanov.dev
LinkedIn: linkedin.com/in/ivan-ivanov`

const FIELD_MAP = {
  'должность': 'title', 'позиция': 'title', 'position': 'title',
  'зарплата': 'expectedSalary', 'salary': 'expectedSalary',
  'опыт': 'experienceYears', 'experience': 'experienceYears', 'опыт работы': 'experienceYears',
  'о себе': 'bio', 'bio': 'bio', 'about': 'bio',
  'навыки': 'skills', 'skills': 'skills',
  'github': 'githubUrl', 'гитхаб': 'githubUrl',
  'портфолио': 'portfolioUrl', 'portfolio': 'portfolioUrl',
  'linkedin': 'linkedinUrl', 'линкедин': 'linkedinUrl',
}

function parseResume(text) {
  const result = {}
  const lines = text.split(/\r?\n/)
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const sep = line.indexOf(':')
    if (sep < 0) continue
    const key = line.slice(0, sep).trim().toLowerCase()
    const val = line.slice(sep + 1).trim()
    const field = FIELD_MAP[key]
    if (!field || !val) continue
    if (field === 'skills') {
      result.skills = val.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    } else if (field === 'experienceYears' || field === 'expectedSalary') {
      const n = parseInt(val.replace(/\D/g, ''), 10)
      if (!Number.isNaN(n)) result[field] = n
    } else {
      result[field] = val
    }
  }
  return result
}

export default function ProfilePage() {
  const { user } = useAuthStore()
    const t = useT()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [showExpForm, setShowExpForm] = useState(false)
  const [expForm, setExpForm] = useState({ companyName: '', position: '', description: '', startDate: '', endDate: '', isCurrent: false })
  const [showParseModal, setShowParseModal] = useState(false)
  const [parseText, setParseText] = useState('')

  const applyParsedResume = () => {
    const parsed = parseResume(parseText)
    if (Object.keys(parsed).length === 0) {
      toast.error('Не удалось распознать. Используй формат "Ключ: Значение"')
      return
    }
    setForm(f => ({ ...f, ...parsed, skills: parsed.skills?.length ? parsed.skills : (f.skills || []) }))
    setShowParseModal(false)
    setParseText('')
    toast.success(`Заполнено полей: ${Object.keys(parsed).length}. Проверь и сохрани.`)
  }

  useEffect(() => {
    if (!user) return
    const fetch = user.role === 'WORKER' ? profileApi.getWorker : profileApi.getEmployer
    fetch().then(r => {
      setProfile(r.data)
      setForm({
        ...r.data,
        experienceYears: Number(r.data.experienceYears) || 0,
        expectedSalary: Number(r.data.expectedSalary) || '',
      })
    }).finally(() => setLoading(false))
  }, [user])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const save = user.role === 'WORKER' ? profileApi.updateWorker : profileApi.updateEmployer
      const { data } = await save(form)
      setProfile(data)
      toast.success(t.profileSaved)
    } catch (err) {
      toast.error(err.response?.data?.message || t.error)
    } finally { setSaving(false) }
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await profileApi.uploadFile(type, file)
      toast.success(t.fileSaved)
      // Перезагружаем профиль
      const fetch = user.role === 'WORKER' ? profileApi.getWorker : profileApi.getEmployer
      const { data } = await fetch()
      setProfile(data)
    } catch (err) {
      toast.error(err.response?.data?.message || t.error)
    }
  }

  const handleFileDelete = async (type, label) => {
    if (!window.confirm(`Удалить ${label}?`)) return
    try {
      await profileApi.deleteFile(type)
      toast.success('Удалено')
      const fetch = user.role === 'WORKER' ? profileApi.getWorker : profileApi.getEmployer
      const { data } = await fetch()
      setProfile(data)
    } catch (err) {
      toast.error(err.response?.data?.message || t.error)
    }
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const exists = (form.skills || []).some(s => s.toLowerCase() === trimmed.toLowerCase())
    if (exists) { toast.error(t.skillExists); return }
    set('skills', [...(form.skills || []), trimmed])
    setSkillInput('')
  }

  const addExperience = () => {
    if (!expForm.companyName || !expForm.position || !expForm.startDate) {
      toast.error(t.fillExperienceRequired)
      return
    }
    set('experiences', [...(form.experiences || []), { ...expForm, id: Date.now() }])
    setExpForm({ companyName: '', position: '', description: '', startDate: '', endDate: '', isCurrent: false })
    setShowExpForm(false)
  }

  const removeExperience = idx => set('experiences', form.experiences.filter((_, i) => i !== idx))

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>
  if (!profile) return null

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      {showParseModal && (
        <div onClick={() => setShowParseModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card"
            style={{ maxWidth: 600, width: '100%', padding: 24, position: 'relative' }}>
            <button type="button" onClick={() => setShowParseModal(false)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--primary)" /> Авто-заполнение из резюме
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Вставь текст в формате "Ключ: Значение". Ключи: Должность, Зарплата, Опыт, О себе, Навыки (через запятую), GitHub, Портфолио, LinkedIn.
            </p>
            <textarea value={parseText} onChange={e => setParseText(e.target.value)}
              placeholder={RESUME_EXAMPLE} rows={12}
              className="input" style={{ fontFamily: 'monospace', fontSize: 13, resize: 'vertical', minHeight: 240 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <label style={{ padding: '8px 14px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                📂 Выбрать файл (.txt)
                <input type="file" accept=".txt,text/plain" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setParseText(String(reader.result || ''))
                    reader.onerror = () => toast.error('Не удалось прочитать файл')
                    reader.readAsText(file, 'utf-8')
                    e.target.value = ''
                  }} />
              </label>
              <button type="button" className="btn-ghost"
                onClick={() => setParseText(RESUME_EXAMPLE)}
                style={{ padding: '8px 14px', fontSize: 13 }}>
                Вставить пример
              </button>
              <button type="button" className="btn-ghost"
                onClick={() => setShowParseModal(false)}
                style={{ padding: '8px 14px', fontSize: 13 }}>
                Отмена
              </button>
              <button type="button" className="btn-primary" onClick={applyParsedResume}
                disabled={!parseText.trim()}
                style={{ padding: '8px 18px', fontSize: 13 }}>
                Заполнить
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.myProfile}</h1>
      <ProfileProgress profile={profile} role={user?.role} />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar / Logo */}
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Personal photo — always circle, left */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {profile.user?.avatarUrl ? (
              <img src={profile.user.avatarUrl} alt="Фото профиля"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white' }}>
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Фото</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ cursor: 'pointer' }}>
                <span className="btn-outline" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block' }}>📷 {t.uploadAvatar}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'avatars')} />
              </label>
              {profile.user?.avatarUrl && (
                <button type="button" onClick={() => handleFileDelete('avatars', 'фото')}
                  style={{ fontSize: 13, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 500 }}>
                  🗑 Удалить фото
                </button>
              )}
              {user.role === 'WORKER' && (
                <>
                  <label style={{ cursor: 'pointer' }}>
                    <span className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block', border: '1px solid var(--border)', borderRadius: 8 }}>📄 {t.uploadResume}</span>
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'resumes')} />
                  </label>
                  {profile.resumeUrl && (
                    <button type="button" onClick={() => handleFileDelete('resumes', 'резюме')}
                      style={{ fontSize: 13, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 500 }}>
                      🗑 Удалить резюме
                    </button>
                  )}
                  <button type="button" onClick={() => setShowParseModal(true)}
                    style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} /> Авто-заполнить
                  </button>
                </>
              )}
              {user.role === 'EMPLOYER' && (
                <>
                  <label style={{ cursor: 'pointer' }}>
                    <span className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block', border: '1px solid var(--border)', borderRadius: 8 }}>🏢 {t.uploadLogo}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'logos')} />
                  </label>
                  {profile.logoUrl && (
                    <button type="button" onClick={() => handleFileDelete('logos', 'логотип')}
                      style={{ fontSize: 13, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 500 }}>
                      🗑 Удалить логотип
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Company logo — right side, only for EMPLOYER */}
          {user.role === 'EMPLOYER' && (
            <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: 'auto' }}>
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Логотип компании"
                  style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: '1px solid var(--border)' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--text-secondary)' }}>
                  🏢
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Логотип</div>
            </div>
          )}
        </div>

        {/* Worker form */}
        {user.role === 'WORKER' && (
          <>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="var(--primary)" /> {t.basicInfo}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.position}</label>
                  <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Frontend разработчик" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.expectedSalary} (KGS)</label>
                  <input className="input" type="number" value={form.expectedSalary || ''} onChange={e => set('expectedSalary', e.target.value)} placeholder="80000" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.jobSearchStatus}</label>
                  <select className="input" value={form.jobSearchStatus || 'OPEN_TO_OFFERS'} onChange={e => set('jobSearchStatus', e.target.value)}>
                    <option value="ACTIVELY_LOOKING">{t.ACTIVELY_LOOKING}</option>
                    <option value="OPEN_TO_OFFERS">{t.OPEN_TO_OFFERS}</option>
                    <option value="NOT_LOOKING">{t.NOT_LOOKING}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    💼 Опыт работы (лет)
                  </label>
                  <input className="input" type="number" min={0} max={80}
                    value={form.experienceYears ?? 0}
                    onChange={e => set('experienceYears', e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="0" />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.bio}</label>
                <textarea className="input" value={form.bio || ''} onChange={e => set('bio', e.target.value)}
                  placeholder={t.bioPlaceholder} rows={4} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>

            {/* Links */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color="var(--primary)" /> {t.links}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'githubUrl', label: 'GitHub', placeholder: 'https://github.com/username' },
                  { key: 'portfolioUrl', label: t.portfolio, placeholder: 'https://myportfolio.com' },
                  { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--text-secondary)', width: 90, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                    <input className="input" value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="var(--primary)" /> {t.skills}
              </h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input className="input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="React, Java, Figma..." style={{ flex: 1 }} />
                <button type="button" className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={addSkill}>
                  <Plus size={14} /> {t.add}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(form.skills || []).map((skill, i) => (
                  <span key={i} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px' }}>
                    {skill}
                    <button type="button" onClick={() => set('skills', form.skills.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
                {(form.skills || []).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.noSkills}</p>}
              </div>
            </div>

            {/* Work Experience */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} color="var(--primary)" /> {t.workExperience}
                </h3>
                <button type="button" className="btn-outline" style={{ fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setShowExpForm(v => !v)}>
                  <Plus size={14} /> {t.addExperience}
                </button>
              </div>

              {showExpForm && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t.companyRequired}</label>
                      <input className="input" value={expForm.companyName} onChange={e => setExpForm(f => ({ ...f, companyName: e.target.value }))} placeholder="TechBishkek" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t.positionRequired}</label>
                      <input className="input" value={expForm.position} onChange={e => setExpForm(f => ({ ...f, position: e.target.value }))} placeholder="Frontend разработчик" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t.startDate}</label>
                      <input className="input" type="date" value={expForm.startDate} onChange={e => setExpForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t.endDate}</label>
                      <input className="input" type="date" value={expForm.endDate} onChange={e => setExpForm(f => ({ ...f, endDate: e.target.value }))} disabled={expForm.isCurrent} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
                    <input type="checkbox" checked={expForm.isCurrent} onChange={e => setExpForm(f => ({ ...f, isCurrent: e.target.checked, endDate: '' }))} />
                    {t.present}
                  </label>
                  <textarea className="input" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t.descriptionPlaceholder} rows={2} style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-primary" style={{ padding: '8px 20px' }} onClick={addExperience}>{t.add}</button>
                    <button type="button" className="btn-ghost" style={{ padding: '8px 16px' }} onClick={() => setShowExpForm(false)}>{t.cancel}</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(form.experiences || []).map((exp, i) => (
                  <div key={exp.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 14, borderLeft: '2px solid var(--primary)' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{exp.position}</p>
                      <p style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>{exp.companyName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {exp.startDate} — {exp.isCurrent ? t.present : exp.endDate}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeExperience(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {(form.experiences || []).length === 0 && !showExpForm && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.noExperience}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Employer form */}
        {user.role === 'EMPLOYER' && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.companyInfoTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.companyName}</label>
                <input className="input" value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.industry}</label>
                  <select className="input" value={form.industry || ''} onChange={e => set('industry', e.target.value)}>
                    <option value="">{t.industryPlaceholder || 'Выберите отрасль'}</option>
                    {[
                      'IT и разработка',
                      'Финансы и банки',
                      'Образование',
                      'Медицина и фармацевтика',
                      'Торговля и e-commerce',
                      'Строительство и недвижимость',
                      'Производство',
                      'Транспорт и логистика',
                      'Маркетинг и реклама',
                      'HR и рекрутинг',
                      'Сфера услуг',
                      'Искусство и медиа',
                      'Госслужба',
                      'Наука и исследования',
                      'Сельское хозяйство',
                      'Ресторанный бизнес',
                      'Туризм',
                      'Другое',
                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.companySize}</label>
                  <select className="input" value={form.companySize || ''} onChange={e => set('companySize', e.target.value)}>
                    <option value="">{t.companySizeSelect}</option>
                    {['1-10','10-50','50-100','100-500','500+'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.foundedYear}</label>
                  <input className="input" type="number" value={form.foundedYear || ''} onChange={e => set('foundedYear', e.target.value)} placeholder="2020" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.website}</label>
                  <input className="input" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://company.kg" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.companyDescription}</label>
                <textarea className="input" value={form.description || ''} onChange={e => set('description', e.target.value)}
                  placeholder={t.companyDescriptionPlaceholder} rows={5} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={saving} style={{ padding: '14px', fontSize: 16, alignSelf: 'flex-start', minWidth: 160 }}>
          {saving ? t.loading : t.save_btn}
        </button>
      </form>
    </div>
  )
}
