import { useState } from 'react'

/* ── Individual form field ── */
export function Field({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ds-text-secondary)', marginBottom: '8px',
      }}>{label}</label>
      {children}
    </div>
  )
}

/* ── Styled input / textarea ── */
export function StyledInput({ type = 'text', placeholder, value, onChange, multiline }) {
  const [focused, setFocused] = useState(false)
  const base = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--ds-input)',
    border: `1.5px solid ${focused ? 'var(--ds-amber)' : 'var(--ds-border)'}`,
    boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--ds-amber) 10%, transparent)' : 'none',
    borderRadius: '8px',
    padding: '14px 16px',
    fontSize: '14px', color: 'var(--ds-text-primary)',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  return multiline ? (
    <textarea
      placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...base, resize: 'vertical', minHeight: '96px' }}
    />
  ) : (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={base}
    />
  )
}

/* ── Styled select ── */
export function StyledSelect({ value, onChange, children }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--ds-input)',
          border: `1.5px solid ${focused ? 'var(--ds-amber)' : 'var(--ds-border)'}`,
          boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--ds-amber) 10%, transparent)' : 'none',
          borderRadius: '8px',
          padding: '14px 44px 14px 16px',
          fontSize: '14px', color: 'var(--ds-text-primary)',
          outline: 'none', fontFamily: 'Inter, sans-serif',
          appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >{children}</select>
      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--ds-text-secondary)', pointerEvents: 'none' }}>
        expand_more
      </span>
    </div>
  )
}

/* ── Cost input ── */
export function CostInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--ds-input)',
      border: `1.5px solid ${focused ? 'var(--ds-amber)' : 'var(--ds-border)'}`,
      boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--ds-amber) 10%, transparent)' : 'none',
      borderRadius: '8px', overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <span style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--ds-text-secondary)', borderRight: `1px solid var(--ds-border)`, flexShrink: 0 }}>$</span>
      <input
        type="number" placeholder="0.00" value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '14px 16px', fontSize: '14px', color: 'var(--ds-text-primary)', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  )
}

/* ── Group card — wraps related fields ── */
export function FormGroup({ title, children }) {
  return (
    <div style={{ background: 'var(--ds-surface)', border: `1px solid var(--ds-border)`, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Group header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: `1px solid var(--ds-border)`,
        background: 'var(--ds-surface-hover)',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>{title}</p>
      </div>
      {/* Fields */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}
