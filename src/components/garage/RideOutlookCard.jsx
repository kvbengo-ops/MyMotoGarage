const DS = {
  surface: 'var(--ds-surface)',
  border:  'var(--ds-border)',
  amber:   'var(--ds-amber)',
  textPrimary:   'var(--ds-text-primary)',
  textSecondary: 'var(--ds-text-secondary)',
}

export default function RideOutlookCard() {
  return (
    <div style={{
      background: DS.surface,
      border: `1px solid color-mix(in srgb, var(--ds-amber) 18%, transparent)`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex', alignItems: 'flex-start', gap: '14px',
    }}>
      {/* Icon */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'color-mix(in srgb, var(--ds-amber) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--ds-amber) 15%, transparent)',
      }}>
        <span className="material-symbols-filled" style={{ fontSize: '22px', color: DS.amber }}>light_mode</span>
      </div>

      {/* Content */}
      <div>
        <p style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: DS.amber, marginBottom: '6px',
        }}>
          Ride Outlook
        </p>
        <p style={{ fontSize: '13px', color: DS.textSecondary, lineHeight: 1.6 }}>
          If you're going for a ride today, consider wearing ventilated gear — it's hot out there. Humidity at 78%.
        </p>
      </div>
    </div>
  )
}
