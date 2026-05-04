import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import RideOutlookCard from '../components/garage/RideOutlookCard'
import GasPriceCard from '../components/garage/GasPriceCard'
import VehicleCard from '../components/garage/VehicleCard'
import AddVehicleCard from '../components/garage/AddVehicleCard'

export default function GarageDashboard() {
  const navigate = useNavigate()
  
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [dragStart, setDragStart] = useState(null)

  const CARDS = ['outlook', 'gas']

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -40 && cardIndex < CARDS.length - 1) setCardIndex(i => i + 1)
    if (info.offset.x >  40 && cardIndex > 0)               setCardIndex(i => i - 1)
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?userId=00000000-0000-0000-0000-000000000000')
        const data = await response.json()
        if (data.success) {
          const mappedFleet = data.data.map(v => ({
            id: v.id,
            make: v.make || '',
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

  const handleDeleteVehicle = async (id) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setFleet(prev => prev.filter(v => v.id !== id))
      } else {
        setError(data.error || 'Failed to delete vehicle')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete vehicle')
    }
  }

  return (
    <div className="fade-in cockpit-grid min-h-screen transition-colors duration-300" style={{ background: 'var(--ds-bg)' }}>

      {/* ── App Bar ── */}
      <header
        className="carbon-texture"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: '58px', padding: '0 20px',
          background: 'var(--ds-glass-bg)',
          borderBottom: '1px solid var(--ds-border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Left: amber accent line + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '3px', height: '22px', background: 'var(--ds-amber)', borderRadius: '2px', boxShadow: '0 0 10px var(--ds-amber-glow)' }} />
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-text-primary)' }}>
            Your Garage
          </h1>
        </div>
        {/* Right: avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: 'var(--ds-amber)',
          background: 'var(--ds-amber-subtle)', border: '1px solid rgba(255,107,0,0.25)',
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em',
        }}>R</div>
      </header>

      {/* ── Fleet Stats Banner ── */}
      {!loading && !error && fleet.length > 0 && (() => {
        const totalAlerts = 0 // future: sum smartAlerts across fleet
        const avgHealth   = null  // future: avg across all bikes
        return (
          <div style={{
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '10px 20px',
            background: 'var(--ds-surface)',
            borderBottom: '1px solid var(--ds-border)',
          }}>
            {[
              { label: 'Fleet',   value: fleet.length, unit: 'bikes',   color: 'var(--ds-text-primary)' },
              { label: 'Alerts',  value: totalAlerts,  unit: 'active',  color: totalAlerts > 0 ? 'var(--ds-red)' : 'var(--ds-text-muted)' },
              { label: 'Status',  value: avgHealth ?? '—', unit: '% health', color: 'var(--ds-neon-cyan)' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 800, color, lineHeight: 1 }}>
                  {value}
                </span>
                <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>
                  {label} · {unit}
                </span>
              </div>
            ))}
          </div>
        )
      })()}

      {/* ── Page Content ── */}
      <main style={{ padding: '24px 16px 32px' }}>

        {/* ── Swipeable Info Cards ── */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={cardIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: cardIndex === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: cardIndex === 0 ? 30 : -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ cursor: 'grab', userSelect: 'none' }}
            >
              {cardIndex === 0 ? <RideOutlookCard /> : <GasPriceCard />}
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
            {CARDS.map((_, i) => (
              <div
                key={i}
                onClick={() => setCardIndex(i)}
                style={{
                  width: i === cardIndex ? '20px' : '6px', height: '6px',
                  borderRadius: '3px', cursor: 'pointer',
                  background: i === cardIndex ? 'var(--ds-primary)' : 'var(--ds-surface-active)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

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
                <VehicleCard key={bike.id} bike={bike} onDelete={handleDeleteVehicle} />
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
