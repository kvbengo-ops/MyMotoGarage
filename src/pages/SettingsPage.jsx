import { useNavigate } from 'react-router-dom'
import { useTheme } from '../components/shared/ThemeContext'

function SettingsRow({ icon, label, sublabel, trailing, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 20px',
        background: 'transparent', border: 'none', cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--ds-border)',
        transition: 'background 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = 'var(--ds-surface-hover)')}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: danger ? 'rgba(239,68,68,0.10)' : 'var(--ds-surface-active)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: danger ? 'var(--ds-red)' : 'var(--ds-text-secondary)' }}>
          {icon}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: danger ? 'var(--ds-red)' : 'var(--ds-text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '11px', color: 'var(--ds-text-muted)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {trailing}
    </button>
  )
}

function GroupCard({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ds-text-muted)', marginBottom: '8px', paddingLeft: '4px' }}>
        {label}
      </span>
      <div style={{
        background: 'var(--ds-surface)',
        border: '1px solid var(--ds-border)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function Toggle({ value, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 52, height: 28, borderRadius: 14, flexShrink: 0,
        background: value ? 'var(--ds-primary)' : 'var(--ds-surface-active)',
        border: '1px solid var(--ds-border)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.3s',
        boxShadow: value ? '0 0 12px var(--ds-primary-glow)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 26 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: value ? '#0A0A0A' : 'var(--ds-text-muted)',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="fade-in" style={{ minHeight: '100dvh', background: 'var(--ds-bg)' }}>

      {/* App Bar */}
      <header
        className="carbon-texture"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', gap: '12px',
          height: '56px', padding: '0 20px',
          background: 'var(--ds-glass-bg)',
          borderBottom: '1px solid var(--ds-glass-border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-primary)', lineHeight: 1 }}>
            Settings
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--ds-text-muted)', marginTop: '2px' }}>System Configuration</p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ds-text-muted)' }}>tune</span>
      </header>

      <main style={{ padding: '24px 16px 120px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Appearance ── */}
        <GroupCard label="Appearance">
          <SettingsRow
            icon={isDark ? 'dark_mode' : 'light_mode'}
            label="Theme Mode"
            sublabel={isDark ? 'Dark Protocol Active' : 'Light Mode Active'}
            trailing={<Toggle value={isDark} onToggle={toggleTheme} />}
          />
        </GroupCard>

        {/* ── Units ── */}
        <GroupCard label="Units">
          <SettingsRow
            icon="straighten"
            label="Distance"
            sublabel="Kilometers (km)"
            trailing={<span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>km</span>}
          />
          <SettingsRow
            icon="local_gas_station"
            label="Fuel Economy"
            sublabel="Kilometers per liter"
            trailing={<span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>km/L</span>}
          />
          <SettingsRow
            icon="monitor_weight"
            label="Weight"
            sublabel="Kilograms (kg)"
            trailing={<span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>kg</span>}
          />
        </GroupCard>

        {/* ── Profile ── */}
        <GroupCard label="Rider Profile">
          <SettingsRow
            icon="person"
            label="Rider Name"
            sublabel="Not configured"
            trailing={<span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ds-text-muted)' }}>chevron_right</span>}
            onClick={() => {}}
          />
          <SettingsRow
            icon="garage"
            label="Garage Name"
            sublabel="My Garage"
            trailing={<span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ds-text-muted)' }}>chevron_right</span>}
            onClick={() => {}}
          />
        </GroupCard>

        {/* ── Data ── */}
        <GroupCard label="Data">
          <SettingsRow
            icon="ios_share"
            label="Export Logs"
            sublabel="Download service history as CSV"
            trailing={<span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ds-text-muted)' }}>chevron_right</span>}
            onClick={() => {}}
          />
          <SettingsRow
            icon="delete_sweep"
            label="Clear Local Cache"
            sublabel="Remove stored preferences"
            trailing={<span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ds-text-muted)' }}>chevron_right</span>}
            onClick={() => {}}
            danger
          />
        </GroupCard>

        {/* ── App Info ── */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <p style={{ fontSize: '10px', color: 'var(--ds-text-muted)', letterSpacing: '0.06em' }}>
            MyMotoGarage · v1.0.0 · Cockpit Edition
          </p>
        </div>

      </main>
    </div>
  )
}
