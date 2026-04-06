import { useState, useEffect } from 'react'
import { feedbackApi, categoryApi } from '../api'

import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

export default function SalaryCalculatorPage() {
    const t = useT()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ categoryId: '', city: 'Бишкек', experienceYears: 0 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { categoryApi.getAll().then(r => setCategories(r.data || [])) }, [])

  const handleCalc = async e => {
    e.preventDefault()
    if (!form.categoryId) { toast.error('Выберите категорию'); return }
    setLoading(true)
    try {
      const { data } = await feedbackApi.calculateSalary({ ...form, categoryId: Number(form.categoryId), experienceYears: Number(form.experienceYears) })
      setResult(data)
    } catch {
      toast.error('Нет данных для выбранных параметров')
    } finally { setLoading(false) }
  }

  const pct = result ? Math.round(((result.salaryAvg - result.salaryMin) / (result.salaryMax - result.salaryMin)) * 100) : 50

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>{t.salaryCalculator}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.calcDescription}</p>
      </div>

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <form onSubmit={handleCalc} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t.category}</label>
            <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Выберите категорию</option>
              {categories.filter(c => !c.parentId).map(c => (
                <optgroup key={c.id} label={`${c.icon} ${c.name}`}>
                  {categories.filter(sub => sub.parentId === c.id).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t.city}</label>
            <select className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
              <option value="Бишкек">Бишкек</option>
              <option value="Ош">Ош</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              {t.yearsOfExperience}: <strong style={{ color: 'var(--primary)' }}>{form.experienceYears} {t.years}</strong>
            </label>
            <input type="range" min={0} max={15} value={form.experienceYears}
              onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              <span>0</span><span>5</span><span>10</span><span>15+</span>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '14px', fontSize: 16 }}>
            {loading ? t.loading : t.calculate}
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
            {result.categoryName} · {result.city}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
            Опыт: {result.experienceYears} {t.years} · {result.currency}
          </p>

          {/* Salary range visual */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.marketMin}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.marketMax}</span>
            </div>
            <div style={{ position: 'relative', height: 8, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 8 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #10b981, var(--primary), #8b5cf6)', borderRadius: 4, opacity: 0.3 }} />
              <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: t.marketMin, value: result.salaryMin, color: '#10b981' },
              { label: t.marketAvg, value: result.salaryAvg, color: 'var(--primary)', big: true },
              { label: t.marketMax, value: result.salaryMax, color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: 20, textAlign: 'center', border: item.big ? `2px solid ${item.color}` : undefined }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: item.big ? 24 : 20, fontWeight: 900, color: item.color }}>
                  {item.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{result.currency} {t.perMonth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
