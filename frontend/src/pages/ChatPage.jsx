import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, Search, ChevronUp, Archive, Trash2, ArchiveRestore, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { chatApi, notificationApi } from '../api'
import { useAuthStore, useNotifStore } from '../store'
import { useT } from '../utils/i18n'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { roomId } = useParams()
  const { user } = useAuthStore()
  const { setUnreadCount } = useNotifStore()
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
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [unreadMap, setUnreadMap] = useState({})
  const [tab, setTab] = useState('active') // 'active' | 'archived'
  const [menuOpen, setMenuOpen] = useState(null)
  const bottomRef = useRef(null)
  const messagesRef = useRef(null)
  const stompRef = useRef(null)
  const activeRoomRef = useRef(activeRoom)

  const [mobileShowChat, setMobileShowChat] = useState(!!roomId)

  useEffect(() => { activeRoomRef.current = activeRoom }, [activeRoom])

  const loadRooms = (currentTab = tab) => {
    const fetch = currentTab === 'archived' ? chatApi.getArchivedRooms : chatApi.getRooms
    fetch().then(r => {
      const data = r.data || []
      setRooms(data)
      setFilteredRooms(data)
      if (!activeRoom && data.length > 0 && currentTab === 'active') setActiveRoom(data[0].id)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadRooms()
  }, [user])

  useEffect(() => {
    loadRooms(tab)
  }, [tab])

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

  useEffect(() => {
    if (!activeRoom) return
    setPage(0)
    setMessages([])
    chatApi.getMessages(activeRoom, { size: 30, page: 0 })
      .then(r => {
        const content = r.data.content?.reverse() || []
        setMessages(content)
        setHasMore(!r.data.last)
      })
      .catch(error => {
        if (error.response?.status === 404) {
          // Чат удален собеседником
          setActiveRoom(null)
          loadRooms()
          toast.error('Диалог был удалён')
        } else {
          toast.error('Ошибка загрузки сообщений')
        }
      })
    setUnreadMap(prev => ({ ...prev, [activeRoom]: 0 }))
    notificationApi.markChatRead(activeRoom).catch(() => {})
    notificationApi.getUnreadCount().then(r => setUnreadCount(r.data.count || 0)).catch(() => {})
  }, [activeRoom])

  useEffect(() => {
    if (messages.length > 0 && page === 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages.length])

  // WebSocket
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    const client = new Client({
      webSocketFactory: () => new SockJS(
        window.location.hostname === 'localhost'
          ? 'http://localhost:8080/ws'
          : `${window.location.origin}/ws`
      ),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        // Subscribe to all rooms
        rooms.forEach(room => {
          client.subscribe(`/topic/room/${room.id}`, msg => {
            const message = JSON.parse(msg.body)
            const currentRoom = activeRoomRef.current

            if (message.roomId === currentRoom) {
              // Только чужие сообщения — своё уже добавлено локально
              if (message.senderId !== user.id) {
                setMessages(prev => [...prev, message])
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                // Помечаем сообщения прочитанными раз уже в этом чате
                notificationApi.markChatRead(currentRoom).catch(() => {})
              }
            } else {
              // Toast только если сообщение в ДРУГОЙ комнате
              if (message.senderId !== user.id) {
                toast(`💬 ${message.senderName}: ${message.content.slice(0, 40)}${message.content.length > 40 ? '...' : ''}`, {
                  duration: 4000,
                  style: { cursor: 'pointer' },
                })
                setUnreadMap(prev => ({ ...prev, [message.roomId]: (prev[message.roomId] || 0) + 1 }))
              }
            }
          })
        })

        // Online presence
        client.subscribe(`/user/queue/online`, msg => {
          const data = JSON.parse(msg.body)
          setOnlineUsers(prev => {
            const next = new Set(prev)
            if (data.online) next.add(data.userId)
            else next.delete(data.userId)
            return next
          })
        })
      },
      reconnectDelay: 3000,
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [user, rooms])

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
      setTimeout(() => {
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight
      }, 0)
    } finally { setLoadingMore(false) }
  }

  const handleSend = async e => {
    e.preventDefault()
    if (!input.trim() || !activeRoom || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    try {
      const { data } = await chatApi.sendMessage(activeRoom, content)
      // Добавляем своё сообщение локально сразу
      setMessages(prev => [...prev, data])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch {
      toast.error('Не удалось отправить')
      setInput(content)
    } finally { setSending(false) }
  }

  const handleRoomSelect = id => {
    console.log('Selecting room:', id)
    setActiveRoom(id)
    setMessages([])
    setUnreadMap(prev => ({ ...prev, [id]: 0 }))
    setMenuOpen(null)
    setMobileShowChat(true)
    navigate(`/chat/${id}`)
  }

  const handleArchive = async (roomId) => {
    try {
      await chatApi.archiveRoom(roomId)
      if (activeRoom === roomId) setActiveRoom(null)
      loadRooms(tab)
      toast.success('Диалог архивирован')
    } catch { toast.error('Ошибка') }
    setMenuOpen(null)
  }

  const handleUnarchive = async (roomId) => {
    try {
      await chatApi.unarchiveRoom(roomId)
      loadRooms(tab)
      toast.success('Диалог восстановлен')
    } catch { toast.error('Ошибка') }
    setMenuOpen(null)
  }

  const handleDelete = async (roomId) => {
    if (!window.confirm('Удалить диалог? Все сообщения будут удалены.')) return
    try {
      await chatApi.deleteRoom(roomId)
      if (activeRoom === roomId) setActiveRoom(null)
      loadRooms(tab)
      toast.success('Диалог удалён')
    } catch { toast.error('Ошибка') }
    setMenuOpen(null)
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

      <div style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth <= 640 ? '1fr' : '280px 1fr', 
        gap: 16, 
        minHeight: 0 
      }}>

        {/* Список комнат */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', ...(window.innerWidth <= 640 && mobileShowChat ? { display: 'none' } : {}) }}>
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {[{ key: 'active', label: 'Активные' }, { key: 'archived', label: 'Архив' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ flex: 1, padding: '6px', borderRadius: 6, border: 'none', background: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {t.label}
                </button>
              ))}
            </div>
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
              const isOnline = onlineUsers.has(other?.id)
              const unread = unreadMap[room.id] || 0
              return (
                <button key={room.id} onClick={() => handleRoomSelect(room.id)}
                  style={{ width: '100%', padding: '14px 16px', border: 'none', textAlign: 'left', cursor: 'pointer', background: isActive ? 'var(--primary-light)' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Avatar with online dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: isActive ? 'white' : 'var(--text-secondary)' }}>
                        {other?.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      {isOnline && (
                        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-card)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other?.firstName} {other?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: isOnline ? '#10b981' : 'var(--text-secondary)', marginTop: 2, fontWeight: isOnline ? 600 : 400 }}>
                        {isOnline ? '● Онлайн' : user.role === 'WORKER' ? 'Работодатель' : 'Соискатель'}
                      </div>
                    </div>
                    {unread > 0 && (
                      <AnimatePresence>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          style={{ minWidth: 20, height: 20, borderRadius: 10, background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                          {unread}
                        </motion.div>
                      </AnimatePresence>
                    )}
                    {/* Menu button */}
                    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === room.id ? null : room.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex', opacity: 0.7 }}>
                        <MoreVertical size={14} />
                      </button>
                      <AnimatePresence>
                        {menuOpen === room.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.12 }}
                            className="card"
                            style={{ position: 'absolute', right: 0, top: '100%', minWidth: 160, padding: 4, zIndex: 300, boxShadow: 'var(--shadow-lg)' }}>
                            {tab === 'active' ? (
                              <button onClick={() => handleArchive(room.id)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Archive size={14} /> Архивировать
                              </button>
                            ) : (
                              <button onClick={() => handleUnarchive(room.id)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <ArchiveRestore size={14} /> Восстановить
                              </button>
                            )}
                            <button onClick={() => handleDelete(room.id)}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--danger)', fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <Trash2 size={14} /> Удалить
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  <button
                    className="show-mobile"
                    onClick={() => setMobileShowChat(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, marginRight: 4 }}>
                    ← Назад
                  </button>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 15 }}>
                      {getOtherUser(activeRoomData)?.firstName?.[0]?.toUpperCase()}
                    </div>
                    {onlineUsers.has(getOtherUser(activeRoomData)?.id) && (
                      <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-card)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{getOtherUser(activeRoomData)?.firstName} {getOtherUser(activeRoomData)?.lastName}</div>
                    <div style={{ fontSize: 12, color: onlineUsers.has(getOtherUser(activeRoomData)?.id) ? '#10b981' : 'var(--text-secondary)', fontWeight: onlineUsers.has(getOtherUser(activeRoomData)?.id) ? 600 : 400 }}>
                      {onlineUsers.has(getOtherUser(activeRoomData)?.id) ? '● Онлайн' : user.role === 'WORKER' ? 'Работодатель' : 'Соискатель'}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    <motion.div key={msg.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {showName && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, marginLeft: 4 }}>{msg.senderName}</span>}
                      <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? 'var(--primary)' : 'var(--bg-secondary)', color: isMine ? 'white' : 'var(--text)', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, marginLeft: 4, marginRight: 4 }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : ''}
                        {isMine && <span style={{ marginLeft: 4 }}>{msg.isRead ? '✓✓' : '✓'}</span>}
                      </span>
                    </motion.div>
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
                <motion.button type="submit" disabled={!input.trim() || sending}
                  whileTap={{ scale: 0.9 }}
                  style={{ width: 42, height: 42, borderRadius: 10, border: 'none', flexShrink: 0, background: input.trim() ? 'var(--primary)' : 'var(--bg-secondary)', color: input.trim() ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.15s' }}>
                  <Send size={18} />
                </motion.button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
