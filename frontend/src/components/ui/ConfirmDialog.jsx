import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCancel}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 28, animation: 'fadeUp 0.2s ease' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: danger ? '#fee2e2' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} color={danger ? 'var(--danger)' : 'var(--primary)'} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Подтверждение</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onCancel} style={{ padding: '9px 20px' }}>Отмена</button>
          <button onClick={onConfirm}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', background: danger ? 'var(--danger)' : 'var(--primary)', color: 'white' }}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}

export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, message: '', danger: true })
  const [resolver, setResolver] = useState(null)

  const confirm = (message, danger = true) => {
    return new Promise(resolve => {
      setState({ isOpen: true, message, danger })
      setResolver(() => resolve)
    })
  }

  const handleConfirm = () => {
    setState(s => ({ ...s, isOpen: false }))
    resolver?.(true)
  }

  const handleCancel = () => {
    setState(s => ({ ...s, isOpen: false }))
    resolver?.(false)
  }

  return {
    confirm,
    ConfirmDialogComponent: (
      <ConfirmDialog
        isOpen={state.isOpen}
        message={state.message}
        danger={state.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }
}
