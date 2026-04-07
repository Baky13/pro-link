import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
      <div>
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ position: 'relative', marginBottom: 32, display: 'inline-block' }}
        >
          <div style={{
            fontSize: 'clamp(80px, 15vw, 140px)',
            fontWeight: 900,
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            letterSpacing: -4,
          }}>
            404
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: -20, right: -20, fontSize: 48 }}
          >
            🔍
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 12 }}>
            Страница не найдена
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
            Возможно, страница была удалена или вы перешли по неверной ссылке
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-primary" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Home size={16} /> На главную
            </Link>
            <Link to="/vacancies" className="btn-outline" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} /> Найти работу
            </Link>
          </div>
        </motion.div>

        {/* Decorative dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}
        >
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
