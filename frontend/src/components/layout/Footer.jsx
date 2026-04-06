import { Link, useLocation } from 'react-router-dom'

const HIDE_FOOTER_PATHS = ['/chat', '/notifications', '/applications', '/profile', '/my-vacancies']

export default function Footer() {
  const location = useLocation()
  const hide = HIDE_FOOTER_PATHS.some(p => location.pathname.startsWith(p))
  if (hide) return null

  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', marginTop: 60, padding: '40px 20px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</span>
              <span style={{ color: 'var(--text)' }}>Link</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Платформа для поиска работы в Кыргызстане. Честные зарплаты, прозрачный найм.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text)' }}>Соискателям</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Найти работу', '/vacancies'], ['Мои отклики', '/applications'], ['Профиль', '/profile']].map(([label, to]) => (
                <Link key={to} to={to} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text)' }}>Работодателям</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Разместить вакансию', '/vacancies/create'], ['Мои вакансии', '/my-vacancies']].map(([label, to]) => (
                <Link key={to} to={to} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ProLink — Кыргызстан</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Сделано с ❤️ в Бишкеке</p>
        </div>
      </div>
    </footer>
  )
}
