import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #f8f9ff)',
          padding: 20
        }}>
          <div style={{
            maxWidth: 480,
            width: '100%',
            padding: 32,
            textAlign: 'center',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text, #111)' }}>
              Что-то пошло не так
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary, #6b7280)', marginBottom: 24, lineHeight: 1.5 }}>
              Произошла неожиданная ошибка. Попробуйте обновить страницу или вернуться на главную.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                background: 'var(--bg-secondary, #f3f4f6)',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--danger, #dc2626)',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: 16,
                maxHeight: 200,
                whiteSpace: 'pre-wrap'
              }}>
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--primary, #6366f1)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}>
                Обновить страницу
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border, #e5e7eb)',
                  background: 'transparent',
                  color: 'var(--text, #111)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}>
                На главную
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
