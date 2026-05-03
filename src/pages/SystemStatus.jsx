import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'


/* ── Design tokens — aligned to global CSS design system ──────────
   BG / surfaces / borders / text → CSS vars (auto dark/light)
   Health semantics → explicit hex, used ONLY on health indicators
   Brand accent (Acid Lime) → interactive chrome only
   ─────────────────────────────────────────────────────────────── */

/* Health — semantic only: arc strokes, bars, % numbers, dots */
const GOOD  = '#22c55e'    // --ds-green
const WARN  = '#f59e0b'    // amber
const CRIT  = '#ef4444'    // --ds-red

/* Structural — mirror the CSS vars */
const BG      = 'var(--ds-bg)'
const CARD    = 'var(--ds-surface)'
const BORDER  = 'var(--ds-border)'
const TEXT1   = 'var(--ds-text-primary)'
const TEXT2   = 'var(--ds-text-secondary)'
const TEXT3   = 'var(--ds-text-muted)'
const LIME    = 'var(--ds-primary)'         // brand accent for chrome
const CYAN    = 'var(--ds-neon-cyan)'       // telemetry data accent

/* back-compat aliases */
const MUTED   = TEXT2
const DIM     = TEXT3

/* ── Segmented Health Bar (20 segments, cockpit style) ── */
function SegmentedBar({ percent, color }) {
  const SEGS = 20
  const filled = Math.round((percent / 100) * SEGS)
  return (
    <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
      {Array.from({ length: SEGS }, (_, i) => (
        <div
          key={i}
          className="seg-bar-fill"
          style={{
            flex: 1, height: '5px', borderRadius: '2px',
            background: i < filled
              ? color
              : 'rgba(255,255,255,0.07)',
            boxShadow: i < filled ? `0 0 4px ${color}80` : 'none',
          }}
        />
      ))}
    </div>
  )
}

/* ── Health helpers ── */
const healthColor = (p) => p >= 70 ? GOOD : p >= 40 ? WARN : CRIT
const statusMeta  = (h) => {
  if (h >= 85) return { label: 'All Systems Go',  color: GOOD }
  if (h >= 60) return { label: 'Fair',             color: WARN }
  if (h >= 40) return { label: 'Monitor',          color: WARN }
  return               { label: 'Needs Attention', color: CRIT }
}



/* ── Shared 270° open-arc gauge (same as diagnostics) ── */
function ArcGauge({ percent }) {
  const cx = 50, cy = 56, r = 36
  const toRad = deg => (deg * Math.PI) / 180
  const startAngle = 150, sweepTotal = 240
  const startX = cx + r * Math.cos(toRad(startAngle))
  const startY = cy + r * Math.sin(toRad(startAngle))
  const endX = cx + r * Math.cos(toRad(startAngle + sweepTotal))
  const endY = cy + r * Math.sin(toRad(startAngle + sweepTotal))
  const fillSweep = sweepTotal * percent / 100
  const fillAngle = startAngle + fillSweep
  const fillX = cx + r * Math.cos(toRad(fillAngle))
  const fillY = cy + r * Math.sin(toRad(fillAngle))
  const fillLargeArc = fillSweep >= 180 ? 1 : 0
  const arcColor =
    percent >= 90 ? GOOD
    : percent >= 70 ? '#86efac'
    : percent >= 40 ? WARN
    : CRIT
  return (
    <svg viewBox="0 0 100 76" style={{ width: '100%', display: 'block' }}>
      <path d={`M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${r} ${r} 0 1 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" strokeLinecap="round" />
      {percent > 0 && (
        <path d={`M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${r} ${r} 0 ${fillLargeArc} 1 ${fillX.toFixed(2)} ${fillY.toFixed(2)}`}
          fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"
        />
      )}
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800"
        fill={arcColor} fontFamily="inherit">{percent}</text>
      <text x="50" y="63" textAnchor="middle" fontSize="6.5" fontWeight="500"
        fill={arcColor} opacity="0.45" fontFamily="inherit">%</text>
    </svg>
  )
}

/* ── Category definitions ── */
const CAT_ORDER = ['Engine', 'Tires', 'Brakes', 'Oils', 'Electronics']
const CAT_ICONS = {
  Engine: 'settings',
  Tires: 'tire_repair',
  Brakes: 'disc_full',
  Oils: 'water_drop',
  Electronics: 'bolt',
}

/* ── Per-category accent colors (visual identity, not health) ── */
const CAT_COLORS = {
  Engine:      '#fb923c',   // orange    — heat, combustion
  Tires:       '#94a3b8',   // slate     — rubber, road
  Brakes:      '#f43f5e',   // rose      — stop, friction
  Oils:        '#fbbf24',   // gold      — fluid, lubrication
  Electronics: '#38bdf8',   // sky blue  — circuits, power
}

/* ── Component-type → icon map ── */
const COMP_ICON = {
  'CVT Belt': 'sync_alt',
  'Roller Weights': 'fitness_center',
  'CVT Clutch Shoes': 'settings',
  'Drive Face': 'radio_button_checked',
  'Front Tire': 'tire_repair',
  'Rear Tire': 'tire_repair',
  'Front Brake Pads': 'disc_full',
  'Rear Brake Pads': 'disc_full',
  'Brake Fluid': 'water_drop',
  'Engine Oil': 'oil_barrel',
  'Gear Oil': 'opacity',
  'Air Filter': 'air',
  'Fuel Filter': 'filter_alt',
  'Oil Filter': 'filter_list',
  'Spark Plug': 'bolt',
  'Battery': 'battery_full',
}
const compIcon = (label) => COMP_ICON[label] || 'build_circle'

/* ── 4-dot efficiency indicator ── */
const dotsFilled = (p) => p >= 75 ? 4 : p >= 50 ? 3 : p >= 25 ? 2 : p >= 10 ? 1 : 0

/* ── Carbon fiber pattern (SVG data URI) ── */

const CARBON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23141414'/%3E%3Crect x='4' width='4' height='4' fill='%230f0f0f'/%3E%3Crect y='4' width='4' height='4' fill='%230f0f0f'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23141414'/%3E%3C/svg%3E")`

export default function SystemStatus() {
  const navigate = useNavigate()
  const { bike } = useOutletContext()

  const items = bike.systemStatus || []
  const alerts = bike.smartAlerts || []
  const logs = bike.maintenanceLogs || bike.recentUpgrades || []

  // Which category modal is open (null = none)
  const [openCat, setOpenCat]       = useState(null)
  // Show all categories or just first 4
  const [showAllCats, setShowAllCats] = useState(false)

  const totalHealth = items.length
    ? Math.round(items.reduce((s, i) => s + i.percent, 0) / items.length)
    : 100

  const { label: sLabel, color: sColor } = statusMeta(totalHealth)

  /* Gauge math */
  const R = 78
  const SW = 10
  const circ = 2 * Math.PI * R
  const off = circ - (totalHealth / 100) * circ

  /* Group items */
  const groups = {}
  items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = { meta: item.categoryMeta, parts: [] }
    groups[item.category].parts.push(item)
  })

  /* Category avg for icon strip */
  const catAvg = (cat) => {
    if (!groups[cat]) return null
    const ps = groups[cat].parts
    return Math.round(ps.reduce((s, p) => s + p.percent, 0) / ps.length)
  }

  return (
    <div className="fade-in cockpit-grid" style={{ minHeight: '100dvh', background: BG }}>

      {/* ── App Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '52px', padding: '0 20px',
        background: 'rgba(10,10,10,0.85)',
        borderBottom: `1px solid ${BORDER}`,
        backdropFilter: 'blur(24px)',
      }}>
        <button onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: MUTED }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
        </button>
        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>
          {bike.make} · {bike.model}
        </span>
        <button onClick={() => navigate(`/bike/${bike.id}/add-log`)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${CYAN}`, background: 'var(--ds-neon-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CYAN }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        </button>
      </header>

      <main style={{ paddingBottom: '120px' }}>

        {/* ── Hero Gauge Section ── */}
        <div style={{ padding: '32px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* Gauge wrapper */}
          <div style={{ position: 'relative', width: `${(R + SW) * 2}px`, height: `${(R + SW) * 2}px` }}>
            <svg width={(R + SW) * 2} height={(R + SW) * 2} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 2 }}>
              {/* Track ring */}
              <circle cx={R + SW} cy={R + SW} r={R}
                fill="none"
                stroke="url(#trackGrad)"
                strokeWidth={SW}
              />
              {/* Neon glow layer — blurred, wider */}
              {totalHealth > 0 && (
                <circle cx={R + SW} cy={R + SW} r={R}
                  fill="none"
                  stroke={sColor}
                  strokeWidth={SW + 12}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={off}
                  opacity={0.12}
                  style={{ filter: 'blur(8px)', transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
                />
              )}
              {/* Health arc — crisp top layer */}
              <circle cx={R + SW} cy={R + SW} r={R}
                fill="none"
                stroke={sColor}
                strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={off}
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
              />
              <defs>
                <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2a2a2a" />
                  <stop offset="50%" stopColor="#1a1a1a" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center readout */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', zIndex: 3 }}>
              <span style={{
                fontSize: '46px', fontWeight: 900, lineHeight: 1,
                letterSpacing: '-0.04em', color: sColor,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {totalHealth}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: DIM, textTransform: 'uppercase' }}>% Health</span>
            </div>
          </div>


          {/* Status label — plain, no heavy tint */}
          <span style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
            color: sColor,
            borderBottom: `1px solid ${sColor}50`,
            paddingBottom: '2px',
          }}>
            {sLabel}
          </span>

          {/* ── 5-Category Icon + Dot Strip ── */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', marginTop: '4px' }}>
            {CAT_ORDER.map(cat => {
              const avg      = catAvg(cat)
              const hasData  = avg !== null
              const fc       = hasData ? healthColor(avg) : DIM    // dots → health color
              const catColor = CAT_COLORS[cat]                      // icon → category color
              const filled   = hasData ? dotsFilled(avg) : 0
              return (
                <div key={cat} style={{
                  flex: 1, maxWidth: '64px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '10px 4px 8px',
                  background: CARD,
                  border: `1px solid ${hasData && avg < 40 ? CRIT : hasData && avg < 70 ? WARN : BORDER}`,
                  borderRadius: '14px',
                  boxShadow: hasData && avg < 40 ? `0 0 10px ${CRIT}20` : 'none',
                }}>
                  {/* Category icon — category color */}
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: hasData ? catColor : DIM }}>
                    {CAT_ICONS[cat]}
                  </span>

                  {/* Label */}
                  <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: DIM, textAlign: 'center', lineHeight: 1 }}>
                    {cat}
                  </span>

                  {/* 4 dots — health color */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1, 2, 3, 4].map(d => (
                      <div key={d} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: d <= filled ? fc : 'rgba(255,255,255,0.08)',
                      }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>


        </div>

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '0 20px' }} />

        {/* ── Smart Alerts ── */}
        {alerts.length > 0 && (
          <div style={{ padding: '20px 20px 0' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase', marginBottom: '12px' }}>Alerts</p>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {alerts.map(alert => {
                const col = alert.type !== 'warning' ? '#ff3b3b' : '#fbbf24'
                return (
                  <div key={alert.id} style={{
                    flexShrink: 0, minWidth: '180px',
                    background: `color-mix(in srgb, ${col} 6%, ${CARD})`,
                    border: `1px solid color-mix(in srgb, ${col} 18%, transparent)`,
                    borderRadius: '12px', padding: '14px',
                  }}>
                    <span className="material-symbols-filled" style={{ fontSize: '18px', color: col, display: 'block', marginBottom: '8px' }}>{alert.icon}</span>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: col, lineHeight: 1.3, marginBottom: '4px' }}>{alert.title}</p>
                    <p style={{ fontSize: '10px', color: MUTED, lineHeight: 1.5 }}>{alert.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Insights Strip ── */}
        {(() => {
          // Build insight cards from component health
          const urgent  = items.filter(i => i.percent < 40)
          const caution = items.filter(i => i.percent >= 40 && i.percent < 70)

          const insights = [
            // Urgent items first
            ...urgent.map(i => ({
              id: `urg-${i.id}`,
              type: 'urgent',
              icon: 'warning',
              color: CRIT,
              title: `Replace ${i.label}`,
              body: `At ${i.percent}% — service needed soon`,
            })),
            // Caution items
            ...caution.map(i => ({
              id: `cau-${i.id}`,
              type: 'caution',
              icon: 'schedule',
              color: WARN,
              title: `Monitor ${i.label}`,
              body: `At ${i.percent}% — plan ahead`,
            })),
            // Static tips / upgrade nudges when health is good
            ...(totalHealth >= 85 ? [{
              id: 'tip-optimal',
              type: 'tip',
              icon: 'tips_and_updates',
              color: LIME,
              title: 'All Systems Optimal',
              body: 'Great time to log a service record',
            }] : []),
            ...(items.some(i => i.label?.toLowerCase().includes('oil')) ? [{
              id: 'tip-oil',
              type: 'upgrade',
              icon: 'upgrade',
              color: CAT_COLORS.Oils,
              title: 'Consider Synthetic Oil',
              body: 'Extends engine life by up to 20%',
            }] : []),
          ]

          if (insights.length === 0) return null
          return (
            <div style={{ padding: '20px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '10px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase' }}>Insights</p>
                <span style={{ fontSize: '9px', color: DIM }}>{insights.length} notice{insights.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 16px 4px' }}>
                {insights.map(n => (
                  <div key={n.id} style={{
                    flexShrink: 0, width: '180px',
                    background: CARD,
                    border: `1px solid ${n.type === 'urgent' ? `${CRIT}30` : n.type === 'caution' ? `${WARN}25` : BORDER}`,
                    borderRadius: '14px', padding: '14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: n.color }}>{n.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: n.color, letterSpacing: '0.02em', lineHeight: 1.2 }}>{n.title}</span>
                    </div>
                    <p style={{ fontSize: '10px', color: MUTED, lineHeight: 1.5 }}>{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Categories: 2-column card grid ── */}
        <div style={{ padding: '24px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase' }}>Components</p>
            {!showAllCats && (
              <button onClick={() => setShowAllCats(true)} style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: LIME, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                View All
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'start' }}>
            {(() => {
              const available = CAT_ORDER.filter(c => groups[c])
              const visible   = showAllCats ? available : available.slice(0, 4)
              const hiddenCount = available.length - 4
              return (
                <>
                  {visible.map(cat => {
                    const { parts } = groups[cat]
                    const catColor = CAT_COLORS[cat]
                    const avg = Math.round(parts.reduce((s, p) => s + p.percent, 0) / parts.length)
                    return (
                      <button
                        key={cat}
                        onClick={() => setOpenCat(cat)}
                        className={avg < 40 ? 'cockpit-glow-red' : avg < 70 ? 'cockpit-glow-amber' : ''}
                        style={{
                          background: CARD,
                          border: `1px solid ${avg < 40 ? 'rgba(239,68,68,0.35)' : avg < 70 ? 'rgba(245,158,11,0.30)' : BORDER}`,
                          borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                          padding: '14px 12px 12px', display: 'flex', flexDirection: 'column',
                          gap: '8px', width: '100%',
                          boxShadow: avg < 40 ? '0 0 12px rgba(239,68,68,0.15)' : 'none',
                        }}
                      >
                        <div style={{ width: '80px', margin: '0 auto' }}>
                          <ArcGauge percent={avg} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: catColor }}>
                            {CAT_ICONS[cat]}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: TEXT1, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
                            {cat}
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: DIM }}>chevron_right</span>
                        </div>
                        <p style={{ fontSize: '9px', color: DIM }}>{parts.length} parts</p>
                      </button>
                    )
                  })}

                  {/* Collapse button — shown when all cats are visible */}
                  {showAllCats && available.length > 4 && (
                    <button
                      onClick={() => setShowAllCats(false)}
                      style={{
                        gridColumn: '1 / -1', background: 'none', border: 'none',
                        cursor: 'pointer', color: DIM, fontSize: '9px',
                        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '8px', marginTop: '2px',
                      }}
                    >
                      Show less ↑
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </div>


        {/* ── Log Timeline ── */}
        {logs.length > 0 && (
          <div style={{ padding: '8px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase' }}>Recent Logs</p>
              <button style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: LIME, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {logs.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', paddingBottom: i < logs.length - 1 ? '16px' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%', marginTop: '3px',
                      background: item.borderColor === 'amber' ? WARN : TEXT3,
                    }} />
                    {i < logs.length - 1 && <div style={{ width: '1px', flex: 1, background: BORDER, marginTop: '5px' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < logs.length - 1 ? '6px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>{item.title}</p>
                      <span style={{ fontSize: '9px', color: DIM, flexShrink: 0, marginLeft: '8px', marginTop: '2px' }}>{item.date}</span>
                    </div>
                    <p style={{ fontSize: '10px', color: DIM, marginTop: '2px' }}>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── Category Bottom-Sheet Modal ── */}
      {openCat && groups[openCat] && (() => {
        const { parts } = groups[openCat]
        const catColor = CAT_COLORS[openCat]
        const avg = Math.round(parts.reduce((s, p) => s + p.percent, 0) / parts.length)
        return (
          <>
            <div onClick={() => setOpenCat(null)} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              zIndex: 100, backdropFilter: 'blur(3px)',
              animation: 'bsFadeIn 0.2s ease',
            }} />
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
              background: 'var(--ds-surface)',
              borderRadius: '20px 20px 0 0',
              border: `1px solid ${BORDER}`, borderBottom: 'none',
              maxHeight: '80dvh', display: 'flex', flexDirection: 'column',
              animation: 'bsSlideUp 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px 12px' }}>
                <div style={{ width: '72px', flexShrink: 0 }}><ArcGauge percent={avg} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: catColor }}>{CAT_ICONS[openCat]}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{openCat}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: DIM }}>{parts.length} parts monitored</p>
                </div>
                <button onClick={() => setOpenCat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
                </button>
              </div>
              <div style={{ height: '1px', background: BORDER, margin: '0 20px' }} />
              <div style={{ overflowY: 'auto', padding: '18px 20px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {parts.map(item => {
                  const fc = healthColor(item.percent)
                  const kmLeft = item.threshold
                    ? Math.max(0, Math.round((item.percent / 100) * item.threshold))
                    : null
                  return (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: TEXT1 }}>{item.label}</span>
                        <span style={{
                          fontSize: '14px', fontWeight: 800, color: fc,
                          fontFamily: "'JetBrains Mono', monospace",
                          textShadow: `0 0 10px ${fc}80`,
                        }}>{item.percent}%</span>
                      </div>
                      <SegmentedBar percent={item.percent} color={fc} />
                      <span style={{ fontSize: '10px', color: DIM, display: 'block', marginTop: '6px' }}>
                        {kmLeft !== null ? `~${kmLeft.toLocaleString()} km remaining` : `Last: ${item.lastDate}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <style>{`
              @keyframes bsFadeIn  { from{opacity:0} to{opacity:1} }
              @keyframes bsSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
            `}</style>
          </>
        )
      })()}

    </div>
  )
}
