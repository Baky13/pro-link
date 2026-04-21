import { Link } from 'react-router-dom'
import { MapPin, Users, Eye, Bookmark, BookmarkCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useT } from '../../utils/i18n'
import { useState } from 'react'
import { vacancyApi } from '../../api'
import Avatar from './Avatar'

export default function VacancyCard({ vacancy, onSaveToggle }) {
    const t = useT()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async e => {
    e.preventDefault()
    e.stopPropagation()
    if (saving) return
    setSaving(true)
    try {
      await vacancyApi.toggleSave(vacancy.id)
      setSaved(v => !v)
      onSaveToggle?.()
    } catch {}
    finally { setSaving(false) }
  }

  const formatSalary = () => {
    if (!vacancy.salaryFrom && !vacancy.salaryTo) return t.salaryNotSpecified
    const c = vacancy.currency || 'KGS'
    if (vacancy.salaryFrom && vacancy.salaryTo)
      return `${vacancy.salaryFrom.toLocaleString()} – ${vacancy.salaryTo.toLocaleString()} ${c}`
    if (vacancy.salaryFrom) return `${t.from} ${vacancy.salaryFrom.toLocaleString()} ${c}`
    return `${t.to} ${vacancy.salaryTo.toLocaleString()} ${c}`
  }

  return (
    <Link to={`/vacancies/${vacancy.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <motion.div
        className="card"
        whileHover={{ y: -4, boxShadow: 'var(--shadow-md)', borderColor: 'var(--primary)' }}
        transition={{ duration: 0.2 }}
        style={{ padding: 22, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {vacancy.isHot && (
                <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="badge badge-hot">
                  Горячая
                </motion.span>
              )}
              {vacancy.isUrgent && (
                <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="badge badge-urgent">
                  Срочно
                </motion.span>
              )}
              {vacancy.employer?.isVerified && (
                <span className="badge badge-success">✓ Проверена</span>
              )}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {vacancy.title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {vacancy.employer?.companyName}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 12, flexShrink: 0 }}>
            <Avatar
              src={vacancy.employer?.logoUrl}
              name={vacancy.employer?.companyName}
              size={42}
              square
              bg="var(--primary-light)"
              style={{ border: '1px solid var(--border)', color: 'var(--primary)' }}
            />
            <motion.button
              onClick={handleSave}
              aria-label={saved ? 'Удалить из сохранённых' : 'Сохранить вакансию'}
              aria-pressed={saved}
              title={saved ? 'В сохранённых' : 'Сохранить'}
              whileTap={{ scale: 0.85 }}
              style={{ background: 'none', border: 'none', color: saved ? 'var(--primary)' : 'var(--text-secondary)', padding: 6, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 6, transition: 'color 0.15s' }}>
              <AnimatePresence mode="wait">
                <motion.div key={saved ? 'saved' : 'unsaved'} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Salary */}
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {formatSalary()}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, flex: 1 }}>
          <span className="badge badge-primary">{t[vacancy.employmentType] || vacancy.employmentType}</span>
          {vacancy.skills?.slice(0, 3).map(s => (
            <span key={s} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{s}</span>
          ))}
          {vacancy.skills?.length > 3 && (
            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>+{vacancy.skills.length - 3}</span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {vacancy.city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {vacancy.city}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> {vacancy.applicantsCount || 0} {t.applicants}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> {vacancy.viewsCount || 0}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
