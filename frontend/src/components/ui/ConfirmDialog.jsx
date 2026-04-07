import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Подтвердите действие',
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  const colors = {
    danger: { bg: '#fee2e2', text: '#dc2626', icon: '#ef4444' },
    warning: { bg: '#fef3c7', text: '#d97706', icon: '#f59e0b' },
    info: { bg: '#dbeafe', text: '#2563eb', icon: '#3b82f6' }
  }

  const color = colors[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="card"
              style={{
                maxWidth: 400,
                width: '100%',
                padding: 24,
                position: 'relative'
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 4,
                  borderRadius: 4
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: color.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <AlertTriangle size={24} color={color.icon} />
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--text)'
              }}>
                {title}
              </h3>

              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: 24
              }}>
                {message}
              </p>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={onClose}
                  className="btn-ghost"
                  style={{ padding: '8px 16px' }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={type === 'danger' ? 'btn-danger' : 'btn-primary'}
                  style={{ padding: '8px 16px' }}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}