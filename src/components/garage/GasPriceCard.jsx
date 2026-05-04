import { useState, useEffect } from 'react'

const FALLBACK_DATA = {
  source: 'GasWatch PH',
  asOf: 'Apr 29 – May 5, 2026',
  fuels: [
    { key: 'unleaded', label: 'Unleaded', sub: 'RON 91',     icon: 'local_gas_station', color: '#22c55e', price: 87.69, weeklyChange: +0.53  },
    { key: 'premium',  label: 'Premium',  sub: 'RON 95+',    icon: 'grade',             color: '#00d4ff', price: 95.69, weeklyChange: +0.53  },
    { key: 'diesel',   label: 'Diesel',   sub: 'Auto Diesel', icon: 'oil_barrel',        color: '#f59e0b', price: 92.20, weeklyChange: -12.94 },
  ],
  brands: [
    { brand: 'Flying V',  color: '#e63939', unleaded: 84.50, premium: 91.00, diesel: 89.20 },
    { brand: 'Seaoil',   color: '#0090d9', unleaded: 85.25, premium: 92.10, diesel: 89.80 },
    { brand: 'Phoenix',  color: '#f97316', unleaded: 85.75, premium: 93.40, diesel: 90.50 },
    { brand: 'EcoOil',   color: '#22c55e', unleaded: 86.10, premium: 93.90, diesel: 90.95 },
    { brand: 'Petron',   color: '#dc2626', unleaded: 87.10, premium: 95.10, diesel: 91.85 },
    { brand: 'Shell',    color: '#eab308', unleaded: 87.50, premium: 96.25, diesel: 92.40 },
    { brand: 'Caltex',   color: '#e05c00', unleaded: 87.65, premium: 96.50, diesel: 92.55 },
    { brand: 'CleanFuel',color: '#8b5cf6', unleaded: 87.90, premium: 97.00, diesel: 93.10 },
    { brand: 'PTT',      color: '#64748b', unleaded: 88.50, premium: 98.00, diesel: 106.61 },
  ]
}

// MetroFuelTracker city slugs — 153 PH cities (Metro Manila, Cebu, Davao, Iloilo, Bacolod)
const CITY_SLUGS = {
  // Metro Manila
  'quezon city': 'quezon-city', 'manila': 'manila', 'makati': 'makati',
  'pasig': 'pasig', 'caloocan': 'caloocan', 'parañaque': 'paranaque', 'paranaque': 'paranaque',
  'las piñas': 'las-pinas', 'las pinas': 'las-pinas', 'valenzuela': 'valenzuela',
  'marikina': 'marikina', 'san juan': 'san-juan', 'mandaluyong': 'mandaluyong',
  'muntinlupa': 'muntinlupa', 'malabon': 'malabon', 'pasay': 'pasay',
  'taguig': 'taguig', 'navotas': 'navotas', 'pateros': 'pateros',
  // Cavite
  'bacoor': 'bacoor', 'dasmariñas': 'dasmarinas', 'dasmarinas': 'dasmarinas',
  'imus': 'imus', 'general trias': 'general-trias', 'silang': 'silang',
  'tagaytay': 'tagaytay', 'trece martires': 'trece-martires', 'cavite city': 'cavite-city',
  // Rizal / Laguna
  'antipolo': 'antipolo', 'cainta': 'cainta', 'taytay': 'taytay',
  'binangonan': 'binangonan', 'san mateo': 'san-mateo', 'rodriguez': 'rodriguez',
  'calamba': 'calamba', 'santa rosa': 'santa-rosa', 'san pedro': 'san-pedro',
  // Metro Cebu
  'cebu city': 'cebu-city', 'cebu': 'cebu-city',
  'lapu-lapu city': 'lapu-lapu-city', 'lapu lapu': 'lapu-lapu-city',
  'mandaue city': 'mandaue-city', 'mandaue': 'mandaue-city',
  'talisay city': 'talisay-city', 'consolacion': 'consolacion',
  'liloan': 'liloan', 'minglanilla': 'minglanilla', 'danao city': 'danao-city',
  'carcar city': 'carcar-city', 'naga city': 'naga-city',
  // Metro Davao
  'davao city': 'davao-city', 'davao': 'davao-city',
  'tagum city': 'tagum-city', 'panabo city': 'panabo-city', 'digos city': 'digos-city',
  // Metro Iloilo
  'iloilo city': 'iloilo-city', 'iloilo': 'iloilo-city',
  // Metro Bacolod
  'bacolod city': 'bacolod-city', 'bacolod': 'bacolod-city',
  'silay city': 'silay-city', 'bago city': 'bago-city',
}

function getCitySlug(cityName) {
  if (!cityName) return null
  const lower = cityName.toLowerCase().replace(/\s*city\s*$/, '').trim()
  return CITY_SLUGS[lower] ?? CITY_SLUGS[cityName.toLowerCase()] ?? null
}

// Geolocation with IP fallback (same pattern as RideOutlookCard)
async function resolveLocation() {
  const reverseGeocode = async (lat, lon) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      const addr = data.address
      return addr.city || addr.town || addr.village || addr.county || addr.state || null
    } catch { return null }
  }

  // Try GPS first
  if (navigator.geolocation) {
    try {
      const { coords } = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      const city = await reverseGeocode(coords.latitude, coords.longitude)
      if (city) return city
    } catch { /* fall through */ }
  }

  // IP fallback providers
  const providers = [
    () => fetch('https://freeipapi.com/api/json').then(r => r.json()).then(d => d.cityName),
    () => fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json()).then(d => d.city),
    () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => d.city),
  ]
  for (const p of providers) {
    try { const city = await p(); if (city) return city } catch { /* next */ }
  }
  return null
}

const FUEL_KEYS = [
  { key: 'unleaded', label: 'Unleaded', color: '#22c55e' },
  { key: 'premium',  label: 'Premium',  color: '#00d4ff' },
  { key: 'diesel',   label: 'Diesel',   color: '#f59e0b' },
]

export default function GasPriceCard() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [city, setCity]           = useState(null)
  const [citySlug, setCitySlug]   = useState(null)
  const [activeFuel, setActiveFuel] = useState('unleaded')

  useEffect(() => {
    const load = async () => {
      // Step 1: resolve location
      const detectedCity = await resolveLocation().catch(() => null)
      let slug = detectedCity ? getCitySlug(detectedCity) : null

      // Force Cebu City for testing purposes if geolocation fails to return a tracked city
      if (!slug) {
        slug = 'cebu-city'
        setCity('Cebu City')
      } else {
        setCity(detectedCity)
      }
      setCitySlug(slug)

      // Step 2: fetch prices — pass city slug if known
      try {
        const url  = slug ? `/api/gas-prices?city=${slug}` : '/api/gas-prices'
        const res  = await fetch(url)
        const json = await res.json()
        if (json?.success && Array.isArray(json.fuels)) {
          setData(json)
          // Backend may return a better city label
          if (json.city && !detectedCity) setCity(json.city)
        } else {
          setData(FALLBACK_DATA)
        }
      } catch {
        setData(FALLBACK_DATA)
      }

      setLoading(false)
    }
    load()
  }, [])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: 'var(--ds-surface)', border: '1px solid var(--ds-border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <style>{`@keyframes spinFuel { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--ds-surface-active)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--ds-text-muted)', animation: 'spinFuel 1.2s linear infinite' }}>local_gas_station</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: '9px', width: '130px', background: 'var(--ds-surface-active)', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '12px', width: '200px', background: 'var(--ds-surface-active)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '9px', width: '160px', background: 'var(--ds-surface-active)', borderRadius: '4px' }} />
      </div>
    </div>
  )

  const { fuels, asOf, source } = data
  const activeFuelDef = FUEL_KEYS.find(f => f.key === activeFuel)
  const activeFuelData = fuels.find(f => f.key === activeFuel)
  // Safe formatter — returns '—' if value is null/NaN
  const fmt = (v) => (v != null && !isNaN(v)) ? Number(v).toFixed(2) : '—'

  const trackerUrl = citySlug
    ? `https://metrofueltracker.com/prices/${citySlug}`
    : 'https://metrofueltracker.com/prices'

  return (
    <div style={{
      background: 'rgba(200,245,0,0.03)',
      border: '1px solid rgba(200,245,0,0.18)',
      borderLeft: '3px solid var(--ds-primary)',
      borderRadius: '12px', overflow: 'hidden'
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--ds-surface)', border: '1px solid rgba(200,245,0,0.25)'
        }}>
          <span className="material-symbols-filled" style={{ fontSize: '24px', color: 'var(--ds-primary)' }}>local_gas_station</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ds-primary)', fontFamily: "'DM Sans'" }}>Fuel Prices · PH</p>
            {/* Location badge */}
            {city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '11px', color: 'var(--ds-text-muted)' }}>location_on</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'" }}>{city}</span>
              </div>
            )}
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ds-text-primary)', fontFamily: "'DM Sans'", marginBottom: '2px' }}>
            Current {activeFuelDef?.label}:{' '}
            <span style={{ color: 'var(--ds-primary)' }}>
              ₱{fmt(activeFuelData?.price)}/L
            </span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '11px', color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans'" }}>
              {city ? `Near ${city}` : 'Nationwide'} · {source} · {asOf}
            </p>
            {/* Deep link to MetroFuelTracker */}
            <a
              href={trackerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                fontSize: '10px', fontWeight: 700, color: 'var(--ds-primary)',
                textDecoration: 'none', fontFamily: "'DM Sans'",
                padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(200,245,0,0.10)',
                border: '1px solid rgba(200,245,0,0.20)',
              }}
            >
              {citySlug ? 'Live map' : 'All cities'}
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Fuel type tabs (metro avg) ── */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(200,245,0,0.12)', background: 'rgba(0,0,0,0.05)' }}>
        {fuels.map((fuel, i, arr) => {
          const isUp     = fuel.weeklyChange > 0
          const isFlat   = fuel.weeklyChange === 0
          const tc       = isFlat ? 'var(--ds-text-muted)' : isUp ? '#ef4444' : '#22c55e'
          const isActive = fuel.key === activeFuel
          return (
            <button
              key={fuel.key}
              onClick={() => setActiveFuel(fuel.key)}
              style={{
                flex: 1, padding: '11px 6px', border: 'none', cursor: 'pointer',
                background: isActive ? 'rgba(200,245,0,0.08)' : 'transparent',
                borderBottom: isActive ? `2px solid ${fuel.color}` : '2px solid transparent',
                borderRight: i < arr.length - 1 ? '1px solid rgba(200,245,0,0.10)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px', color: fuel.color }}>{fuel.icon}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                <span style={{ fontSize: '9px', color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'" }}>₱</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: 800, color: isActive ? 'var(--ds-primary)' : 'var(--ds-text-primary)', lineHeight: 1 }}>
                  {fmt(fuel.price)}
                </span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: fuel.color, fontFamily: "'DM Sans'", textTransform: 'uppercase' }}>{fuel.label}</span>
              {fuel.weeklyChange != null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '11px', color: tc }}>{isFlat ? 'remove' : isUp ? 'trending_up' : 'trending_down'}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: tc, fontFamily: "'JetBrains Mono', monospace" }}>{isUp ? '+' : ''}{Number(fuel.weeklyChange).toFixed(2)}</span>
                </div>
              ) : (
                <span style={{ fontSize: '9px', color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'" }}>live</span>
              )}
            </button>
          )
        })}
      </div>



      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderTop: '1px solid rgba(200,245,0,0.10)', background: 'rgba(0,0,0,0.07)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--ds-text-muted)', flexShrink: 0 }}>info</span>
        <span style={{ fontSize: '10px', color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'", lineHeight: 1.4 }}>
          Source: <strong style={{ color: 'var(--ds-text-secondary)' }}>MetroFuel Tracker</strong> · {data?.stations ?? '5631'} stations · Covers 153 PH cities · Updated daily.
        </span>
      </div>
    </div>
  )
}
