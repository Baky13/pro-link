import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { Mail, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1=email, 2=token+password
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSendEmail = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('Код отправлен на email')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка')
    } finally { setLoading(false) }
  }

  const handleReset = async e => {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('Минимум 6 символов'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(token, newPassword)
      toast.success('Пароль изменён! Войдите заново.')
      window.location.href = '/login'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Неверный код')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Назад к входу
        </Link>

        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {step === 1 ? <Mail size={24} color="var(--primary)" /> : <KeyRound size={24} color="var(--primary)" />}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            {step === 1 ? 'Забыли пароль?' : 'Новый пароль'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {step === 1
              ? 'Введите email — отправим код для сброса пароля'
              : `Код отправлен на ${email}. Введите его и новый пароль`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '13px', fontSize: 15 }}>
              {loading ? 'Отправка...' : 'Отправить код'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Код из email</label>
              <input className="input" required value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Вставьте код" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Новый пароль</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} required
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '13px', fontSize: 15 }}>
              {loading ? 'Сохранение...' : 'Сменить пароль'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep(1)} style={{ fontSize: 14 }}>
              Отправить код повторно
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
