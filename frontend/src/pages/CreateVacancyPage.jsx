import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vacancyApi, categoryApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE', 'INTERNSHIP']

const err = (color) => ({ borderColor: color ? 'var(--danger)' : undefined })

export default function CreateVacancyPage() {
  const { user } = useAuthStore()
    const t = useT()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: '', description: '', requirements: '',
    salaryFrom: '', salaryTo: '', currency: 'KGS',
    categoryId: '', city: 'Бишкек',
    employmentType: 'FULL_TIME',
    isHot: false, isUrgent: false,
    responseDeadlineDays: 7,
    autoRejectEnabled: false, autoRejectMinExp: '', autoRejectMinAge: '', autoRejectCustomCriteria: '',
    skills: [],
  })

  useEffect(() => {
    if (user?.role !== 'EMPLOYER') { navigate('/'); return }
    categoryApi.getAll().then(r => {
      const flat = []
      ;(r.data || []).forEach(parent => {
        flat.push({ ...parent, parentId: null })
        ;(parent.children || []).forEach(child => flat.push({ ...child, parentId: parent.id }))
      })
      setCategories(flat)
    })
  }, [user])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const clearError = (key) => setErrors(e => ({ ...e, [key]: false }))

  const parents = categories.filter(c => !c.parentId)
  const children = selectedParent ? categories.filter(c => c.parentId === selectedParent) : []
  const selectedParentData = parents.find(p => p.id === selectedParent)
  const selectedChild = categories.find(c => c.id === Number(form.categoryId))

  const handleParentClick = (parentId) => {
    setSelectedParent(parentId === selectedParent ? null : parentId)
    set('categoryId', '')
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const exists = form.skills.some(s => s.toLowerCase() === trimmed.toLowerCase())
    if (exists) { toast.error(t.skillExists); return }
    set('skills', [...form.skills, trimmed])
    setSkillInput('')
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = true
    if (!form.categoryId) e.categoryId = true
    if (!form.description.trim()) e.description = true
    if (!form.salaryFrom) e.salaryFrom = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) { toast.error(t.fillRequired); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        salaryFrom: form.salaryFrom ? Number(form.salaryFrom) : null,
        salaryTo: form.salaryTo ? Number(form.salaryTo) : null,
        responseDeadlineDays: Number(form.responseDeadlineDays),
        autoRejectMinExp: form.autoRejectMinExp ? Number(form.autoRejectMinExp) : null,
        autoRejectMinAge: form.autoRejectMinAge ? Number(form.autoRejectMinAge) : null,
        autoRejectCustomCriteria: form.autoRejectCustomCriteria || null,
      }
      const { data } = await vacancyApi.create(payload)
      toast.success(t.vacancyCreated)
      navigate(`/vacancies/${data.id}`)
    } catch (e) {
      toast.error(e.response?.data?.message || t.error)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.postVacancy}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.basicInfo}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: errors.title ? 'var(--danger)' : 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {t.vacancyTitle}
              </label>
              <input className="input" value={form.title}
                onChange={e => { set('title', e.target.value); clearError('title') }}
                placeholder={t.vacancyTitlePlaceholder}
                style={err(errors.title)} />
              {errors.title && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{t.requiredField}</span>}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: errors.categoryId ? 'var(--danger)' : 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                {t.categoryRequired}
              </label>
              {errors.categoryId && <span style={{ fontSize: 12, color: 'var(--danger)', display: 'block', marginBottom: 6 }}>{t.specifyCategory}</span>}

              {form.categoryId && selectedChild ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-primary" style={{ fontSize: 13, padding: '5px 12px' }}>
                    {selectedParentData?.icon} {selectedParentData?.name} → {selectedChild.name}
                  </span>
                  <button type="button" className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}
                    onClick={() => { set('categoryId', ''); setSelectedParent(null); clearError('categoryId') }}>
                    {t.change}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: selectedParent ? 10 : 0 }}>
                    {parents.map(p => (
                      <button key={p.id} type="button" onClick={() => handleParentClick(p.id)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, border: '1.5px solid',
                          borderColor: selectedParent === p.id ? 'var(--primary)' : 'var(--border)',
                          background: selectedParent === p.id ? 'var(--primary-light)' : 'transparent',
                          color: selectedParent === p.id ? 'var(--primary)' : 'var(--text)',
                          fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
                        }}>
                        {p.icon} {p.name}
                      </button>
                    ))}
                  </div>
                  {selectedParent && children.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 12, borderLeft: '2px solid var(--primary)', marginTop: 8 }}>
                      {children.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => { set('categoryId', String(c.id)); clearError('categoryId') }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)',
                            background: 'transparent', color: 'var(--text)',
                            fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.employmentType}</label>
                <select className="input" value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                  {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{t[type]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.city}</label>
                <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.responseDays}</label>
                <input className="input" type="number" min={1} max={30} value={form.responseDeadlineDays} onChange={e => set('responseDeadlineDays', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: errors.description ? 'var(--danger)' : 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {t.descriptionRequired}
              </label>
              <textarea className="input" value={form.description}
                onChange={e => { set('description', e.target.value); clearError('description') }}
                rows={5} style={{ resize: 'vertical', fontFamily: 'inherit', ...err(errors.description) }}
                placeholder={t.descriptionVacancyPlaceholder} />
              {errors.description && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{t.requiredField}</span>}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.requirementsLabel}</label>
              <textarea className="input" value={form.requirements} onChange={e => set('requirements', e.target.value)}
                rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder={t.requirementsPlaceholder} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.salary}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: errors.salaryFrom ? 'var(--danger)' : 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.salaryFrom}</label>
              <input className="input" type="number" value={form.salaryFrom}
                onChange={e => { set('salaryFrom', e.target.value); clearError('salaryFrom') }}
                placeholder="50000" style={err(errors.salaryFrom)} />
              {errors.salaryFrom && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{t.specifySalary}</span>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.salaryTo}</label>
              <input className="input" type="number" value={form.salaryTo} onChange={e => set('salaryTo', e.target.value)} placeholder="100000" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.currency}</label>
              <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="KGS">KGS</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.skills}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input className="input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Например: React, Java, Figma..." style={{ flex: 1 }} />
            <button type="button" className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={addSkill}>
              <Plus size={14} /> {t.add}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.skills.map((skill, i) => (
              <span key={i} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px' }}>
                {skill}
                <button type="button" onClick={() => set('skills', form.skills.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
            {form.skills.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.noSkills}</p>}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.settings}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isHot} onChange={e => set('isHot', e.target.checked)} />
              {t.hotVacancy}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isUrgent} onChange={e => set('isUrgent', e.target.checked)} />
              {t.urgentHiring}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.autoRejectEnabled} onChange={e => set('autoRejectEnabled', e.target.checked)} />
              {t.autoReject}
            </label>
            {form.autoRejectEnabled && (
              <div style={{ marginLeft: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Мин. опыт (лет)</label>
                <input className="input" type="number" min={0} value={form.autoRejectMinExp} onChange={e => set('autoRejectMinExp', e.target.value)} placeholder="2" style={{ maxWidth: 200 }} />
              </div>
            )}
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={saving} style={{ padding: '14px', fontSize: 16, alignSelf: 'flex-start', minWidth: 200 }}>
          {saving ? t.loading : t.publishVacancy}
        </button>
      </form>
    </div>
  )
}
