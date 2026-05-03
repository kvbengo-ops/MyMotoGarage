import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const serviceTypes = [
  { label: 'Engine Oil', icon: 'oil_barrel' },
  { label: 'Tire Replacement', icon: 'tire_repair' },
  { label: 'Brake Service', icon: 'disc_full' },
  { label: 'Air Filter', icon: 'air' },
  { label: 'Spark Plugs', icon: 'bolt' },
  { label: 'Chain Clean & Lube', icon: 'sync_alt' },
  { label: 'Valve Clearance', icon: 'settings' },
  { label: 'Coolant Flush', icon: 'water_drop' },
  { label: 'Other', icon: 'build_circle' },
]

/* ── Shared input style ── */
const inputStyle = {
  width: '100%',
  background: 'var(--ds-input)',
  border: '1px solid var(--ds-border)',
  borderRadius: '10px',
  padding: '13px 14px',
  color: 'var(--ds-text-primary)',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

function GlassGroup({ title, children }) {
  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ds-neon-cyan)', opacity: 0.7 }}>
        {title}
      </span>
      {children}
    </div>
  )
}

export default function AddLog() {
  const navigate   = useNavigate()
  const { bikeId } = useParams()

  const [serviceType, setServiceType] = useState('')
  const [date,        setDate]        = useState('')
  const [odometer,    setOdometer]    = useState('')
  const [notes,       setNotes]       = useState('')
  const [cost,        setCost]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!serviceType || !date) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/vehicles/${bikeId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: serviceType,
          log_type: 'service',
          date,
          odometer_at_service: odometer ? Number(odometer) : undefined,
          description: notes || undefined,
          cost: cost ? Number(cost) : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to save log')
      setSuccess(true)
      setTimeout(() => navigate(-1), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const focusBorder = (e) => {
    e.target.style.borderColor = 'var(--ds-neon-cyan)'
    e.target.style.boxShadow = '0 0 0 3px var(--ds-neon-cyan-dim)'
  }
  const blurBorder = (e) => {
    e.target.style.borderColor = 'var(--ds-border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="fade-in cockpit-grid" style={{ minHeight: '100dvh', background: 'var(--ds-bg)' }}>

      {/* App Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: '1px solid var(--ds-glass-border)',
        backdropFilter: 'blur(24px)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-primary)', lineHeight: 1 }}>
            Log Service
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--ds-text-muted)', marginTop: '2px' }}>Commit a maintenance record</p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ds-text-muted)' }}>build_circle</span>
      </header>

      <main style={{ padding: '20px 16px 120px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Service Type — pill selector ── */}
          <GlassGroup title="Service Type">
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {serviceTypes.map(({ label, icon }) => {
                const active = serviceType === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setServiceType(label)}
                    style={{
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: `1px solid ${active ? 'var(--ds-neon-cyan)' : 'var(--ds-border)'}`,
                      background: active ? 'var(--ds-neon-cyan-dim)' : 'transparent',
                      color: active ? 'var(--ds-neon-cyan)' : 'var(--ds-text-secondary)',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                      cursor: 'pointer',
                      boxShadow: active ? '0 0 10px var(--ds-neon-cyan-glow)' : 'none',
                      transition: 'all 0.18s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
                    {label}
                  </button>
                )
              })}
            </div>
          </GlassGroup>

          {/* ── Date & Odometer ── */}
          <GlassGroup title="Date & Mileage">
            <Field label="Date of Service">
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)} required
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>
            <Field label="Odometer at Service (km)">
              <input
                type="number" placeholder="e.g. 12,440"
                value={odometer} onChange={e => setOdometer(e.target.value)}
                style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '16px' }}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>
          </GlassGroup>

          {/* ── Details ── */}
          <GlassGroup title="Details">
            <Field label="Parts / Notes">
              <textarea
                placeholder="Describe the work done, parts used…"
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>
            <Field label="Cost (PHP)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--ds-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>₱</span>
                <input
                  type="number" placeholder="0.00"
                  value={cost} onChange={e => setCost(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 30, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={focusBorder} onBlur={blurBorder}
                />
              </div>
            </Field>
          </GlassGroup>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--ds-red)', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !serviceType || !date}
            className="glow-pulse"
            style={{
              width: '100%', height: '54px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              borderRadius: '12px', border: 'none', cursor: serviceType && date ? 'pointer' : 'not-allowed',
              background: success ? 'var(--ds-green)' : (serviceType && date) ? 'var(--ds-primary)' : 'var(--ds-surface-active)',
              color: (serviceType && date) ? '#000' : 'var(--ds-text-muted)',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
              transition: 'background 0.3s',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {success ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>LOG COMMITTED</>
            ) : submitting ? (
              'COMMITTING...'
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>COMMIT LOG</>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
