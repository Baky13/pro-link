import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authApi } from '../api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Неверная ссылка верификации')
      return
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Email успешно подтверждён!')
        setTimeout(() => navigate('/'), 3000)
      })
      .catch(e => {
        setStatus('error')
        setMessage(e.response?.data?.message || 'Ссылка недействительна или истекла')
      })
  }, [])

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ maxWidth: 400, width: '100%', padding: 40, textAlign: 'center' }}
      >
        {status === 'loading' && (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 20 }}>
              <Loader size={48} color="var(--primary)" />
            </motion.div>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Подтверждаем email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ marginBottom: 20 }}>
              <CheckCircle size={64} color="var(--success)" />
            </motion.div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Email подтверждён!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Перенаправляем на главную...</p>
            <button className="btn-primary" onClick={() => navigate('/')}>На главную</button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ marginBottom: 20 }}>
              <XCircle size={64} color="var(--danger)" />
            </motion.div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Ошибка верификации</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{message}</p>
            <button className="btn-primary" onClick={() => navigate('/')}>На главную</button>
          </>
        )}
      </motion.div>
    </div>
  )
}
