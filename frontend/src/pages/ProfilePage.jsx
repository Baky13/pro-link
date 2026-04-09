import { useState, useEffect } from 'react'
import { profileApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'
import { User, Briefcase, Globe, Plus, Trash2, Building2 } from 'lucide-react'
import ProfileProgress from '../components/ProfileProgress'

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
    } catch { toast.error(t.error) }
    finally { setSaving(false) }
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
    } catch { toast.error(t.error) }
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
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.myProfile}</h1>
      <ProfileProgress profile={profile} role={user?.role} />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar / Logo */}
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            {profile.user?.avatarUrl || profile.logoUrl ? (
              <img src={profile.user?.avatarUrl || profile.logoUrl} alt=""
                style={{ width: 80, height: 80, borderRadius: user.role === 'WORKER' ? '50%' : 16, objectFit: 'cover', border: '3px solid var(--primary)' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: user.role === 'WORKER' ? '50%' : 16, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white' }}>
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ cursor: 'pointer' }}>
                <span className="btn-outline" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block' }}>📷 {t.uploadAvatar}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'avatars')} />
              </label>
              {user.role === 'WORKER' && (
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block', border: '1px solid var(--border)', borderRadius: 8 }}>📄 {t.uploadResume}</span>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'resumes')} />
                </label>
              )}
              {user.role === 'EMPLOYER' && (
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px', display: 'inline-block', border: '1px solid var(--border)', borderRadius: 8 }}>🏢 {t.uploadLogo}</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'logos')} />
                </label>
              )}
            </div>
          </div>
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
                <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid var(--primary)', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                  💼 Опыт: {profile.experienceYears || 0} лет (считается автоматически)
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
                  <input className="input" value={form.industry || ''} onChange={e => set('industry', e.target.value)} placeholder={t.industryPlaceholder} />
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
