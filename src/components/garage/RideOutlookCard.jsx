import { useState, useEffect } from 'react'

const WMO_CONDITIONS = {
  0:  { label: 'Clear skies',         icon: 'light_mode',        rideScore: 5 },
  1:  { label: 'Mainly clear',        icon: 'light_mode',        rideScore: 5 },
  2:  { label: 'Partly cloudy',       icon: 'partly_cloudy_day', rideScore: 4 },
  3:  { label: 'Overcast',            icon: 'cloud',             rideScore: 3 },
  45: { label: 'Foggy',               icon: 'foggy',             rideScore: 1 },
  48: { label: 'Icy fog',             icon: 'foggy',             rideScore: 1 },
  51: { label: 'Light drizzle',       icon: 'rainy',             rideScore: 2 },
  53: { label: 'Drizzle',             icon: 'rainy',             rideScore: 2 },
  55: { label: 'Heavy drizzle',       icon: 'rainy',             rideScore: 1 },
  61: { label: 'Light rain',          icon: 'rainy',             rideScore: 2 },
  63: { label: 'Rain',                icon: 'rainy',             rideScore: 1 },
  65: { label: 'Heavy rain',          icon: 'thunderstorm',      rideScore: 0 },
  71: { label: 'Light snow',          icon: 'snowing',           rideScore: 0 },
  80: { label: 'Rain showers',        icon: 'rainy',             rideScore: 1 },
  82: { label: 'Violent showers',     icon: 'thunderstorm',      rideScore: 0 },
  95: { label: 'Thunderstorm',        icon: 'thunderstorm',      rideScore: 0 },
  99: { label: 'Thunderstorm + hail', icon: 'thunderstorm',      rideScore: 0 },
}

function buildRiderAdvisory(temp, humidity, windspeed, rideScore, conditionLabel) {
  const tempF = Math.round(temp * 9/5 + 32)
  const parts = []
  if (rideScore === 0) {
    parts.push(`Stay parked — ${conditionLabel.toLowerCase()} conditions are unsafe for riding.`)
  } else if (rideScore >= 4) {
    if (tempF > 90) parts.push(`${conditionLabel}. ${tempF}°F — ventilated gear recommended.`)
    else if (tempF < 50) parts.push(`${conditionLabel}. ${tempF}°F — layer up, gloves are a must.`)
    else parts.push(`${conditionLabel}. ${tempF}°F — great day to ride.`)
  } else if (rideScore === 3) {
    parts.push(`${conditionLabel}. ${tempF}°F — decent day, stay alert.`)
  } else {
    parts.push(`${conditionLabel}. ${tempF}°F — ride cautiously or wait it out.`)
  }
  if (windspeed > 40) parts.push(`Strong crosswinds at ${Math.round(windspeed)} km/h.`)
  if (humidity > 85 && rideScore > 1) parts.push(`High humidity — visor may fog.`)
  return parts.join(' ')
}

const SCORE_CONFIG = {
  5: { label: 'Perfect Day to Ride',    color: 'var(--ds-green)', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.18)'  },
  4: { label: 'Good Riding Conditions', color: 'var(--ds-green)', bg: 'rgba(34,197,94,0.05)',  border: 'rgba(34,197,94,0.14)'  },
  3: { label: 'Rideable — Stay Alert',  color: 'var(--ds-primary)', bg: 'var(--ds-primary-subtle)', border: 'var(--ds-primary-glow)' },
  2: { label: 'Marginal Conditions',    color: 'var(--ds-red)',   bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.18)'  },
  1: { label: 'Not Recommended',        color: 'var(--ds-red)',   bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)'  },
  0: { label: 'Stay Parked',            color: 'var(--ds-red)',   bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.28)'  },
}

// Derive a rider-friendly traffic summary
function buildTrafficSummary(traffic) {
  if (!traffic) return null
  const { incidents, flow } = traffic
  const count = incidents?.length ?? 0
  const congestion = flow?.congestionRatio ?? 0

  // Helper: get the best location string from an incident
  const locationOf = (inc) => {
    if (inc.from && inc.to) return `${inc.from} → ${inc.to}`
    if (inc.from) return inc.from
    if (inc.roadNumbers) return `Road ${inc.roadNumbers}`
    return 'nearby'
  }

  const top = incidents?.[0]

  if (count === 0 && congestion < 20) {
    return { label: 'Traffic Clear', detail: 'Roads are flowing freely near you.', color: 'var(--ds-green)', icon: 'check_circle' }
  }
  if (count === 0 && congestion < 50) {
    return { label: 'Light Traffic', detail: `Roads around ${congestion}% congested — expect minor slowdowns.`, color: 'var(--ds-primary)', icon: 'traffic' }
  }
  if (count === 1 && top) {
    return { label: '1 Significant Incident', detail: `${top.description} at ${locationOf(top)}.`, color: 'var(--ds-red)', icon: 'warning' }
  }
  if (count > 1 && top) {
    return {
      label: `${count} Significant Incidents`,
      detail: `Worst: ${top.description} at ${locationOf(top)}. Ride defensively.`,
      color: 'var(--ds-red)', icon: 'warning'
    }
  }
  // Congested but no filtered incidents (all were minor)
  return { label: 'Moderate Traffic', detail: `Roads ${congestion}% congested. Allow extra time.`, color: 'var(--ds-primary)', icon: 'traffic' }
}

export default function RideOutlookCard() {
  const [weather, setWeather] = useState(null)
  const [traffic, setTraffic] = useState(null)
  const [location, setLocation] = useState(null) // city name
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`
      const res  = await fetch(url)
      const data = await res.json()
      const c    = data.current
      const cond = WMO_CONDITIONS[c.weather_code] ?? { label: 'Unknown', icon: 'device_thermostat', rideScore: 3 }
      setWeather({
        temp: c.temperature_2m, humidity: c.relative_humidity_2m,
        windspeed: c.wind_speed_10m, windDir: c.wind_direction_10m,
        code: c.weather_code, ...cond,
        advisory: buildRiderAdvisory(c.temperature_2m, c.relative_humidity_2m, c.wind_speed_10m, cond.rideScore, cond.label),
      })
    }

    const fetchLocation = async (lat, lon) => {
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'Accept-Language': 'en' }
        })
        const data = await res.json()
        const addr = data.address
        // Use city, town, or village — whichever is available
        const city = addr.city || addr.town || addr.village || addr.county || addr.state
        const country = addr.country_code?.toUpperCase()
        if (city) setLocation(country ? `${city}, ${country}` : city)
      } catch { /* non-critical */ }
    }

    const fetchTraffic = async (lat, lon) => {
      try {
        const res  = await fetch(`/api/traffic?lat=${lat}&lon=${lon}`)
        const data = await res.json()
        if (data.success) setTraffic(data.data)
      } catch { /* non-critical */ }
    }

    const withLocation = async (lat, lon) => {
      await Promise.all([fetchWeather(lat, lon), fetchTraffic(lat, lon), fetchLocation(lat, lon)])
    }

    const tryIpFallback = async () => {
      // Try multiple free IP geo providers in sequence
      const providers = [
        async () => {
          const r = await fetch('https://freeipapi.com/api/json')
          const d = await r.json()
          if (!d.latitude) throw new Error('freeipapi failed')
          return { lat: d.latitude, lon: d.longitude }
        },
        async () => {
          const r = await fetch('https://get.geojs.io/v1/ip/geo.json')
          const d = await r.json()
          if (!d.latitude) throw new Error('geojs failed')
          return { lat: parseFloat(d.latitude), lon: parseFloat(d.longitude) }
        },
        async () => {
          const r = await fetch('https://ipapi.co/json/')
          const d = await r.json()
          if (!d.latitude) throw new Error('ipapi failed')
          return { lat: d.latitude, lon: d.longitude }
        },
      ]

      for (const provider of providers) {
        try {
          const { lat, lon } = await provider()
          await withLocation(lat, lon)
          return
        } catch (e) {
          console.warn('IP geo provider failed, trying next:', e.message)
        }
      }
      throw new Error('All IP geo providers failed')
    }

    const run = async () => {
      try {
        if (!navigator.geolocation) { await tryIpFallback(); return }
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
              try { await withLocation(coords.latitude, coords.longitude); resolve() }
              catch (e) { reject(e) }
            },
            reject,
            { timeout: 5000 }
          )
        })
      } catch {
        try { await tryIpFallback() }
        catch { setError('Weather unavailable') }
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const tempF        = weather ? Math.round(weather.temp * 9/5 + 32) : null
  const cfg          = weather ? (SCORE_CONFIG[weather.rideScore] ?? SCORE_CONFIG[3]) : null
  const trafficInfo  = buildTrafficSummary(traffic)

  // ── Loading ──
  if (loading) return (
    <div style={{ background: 'var(--ds-surface)', border: '1px solid var(--ds-border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--ds-surface-active)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--ds-text-muted)', animation: 'spin 1.2s linear infinite' }}>autorenew</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: '9px', width: '100px', background: 'var(--ds-surface-active)', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '12px', width: '220px', background: 'var(--ds-surface-active)', borderRadius: '4px' }} />
      </div>
    </div>
  )

  // ── Error ──
  if (error || !weather) return (
    <div style={{ background: 'var(--ds-surface)', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '3px solid var(--ds-red)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--ds-red)' }}>cloud_off</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-red)', marginBottom: '4px', fontFamily: "'DM Sans'" }}>Ride Outlook</p>
        <p style={{ fontSize: '13px', color: 'var(--ds-text-secondary)', lineHeight: 1.5, marginBottom: '8px', fontFamily: "'DM Sans'" }}>
          Could not load weather data. Check your internet connection.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ds-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans'" }}
        >
          RETRY →
        </button>
      </div>
    </div>
  )

  // ── Live Card ──
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: '12px', overflow: 'hidden' }}>

      {/* ── Top: Weather ── */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-surface)', border: `1px solid ${cfg.border}` }}>
          <span className="material-symbols-filled" style={{ fontSize: '24px', color: cfg.color }}>{weather.icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: cfg.color, fontFamily: "'DM Sans'" }}>Ride Outlook</p>
            {location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--ds-text-muted)' }}>location_on</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'" }}>{location}</span>
              </div>
            )}
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ds-text-primary)', marginBottom: '4px', fontFamily: "'DM Sans'" }}>{cfg.label}</p>
          <p style={{ fontSize: '12px', color: 'var(--ds-text-secondary)', lineHeight: 1.55, fontFamily: "'DM Sans'" }}>{weather.advisory}</p>
        </div>
      </div>

      {/* ── Weather Stats Strip ── */}
      <div style={{ display: 'flex', borderTop: `1px solid ${cfg.border}`, background: 'rgba(0,0,0,0.04)' }}>
        {[
          { icon: 'device_thermostat', label: 'TEMP',     value: `${tempF}°F` },
          { icon: 'water_drop',        label: 'HUMIDITY', value: `${weather.humidity}%` },
          { icon: 'air',               label: 'WIND',     value: `${Math.round(weather.windspeed)} km/h` },
        ].map((stat, i, arr) => (
          <div key={stat.label} style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderRight: i < arr.length - 1 ? `1px solid ${cfg.border}` : 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: cfg.color }}>{stat.icon}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--ds-text-primary)', lineHeight: 1 }}>{stat.value}</span>
            <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--ds-text-muted)', fontFamily: "'DM Sans'" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Traffic Alert Strip ── */}
      {trafficInfo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderTop: `1px solid ${cfg.border}`, background: 'rgba(0,0,0,0.06)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: trafficInfo.color, flexShrink: 0 }}>{trafficInfo.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: trafficInfo.color, marginRight: '8px', fontFamily: "'DM Sans'" }}>{trafficInfo.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans'" }}>{trafficInfo.detail}</span>
          </div>
        </div>
      )}
    </div>
  )
}
