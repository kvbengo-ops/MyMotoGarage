import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fleet } from '../data/fleet'
import AmberButton from '../components/shared/AmberButton'

const DS = {
  bg:      'var(--ds-bg)',
  surface: 'var(--ds-surface)',
  border:  'var(--ds-border)',
  input:   'var(--ds-input)',
  textPrimary:   'var(--ds-text-primary)',
  textSecondary: 'var(--ds-text-secondary)',
  amber:         'var(--ds-amber)',
}

const serviceTypes = [
  'Engine Oil Change','Tire Replacement','Brake Service',
  'Chain Clean & Lube','Air Filter','Spark Plugs',
  'Valve Clearance','Coolant Flush','Other',
]

import { Field, StyledInput, StyledSelect, CostInput, FormGroup } from '../components/shared/FormUtils'

export default function AddLog() {
  const navigate   = useNavigate()
  const { bikeId } = useParams()
  
  const bike = fleet.find((b) => b.id === bikeId) || fleet[0]

  const [serviceType, setServiceType] = useState('')
  const [date,        setDate]        = useState('')
  const [odometer,    setOdometer]    = useState('')
  const [notes,       setNotes]       = useState('')
  const [cost,        setCost]        = useState('')
  const [success,     setSuccess]     = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setServiceType(''); setDate(''); setOdometer(''); setNotes(''); setCost('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div style={{ minHeight: '100dvh', background: DS.bg }}>

      {/* ── App Bar — 56px ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: `1px solid var(--ds-glass-border)`,
        backdropFilter: 'blur(20px)',
        transition: 'background-color 0.3s'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: DS.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: DS.amber }}>
          Log Maintenance
        </h1>
      </header>

      {/* ── Form — 16px sides, 24px top, 16px between groups ── */}
      <main style={{ padding: '24px 16px 40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <FormGroup title="Service Info">
            <Field label="Vehicle">
              <div style={{
                background: 'var(--ds-surface-hover)',
                border: `1.5px solid ${DS.border}`,
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '14px', color: DS.textSecondary,
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>two_wheeler</span>
                {bike.name}
              </div>
            </Field>
            <Field label="Service Type">
              <StyledSelect value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="" disabled style={{ background: 'var(--ds-surface)' }}>Select service type…</option>
                {serviceTypes.map((t) => (
                  <option key={t} value={t} style={{ background: 'var(--ds-surface)' }}>{t}</option>
                ))}
              </StyledSelect>
            </Field>
          </FormGroup>

          <FormGroup title="Date & Mileage">
            <Field label="Date of Service">
              <StyledInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Odometer at Service (mi)">
              <StyledInput type="number" placeholder="e.g. 4,250" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
            </Field>
          </FormGroup>

          <FormGroup title="Details">
            <Field label="Parts / Notes">
              <StyledInput placeholder="Describe the work done, parts used…" value={notes} onChange={(e) => setNotes(e.target.value)} multiline />
            </Field>
            <Field label="Cost">
              <CostInput value={cost} onChange={(e) => setCost(e.target.value)} />
            </Field>
          </FormGroup>

          {/* CTa — 24px top margin for weight after form groups */}
          <div style={{ marginTop: '8px' }}>
            <AmberButton icon="check_circle">COMMIT LOG</AmberButton>
          </div>

        </form>
      </main>

      {/* ── Toast ── */}
      {success && (
        <div style={{
          position: 'fixed', bottom: '96px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 20px', borderRadius: '9999px',
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
          color: '#4ade80', fontSize: '13px', fontWeight: 600,
          backdropFilter: 'blur(12px)', whiteSpace: 'nowrap', zIndex: 50,
        }}>
          <span className="material-symbols-filled" style={{ fontSize: '16px' }}>check_circle</span>
          Maintenance log committed!
        </div>
      )}
    </div>
  )
}
