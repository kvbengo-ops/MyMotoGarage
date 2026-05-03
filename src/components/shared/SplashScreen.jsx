import { useEffect, useState } from 'react'

/* ── SplashScreen ─────────────────────────────────────────────
   Shown once per session on first mount.
   Sequence:
     0 ms   → logo + tagline fade in
     400ms  → scanning bar sweeps across
     1400ms → bar completes, "SYSTEMS ONLINE" text appears
     2000ms → whole screen fades out
     2400ms → unmounted, app renders
─────────────────────────────────────────────────────────────── */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter')   // enter | scan | online | exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scan'),   400)
    const t2 = setTimeout(() => setPhase('online'), 1500)
    const t3 = setTimeout(() => setPhase('exit'),   2100)
    const t4 = setTimeout(() => onComplete(),       2700)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0A0A10',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.55s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Cockpit dot grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(0,212,255,0.045) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* ── Logo block ── */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Hex icon */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <svg viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C8FF00" />
                <stop offset="100%" stopColor="#00D4FF" />
              </linearGradient>
              <filter id="hexGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Outer hex — glow */}
            <polygon
              points="36,4 64,20 64,52 36,68 8,52 8,20"
              fill="none"
              stroke="url(#hexGrad)"
              strokeWidth="1.5"
              opacity="0.4"
              filter="url(#hexGlow)"
            />
            {/* Inner hex — solid */}
            <polygon
              points="36,10 58,23 58,49 36,62 14,49 14,23"
              fill="rgba(200,255,0,0.07)"
              stroke="url(#hexGrad)"
              strokeWidth="1"
            />
            {/* Bike icon */}
            <text
              x="36" y="42"
              textAnchor="middle"
              fontSize="24"
              fontFamily="Material Symbols Outlined"
              fill="url(#hexGrad)"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              two_wheeler
            </text>
          </svg>
          {/* Rotating ring */}
          <div style={{
            position: 'absolute', inset: -6,
            border: '1px solid rgba(200,255,0,0.15)',
            borderTopColor: '#C8FF00',
            borderRadius: '50%',
            animation: 'splash-spin 1.2s linear infinite',
          }} />
        </div>

        {/* App name */}
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '32px', fontWeight: 900,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #C8FF00 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            MyMotoGarage
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '6px',
          }}>
            Cockpit Edition
          </div>
        </div>

        {/* ── Scanning bar ── */}
        <div style={{
          width: '200px', height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '999px', overflow: 'hidden',
          marginTop: '8px',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #C8FF00, #00D4FF)',
            borderRadius: '999px',
            width: phase === 'scan' || phase === 'online' || phase === 'exit' ? '100%' : '0%',
            boxShadow: '0 0 8px rgba(0,212,255,0.6)',
            transition: phase === 'scan' ? 'width 1.0s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }} />
        </div>

        {/* Status text */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          height: '14px',
          opacity: phase === 'online' || phase === 'exit' ? 1 : 0,
          transition: 'opacity 0.4s ease',
          color: '#00D4FF',
        }}>
          ● SYSTEMS ONLINE
        </div>
      </div>

      {/* Corner HUD lines */}
      {[
        { top: 16, left: 16,   borderTop: '1px solid rgba(200,255,0,0.25)', borderLeft: '1px solid rgba(200,255,0,0.25)', width: 24, height: 24 },
        { top: 16, right: 16,  borderTop: '1px solid rgba(200,255,0,0.25)', borderRight: '1px solid rgba(200,255,0,0.25)', width: 24, height: 24 },
        { bottom: 16, left: 16,  borderBottom: '1px solid rgba(200,255,0,0.25)', borderLeft: '1px solid rgba(200,255,0,0.25)', width: 24, height: 24 },
        { bottom: 16, right: 16, borderBottom: '1px solid rgba(200,255,0,0.25)', borderRight: '1px solid rgba(200,255,0,0.25)', width: 24, height: 24 },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', pointerEvents: 'none', ...s }} />
      ))}

      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
