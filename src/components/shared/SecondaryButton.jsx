export default function SecondaryButton({ children, onClick, icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2.5 rounded-[12px]
        font-bold text-[13px] uppercase tracking-[0.12em]
        active:scale-[0.97] transition-all duration-150 ${className}`}
      style={{ 
        minHeight: '52px', paddingTop: '14px', paddingBottom: '14px',
        background: 'var(--ds-surface-hover)', 
        border: '1px solid var(--ds-border-heavy)', 
        color: 'var(--ds-text-primary)' 
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--ds-text-primary) 8%, transparent)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--ds-surface-hover)'}
    >
      {icon && <span className="material-symbols-outlined text-[22px]">{icon}</span>}
      {children}
    </button>
  )
}
