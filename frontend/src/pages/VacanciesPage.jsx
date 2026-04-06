import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { vacancyApi, categoryApi } from '../api'

import { useT } from '../utils/i18n'
import VacancyCard from '../components/ui/VacancyCard'
import { SkeletonCard } from '../components/ui/Skeleton'

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE', 'INTERNSHIP']

export default function VacanciesPage() {
    const t = useT()
  const [searchParams, setSearchParams] = useSearchParams()
  const [vacancies, setVacancies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    categoryId: searchParams.get('categoryId') || '',
    employmentType: searchParams.get('employmentType') || '',
    salaryFrom: searchParams.get('salaryFrom') || '',
    salaryTo: searchParams.get('salaryTo') || '',
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
      .then(r => { setVacancies(r.data.content || []); setTotalPages(r.data.totalPages || 0) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchVacancies() }, [fetchVacancies])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }))

  const clearFilters = () => setFilters({ search: '', city: '', categoryId: '', employmentType: '', salaryFrom: '', salaryTo: '', isHot: '', isUrgent: '', page: 0 })

  const activeFiltersCount = [filters.categoryId, filters.employmentType, filters.salaryFrom, filters.salaryTo, filters.isHot, filters.isUrgent].filter(Boolean).length

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input" value={filters.search} onChange={e => setFilter('search', e.target.value)}
          placeholder={t.searchPlaceholder} style={{ flex: 2, minWidth: 200 }} />
        <input className="input" value={filters.city} onChange={e => setFilter('city', e.target.value)}
          placeholder={t.cityPlaceholder} style={{ flex: 1, minWidth: 140 }} />
        <select className="input" style={{ width: 160 }} value={filters.sort || ''} onChange={e => setFilter('sort', e.target.value)}>
          <option value="">По дате</option>
          <option value="salaryFrom,desc">Зарплата ↓</option>
          <option value="salaryFrom,asc">Зарплата ↑</option>
          <option value="viewsCount,desc">Популярные</option>
          <option value="applicantsCount,desc">Больше откликов</option>
        </select>
        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowFilters(v => !v)}>
          <SlidersHorizontal size={16} />
          {activeFiltersCount > 0 && <span className="badge badge-primary" style={{ padding: '1px 7px' }}>{activeFiltersCount}</span>}
        </button>
        {activeFiltersCount > 0 && (
          <button className="btn-ghost" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={16} /> Сбросить
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
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
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t.employmentType}</label>
            <select className="input" value={filters.employmentType} onChange={e => setFilter('employmentType', e.target.value)}>
              <option value="">Все типы</option>
              {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{t[type]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Зарплата от</label>
            <input className="input" type="number" value={filters.salaryFrom} onChange={e => setFilter('salaryFrom', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Зарплата до</label>
            <input className="input" type="number" value={filters.salaryTo} onChange={e => setFilter('salaryTo', e.target.value)} placeholder="∞" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={!!filters.isHot} onChange={e => setFilter('isHot', e.target.checked ? 'true' : '')} />
              🔥 {t.hot}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={!!filters.isUrgent} onChange={e => setFilter('isUrgent', e.target.checked ? 'true' : '')} />
              ⚡ {t.urgent}
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {loading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) :
          vacancies.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16 }}>{t.noData}</p>
            </div>
          ) : vacancies.map(v => <VacancyCard key={v.id} vacancy={v} />)
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button key={i} onClick={() => setFilters(f => ({ ...f, page: i }))}
              style={{
                width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                borderColor: filters.page === i ? 'var(--primary)' : 'var(--border)',
                background: filters.page === i ? 'var(--primary)' : 'transparent',
                color: filters.page === i ? 'white' : 'var(--text)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
