import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',         label: 'Garage',      icon: 'garage'    },
  { to: '/settings', label: 'Settings',    icon: 'settings'  },
]

export default function BottomNavBar() {
  return (
    <nav
      style={{
        background: 'var(--ds-glass-bg)',
        borderTop: '1px solid var(--ds-glass-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch"
    >
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 relative
            ${isActive ? 'text-[var(--ds-amber)]' : 'text-[var(--ds-text-secondary)] hover:text-[var(--ds-text-muted)]'}`
          }
          style={{ minHeight: '72px', paddingTop: '12px', paddingBottom: '12px' }}
        >
          {({ isActive }) => (
            <>
              {/* Active top indicator bar */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{
                    width: '32px',
                    height: '3px',
                    background: 'var(--ds-amber)',
                    boxShadow: '0 0 8px rgba(255,140,0,0.4)',
                  }}
                />
              )}

              {/* Icon container — pill highlight when active */}
              <span
                className={`flex items-center justify-center rounded-xl transition-all duration-200`}
                style={{
                  width: '48px', height: '32px',
                  background: isActive ? 'color-mix(in srgb, var(--ds-amber) 15%, transparent)' : 'transparent'
                }}
              >
                <span
                  className={`text-[26px] ${isActive ? 'material-symbols-filled' : 'material-symbols-outlined'}`}
                >
                  {icon}
                </span>
              </span>

              {/* Label */}
              <span
                className="font-bold uppercase"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
