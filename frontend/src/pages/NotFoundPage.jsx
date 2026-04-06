import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function NotFoundPage() {
  const { user } = useAuthStore()

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🔍</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
          404
        </h1>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Страница не найдена</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
          Возможно, страница была удалена или вы перешли по неверной ссылке
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary" style={{ padding: '12px 28px' }}>На главную</Link>
          <Link to="/vacancies" className="btn-outline" style={{ padding: '12px 28px' }}>Найти работу</Link>
        </div>
      </div>
    </div>
  )
}
