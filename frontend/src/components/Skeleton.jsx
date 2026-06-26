// Componente skeleton pentru loading state — înlocuiesc spinner-ul
// Fiecare funcție returnează un placeholder animat care imită structura cardului real

// ── CARD TEREN ─────────────────────────────────────────────────
export function SkeletonFieldCard() {
  return (
    <div className="skeleton-field-card">
      <div className="skeleton skeleton-field-img" />
      <div className="skeleton-field-body">
        <div className="skeleton skeleton-line skeleton-line-title" />
        <div className="skeleton skeleton-line skeleton-line-med" />
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  )
}

// ── CARD REZERVARE ──────────────────────────────────────────────
export function SkeletonBookingCard() {
  return (
    <div className="skeleton-booking-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton skeleton-line" style={{ width: '45%', height: 18 }} />
        <div className="skeleton skeleton-line" style={{ width: '22%', height: 24, borderRadius: 20 }} />
      </div>
      <div className="skeleton skeleton-line skeleton-line-med" />
      <div className="skeleton skeleton-line skeleton-line-short" />
      <div className="skeleton skeleton-line skeleton-line-short" />
      <div className="skeleton skeleton-line" style={{ width: '30%', height: 16 }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <div className="skeleton skeleton-btn" style={{ width: 130 }} />
        <div className="skeleton skeleton-btn" style={{ width: 100 }} />
      </div>
    </div>
  )
}

// ── CARD TURNEU ─────────────────────────────────────────────────
export function SkeletonTournamentCard() {
  return (
    <div className="skeleton-tournament-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton skeleton-line" style={{ width: '55%', height: 20 }} />
        <div className="skeleton skeleton-line" style={{ width: '20%', height: 24, borderRadius: 20 }} />
      </div>
      <div className="skeleton skeleton-line skeleton-line-med" />
      <div className="skeleton skeleton-line skeleton-line-short" />
      <div className="skeleton skeleton-line" style={{ width: '80%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <div className="skeleton skeleton-btn" style={{ width: 80, height: 32 }} />
        <div className="skeleton skeleton-btn" style={{ width: 80, height: 32 }} />
      </div>
    </div>
  )
}

// ── CARD ÎNSCRIERE TURNEU (MyTournamentsList) ───────────────────
export function SkeletonTournamentReg() {
  return (
    <div className="skeleton-booking-card" style={{ borderLeft: '4px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton skeleton-line" style={{ width: '50%', height: 18 }} />
        <div className="skeleton skeleton-line" style={{ width: '18%', height: 22, borderRadius: 20 }} />
      </div>
      <div className="skeleton skeleton-line skeleton-line-med" />
      <div className="skeleton skeleton-line skeleton-line-short" />
      <div className="skeleton skeleton-line" style={{ width: '35%' }} />
    </div>
  )
}

// ── TABEL ADMIN (rânduri placeholder) ──────────────────────────
// cols = numărul de coloane, rows = numărul de rânduri simulate
export function SkeletonAdminTable({ rows = 5, cols = 5 }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div
                    className="skeleton skeleton-line"
                    style={{ width: c === 0 ? '30px' : c === cols - 1 ? '60px' : `${55 + (c * 7) % 35}%`, height: 14 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── PAGINA PROFIL ───────────────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div className="page-container">
      {/* Banner placeholder */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{
          position: 'absolute', top: 90, left: 36,
          width: 100, height: 100, borderRadius: 'var(--radius-lg)'
        }} />
      </div>
      {/* Info sub banner */}
      <div style={{ padding: '0 36px 26px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <div className="skeleton skeleton-line" style={{ width: 200, height: 22 }} />
        <div className="skeleton skeleton-line" style={{ width: 160, height: 14 }} />
        <div className="skeleton skeleton-line" style={{ width: 120, height: 12 }} />
      </div>
      {/* Tab-uri placeholder */}
      <div className="skeleton" style={{ width: 280, height: 46, borderRadius: 'var(--radius-pill)', marginBottom: 22 }} />
      {/* Card placeholder */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '30px 36px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[80, 60, 40, 70, 50].map((w, i) => (
          <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, height: 16 }} />
        ))}
      </div>
    </div>
  )
}

// ── PAGINA DETALII TEREN ────────────────────────────────────────
export function SkeletonFieldDetail() {
  return (
    <div className="page-container">
      {/* Hero placeholder */}
      <div className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-2xl)', marginBottom: 28 }} />
      {/* Booking section */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton skeleton-line" style={{ width: '40%', height: 24 }} />
        {/* DatePickerBar placeholder */}
        <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-xl)' }} />
        {/* Sloturi placeholder */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 72, height: 52, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── PAGINA DETALII TURNEU ───────────────────────────────────────
export function SkeletonTournamentDetail() {
  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="skeleton skeleton-line" style={{ width: 220, height: 14, marginBottom: 20 }} />
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton skeleton-line" style={{ width: '50%', height: 32 }} />
        <div className="skeleton skeleton-line" style={{ width: '70%', height: 16 }} />
      </div>
      {/* Body 2 coloane */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Stânga */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%', height: 18 }} />
          {[65, 80, 55, 70, 60, 45].map((w, i) => (
            <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, height: 14 }} />
          ))}
        </div>
        {/* Dreapta */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton skeleton-line" style={{ width: '50%', height: 18 }} />
          {[70, 55, 80, 60, 65].map((w, i) => (
            <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, height: 14 }} />
          ))}
          <div className="skeleton skeleton-btn" style={{ marginTop: 8 }} />
        </div>
      </div>
    </div>
  )
}
