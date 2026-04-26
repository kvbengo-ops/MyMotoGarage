import RideOutlookCard from '../components/garage/RideOutlookCard'
import VehicleCard from '../components/garage/VehicleCard'
import AddVehicleCard from '../components/garage/AddVehicleCard'
import { fleet } from '../data/fleet'

/*
  8px grid:  pt-16=header, px-16=side, gap-24=cards, mt-32=section break
  Type:      17px header, 11px label (both on Major Third scale)
  Gestalt:   Proximity — Ride Outlook isolated at top as "context widget"
             Similarity — all cards share identical radius + surface
             Figure/Ground — dark outer shell vs warm #1A1A1A card surfaces
*/
import { useNavigate } from 'react-router-dom'

export default function GarageDashboard() {
  const navigate = useNavigate()
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
              {fleet.length} vehicles
            </span>
          </div>

          {/* Cards — 20px gap between (consistent with 8px grid, 2.5 units deliberate for card stacking) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {fleet.map((bike) => (
              <VehicleCard key={bike.id} bike={bike} />
            ))}
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
