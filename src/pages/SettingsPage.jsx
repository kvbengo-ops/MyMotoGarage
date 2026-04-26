import { useTheme } from '../components/shared/ThemeContext'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ds-bg)' }}>
      <header
        className="sticky top-0 z-40 flex justify-between items-center px-4 h-14 transition-colors duration-300"
        style={{ borderBottom: '1px solid var(--ds-border)' }}
      >
        <h1 className="text-[15px] font-black uppercase tracking-widest text-[var(--ds-amber)]">Settings</h1>
      </header>
      <div className="flex flex-col py-12 px-6">
        
        {/* Appearance Group */}
        <div style={{ background: 'var(--ds-surface)', border: '1px solid var(--ds-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--ds-border)', background: 'var(--ds-surface-hover)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-secondary)' }}>Appearance</p>
          </div>
          
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--ds-text-secondary)' }}>
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ds-text-primary)' }}>Theme Mode</p>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginTop: '2px' }}>
                  {theme === 'dark' ? 'Dark Protocol Active' : 'Light Mode Active'}
                </p>
              </div>
            </div>

            <button 
              onClick={toggleTheme}
              style={{
                width: '48px', height: '28px', borderRadius: '14px',
                background: theme === 'dark' ? 'var(--ds-amber)' : 'var(--ds-surface-active)',
                border: '1px solid var(--ds-border)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: '2px', left: theme === 'dark' ? '22px' : '2px',
                width: '22px', height: '22px', borderRadius: '50%',
                background: theme === 'dark' ? '#000' : 'var(--ds-text-secondary)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
