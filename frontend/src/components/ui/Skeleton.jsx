export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 'var(--radius-full)' }} />
        </div>
        <div className="skeleton" style={{ width: 40, height: 14 }} />
      </div>
      
      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
        <div>
          <div className="skeleton" style={{ width: 120, height: 16, marginBottom: 'var(--space-1)' }} />
          <div className="skeleton" style={{ width: 60, height: 12 }} />
        </div>
      </div>
      
      {/* Title */}
      <div className="skeleton" style={{ width: '80%', height: 24, marginBottom: 'var(--space-3)' }} />
      
      {/* Salary */}
      <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 'var(--space-4)' }} />
      
      {/* Meta */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton" style={{ width: 100, height: 20, borderRadius: 'var(--radius-full)' }} />
      </div>
      
      {/* Skills */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 'var(--radius-full)' }} />
      </div>
      
      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="skeleton" style={{ width: 30, height: 14 }} />
          <div className="skeleton" style={{ width: 30, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  )
}

export function SkeletonText({ width = '100%', height = 16 }) {
  return <div className="skeleton" style={{ height, width, borderRadius: 4 }} />
}

export function SkeletonProfile() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '80%', height: 14 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: 60, borderRadius: 8 }} />
    </div>
  )
}

export function SkeletonList({ count = 5 }) {
  return (
    <div>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ width: '40%', height: 24, marginBottom: 20 }} />
      <div style={{ marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 8 }} />
      </div>
      <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 8 }} />
    </div>
  )
}
