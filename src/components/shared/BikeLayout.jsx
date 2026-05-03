import { Outlet, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BikeNavBar from './BikeNavBar'

/* ── Skeleton Screen — mirrors VehicleDetail layout ── */
function SkeletonScreen() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ds-bg)', overflow: 'hidden' }}>
      {/* App bar skeleton */}
      <div style={{
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: '1px solid var(--ds-glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="skeleton-item" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton-item" style={{ width: 120, height: 14 }} />
        <div className="skeleton-item" style={{ width: 32, height: 32, borderRadius: '50%' }} />
      </div>

      {/* Hero image skeleton */}
      <div className="skeleton-item" style={{ height: 220, borderRadius: 0, animationDelay: '0.05s' }} />

      <div style={{ padding: '16px 16px 0' }}>
        {/* Odometer skeleton */}
        <div className="skeleton-item" style={{ height: 88, borderRadius: 12, marginBottom: 14, animationDelay: '0.1s' }} />

        {/* Diagnostics grid skeleton */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div className="skeleton-item" style={{ width: '38%', height: 170, borderRadius: 10, animationDelay: '0.15s' }} />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[0.2, 0.25, 0.3, 0.35, 0.4].map((d, i) => (
              <div key={i} className="skeleton-item" style={{ height: 80, borderRadius: 10, animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>

        {/* Alerts skeleton */}
        <div className="skeleton-item" style={{ height: 52, borderRadius: 12, marginBottom: 14, animationDelay: '0.42s' }} />

        {/* Log rows skeleton */}
        {[0.48, 0.54, 0.60].map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
            <div className="skeleton-item" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, animationDelay: `${d}s` }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton-item" style={{ height: 13, width: '60%', animationDelay: `${d}s` }} />
              <div className="skeleton-item" style={{ height: 11, width: '40%', animationDelay: `${d + 0.04}s` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Error Screen ── */
function ErrorScreen({ message }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', background: 'var(--ds-bg)', padding: '32px', gap: '16px',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--ds-red)', opacity: 0.7 }}>
        error_outline
      </span>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ds-text-primary)', marginBottom: 8 }}>
          Failed to load bike
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 24px', borderRadius: 999,
          background: 'var(--ds-surface-active)', border: '1px solid var(--ds-border)',
          color: 'var(--ds-text-secondary)', fontSize: '12px', fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.08em',
        }}
      >
        RETRY
      </button>
    </div>
  )
}

export default function BikeLayout() {
  const { bikeId } = useParams()
  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const [vehicleRes, logsRes] = await Promise.all([
          fetch(`/api/vehicles/${bikeId}`),
          fetch(`/api/vehicles/${bikeId}/logs`),
        ])
        const vehicleData = await vehicleRes.json()
        const logsData    = await logsRes.json()

        if (!vehicleData.success) {
          setError(vehicleData.error || 'Failed to fetch bike')
          return
        }

        const v    = vehicleData.data
        const logs = logsData.success ? logsData.data : []

        const CATEGORY_META = {
          Engine:      { icon: 'settings',    label: 'Engine',        color: 'var(--ds-amber)' },
          Tires:       { icon: 'tire_repair', label: 'Tires',         color: 'var(--ds-cyan)' },
          Brakes:      { icon: 'disc_full',   label: 'Brakes',        color: 'var(--ds-red)' },
          Oils:        { icon: 'water_drop',  label: 'Oils & Fluids', color: 'var(--ds-primary)' },
          Electronics: { icon: 'bolt',        label: 'Electronics',   color: 'var(--ds-cyan)' },
        }
        const remapCat = (cat) => {
          if (['Drivetrain', 'Filters', 'Ignition'].includes(cat)) return 'Engine'
          return cat
        }
        const catIcon = (cat) => CATEGORY_META[remapCat(cat)]?.icon || 'build'

        const DIAG_CATEGORIES = [
          { key: 'Engine',      label: 'Engine',        icon: 'settings',    accentColor: 'var(--ds-amber)',   maps: ['Drivetrain', 'Filters', 'Ignition'] },
          { key: 'Tires',       label: 'Tires',         icon: 'tire_repair', accentColor: 'var(--ds-cyan)',    maps: ['Tires'] },
          { key: 'Brakes',      label: 'Brakes',        icon: 'disc_full',   accentColor: 'var(--ds-red)',     maps: ['Brakes'] },
          { key: 'Oils',        label: 'Oils & Fluids', icon: 'water_drop',  accentColor: 'var(--ds-primary)', maps: ['Oils'] },
          { key: 'Electronics', label: 'Electronics',   icon: 'bolt',        accentColor: 'var(--ds-cyan)',    maps: ['Electronics'] },
        ]

        const allComps = (v.components || []).filter(c => c.replacement_threshold > 0)

        const compHealth = (c) => {
          const kmUsed = (v.odometer || 0) - (c.baseline_install_odometer || 0)
          return Math.max(0, Math.min(100, Math.round(100 - (kmUsed / c.replacement_threshold) * 100)))
        }

        const diagnostics = DIAG_CATEGORIES.map(cat => {
          const catComps = allComps.filter(c => cat.maps.includes(c.category))
          if (catComps.length === 0) {
            return { ...cat, percent: 0, status: 'ok', alerts: [], isLocked: true }
          }
          const healths = catComps.map(c => ({ name: c.component_type, brand: c.brand, health: compHealth(c) }))
          const avg    = Math.round(healths.reduce((s, h) => s + h.health, 0) / healths.length)
          const status = avg < 20 ? 'critical' : avg < 50 ? 'warning' : 'ok'
          const alerts = healths.filter(h => h.health < 30).map(h => ({
            name: h.name, health: h.health,
            icon: h.health < 10 ? 'error' : 'warning',
            severity: h.health < 10 ? 'critical' : 'warning',
          }))
          return { ...cat, percent: avg, status, alerts, isLocked: false, componentCount: catComps.length }
        })

        const systemStatus = allComps.map(c => {
          const displayCat = remapCat(c.category)
          return {
            id: c.id, label: c.component_type, category: displayCat,
            categoryMeta: CATEGORY_META[displayCat] || { icon: 'build', label: displayCat, color: 'var(--ds-amber)' },
            percent: compHealth(c),
            threshold: c.replacement_threshold,
            lastKm: (c.baseline_install_odometer || 0).toLocaleString(),
            lastDate: c.last_service_date
              ? new Date(c.last_service_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
              : '—',
            icon: catIcon(c.category),
          }
        })

        const smartAlerts = allComps
          .map(c => ({ c, health: compHealth(c) }))
          .filter(({ health }) => health < 30)
          .map(({ c, health }, i) => ({
            id: `alert-${i}`,
            type: health < 10 ? 'critical' : 'warning',
            title: `${c.component_type} needs attention`,
            body: health < 10
              ? `Critical — only ${health}% life remaining. Replace immediately.`
              : `Only ${health}% life remaining. Plan replacement soon.`,
            action: 'VIEW', icon: catIcon(c.category),
          }))

        const maintenanceLogs = logs.map(l => ({
          id: l.id, title: l.title,
          subtitle: l.description || l.log_type,
          date: new Date(l.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          borderColor: l.log_type === 'upgrade' ? 'amber' : 'gray',
        }))

        setBike({
          id: v.id,
          name: `${v.year} ${v.make.toUpperCase()} ${v.model.toUpperCase()}`,
          make: v.make, model: v.model, year: v.year,
          category: v.category || '—',
          engine: v.engine_displacement ? `${v.engine_displacement} cc` : '—',
          weight: v.weight ? `${v.weight} kg` : '—',
          fuelType: v.fuel_type || '—',
          fuelCapacity: v.fuel_capacity ? `${v.fuel_capacity} L` : '—',
          fuelConsumption: v.fuel_consumption || '—',
          status: v.status || 'needsSetup',
          image: v.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
          odometer: v.odometer || 0,
          fuelRange: (v.fuel_capacity && v.fuel_consumption) ? Math.round(v.fuel_capacity * v.fuel_consumption) : '—',
          diagnostics, systemStatus, smartAlerts, maintenanceLogs,
          rideHistory: [], chatThread: [],
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBike()
  }, [bikeId])

  return (
    <div className="relative min-h-screen flex justify-center transition-colors duration-300" style={{ background: '#090909' }}>
      <div
        className="w-full h-full min-h-screen relative overflow-x-hidden transition-colors duration-300"
        style={{
          maxWidth: '430px',
          background: 'var(--ds-bg)',
          boxShadow: '0 0 60px rgba(0,0,0,0.7)',
          borderLeft: '1px solid var(--ds-border)',
          borderRight: '1px solid var(--ds-border)',
        }}
      >
        {loading ? (
          <SkeletonScreen />
        ) : error || !bike ? (
          <ErrorScreen message={error || 'Bike not found.'} />
        ) : (
          <>
            <Outlet context={{ bike, setBike }} />
            <BikeNavBar />
          </>
        )}
      </div>
    </div>
  )
}
