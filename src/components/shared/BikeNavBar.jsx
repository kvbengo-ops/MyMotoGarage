import { NavLink, useParams } from 'react-router-dom'

export default function BikeNavBar() {
  const { bikeId } = useParams()

  const tabs = [
    { to: `/bike/${bikeId}`,          label: 'Details',    icon: 'two_wheeler',  exact: true  },
    { to: `/bike/${bikeId}/status`,   label: 'Health',     icon: 'analytics',    exact: false },
    { to: `/bike/${bikeId}/mechanic`, label: 'AI',         icon: 'smart_toy',    exact: false },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch"
      style={{
        background: 'rgba(10,10,18,0.94)',
        borderTop: '1px solid rgba(0,212,255,0.08)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {tabs.map(({ to, label, icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="flex flex-col items-center justify-center flex-1 gap-1 relative transition-all duration-200"
          style={{ minHeight: '68px', paddingTop: '10px', paddingBottom: '10px' }}
        >
          {({ isActive }) => (
            <>
              {/* Neon cyan active top bar */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{
                    width: '36px', height: '3px',
                    background: 'var(--ds-neon-cyan)',
                    boxShadow: '0 0 10px var(--ds-neon-cyan-glow), 0 0 20px var(--ds-neon-cyan-glow)',
                  }}
                />
              )}

              {/* Icon pill */}
              <span
                className="flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: '48px', height: '32px',
                  background: isActive ? 'rgba(0,212,255,0.10)' : 'transparent',
                  boxShadow: isActive ? '0 0 12px rgba(0,212,255,0.15)' : 'none',
                }}
              >
                <span
                  className={`text-[26px] transition-colors duration-200 ${isActive ? 'material-symbols-filled' : 'material-symbols-outlined'}`}
                  style={{ color: isActive ? 'var(--ds-neon-cyan)' : 'var(--ds-text-muted)' }}
                >
                  {icon}
                </span>
              </span>

              {/* Label */}
              <span
                className="font-bold uppercase"
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  color: isActive ? 'var(--ds-neon-cyan)' : 'var(--ds-text-muted)',
                  transition: 'color 0.2s',
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
