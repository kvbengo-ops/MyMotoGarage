import { Outlet } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

export default function AppLayout() {
  return (
    /* Phone shell wrapper — centers content, simulates mobile viewport */
    <div className="min-h-screen flex items-start justify-center" style={{ background: '#090909' }}>
      <div
        className="relative w-full flex flex-col transition-colors duration-300"
        style={{ maxWidth: '430px', minHeight: '100dvh', background: 'var(--ds-bg)' }}
      >
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
        >
          <Outlet />
        </main>
        <BottomNavBar />
      </div>
    </div>
  )
}
