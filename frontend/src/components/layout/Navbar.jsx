import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Bell, ChevronDown, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore, useNotifStore } from '../../store'
import { useT } from '../../utils/i18n'
import { authApi, notificationApi } from '../../api'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const { unreadCount, setUnreadCount } = useNotifStore()
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!user) return
    notificationApi.getUnreadCount().then(r => setUnreadCount(r.data.count || 0)).catch(() => {})
    const interval = setInterval(() => {
      notificationApi.getUnreadCount().then(r => setUnreadCount(r.data.count || 0)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = () => setMenuOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/')
  }

  const isActive = path => location.pathname === path

  const navLinks = [
    { to: '/vacancies', label: t.findJob },
    { to: '/map', label: '🗺️ Карта' },
    ...(user?.role === 'EMPLOYER' ? [
      { to: '/dashboard', label: '📊 Дашборд' },
      { to: '/workers', label: '👥 Сотрудники' },
      { to: '/vacancies/create', label: t.postVacancy },
    ] : []),
  ]

  const userMenuLinks = [
    { to: '/profile', label: t.myProfile, icon: '👤' },
    ...(user?.role === 'WORKER' ? [
      { to: '/applications', label: t.myApplications, icon: '📋' },
      { to: '/saved', label: 'Сохранённые', icon: '🔖' },
    ] : []),
    ...(user?.role === 'EMPLOYER' ? [{ to: '/my-vacancies', label: t.myVacancies, icon: '💼' }] : []),
    { to: '/chat', label: 'Чаты', icon: '💬' },
    { to: '/notifications', label: t.notifications, icon: '🔔' },
  ]

  return (
    <>
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrolled ? 'var(--shadow-md)' : '0 1px 0 var(--border)',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Logo */}
          <Link to="/" style={{ fontWeight: 900, fontSize: 22, marginRight: 20, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <span style={{ background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</span>
            <span style={{ color: 'var(--text)' }}>Link</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 2, flex: 1 }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                color: isActive(link.to) ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--primary-light)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>

            {/* Theme toggle */}
            <button onClick={toggle}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s', flexShrink: 0 }}>
              <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </button>

            {user ? (
              <>
                {/* Bell */}
                <Link to="/notifications"
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: unreadCount > 0 ? 'var(--primary-light)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.15s', flexShrink: 0 }}>
                  <Bell size={16} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid var(--bg-card)' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                {/* User menu — desktop */}
                <div className="hide-mobile" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 10, border: '1px solid var(--border)', background: menuOpen ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #5b5ef4, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {user.firstName?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user.firstName}</span>
                    <motion.div animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={13} color="var(--text-secondary)" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="card"
                        style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 210, padding: 6, zIndex: 200, boxShadow: 'var(--shadow-lg)' }}
                      >
                        <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{user.firstName} {user.lastName}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</p>
                        </div>
                        {userMenuLinks.map(item => (
                          <Link key={item.to} to={item.to}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: isActive(item.to) ? 'var(--primary)' : 'var(--text)', background: isActive(item.to) ? 'var(--primary-light)' : 'transparent', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!isActive(item.to)) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = isActive(item.to) ? 'var(--primary-light)' : 'transparent' }}>
                            <span>{item.icon}</span> {item.label}
                          </Link>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                          <button onClick={handleLogout}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            🚪 {t.logout}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hide-mobile" style={{ display: 'flex', gap: 6 }}>
                <Link to="/login" className="btn-ghost" style={{ fontWeight: 600 }}>{t.login}</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 18px' }}>{t.register}</Link>
              </div>
            )}

            {/* Burger — mobile only */}
            <button
              className="show-mobile"
              onClick={() => setMobileOpen(v => !v)}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <motion.div key={mobileOpen ? 'x' : 'menu'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {mobileOpen ? <X size={18} color="var(--text)" /> : <Menu size={18} color="var(--text)" />}
              </motion.div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
              background: 'var(--bg-card)', zIndex: 99,
              padding: 20, display: 'flex', flexDirection: 'column', gap: 6,
              borderTop: '1px solid var(--border)', overflowY: 'auto',
            }}
          >
            {navLinks.map((link, i) => (
              <motion.div key={link.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={link.to} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: isActive(link.to) ? 'var(--primary)' : 'var(--text)', background: isActive(link.to) ? 'var(--primary-light)' : 'transparent' }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {user ? (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                <div style={{ padding: '8px 16px', marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{user.firstName} {user.lastName}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>
                {userMenuLinks.map((item, i) => (
                  <motion.div key={item.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <Link to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: isActive(item.to) ? 'var(--primary)' : 'var(--text)', background: isActive(item.to) ? 'var(--primary-light)' : 'transparent' }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}>
                  🚪 {t.logout}
                </button>
              </>
            ) : (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: 'var(--primary)', border: '1.5px solid var(--primary)' }}>{t.login}</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '12px', fontSize: 15, borderRadius: 10 }}>{t.register}</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
