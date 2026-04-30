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
        const response = await fetch(`/api/vehicles/${bikeId}`)
        const data = await response.json()
        if (data.success) {
          const v = data.data
          setBike({
            id: v.id,
            name: `${v.year} ${v.make.toUpperCase()} ${v.model.toUpperCase()}`,
            make: v.make,
            model: v.model,
            year: v.year,
            category: v.category || '-',
            engine: v.engine_displacement ? `${v.engine_displacement} cc` : '-', 
            weight: v.weight ? `${v.weight} kg` : '-',
            fuelType: v.fuel_type || '-',
            fuelCapacity: v.fuel_capacity ? `${v.fuel_capacity} L` : '-',
            fuelConsumption: v.fuel_consumption || '-',
            status: v.status || 'needsSetup',
            image: v.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80',
            odometer: v.odometer || 0,
            fuelRange: (v.fuel_capacity && v.fuel_consumption) ? Math.round(v.fuel_capacity * v.fuel_consumption) : '-',
            diagnostics: (v.components || []).filter(c => c.replacement_threshold > 0).length > 0 
              ? (v.components || []).filter(c => c.replacement_threshold > 0).map(c => {
                  const kmUsed = (v.odometer || 0) - c.baseline_install_odometer;
                  const percentUsed = (kmUsed / c.replacement_threshold) * 100;
                  const healthPercent = Math.max(0, Math.min(100, Math.round(100 - percentUsed)));
                  
                  let color = 'green';
                  if (healthPercent < 20) color = 'red';
                  else if (healthPercent < 50) color = 'amber';

                  let icon = 'build';
                  if (c.category === 'Drivetrain') icon = 'settings';
                  if (c.category === 'Tires') icon = 'tire_repair';
                  if (c.category === 'Brakes') icon = 'stop_circle';
                  if (c.category === 'Oils') icon = 'water_drop';

                  return { label: c.component_type, percent: healthPercent, color, icon };
              })
              : [{ label: 'System Health', percent: 100, color: 'green', icon: 'check_circle' }],
            maintenanceLogs: [],
            rideHistory: [],
            systemStatus: [
              { id: '1', label: 'Engine Oil', percent: 80, lastKm: '2,500', lastDate: 'Oct 12', icon: 'oil_barrel' },
              { id: '2', label: 'Brake Fluid', percent: 45, lastKm: '8,000', lastDate: 'Mar 01', icon: 'water_drop' },
              { id: '3', label: 'Drive Chain', percent: 90, lastKm: '300', lastDate: 'Nov 05', icon: 'link' },
            ],
            smartAlerts: [
              { id: 'a1', type: 'warning', title: 'Rear Tire Pressure Low', body: 'Pressure is at 32 PSI (Target: 36 PSI).', action: 'FIND AIR', icon: 'tire_repair' },
            ],
            recentUpgrades: [
              { id: 'u1', title: 'Akrapovič Slip-on', subtitle: 'Exhaust System', date: 'Oct 20', borderColor: 'amber' },
              { id: 'u2', title: 'Brembo Brake Pads', subtitle: 'Front & Rear', date: 'Sep 15', borderColor: 'gray' },
            ],
            chatThread: [
              { id: 1, text: 'Hi! Im noticing a slight vibration at 105km/h. Could it be the chain?', isUser: true, time: '10:02 AM' },
              { id: 2, text: 'Vibrations at specific speeds often point to wheel balance or alignment. However, since you last cleaned your chain 500 km ago, it is worth checking the slack first. Want me to pull up the factory spec for your chain tension?', isUser: false, time: '10:03 AM' }
            ]
          })
        } else {
          setError(data.error || 'Failed to fetch bike')
        }
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
