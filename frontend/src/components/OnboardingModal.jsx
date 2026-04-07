import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export default function OnboardingModal({ role, onClose }) {
  const navigate = useNavigate()

  const steps = role === 'WORKER' ? [
    { icon: '👤', title: 'Заполни профиль', desc: 'Добавь фото, навыки и опыт работы — работодатели смотрят на это в первую очередь', action: () => { navigate('/profile'); onClose() }, btn: 'Заполнить профиль' },
    { icon: '🔍', title: 'Найди вакансию', desc: 'Просматривай вакансии и откликайся на подходящие', action: () => { navigate('/vacancies'); onClose() }, btn: 'Смотреть вакансии' },
    { icon: '💬', title: 'Общайся с работодателем', desc: 'После отклика можно написать работодателю напрямую в чате', action: onClose, btn: 'Понятно!' },
  ] : [
    { icon: '🏢', title: 'Заполни профиль компании', desc: 'Добавь логотип, описание и сайт — соискатели доверяют оформленным компаниям', action: () => { navigate('/profile'); onClose() }, btn: 'Заполнить профиль' },
    { icon: '💼', title: 'Разместить вакансию', desc: 'Создай вакансию с подробным описанием и зарплатой — это привлекает больше откликов', action: () => { navigate('/vacancies/create'); onClose() }, btn: 'Создать вакансию' },
    { icon: '✅', title: 'Управляй откликами', desc: 'Просматривай отклики, меняй статусы и общайся с кандидатами в чате', action: onClose, btn: 'Понятно!' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="card"
          style={{ maxWidth: 480, width: '100%', padding: 32, position: 'relative' }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Добро пожаловать в ProLink!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {role === 'WORKER' ? 'Вот с чего начать поиск работы' : 'Вот как начать нанимать сотрудников'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{step.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
                <span style={{ fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : '3️⃣'}
                </span>
              </motion.div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: 15 }}
            onClick={steps[0].action}
          >
            {steps[0].btn}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
