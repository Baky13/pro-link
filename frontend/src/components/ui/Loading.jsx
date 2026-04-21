import { motion } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Loader2 size={size} />
    </motion.div>
  )
}

export function LoadingButton({ loading, children, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <>
          <LoadingSpinner size={16} />
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function LoadingState({ 
  loading = false,
  error = null,
  onRetry,
  children,
  skeleton,
  emptyState,
  emptyMessage = 'Нет данных'
}) {
  if (loading) {
    return skeleton || (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 40,
        color: 'var(--text-secondary)'
      }}>
        <LoadingSpinner size={24} />
        <span style={{ marginLeft: 12 }}>Загрузка...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <AlertCircle size={24} color="var(--danger)" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Произошла ошибка
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          {typeof error === 'string' ? error : 'Не удалось загрузить данные'}
        </p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={16} />
            Попробовать снова
          </button>
        )}
      </div>
    )
  }

  if (emptyState) {
    return emptyState
  }

  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return children
}

export function InlineLoader({ size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <LoadingSpinner size={size} />
    </span>
  )
}

export function PageLoader() {
  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        color: 'var(--text)'
      }}>
        <LoadingSpinner size={32} />
        <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
      </div>
    </div>
  )
}