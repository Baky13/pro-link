export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '40%' }} />
        </div>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8 }} />
      </div>
      <div className="skeleton" style={{ height: 24, width: '35%', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 20 }} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div className="skeleton" style={{ height: 14, width: 80 }} />
        <div className="skeleton" style={{ height: 14, width: 60 }} />
      </div>
    </div>
  )
}

export function SkeletonText({ width = '100%', height = 16 }) {
  return <div className="skeleton" style={{ height, width, borderRadius: 4 }} />
}
