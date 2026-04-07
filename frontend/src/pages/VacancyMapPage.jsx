import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { vacancyApi } from '../api'
import { useT } from '../utils/i18n'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function VacancyMapPage() {
  const t = useT()
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vacancyApi.getAll({ size: 100 })
      .then(r => setVacancies((r.data.content || []).filter(v => v.latitude && v.longitude)))
      .finally(() => setLoading(false))
  }, [])

  const formatSalary = v => {
    if (!v.salaryFrom && !v.salaryTo) return 'По договорённости'
    const c = v.currency || 'KGS'
    if (v.salaryFrom && v.salaryTo) return `${v.salaryFrom.toLocaleString()} – ${v.salaryTo.toLocaleString()} ${c}`
    if (v.salaryFrom) return `от ${v.salaryFrom.toLocaleString()} ${c}`
    return `до ${v.salaryTo.toLocaleString()} ${c}`
  }

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🗺️ Карта вакансий</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {loading ? 'Загрузка...' : `${vacancies.length} вакансий на карте`}
        </p>
      </div>

      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', height: 600 }}>
        <MapContainer
          center={[42.87, 74.59]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vacancies.map(v => (
            <Marker key={v.id} position={[v.latitude, v.longitude]}>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.title}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{v.employer?.companyName}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#5b5ef4', marginBottom: 8 }}>{formatSalary(v)}</p>
                  <button
                    onClick={() => navigate(`/vacancies/${v.id}`)}
                    style={{ background: '#5b5ef4', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                    Подробнее
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!loading && vacancies.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          <p>Нет вакансий с указанным адресом на карте</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>При создании вакансии укажите координаты</p>
        </div>
      )}
    </div>
  )
}
