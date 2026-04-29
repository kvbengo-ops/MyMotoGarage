import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RideOutlookCard from '../components/garage/RideOutlookCard'
import VehicleCard from '../components/garage/VehicleCard'
import AddVehicleCard from '../components/garage/AddVehicleCard'

export default function GarageDashboard() {
  const navigate = useNavigate()
  
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?userId=00000000-0000-0000-0000-000000000000')
        const data = await response.json()
        if (data.success) {
          const mappedFleet = data.data.map(v => ({
            id: v.id,
            name: `${v.year} ${v.make.toUpperCase()} ${v.model.toUpperCase()}`,
            category: v.category || 'Unknown Category',
            status: v.status || 'needsSetup',
            image: v.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
            odometer: v.odometer || 0,
            diagnosticPins: [], // Not yet in DB
            diagnostics: [],
            maintenanceLogs: [],
            rideHistory: [],
            systemStatus: [],
            smartAlerts: [],
            recentUpgrades: [],
            chatThread: []
          }))
          setFleet(mappedFleet)
        } else {
          setError(data.error || 'Failed to fetch vehicles')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ds-bg)' }}>

      {/* ── App Bar — 56px (7 × 8px) ── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: '56px', padding: '0 20px',
          background: 'var(--ds-glass-bg)',
          borderBottom: '1px solid var(--ds-glass-border)',
          backdropFilter: 'blur(20px)',
          transition: 'background-color 0.3s'
        }}
      >
        <h1 style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ds-amber)' }}>
          Your Garage
        </h1>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: 'var(--ds-amber)',
          background: 'color-mix(in srgb, var(--ds-amber) 10%, transparent)', border: '1.5px solid color-mix(in srgb, var(--ds-amber) 35%, transparent)',
        }}>R</div>
      </header>

      {/* ── Page Content — 16px side pad, 24px top ── */}
      <main style={{ padding: '24px 16px 32px' }}>

        {/* ── Ride Outlook widget ── */}
        <RideOutlookCard />

        {/* ── My Fleet — 32px gap after widget (Gestalt: Proximity) ── */}
        <div style={{ marginTop: '32px' }}>
          {/* Section label row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-secondary)' }}>
              My Fleet
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ds-text-muted)' }}>
              {loading ? '...' : fleet.length} vehicles
            </span>
          </div>

          {error && (
            <div style={{ color: 'var(--ds-red)', fontSize: '12px', padding: '12px', background: 'color-mix(in srgb, var(--ds-red) 10%, transparent)', borderRadius: '12px', marginBottom: '16px' }}>
              Failed to load garage: {error}
            </div>
          )}

          {/* Cards — 20px gap between (consistent with 8px grid, 2.5 units deliberate for card stacking) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loading && !error ? (
              <div style={{ color: 'var(--ds-text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
                Loading vehicles...
              </div>
            ) : fleet.length === 0 && !error ? (
              <div style={{ color: 'var(--ds-text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0', border: '1.5px dashed var(--ds-border-heavy)', borderRadius: '16px' }}>
                Your garage is empty. Add your first vehicle below!
              </div>
            ) : (
              fleet.map((bike) => (
                <VehicleCard key={bike.id} bike={bike} />
              ))
            )}
          </div>
        </div>

        {/* ── Add Vehicle — 20px below last card ── */}
        <div style={{ marginTop: '20px' }}>
          <AddVehicleCard onClick={() => navigate('/add-vehicle')} />
        </div>

      </main>
    </div>
  )
}
