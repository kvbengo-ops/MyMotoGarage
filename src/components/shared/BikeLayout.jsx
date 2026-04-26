import { Outlet } from 'react-router-dom'
import BikeNavBar from './BikeNavBar'

export default function BikeLayout() {
  return (
    <div className="relative min-h-screen flex justify-center transition-colors duration-300" style={{ background: '#090909' }}>
      {/* ── Desktop wrapper simulating a mobile phone shell ── */}
      <div 
        className="w-full h-full min-h-screen relative overflow-x-hidden transition-colors duration-300"
        style={{ 
          maxWidth: '430px', /* standard Pro Max phone width */
          background: 'var(--ds-bg)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--ds-border)',
          borderRight: '1px solid var(--ds-border)'
        }}
      >
        <Outlet />
        <BikeNavBar />
      </div>
    </div>
  )
}
