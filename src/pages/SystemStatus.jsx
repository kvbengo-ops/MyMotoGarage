import { useParams, useNavigate } from 'react-router-dom'
import { getBikeById } from '../data/fleet'
import AmberButton from '../components/shared/AmberButton'

const DS = {
  bg:            'var(--ds-bg)',
  surface:       'var(--ds-surface)',
  border:        'var(--ds-border)',
  textPrimary:   'var(--ds-text-primary)',
  textSecondary: 'var(--ds-text-secondary)',
  amber:         'var(--ds-amber)',
}

/* ── Section label — same across all screens ── */
function SectionLabel({ title }) {
  return (
    <p style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--ds-text-muted)',
      marginBottom: '12px', paddingLeft: '4px',
    }}>
      {title}
    </p>
  )
}

/* ── Health bar color by percent ── */
const barFill = (p) => p >= 70 ? DS.amber : p >= 40 ? '#fbbf24' : 'var(--ds-red)'

export default function SystemStatus() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  const bike = getBikeById(bikeId)

  if (!bike) return null

  const items = bike.systemStatus || []
  const alerts = bike.smartAlerts || []
  const upgrades = bike.recentUpgrades || []

  const totalHealth = items.length
    ? Math.round(items.reduce((s, i) => s + i.percent, 0) / items.length)
    : 100

  return (
    <div style={{ minHeight: '100dvh', background: DS.bg }}>

      {/* ── App Bar — 56px ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: `1px solid var(--ds-glass-border)`,
        backdropFilter: 'blur(20px)',
        transition: 'background-color 0.3s'
      }}>
        <button onClick={() => navigate('/')} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DS.textSecondary }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: DS.amber }}>settings_input_component</span>
          <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: DS.amber }}>
            {bike.model} Status
          </h1>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: DS.amber, opacity: 0.6 }}>
          SYNC
        </span>
      </header>

      {/* ── Page — 16px sides, 24px top, 32px between sections ── */}
      <main style={{ padding: '24px 16px 104px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ── Health Gauge Card ── */}
        <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: DS.textSecondary, marginBottom: '8px' }}>
                Total System Health
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1, color: DS.amber }}>{totalHealth}</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: DS.amber }}>%</span>
              </div>
            </div>
            <span style={{
              marginTop: '4px', padding: '4px 12px', borderRadius: '9999px',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            }}>OPTIMAL</span>
          </div>
          {/* Progress track */}
          <div style={{ height: '6px', borderRadius: '4px', background: 'var(--ds-surface-active)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${totalHealth}%`, borderRadius: '4px',
              background: DS.amber, boxShadow: '0 0 12px color-mix(in srgb, var(--ds-amber) 40%, transparent)',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>

        {/* ── Smart Alerts ── */}
        {alerts.length > 0 && (
          <div>
            <SectionLabel title="Smart Alerts" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert) => {
                const warn = alert.type === 'warning'
                const col  = warn ? 'var(--ds-red)' : DS.amber
                const bord = warn ? 'color-mix(in srgb, var(--ds-red) 20%, transparent)' : 'color-mix(in srgb, var(--ds-amber) 20%, transparent)'
                return (
                  <div key={alert.id} style={{
                    background: DS.surface, border: `1px solid ${bord}`,
                    borderRadius: '12px', padding: '16px',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: warn ? 'color-mix(in srgb, var(--ds-red) 10%, transparent)' : 'color-mix(in srgb, var(--ds-amber) 10%, transparent)',
                      border: `1px solid ${bord}`,
                    }}>
                      <span className="material-symbols-filled" style={{ fontSize: '18px', color: col }}>{alert.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: col, marginBottom: '4px', lineHeight: 1.3 }}>{alert.title}</p>
                      <p style={{ fontSize: '12px', color: DS.textSecondary, lineHeight: 1.5 }}>{alert.body}</p>
                      <button style={{
                        marginTop: '12px', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: col, background: 'none', border: 'none',
                        borderBottom: `1px solid ${col}50`, padding: '0 0 2px', cursor: 'pointer',
                      }}>{alert.action}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Maintenance Status ── */}
        <div>
          <SectionLabel title="Maintenance Status" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: DS.surface, border: `1px solid ${DS.border}`,
                borderRadius: '12px', padding: '16px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                {/* Icon block */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.15)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: DS.amber }}>{item.icon}</span>
                </div>
                {/* Data */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: DS.textPrimary }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: barFill(item.percent), marginLeft: '8px' }}>{item.percent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: DS.textSecondary }}>Last: {item.lastKm}</span>
                    <span style={{ fontSize: '11px', color: DS.textSecondary }}>{item.lastDate}</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '4px', background: 'var(--ds-surface-active)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.percent}%`, borderRadius: '4px', background: barFill(item.percent) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Log CTA ── */}
        <AmberButton icon="add_circle" onClick={() => navigate(`/bike/${bike.id}/add-log`)}>LOG NEW UPGRADE</AmberButton>

        {/* ── Recent Upgrades ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingLeft: '4px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5A5A' }}>
              Recent Upgrades & Fixes
            </p>
            <button style={{ fontSize: '11px', fontWeight: 700, color: DS.amber, background: 'none', border: 'none', cursor: 'pointer' }}>VIEW ALL</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upgrades.map((item) => (
              <div key={item.id} style={{
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderLeft: `3px solid ${item.borderColor === 'amber' ? DS.amber : 'var(--ds-border-heavy)'}`,
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: DS.textPrimary }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: DS.textSecondary, marginTop: '2px' }}>{item.subtitle}</p>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: DS.textSecondary, flexShrink: 0,
                  background: 'var(--ds-surface-hover)', padding: '3px 8px', borderRadius: '4px', marginTop: '2px',
                }}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
