import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { vacancyApi } from '../api'
import { useT } from '../utils/i18n'
import VacancyCard from '../components/ui/VacancyCard'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function SavedVacanciesPage() {
  const t = useT()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vacancyApi.getSaved({ size: 50 })
      .then(r => setVacancies(r.data.content || []))
      .finally(() => setLoading(false))
  }, [])

  const handleUnsave = () => {
    vacancyApi.getSaved({ size: 50 })
      .then(r => setVacancies(r.data.content || []))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Bookmark size={24} color="var(--primary)" />
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Сохранённые вакансии</h1>
      </div>

      {loading ? (
        <div className="vacancy-grid">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : vacancies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔖</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 20 }}>
            Нет сохранённых вакансий
          </p>
          <Link to="/vacancies" className="btn-primary" style={{ padding: '12px 28px' }}>
            Найти вакансии
          </Link>
        </div>
      ) : (
        <div className="vacancy-grid">
          {vacancies.map(v => (
            <VacancyCard key={v.id} vacancy={v} onSaveToggle={handleUnsave} />
          ))}
        </div>
      )}
    </div>
  )
}
