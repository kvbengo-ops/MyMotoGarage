import { Outlet, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BikeNavBar from './BikeNavBar'

export default function BikeLayout() {
  const { bikeId } = useParams()
  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBike = async () => {
      try {
        // Fetch vehicle + components
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

        // ── Category icon helper ──
        const catIcon = (cat) => ({ Drivetrain:'settings', Tires:'tire_repair', Brakes:'disc_full', Oils:'water_drop', Electronics:'bolt' }[cat] || 'build')

        // ── Diagnostic categories ──
        const DIAG_CATEGORIES = [
          { key: 'Engine',      label: 'Engine',        icon: 'settings',    accentColor: 'var(--ds-amber)', maps: ['Drivetrain'] },
          { key: 'Tires',       label: 'Tires',         icon: 'tire_repair', accentColor: 'var(--ds-cyan)',  maps: ['Tires'] },
          { key: 'Brakes',      label: 'Brakes',        icon: 'disc_full',   accentColor: 'var(--ds-red)',   maps: ['Brakes'] },
          { key: 'Oils',        label: 'Oils & Fluids', icon: 'water_drop',  accentColor: 'var(--ds-primary)', maps: ['Oils'] },
          { key: 'Electronics', label: 'Electronics',   icon: 'bolt',        accentColor: 'var(--ds-cyan)',  maps: ['Electronics'] },
        ]

        const allComps = (v.components || []).filter(c => c.replacement_threshold > 0)

        // ── Per-component health helper ──
        const compHealth = (c) => {
          const kmUsed = (v.odometer || 0) - (c.baseline_install_odometer || 0)
          return Math.max(0, Math.min(100, Math.round(100 - (kmUsed / c.replacement_threshold) * 100)))
        }

        // ── Diagnostics ──
        // Formula per category: avg(component_health) where
        //   component_health = max(0, min(100, 100 - (km_used / threshold × 100)))
        // Empty category → isLocked:true (no components configured yet)
        const diagnostics = DIAG_CATEGORIES.map(cat => {
          const catComps = allComps.filter(c => cat.maps.includes(c.category))
          if (catComps.length === 0) {
            return { ...cat, percent: 0, status: 'ok', alerts: [], isLocked: true }
          }
          const healths = catComps.map(c => ({
            name: c.component_type,
            brand: c.brand,
            health: compHealth(c),
          }))
          // Category health = weighted average across all its components
          const avg    = Math.round(healths.reduce((s, h) => s + h.health, 0) / healths.length)
          const status = avg < 20 ? 'critical' : avg < 50 ? 'warning' : 'ok'
          const alerts = healths.filter(h => h.health < 30).map(h => ({
            name: h.name, health: h.health,
            icon: h.health < 10 ? 'error' : 'warning',
            severity: h.health < 10 ? 'critical' : 'warning',
          }))
          return { ...cat, percent: avg, status, alerts, isLocked: false, componentCount: catComps.length }
        })


        // ── System status (real components) ──
        const systemStatus = allComps.map(c => ({
          id: c.id,
          label: c.component_type,
          percent: compHealth(c),
          lastKm: (c.baseline_install_odometer || 0).toLocaleString(),
          lastDate: c.last_service_date
            ? new Date(c.last_service_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
            : '—',
          icon: catIcon(c.category),
        }))

        // ── Smart alerts (real low-health components) ──
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
            action: 'VIEW',
            icon: catIcon(c.category),
          }))

        // ── Maintenance logs (real DB data) ──
        const maintenanceLogs = logs.map(l => ({
          id: l.id,
          title: l.title,
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
          diagnostics,
          systemStatus,
          smartAlerts,
          maintenanceLogs,
          rideHistory: [],
          chatThread: [],
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
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--ds-border)',
          borderRight: '1px solid var(--ds-border)'
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <p style={{ color: 'var(--ds-text-secondary)' }}>Loading...</p>
          </div>
        ) : error || !bike ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <p style={{ color: 'var(--ds-text-secondary)' }}>{error || 'Bike not found.'}</p>
          </div>
        ) : (
          <>
            <Outlet context={{ bike }} />
            <BikeNavBar />
          </>
        )}
      </div>
    </div>
  )
}
