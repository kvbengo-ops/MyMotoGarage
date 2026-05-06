import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import BarcodeScanner from '../components/shared/BarcodeScanner'


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
  const { bike, refreshBike } = useOutletContext()

  const items = bike.systemStatus || []
  const alerts = bike.smartAlerts || []
  const logs = bike.maintenanceLogs || bike.recentUpgrades || []

  // GA-05: Split tracked (wearable) items from permanent accessories
  const wearableItems  = items.filter(i => i.percent !== null && i.percent !== undefined)
  const permanentItems = items.filter(i => i.percent === null || i.percent === undefined)

  // Which category modal is open (null = none)
  const [openCat, setOpenCat]         = useState(null)
  // Which individual part detail is open (null = none)
  const [openPart, setOpenPart]       = useState(null)
  // Show all categories or just first 4
  const [showAllCats, setShowAllCats] = useState(false)
  // Modal for accessories
  const [openAccessories, setOpenAccessories] = useState(false)

  // Quick-reset state
  const [showReset, setShowReset]             = useState(false)
  const [resetBrand, setResetBrand]           = useState('')
  const [resetModel, setResetModel]           = useState('')
  const [resetDate, setResetDate]             = useState('')
  const [resetNewThreshold, setResetNewThreshold] = useState('')
  const [resetCost, setResetCost]             = useState('')
  const [resetImageFile, setResetImageFile]   = useState(null)
  const [resetImagePreview, setResetImagePreview] = useState(null)
  const [uploadingResetImage, setUploadingResetImage] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [resetting, setResetting]             = useState(false)
  const [resetDone, setResetDone]             = useState(false)
  const [resetError, setResetError]           = useState(null)

  // GA-01: Edit part (threshold / brand / model) state
  const [showEdit, setShowEdit]             = useState(false)
  const [editBrand, setEditBrand]           = useState('')
  const [editModel, setEditModel]           = useState('')
  const [editThreshold, setEditThreshold]   = useState('')
  const [editName, setEditName]             = useState('')
  const [editing, setEditing]               = useState(false)
  const [editDone, setEditDone]             = useState(false)
  const [editError, setEditError]           = useState(null)

  // GA-08: Service history state
  const [partHistory, setPartHistory]       = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // When a part is opened, pre-fill all edit fields and load history
  const openPartDetail = async (item) => {
    setOpenPart(item)
    setResetBrand(item.brand || '')
    setResetModel(item.model || '')
    setResetDate(new Date().toISOString().split('T')[0])
    setResetNewThreshold('')
    setResetCost('')
    if (resetImagePreview) URL.revokeObjectURL(resetImagePreview)
    setResetImageFile(null)
    setResetImagePreview(null)
    setShowReset(false)
    setResetDone(false)
    setResetError(null)
    setShowEdit(false)
    setEditBrand(item.brand || '')
    setEditModel(item.model || '')
    setEditThreshold(item.threshold != null ? String(item.threshold) : '')
    setEditName(item.label || '')
    setEditDone(false)
    setEditError(null)
    // Fetch service history in background (GA-08)
    setPartHistory([])
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/vehicles/${bike.id}/components/${item.id}/history`)
      const data = await res.json()
      if (data.success) setPartHistory(data.data)
    } catch (_) {}
    setHistoryLoading(false)
  }

  // GA-01: PATCH the component's editable fields
  const handleEditPart = async (partItem) => {
    setEditing(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/vehicles/${bike.id}/components/${partItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: editBrand || null,
          model: editModel || null,
          component_type: editName || undefined,
          replacement_threshold: editThreshold !== '' ? editThreshold : null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Update failed')
      setEditDone(true)
      if (refreshBike) await refreshBike()
      setTimeout(() => { setShowEdit(false); setEditDone(false) }, 1200)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditing(false)
    }
  }

  const handleQuickReset = async (partItem) => {
    setResetting(true)
    setResetError(null)
    try {
      // Upload image first if one was picked (same deferred-upload pattern as AddLog)
      let committedImageUrl = undefined
      if (resetImageFile) {
        setUploadingResetImage(true)
        const formData = new FormData()
        formData.append('image', resetImageFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const upData = await upRes.json()
        setUploadingResetImage(false)
        if (!upData.success) throw new Error(upData.error || 'Image upload failed')
        committedImageUrl = upData.imageUrl
      }

      const res = await fetch(`/api/vehicles/${bike.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Replaced ${partItem.label}`,
          logType: 'service',
          date: resetDate,
          imageUrl: committedImageUrl,
          cost: resetCost !== '' ? Number(resetCost) : undefined,
          // GA-03: Backend fetches live vehicle odometer atomically.
          updatedComponents: [{
            id: partItem.id,
            brand: resetBrand || null,
            model: resetModel || null,
            ...(resetNewThreshold !== '' ? { newThreshold: Number(resetNewThreshold) } : {}),
          }],
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Reset failed')
      setResetDone(true)
      if (refreshBike) await refreshBike()
      setTimeout(() => {
        setOpenPart(null)
        setOpenCat(null)
        setShowReset(false)
        setResetDone(false)
      }, 1200)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetting(false)
      setUploadingResetImage(false)
    }
  }

  // GA-05: totalHealth only averages wearable (tracked) parts
  const totalHealth = wearableItems.length
    ? Math.round(wearableItems.reduce((s, i) => s + i.percent, 0) / wearableItems.length)
    : 100

  const { label: sLabel, color: sColor } = statusMeta(totalHealth)

  /* Gauge math */
  const R = 78
  const SW = 10
  const circ = 2 * Math.PI * R
  const off = circ - (totalHealth / 100) * circ

  /* Group items by category */
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

        {/* ── Upgrades & Accessories Card ── */}
        {groups['Accessory'] && groups['Accessory'].parts.length > 0 && (
          <div style={{ padding: '16px 16px 0' }}>
            <button
              onClick={() => setOpenAccessories(true)}
              style={{
                background: `color-mix(in srgb, ${CAT_COLORS.Electronics} 8%, ${CARD})`,
                border: `1px solid color-mix(in srgb, ${CAT_COLORS.Electronics} 25%, ${BORDER})`,
                borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `color-mix(in srgb, ${CAT_COLORS.Electronics} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: CAT_COLORS.Electronics }}>star</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT1, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block' }}>Upgrades & Accessories</span>
                    <span style={{ fontSize: '9px', color: DIM }}>{groups['Accessory'].parts.length} permanent additions</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: LIME, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${bike.totalInvestment?.toLocaleString() || '0'}
                  </span>
                  <span style={{ fontSize: '9px', color: DIM }}>Total Invested</span>
                </div>
              </div>
            </button>
          </div>
        )}


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
            <div onClick={() => { setOpenCat(null); setOpenPart(null) }} style={{
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
                  <p style={{ fontSize: '10px', color: DIM }}>{parts.length} parts — tap any to inspect</p>
                </div>
                <button onClick={() => { setOpenCat(null); setOpenPart(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
                </button>
              </div>
              <div style={{ height: '1px', background: BORDER, margin: '0 20px' }} />
              <div style={{ overflowY: 'auto', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parts.map(item => {
                  const fc = healthColor(item.percent)
                  const kmLeft = item.threshold ? Math.max(0, Math.round((item.percent / 100) * item.threshold)) : null
                  return (
                    <button key={item.id} onClick={() => openPartDetail(item)} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      background: 'var(--ds-bg)', width: '100%', textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${item.percent < 40 ? 'rgba(239,68,68,0.30)' : item.percent < 70 ? 'rgba(245,158,11,0.22)' : BORDER}`,
                      transition: 'border-color 0.15s',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `color-mix(in srgb, ${catColor} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${catColor} 22%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: catColor }}>{compIcon(item.label)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: TEXT1 }}>{item.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: fc, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginLeft: '8px' }}>{item.percent}%</span>
                        </div>
                        <SegmentedBar percent={item.percent} color={fc} />
                        <span style={{ fontSize: '10px', color: DIM, display: 'block', marginTop: '4px' }}>
                          {kmLeft !== null ? `~${kmLeft.toLocaleString()} km left` : `Last: ${item.lastDate || '—'}`}
                        </span>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: DIM, flexShrink: 0 }}>chevron_right</span>
                    </button>
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

      {/* ── Part Detail Bottom-Sheet ── */}
      {openPart && (() => {
        const item = openPart
        const fc = healthColor(item.percent)
        const catColor = CAT_COLORS[item.category] || LIME
        const kmUsed = item.threshold ? Math.round(((100 - item.percent) / 100) * item.threshold) : null
        const kmLeft = item.threshold ? Math.max(0, Math.round((item.percent / 100) * item.threshold)) : null
        const urgency = item.percent < 40 ? 'Replace Soon' : item.percent < 70 ? 'Monitor' : 'Good'
        const uColor = item.percent < 40 ? CRIT : item.percent < 70 ? WARN : GOOD
        const stats = [
          { icon: 'label', lab: 'Brand', val: item.brand || '—' },
          { icon: 'tag', lab: 'Model', val: item.model || '—' },
          { icon: 'speed', lab: 'Installed At', val: item.installOdo != null ? `${Number(item.installOdo).toLocaleString()} km` : '—' },
          { icon: 'swap_calls', lab: 'Replace Every', val: item.threshold ? `${Number(item.threshold).toLocaleString()} km` : '—' },
          { icon: 'calendar_today', lab: 'Last Service', val: item.lastDate || '—' },
          { icon: 'health_and_safety', lab: 'Health', val: `${item.percent}%` },
        ]
        return (
          <>
            <div onClick={() => setOpenPart(null)} style={{ position: 'fixed', inset: 0, zIndex: 102, background: 'rgba(0,0,0,0.35)', animation: 'bsFadeIn 0.15s ease' }} />
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 103,
              background: 'var(--ds-surface)', borderRadius: '20px 20px 0 0',
              border: `1px solid ${BORDER}`, borderBottom: 'none',
              maxHeight: '85dvh', display: 'flex', flexDirection: 'column',
              animation: 'bsSlideUp 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
              </div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px 8px' }}>
                <button onClick={() => setOpenPart(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, display: 'flex', padding: '4px', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  background: `color-mix(in srgb, ${catColor} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${catColor} 28%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: catColor }}>{compIcon(item.label)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: DIM, marginTop: '1px' }}>{item.category}</div>
                </div>
                <div style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: '999px',
                  background: `color-mix(in srgb, ${uColor} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${uColor} 30%, transparent)`,
                  fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', color: uColor, textTransform: 'uppercase',
                }}>{urgency}</div>
              </div>
              <div style={{ height: '1px', background: BORDER, margin: '0 20px' }} />
              {/* Body */}
              <div style={{ overflowY: 'auto', padding: '20px 20px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Gauge + bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '90px', flexShrink: 0 }}><ArcGauge percent={item.percent} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: DIM, marginBottom: '8px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lifeline Health</div>
                    <SegmentedBar percent={item.percent} color={fc} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      {kmUsed != null && <span style={{ fontSize: '10px', color: DIM }}>{kmUsed.toLocaleString()} km used</span>}
                      {kmLeft != null && <span style={{ fontSize: '10px', color: fc, fontWeight: 700 }}>{kmLeft.toLocaleString()} km left</span>}
                    </div>
                  </div>
                </div>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {stats.map(({ icon, lab, val }) => (
                    <div key={lab} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--ds-bg)', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px', color: DIM }}>{icon}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM }}>{lab}</span>
                      </div>
                      <span style={{
                        fontSize: lab === 'Health' ? '16px' : '13px', fontWeight: 700,
                        color: lab === 'Health' ? fc : TEXT1,
                        fontFamily: ['Installed At','Replace Every','Health'].includes(lab) ? "'JetBrains Mono', monospace" : 'inherit',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{val}</span>
                    </div>
                  ))}
                </div>
                {/* Tip */}
                {item.percent < 70 && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '12px',
                    background: `color-mix(in srgb, ${uColor} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${uColor} 20%, transparent)`,
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: uColor, flexShrink: 0 }}>
                      {item.percent < 40 ? 'warning' : 'schedule'}
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: uColor, marginBottom: '2px' }}>
                        {item.percent < 40 ? 'Replacement recommended' : 'Schedule service soon'}
                      </div>
                      <div style={{ fontSize: '11px', color: DIM, lineHeight: 1.5 }}>
                        {item.percent < 40
                          ? `This part is at ${item.percent}% — continued use risks damage.`
                          : `At ${item.percent}% life. Plan service within ${kmLeft != null ? `${kmLeft.toLocaleString()} km` : 'the next window'}.`}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Quick Reset Lifeline ── */}
                {!resetDone && (
                  <div>
                    {!showReset ? (
                      <button
                        onClick={() => setShowReset(true)}
                        style={{
                          width: '100%', padding: '14px', borderRadius: '12px',
                          border: `1px solid ${CYAN}30`, background: `color-mix(in srgb, ${CYAN} 6%, transparent)`,
                          color: CYAN, fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em',
                          textTransform: 'uppercase', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>autorenew</span>
                        Reset Lifeline — Mark as Replaced
                      </button>
                    ) : (
                      <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'var(--ds-bg)', border: `1px solid ${CYAN}25`,
                        display: 'flex', flexDirection: 'column', gap: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: CYAN }}>autorenew</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: CYAN }}>Quick Reset</span>
                        </div>
                        <p style={{ fontSize: '11px', color: DIM, lineHeight: 1.5 }}>
                          This will reset <b style={{ color: TEXT1 }}>{item.label}</b> to 100% at the current odometer ({bike.odometer.toLocaleString()} km) and log a service record on the selected date.
                        </p>
                        <input
                          type="date" value={resetDate}
                          onChange={e => setResetDate(e.target.value)}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
                            background: 'var(--ds-surface)', border: `1px solid ${BORDER}`,
                            color: TEXT1, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                            colorScheme: 'dark',
                          }}
                        />
                        <div style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                            fontSize: '12px', color: DIM, fontWeight: 600, pointerEvents: 'none',
                          }}>₱</span>
                          <input
                            type="number" min="0" step="0.01"
                            placeholder="Amount spent (optional)"
                            value={resetCost}
                            onChange={e => setResetCost(e.target.value)}
                            style={{
                              width: '100%', padding: '10px 12px 10px 26px', borderRadius: '8px', fontSize: '12px',
                              background: 'var(--ds-surface)', border: `1px solid ${BORDER}`,
                              color: TEXT1, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowBarcodeScanner(true)}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            border: `1px solid ${CYAN}30`, background: `color-mix(in srgb, ${CYAN} 5%, transparent)`,
                            color: CYAN, fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>barcode_scanner</span>
                          Scan Part Barcode — auto-fill brand &amp; model
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text" placeholder="Brand" value={resetBrand}
                            onChange={e => setResetBrand(e.target.value)}
                            style={{
                              flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
                              background: 'var(--ds-surface)', border: `1px solid ${BORDER}`,
                              color: TEXT1, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                            }}
                          />
                          <input
                            type="text" placeholder="Model" value={resetModel}
                            onChange={e => setResetModel(e.target.value)}
                            style={{
                              flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
                              background: 'var(--ds-surface)', border: `1px solid ${BORDER}`,
                              color: TEXT1, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                            }}
                          />
                        </div>
                        {/* Upgrade threshold — shown when part has a threshold (wearable) */}
                        {item.threshold != null && (
                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              placeholder={`New Lifespan — leave blank to keep current (${item.threshold?.toLocaleString()} km)`}
                              value={resetNewThreshold}
                              onChange={e => setResetNewThreshold(e.target.value)}
                              style={{
                                width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
                                background: 'var(--ds-surface)', border: `1px solid ${BORDER}`,
                                color: TEXT1, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                                boxSizing: 'border-box',
                              }}
                            />
                            {resetNewThreshold !== '' && (
                              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', fontWeight: 700, color: LIME }}>NEW</span>
                            )}
                          </div>
                        )}
                        {/* ── Photo evidence picker ── */}
                        <input
                          id="reset-image-input"
                          type="file" accept="image/*" capture="environment"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0]
                            if (!file) return
                            if (!file.type.startsWith('image/')) { setResetError('Please select an image file.'); return }
                            if (file.size > 5 * 1024 * 1024) { setResetError('Image must be under 5 MB.'); return }
                            if (resetImagePreview) URL.revokeObjectURL(resetImagePreview)
                            setResetImageFile(file)
                            setResetImagePreview(URL.createObjectURL(file))
                            setResetError(null)
                          }}
                        />
                        {!resetImagePreview ? (
                          <button
                            type="button"
                            onClick={() => document.getElementById('reset-image-input').click()}
                            style={{
                              width: '100%', padding: '11px 14px', borderRadius: '10px',
                              border: `1px dashed ${BORDER}`, background: 'transparent',
                              color: DIM, fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_photo_alternate</span>
                            Attach photo / receipt (optional)
                          </button>
                        ) : (
                          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                            <img src={resetImagePreview} alt="preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} />
                            <button
                              type="button"
                              onClick={() => { URL.revokeObjectURL(resetImagePreview); setResetImageFile(null); setResetImagePreview(null) }}
                              style={{
                                position: 'absolute', top: '8px', right: '8px',
                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                width: '28px', height: '28px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>close</span>
                            </button>
                            <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '9px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '2px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                              PHOTO READY
                            </div>
                          </div>
                        )}
                        {resetError && (
                          <div style={{ padding: '8px 12px', borderRadius: '8px', background: `${CRIT}12`, border: `1px solid ${CRIT}30`, fontSize: '11px', color: CRIT }}>
                            {resetError}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setShowReset(false)}
                            style={{
                              flex: 1, padding: '11px', borderRadius: '10px',
                              border: `1px solid ${BORDER}`, background: 'transparent',
                              color: DIM, fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            }}
                          >CANCEL</button>
                          <button
                            onClick={() => handleQuickReset(item)}
                            disabled={resetting || uploadingResetImage}
                            style={{
                              flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
                              background: (resetting || uploadingResetImage) ? 'var(--ds-surface-active)' : LIME,
                              color: (resetting || uploadingResetImage) ? DIM : '#000',
                              fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
                              textTransform: 'uppercase', cursor: (resetting || uploadingResetImage) ? 'wait' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              transition: 'all 0.2s',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              {uploadingResetImage ? 'cloud_upload' : resetting ? 'hourglass_empty' : 'check_circle'}
                            </span>
                            {uploadingResetImage ? 'Uploading photo...' : resetting ? 'Resetting...' : 'Confirm Reset'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {resetDone && (
                  <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: `color-mix(in srgb, ${GOOD} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${GOOD} 30%, transparent)`,
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: GOOD }}>check_circle</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: GOOD }}>Lifeline Reset!</div>
                      <div style={{ fontSize: '11px', color: DIM, marginTop: '2px' }}>{item.label} is back at 100%{resetNewThreshold !== '' ? ` · Lifespan → ${Number(resetNewThreshold).toLocaleString()} km` : ''}</div>
                    </div>
                  </div>
                )}

                {/* ── GA-01: Edit Part ── */}
                <div style={{ height: '1px', background: BORDER }} />
                {!showEdit ? (
                  <button onClick={() => setShowEdit(true)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: 'var(--ds-bg)', color: TEXT2, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    Edit Part Details
                  </button>
                ) : (
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--ds-bg)', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '15px', color: LIME }}>edit</span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: LIME, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Edit Part</span>
                      </div>
                      <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                    </div>
                    <input type="text" placeholder="Part Name" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--ds-surface)', border: `1px solid ${BORDER}`, color: TEXT1, outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Brand" value={editBrand} onChange={e => setEditBrand(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--ds-surface)', border: `1px solid ${BORDER}`, color: TEXT1, outline: 'none' }} />
                      <input type="text" placeholder="Model" value={editModel} onChange={e => setEditModel(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--ds-surface)', border: `1px solid ${BORDER}`, color: TEXT1, outline: 'none' }} />
                    </div>
                    <input type="number" placeholder="Replacement Threshold (km) — blank = permanent" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--ds-surface)', border: `1px solid ${BORDER}`, color: TEXT1, outline: 'none', boxSizing: 'border-box' }} />
                    {editError && <div style={{ padding: '8px 12px', borderRadius: '8px', background: `${CRIT}12`, border: `1px solid ${CRIT}30`, fontSize: '11px', color: CRIT }}>{editError}</div>}
                    {editDone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: `${GOOD}12`, border: `1px solid ${GOOD}30` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: GOOD }}>check_circle</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: GOOD }}>Part updated!</span>
                      </div>
                    ) : (
                      <button onClick={() => handleEditPart(item)} disabled={editing} style={{ padding: '11px', borderRadius: '10px', border: 'none', background: editing ? 'var(--ds-surface-active)' : LIME, color: editing ? DIM : '#000', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: editing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{editing ? 'hourglass_empty' : 'save'}</span>
                        {editing ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── GA-08: Service History ── */}
                {(historyLoading || partHistory.length > 0) && (
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>Service History</div>
                    {historyLoading ? (
                      <div style={{ fontSize: '11px', color: DIM }}>Loading…</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {partHistory.map((h, i) => (
                          <div key={h.id} style={{ display: 'flex', gap: '12px', paddingBottom: i < partHistory.length - 1 ? '14px' : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', marginTop: '3px', background: LIME }} />
                              {i < partHistory.length - 1 && <div style={{ width: '1px', flex: 1, background: BORDER, marginTop: '4px' }} />}
                            </div>
                            <div style={{ flex: 1, paddingBottom: i < partHistory.length - 1 ? '4px' : 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT1 }}>{h.log_title || 'Service'}</span>
                                <span style={{ fontSize: '9px', color: DIM, marginLeft: '8px', flexShrink: 0 }}>
                                  {h.service_date ? new Date(h.service_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </span>
                              </div>
                              <div style={{ fontSize: '10px', color: DIM, marginTop: '2px' }}>
                                {h.odometer_at_service != null ? `${Number(h.odometer_at_service).toLocaleString()} km` : ''}
                                {h.brand_at_service ? ` · ${h.brand_at_service}${h.model_at_service ? ' ' + h.model_at_service : ''}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </>
        )
      })()}

      {/* ── Accessories Bottom-Sheet Modal ── */}
      {openAccessories && groups['Accessory'] && (() => {
        const parts = groups['Accessory'].parts
        return (
          <>
            <div onClick={() => setOpenAccessories(false)} style={{
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
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `color-mix(in srgb, ${CAT_COLORS.Electronics} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: CAT_COLORS.Electronics }}>star</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Accessories</div>
                  <p style={{ fontSize: '10px', color: DIM }}>{parts.length} permanent upgrades</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: LIME, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${bike.totalInvestment?.toLocaleString() || '0'}
                  </span>
                  <span style={{ fontSize: '9px', color: DIM }}>Total</span>
                </div>
                <button onClick={() => setOpenAccessories(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
                </button>
              </div>
              <div style={{ height: '1px', background: BORDER, margin: '0 20px' }} />
              <div style={{ overflowY: 'auto', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parts.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '12px',
                    background: 'var(--ds-bg)', width: '100%', textAlign: 'left',
                    border: `1px solid ${BORDER}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT1, marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: DIM }}>{item.brand || 'No Brand'} {item.model ? `· ${item.model}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '10px', color: DIM, marginBottom: '2px' }}>Installed</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT1, fontFamily: "'JetBrains Mono', monospace" }}>{item.lastDate || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      })()}

      {/* ── Barcode Scanner Modal ── */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onDetected={({ brand, model }) => {
            if (brand) setResetBrand(brand)
            if (model) setResetModel(model)
            setShowBarcodeScanner(false)
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

    </div>
  )
}
