import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'out'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 1800)
    const t2 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #5b5ef4 0%, #8b5cf6 55%, #ec4899 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 24,
          }}
        >
          {/* Blobs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              🔗
            </motion.div>

            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: -2 }}
              >
                Pro
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.75)', letterSpacing: -2 }}
              >
                Link
              </motion.span>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500, letterSpacing: 0.3 }}
            >
              Платформа для поиска работы
            </motion.p>
          </motion.div>

          {/* Loader dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ display: 'flex', gap: 8, marginTop: 16 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
