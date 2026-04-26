/*
  DESIGN SYSTEM TOKENS  (8px grid + Major Third type scale)
  ───────────────────────────────────────────────────────────
  Spacing:
    sp1 =  8px    sp2 = 16px    sp3 = 24px
    sp4 = 32px    sp5 = 40px    sp6 = 48px

  Type (Major Third 1.25× base 14):
    10px  label/caption
    12px  body-sm
    14px  body
    16px  body-lg / card value labels
    20px  subtitle / section header
    24px  screen title
    32px  display-sm  (stat values)
    40px  display     (big odometer)
    52px  display-lg  (hero health %)

  Radii:
    4px   tag/badge chip
    8px   input field, spec-cell, progress
    12px  card / section surface
    16px  hero card / vehicle card
    9999  pill / avatar
*/

import { useParams, useNavigate } from 'react-router-dom'
import { getBikeById } from '../data/fleet'
import AmberButton from '../components/shared/AmberButton'
import SecondaryButton from '../components/shared/SecondaryButton'

const DS = {
  // Surfaces
  bg:       'var(--ds-bg)',
  surface:  'var(--ds-surface)',
  surface2: 'var(--ds-surface-active)',
  border:   'var(--ds-border)',
  // Text
  textPrimary:   'var(--ds-text-primary)',
  textSecondary: 'var(--ds-text-secondary)',
  textMuted:     'var(--ds-text-muted)',
  amber:         'var(--ds-amber)',
  green:         'var(--ds-green)',
}

const iconColorMap = {
  green: { color: 'var(--ds-green)' },
  amber: { color: 'var(--ds-amber)' },
  gray:  { color: 'var(--ds-text-secondary)' },
}

const specFields = [
  { icon: 'calendar_today', label: 'Year',     key: 'year'     },
  { icon: 'factory',        label: 'Make',     key: 'make'     },
  { icon: 'motorcycle',     label: 'Model',    key: 'model'    },
  { icon: 'category',       label: 'Type',     key: 'category' },
  { icon: 'settings',       label: 'Engine',   key: 'engine'   },
  { icon: 'monitor_weight', label: 'Weight',   key: 'weight'   },
]

/* ── Reusable SectionCard ── */
function SectionCard({ children, style }) {
  return (
    <div style={{
      background: DS.surface,
      border: `1px solid ${DS.border}`,
      borderRadius: '12px',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Section header row ── */
function SectionLabel({ title, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${DS.border}`,
    }}>
      <span style={{ fontSize: '14px', fontWeight: 700, color: DS.textPrimary }}>{title}</span>
      {action && (
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: DS.amber }}>
          {action}
        </span>
      )}
    </div>
  )
}

/* ── Progress bar ── */
function ProgressBar({ percent, color }) {
  const fill = color === 'green' ? 'var(--ds-green)' : color === 'red' ? 'var(--ds-red)' : DS.amber
  return (
    <div style={{ height: '4px', borderRadius: '4px', background: 'var(--ds-surface-active)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percent}%`, background: fill, borderRadius: '4px' }} />
    </div>
  )
}

/* ── List row (upgrades + history) ── */
function ListRow({ icon, iconColor, primary, secondary, trailing, trailingHint }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 0',
      borderBottom: `1px solid ${DS.border}`,
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'var(--ds-surface-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', ...iconColorMap[iconColor] }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: DS.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{primary}</div>
        <div style={{ fontSize: '12px', color: DS.textSecondary, marginTop: '2px' }}>{secondary}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {trailingHint && (
          <div style={{ fontSize: '10px', color: 'var(--ds-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--ds-green)' }}>check_circle</span>
            {trailingHint}
          </div>
        )}
        {trailing && (
          <div style={{ fontSize: '16px', fontWeight: 700, color: DS.textPrimary }}>{trailing}</div>
        )}
      </div>
    </div>
  )
}

export default function VehicleDetail() {
  const { bikeId } = useParams()
  const navigate   = useNavigate()
  const bike       = getBikeById(bikeId)

  if (!bike) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: DS.bg }}>
      <p style={{ color: DS.textSecondary }}>Bike not found.</p>
    </div>
  )

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
        <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: DS.amber }}>
          Digital Garage
        </h1>
        <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: DS.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>settings</span>
        </button>
      </header>

      {/* ── Scrollable Content — 16px sides, 24px top ── */}
      <main style={{ padding: '24px 16px 104px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Hero Banner — 16px radius ── */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '224px', border: `1px solid ${DS.border}` }}>
          <img src={bike.image} alt={bike.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ds-surface) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
                <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--ds-green)', opacity: 0.6 }} />
                <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ds-green)', display: 'block' }} />
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-green)' }}>
                {bike.status === 'readyToRide' ? 'Ready to Ride' : 'Service Due'}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: DS.textPrimary, letterSpacing: '0.02em' }}>{bike.name}</h2>
          </div>
        </div>

        {/* ── Spec Grid — 2-col, 8px cells, 8px gap ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {specFields.map(({ icon, label, key }) => (
            <div key={key} style={{
              padding: '12px 14px',
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#555', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: DS.textSecondary, marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: DS.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{bike[key]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Stat Tiles — 2-col, clear visual hierarchy ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Odometer', value: bike.odometer.toLocaleString(), unit: 'mi', icon: 'speed' },
            { label: 'Fuel Range', value: bike.fuelRange, unit: 'mi', icon: 'local_gas_station' },
          ].map(({ label, value, unit, icon }) => (
            <div key={label} style={{
              padding: '20px 16px 16px',
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderRadius: '12px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Ghost icon */}
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '12px', right: '10px', fontSize: '48px', color: 'var(--ds-surface-hover)', userSelect: 'none' }}>{icon}</span>
              {/* Label */}
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: DS.textSecondary, marginBottom: '16px' }}>{label}</div>
              {/* Value */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: DS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: '12px', color: DS.textSecondary }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Diagnostics Card ── */}
        <SectionCard>
          <div style={{ padding: '20px' }}>
            <SectionLabel title="Diagnostics" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bike.diagnostics.map((d) => (
                <div key={d.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: DS.textSecondary }}>{d.icon}</span>
                      <span style={{ fontSize: '14px', color: DS.textSecondary }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: DS.textPrimary }}>{d.percent}%</span>
                  </div>
                  <ProgressBar percent={d.percent} color={d.color} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Action Buttons — 8px gap between ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AmberButton icon="smart_toy" onClick={() => navigate('/mechanic')}>CONSULT AI MECHANIC</AmberButton>
          <SecondaryButton icon="build" onClick={() => navigate(`/bike/${bike.id}/add-log`)}>LOG MAINTENANCE</SecondaryButton>
        </div>

        {/* ── Recent Upgrades ── */}
        <SectionCard>
          <div style={{ padding: '20px' }}>
            <SectionLabel title="Recent Upgrades & Fixes" action="VIEW ALL" />
            <div>
              {bike.maintenanceLogs.map((log, i) => (
                <ListRow
                  key={i}
                  icon={log.icon}
                  iconColor={log.iconColor}
                  primary={log.title}
                  secondary={log.date}
                  trailingHint="DONE"
                />
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Ride History ── */}
        <SectionCard>
          <div style={{ padding: '20px' }}>
            <SectionLabel title="Ride History" action="VIEW ALL" />
            <div>
              {bike.rideHistory.map((ride, i) => (
                <ListRow
                  key={i}
                  icon={ride.icon}
                  iconColor={ride.iconColor}
                  primary={ride.title}
                  secondary={ride.subtitle}
                  trailing={`${ride.distance.toLocaleString()} mi`}
                />
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <SecondaryButton icon="add_road" onClick={() => {}}>LOG NEW RIDE</SecondaryButton>
            </div>
          </div>
        </SectionCard>

      </main>

    </div>
  )
}
