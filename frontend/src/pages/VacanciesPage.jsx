import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { vacancyApi, categoryApi } from '../api'
import { useT } from '../utils/i18n'
import VacancyCard from '../components/ui/VacancyCard'
import { SkeletonCard } from '../components/ui/Skeleton'

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE', 'INTERNSHIP']

export default function VacanciesPage() {
  const t = useT()
  const [searchParams] = useSearchParams()
  const [vacancies, setVacancies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    categoryId: searchParams.get('categoryId') || '',
    employmentType: searchParams.get('employmentType') || '',
    salaryFrom: searchParams.get('salaryFrom') || '',
    salaryTo: searchParams.get('salaryTo') || '',
    skill: searchParams.get('skill') || '',
    isHot: searchParams.get('isHot') || '',
    isUrgent: searchParams.get('isUrgent') || '',
    page: 0,
  })

  useEffect(() => { categoryApi.getAll().then(r => setCategories(r.data || [])) }, [])

  const fetchVacancies = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([k, v]) => v !== '' && v !== false && k !== 'sort'))
    if (filters.sort) params.sort = filters.sort
    vacancyApi.getAll({ ...params, size: 20 })
      .then(r => {
        setVacancies(r.data.content || [])
        setTotalPages(r.data.totalPages || 0)
        setTotalElements(r.data.totalElements || 0)
      })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchVacancies() }, [fetchVacancies])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }))
  const clearFilters = () => setFilters({ search: '', city: '', categoryId: '', employmentType: '', salaryFrom: '', salaryTo: '', skill: '', isHot: '', isUrgent: '', page: 0 })
  const activeFiltersCount = [filters.categoryId, filters.employmentType, filters.salaryFrom, filters.salaryTo, filters.isHot, filters.isUrgent].filter(Boolean).length

  return (
    <div>
      {/* Mini hero */}
      <div style={{
        background: 'linear-gradient(135deg, #5b5ef4 0%, #8b5cf6 100%)',
        padding: 'clamp(28px, 5vw, 48px) 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: 'white', marginBottom: 20, letterSpacing: -0.5 }}>
            {t.findJob}
            {!loading && totalElements > 0 && (
              <span style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginLeft: 12 }}>
                {totalElements} вакансий
              </span>
            )}
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 14, padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 180px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
              <Search size={17} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent', color: '#111' }} />
            </div>
            <div style={{ width: 1, background: '#e5e7eb', margin: '8px 0' }} className="hide-mobile" />
            <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }} className="hide-mobile">
              <MapPin size={17} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input value={filters.city} onChange={e => setFilter('city', e.target.value)}
                placeholder={t.cityPlaceholder}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent', color: '#111' }} />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: showFilters ? '#eeeeff' : 'var(--bg-secondary, #f1f3ff)', color: showFilters ? '#5b5ef4' : '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
              <SlidersHorizontal size={15} />
              Фильтры
              {activeFiltersCount > 0 && (
                <span style={{ background: '#5b5ef4', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{activeFiltersCount}</span>
              )}
            </button>
          </motion.div>

          {/* Quick type filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {EMPLOYMENT_TYPES.map(type => (
              <button key={type} onClick={() => setFilter('employmentType', filters.employmentType === type ? '' : type)}
                style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid', borderColor: filters.employmentType === type ? 'white' : 'rgba(255,255,255,0.3)', background: filters.employmentType === type ? 'white' : 'rgba(255,255,255,0.1)', color: filters.employmentType === type ? '#5b5ef4' : 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {t[type]}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 20 }}>
              <div className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.category}</label>
                  <select className="input" value={filters.categoryId} onChange={e => setFilter('categoryId', e.target.value)}>
                    <option value="">Все категории</option>
                    {categories.filter(c => !c.parentId).map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Навык</label>
                  <input className="input" value={filters.skill} onChange={e => setFilter('skill', e.target.value)} placeholder="React, Java..." />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Зарплата от (KGS)</label>
                  <input className="input" type="number" value={filters.salaryFrom} onChange={e => setFilter('salaryFrom', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Зарплата до (KGS)</label>
                  <input className="input" type="number" value={filters.salaryTo} onChange={e => setFilter('salaryTo', e.target.value)} placeholder="∞" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Сортировка</label>
                  <select className="input" value={filters.sort || ''} onChange={e => setFilter('sort', e.target.value)}>
                    <option value="">По дате</option>
                    <option value="salaryFrom,desc">Зарплата ↓</option>
                    <option value="salaryFrom,asc">Зарплата ↑</option>
                    <option value="viewsCount,desc">Популярные</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={!!filters.isHot} onChange={e => setFilter('isHot', e.target.checked ? 'true' : '')} />
                    🔥 Горячие
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={!!filters.isUrgent} onChange={e => setFilter('isUrgent', e.target.checked ? 'true' : '')} />
                    ⚡ Срочные
                  </label>
                </div>
                {activeFiltersCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button className="btn-ghost" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
                      <X size={14} /> Сбросить всё
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="vacancy-grid">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : vacancies.length === 0
              ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80 }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ничего не найдено</p>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Попробуйте изменить параметры поиска</p>
                  <button className="btn-outline" onClick={clearFilters}>Сбросить фильтры</button>
                </div>
              )
              : vacancies.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <VacancyCard vacancy={v} />
                </motion.div>
              ))
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button onClick={() => setFilters(f => ({ ...f, page: Math.max(0, f.page - 1) }))}
              disabled={filters.page === 0}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: filters.page === 0 ? 'not-allowed' : 'pointer', opacity: filters.page === 0 ? 0.4 : 1 }}>
              ←
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = filters.page <= 3 ? i : filters.page - 3 + i
              if (page >= totalPages) return null
              return (
                <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                  style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid', borderColor: filters.page === page ? 'var(--primary)' : 'var(--border)', background: filters.page === page ? 'var(--primary)' : 'transparent', color: filters.page === page ? 'white' : 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {page + 1}
                </button>
              )
            })}
            <button onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages - 1, f.page + 1) }))}
              disabled={filters.page >= totalPages - 1}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: filters.page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: filters.page >= totalPages - 1 ? 0.4 : 1 }}>
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
