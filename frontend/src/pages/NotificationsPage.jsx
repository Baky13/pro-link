import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api'
import { useNotifStore } from '../store'
import { useT } from '../utils/i18n'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  APPLICATION_STATUS: '📋',
  NEW_MESSAGE: '💬',
  NEW_VACANCY: '💼',
  REVIEW: '⭐',
  STALE_APPLICATION: '⏰',
  VACANCY_REOPENED: '🔄',
  COMPANY_BLACKLISTED: '⚠️',
  RESPONSE_DEADLINE_WARNING: '🔔',
}

export default function NotificationsPage() {
    const t = useT()
  const navigate = useNavigate()
  const { reset, decrement } = useNotifStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi.getAll({ size: 50 })
      .then(r => setNotifications(r.data.content || []))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifications(n => n.map(item => ({ ...item, isRead: true })))
    reset()
    toast.success('Все прочитаны')
  }

  const handleClick = async (n) => {
    if (!n.isRead) {
      // Помечаем как прочитанные только уведомления этого чата, если это сообщение
      try {
        if (n.type === 'NEW_MESSAGE' && n.referenceId) {
          await notificationApi.markChatRead(n.referenceId)
          // Считаем сколько непрочитанных уведомлений этого чата будет помечено
          const chatUnreadCount = notifications.filter(item => 
            item.type === 'NEW_MESSAGE' && 
            item.referenceId === n.referenceId && 
            !item.isRead
          ).length
          
          // Обновляем все уведомления этого чата в локальном состоянии
          setNotifications(prev => prev.map(item =>
            item.type === 'NEW_MESSAGE' && item.referenceId === n.referenceId
              ? { ...item, isRead: true }
              : item
          ))
          
          // Уменьшаем счетчик на количество помеченных уведомлений
          for (let i = 0; i < chatUnreadCount; i++) {
            decrement()
          }
        } else {
          // Для других типов уведомлений помечаем только одно
          setNotifications(prev => prev.map(item =>
            item.id === n.id ? { ...item, isRead: true } : item
          ))
          decrement()
        }
      } catch {
        // В случае ошибки помечаем только текущее уведомление
        setNotifications(prev => prev.map(item =>
          item.id === n.id ? { ...item, isRead: true } : item
        ))
        decrement()
      }
    }
    
    // Навигация по типу уведомления
    if (!n.referenceId) return
    
    console.log('Navigating from notification:', n.type, n.referenceId)
    
    if (n.type === 'NEW_MESSAGE') {
      navigate(`/chat/${n.referenceId}`)
    } else if (n.type === 'APPLICATION_STATUS') {
      navigate('/applications')
    } else if (n.type === 'VACANCY_REOPENED') {
      navigate(`/vacancies/${n.referenceId}`)
    } else if (n.type === 'STALE_APPLICATION') {
      navigate('/applications')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>{t.loading}</div>

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={22} color="var(--primary)" /> {t.notifications}
          {unreadCount > 0 && <span className="badge badge-primary" style={{ fontSize: 13 }}>{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }} onClick={markAllRead}>
            <CheckCheck size={16} /> {t.markAllRead}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.noNotifications}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} onClick={() => handleClick(n)}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
                opacity: n.isRead ? 0.7 : 1,
                cursor: n.referenceId ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (n.referenceId) e.currentTarget.style.transform = 'translateX(2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title}</p>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {new Date(n.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
