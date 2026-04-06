import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, Search, ChevronUp } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { chatApi, notificationApi } from '../api'
import { useAuthStore } from '../store'
import { useT } from '../utils/i18n'

export default function ChatPage() {
  const { roomId } = useParams()
  const { user } = useAuthStore()
    const t = useT()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [activeRoom, setActiveRoom] = useState(roomId ? Number(roomId) : null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef(null)
  const messagesRef = useRef(null)
  const stompRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    chatApi.getRooms().then(r => {
      const data = r.data || []
      setRooms(data)
      setFilteredRooms(data)
      if (!activeRoom && data.length > 0) setActiveRoom(data[0].id)
    }).finally(() => setLoading(false))
  }, [user])

  // Поиск по чатам
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredRooms(rooms.filter(room => {
        const other = user?.role === 'WORKER' ? room.employer : room.worker
        return `${other?.firstName} ${other?.lastName}`.toLowerCase().includes(q)
      }))
    }
  }, [searchQuery, rooms])

  // Загружаем сообщения при смене комнаты
  useEffect(() => {
    if (!activeRoom) return
    setPage(0)
    setMessages([])
    chatApi.getMessages(activeRoom, { size: 30, page: 0 }).then(r => {
      const content = r.data.content?.reverse() || []
      setMessages(content)
      setHasMore(!r.data.last)
    })
    notificationApi.markAllRead().catch(() => {})
  }, [activeRoom])

  // Скролл вниз при первой загрузке
  useEffect(() => {
    if (page === 0) bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length > 0 && page === 0])

  // Скролл вниз при новом сообщении
  useEffect(() => {
    if (messages.length > 0 && page === 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // WebSocket
  useEffect(() => {
    if (!activeRoom || !user) return
    const token = localStorage.getItem('accessToken')
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/room/${activeRoom}`, msg => {
          const message = JSON.parse(msg.body)
          setMessages(prev => [...prev, message])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        })
      },
      reconnectDelay: 3000,
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [activeRoom, user])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    const scrollEl = messagesRef.current
    const prevScrollHeight = scrollEl?.scrollHeight || 0
    try {
      const r = await chatApi.getMessages(activeRoom, { size: 30, page: nextPage })
      const older = r.data.content?.reverse() || []
      setMessages(prev => [...older, ...prev])
      setHasMore(!r.data.last)
      setPage(nextPage)
      // Сохраняем позицию скролла
      setTimeout(() => {
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight
      }, 0)
    } finally { setLoadingMore(false) }
  }

  const handleSend = async e => {
    e.preventDefault()
    if (!input.trim() || !activeRoom || sending) return
    setSending(true)
    try {
      await chatApi.sendMessage(activeRoom, input.trim())
      setInput('')
    } finally { setSending(false) }
  }

  const handleRoomSelect = id => {
    setActiveRoom(id)
    setMessages([])
    navigate(`/chat/${id}`)
  }

  const getOtherUser = room => {
    if (!room || !user) return null
    return user.role === 'WORKER' ? room.employer : room.worker
  }

  const activeRoomData = rooms.find(r => r.id === activeRoom)

  if (!user) return null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageCircle size={22} color="var(--primary)" /> Чаты
      </h1>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 0 }}>

        {/* Список комнат */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Поиск */}
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 8, padding: '7px 12px' }}>
              <Search size={14} color="var(--text-secondary)" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск диалогов..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', width: '100%' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 14 }}>{t.loading}</div>
            ) : filteredRooms.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                {searchQuery ? 'Не найдено' : 'Нет диалогов'}
              </div>
            ) : filteredRooms.map(room => {
              const other = getOtherUser(room)
              const isActive = room.id === activeRoom
              return (
                <button key={room.id} onClick={() => handleRoomSelect(room.id)}
                  style={{ width: '100%', padding: '14px 16px', border: 'none', textAlign: 'left', cursor: 'pointer', background: isActive ? 'var(--primary-light)' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: isActive ? 'var(--primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: isActive ? 'white' : 'var(--text-secondary)' }}>
                      {other?.firstName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other?.firstName} {other?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {user.role === 'WORKER' ? 'Работодатель' : 'Соискатель'}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Область сообщений */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeRoom ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)' }}>
              <MessageCircle size={48} strokeWidth={1} />
              <p style={{ fontSize: 16 }}>Выберите диалог</p>
            </div>
          ) : (
            <>
              {activeRoomData && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 15 }}>
                    {getOtherUser(activeRoomData)?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{getOtherUser(activeRoomData)?.firstName} {getOtherUser(activeRoomData)?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.role === 'WORKER' ? 'Работодатель' : 'Соискатель'}</div>
                  </div>
                </div>
              )}

              <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Кнопка загрузить ещё */}
                {hasMore && (
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <button className="btn-ghost" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={loadMore} disabled={loadingMore}>
                      <ChevronUp size={14} /> {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 40 }}>
                    Начните диалог — напишите первое сообщение
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user.id
                  const showName = !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId)
                  return (
                    <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {showName && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, marginLeft: 4 }}>{msg.senderName}</span>}
                      <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? 'var(--primary)' : 'var(--bg-secondary)', color: isMine ? 'white' : 'var(--text)', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, marginLeft: 4, marginRight: 4 }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : ''}
                        {isMine && <span style={{ marginLeft: 4 }}>{msg.isRead ? '✓✓' : '✓'}</span>}
                      </span>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
                  placeholder="Написать сообщение... (Enter — отправить)" rows={1}
                  style={{ flex: 1, resize: 'none', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', background: 'var(--bg-secondary)', color: 'var(--text)', outline: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5, transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="submit" disabled={!input.trim() || sending}
                  style={{ width: 42, height: 42, borderRadius: 10, border: 'none', flexShrink: 0, background: input.trim() ? 'var(--primary)' : 'var(--bg-secondary)', color: input.trim() ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
