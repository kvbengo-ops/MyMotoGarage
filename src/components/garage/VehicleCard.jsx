import { useNavigate } from 'react-router-dom'

const DS = {
  surface:  'var(--ds-surface)',
  surface2: 'var(--ds-surface-active)',
  border:   'var(--ds-border)',
  textPrimary:   'var(--ds-text-primary)',
  textSecondary: 'var(--ds-text-secondary)',
  amber:         'var(--ds-amber)',
}

const statusMap = {
  readyToRide: {
    label:       'Ready to Ride',
    dot:         'var(--ds-green)',
    ping:        'var(--ds-green)',
    border:      'color-mix(in srgb, var(--ds-green) 20%, transparent)',
    actionLabel: 'Diagnostics',
    actionColor: DS.amber,
  },
  serviceDue: {
    label:       'Service Due',
    dot:         'var(--ds-red)',
    ping:        null,
    border:      'color-mix(in srgb, var(--ds-red) 20%, transparent)',
    actionLabel: 'View Alerts',
    actionColor: 'var(--ds-red)',
  },
  warning: {
    label:       'Warning',
    dot:         'var(--ds-amber)',
    ping:        'var(--ds-amber)',
    border:      'color-mix(in srgb, var(--ds-amber) 20%, transparent)',
    actionLabel: 'View Alerts',
    actionColor: 'var(--ds-amber)',
  },
  needsSetup: {
    label:       'Awaiting Setup',
    dot:         '#3b82f6', // blue
    ping:        '#3b82f6',
    border:      'color-mix(in srgb, #3b82f6 20%, transparent)',
    actionLabel: 'Setup Ride',
    actionColor: '#3b82f6',
  },
}

export default function VehicleCard({ bike }) {
  const navigate = useNavigate()
  const s = statusMap[bike.status] || statusMap.readyToRide

  return (
    <article style={{
      background: DS.surface,
      border: `1px solid ${s.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>

      {/* ── Image — 4:3 aspect ── */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        <img
          src={bike.image} alt={bike.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ds-surface) 0%, transparent 80%)' }} />

        {/* Status badge — top right */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '9999px',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: `1px solid ${s.border}`,
          }}>
            <span style={{ position: 'relative', display: 'flex', width: '6px', height: '6px', flexShrink: 0 }}>
              {s.ping && <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.ping, opacity: 0.7 }} />}
              <span style={{ position: 'relative', width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'block' }} />
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.dot }}>
              {s.label}
            </span>
          </div>
        </div>

        {/* Diagnostic pins — top right below badge */}
        <div style={{ position: 'absolute', top: '48px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {bike.diagnosticPins.map((pin, i) => (
            <div key={i} title={pin.title} style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--ds-surface) 60%, transparent)', backdropFilter: 'blur(8px)',
              border: `1px solid color-mix(in srgb, var(--ds-${pin.color === 'red' ? 'red' : 'amber'}) 50%, transparent)`,
            }}>
              <span className="material-symbols-filled" style={{ fontSize: '16px', color: `var(--ds-${pin.color === 'red' ? 'red' : 'amber'})` }}>{pin.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content — 20px padding, 16px gap between rows ── */}
      <div style={{ padding: '20px' }}>
        {/* Name + category */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', color: DS.textPrimary, marginBottom: '4px' }}>
            {bike.name}
          </h3>
          <p style={{ fontSize: '12px', color: DS.textSecondary }}>{bike.category}</p>
        </div>

        {/* Action Buttons based on status */}
        {bike.status === 'needsSetup' ? (
          <button
            onClick={() => navigate(`/setup-vehicle/${bike.id}`)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              height: '56px', borderRadius: '12px',
              background: '#3b82f6', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#fff',
              boxShadow: '0 4px 20px color-mix(in srgb, #3b82f6 30%, transparent)',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>build</span>
            SETUP RIDE
          </button>
        ) : (
          <>
            {/* START RIDE */}
            <button
              onClick={() => {}}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                height: '56px', borderRadius: '12px',
                background: DS.amber, border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#000',
                boxShadow: '0 4px 20px rgba(255,140,0,0.25)',
                transition: 'background 0.15s, transform 0.1s',
                marginBottom: '8px',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="material-symbols-filled" style={{ fontSize: '20px' }}>two_wheeler</span>
              START RIDE
            </button>

            {/* VIEW BIKE */}
            <button
              onClick={() => navigate(`/bike/${bike.id}`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                height: '52px', borderRadius: '12px',
                background: 'var(--ds-surface-hover)', border: `1.5px solid ${DS.border}`,
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: DS.textPrimary,
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--ds-text-primary) 8%, transparent)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--ds-surface-hover)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
              VIEW BIKE
            </button>
          </>
        )}

        {/* Footer row — 16px top margin */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '16px', paddingTop: '16px',
          borderTop: `1px solid ${DS.border}`,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: DS.textSecondary }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>speed</span>
            {bike.status === 'needsSetup' ? '--' : bike.odometer.toLocaleString() + ' mi'}
          </span>
          <button
            onClick={() => bike.status === 'needsSetup' ? navigate(`/setup-vehicle/${bike.id}`) : navigate(`/bike/${bike.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: s.actionColor, background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            {s.actionLabel}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          </button>
        </div>
      </div>
    </article>
  )
}
