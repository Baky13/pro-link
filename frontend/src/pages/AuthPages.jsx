import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import OnboardingModal from '../components/OnboardingModal'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <div style={{
        flex: 1, display: 'none', background: 'linear-gradient(135deg, #5b5ef4 0%, #8b5cf6 60%, #ec4899 100%)',
        padding: 48, flexDirection: 'column', justifyContent: 'space-between',
      }} className="auth-left">
        <div style={{ fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: -0.5 }}>ProLink</div>
        <div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20, letterSpacing: -1 }}>
            Найди работу<br />
            <span style={{ background: 'linear-gradient(90deg, #fde68a, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>мечты</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '✅', text: 'Зарплата указана в каждой вакансии' },
              { icon: '💬', text: 'Прямой чат с работодателем' },
              { icon: '🔔', text: 'Уведомления о статусе отклика' },
              { icon: '⚡', text: 'Срочные вакансии выделены отдельно' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, display: 'inline-flex', alignItems: 'center', gap: 2, marginBottom: 24 }}>
              <span style={{ background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</span>
              <span style={{ color: 'var(--text)' }}>Link</span>
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const t = useT()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data)
      navigate('/')
    } catch {
      toast.error('Неверный email или пароль')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Добро пожаловать!" subtitle="Войдите в свой аккаунт">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.email}</label>
          <input className="input" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.password}</label>
          <div style={{ position: 'relative' }}>
            <input className="input" type={showPass ? 'text' : 'password'} required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={loading}
          style={{ padding: '13px', fontSize: 15, marginTop: 4, width: '100%' }}>
          {loading ? t.loading : t.login}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
        <Link to="/forgot-password" style={{ color: 'var(--text-secondary)' }}>Забыли пароль?</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
        {t.noAccount} <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.register}</Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const t = useT()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'WORKER', companyName: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [registeredRole, setRegisteredRole] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      setAuth(data)
      setRegisteredRole(form.role)
      setShowOnboarding(true)
    } catch (e) {
      toast.error(e.response?.data?.message || t.error)
    } finally { setLoading(false) }
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          role={registeredRole}
          onClose={() => { setShowOnboarding(false); navigate('/') }}
        />
      )}
      <AuthLayout title="Создать аккаунт" subtitle="Начните поиск работы уже сегодня">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { role: 'WORKER', icon: '👤', label: t.iAmWorker },
            { role: 'EMPLOYER', icon: '🏢', label: t.iAmEmployer },
          ].map(({ role, icon, label }) => (
            <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
              style={{
                padding: '12px 8px', borderRadius: 10, border: '2px solid',
                borderColor: form.role === role ? 'var(--primary)' : 'var(--border)',
                background: form.role === role ? 'var(--primary-light)' : 'var(--bg-secondary)',
                color: form.role === role ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
              }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.firstName}</label>
              <input className="input" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Азамат" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.lastName}</label>
              <input className="input" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Бейшенов" />
            </div>
          </div>
          {form.role === 'EMPLOYER' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.companyName}</label>
              <input className="input" required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="TechBishkek" />
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.email}</label>
            <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.password}</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} required minLength={6} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Минимум 6 символов" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}
            style={{ padding: '13px', fontSize: 15, marginTop: 4, width: '100%' }}>
            {loading ? t.loading : t.register}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          {t.alreadyHaveAccount} <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.login}</Link>
        </p>
      </AuthLayout>
    </>
  )
}
