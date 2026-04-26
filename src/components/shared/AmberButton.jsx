export default function AmberButton({ children, onClick, icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2.5 rounded-[12px] text-black font-bold text-[13px] uppercase tracking-[0.12em] active:scale-[0.97] transition-all duration-150 ${className}`}
      style={{ 
        minHeight: '56px', paddingTop: '16px', paddingBottom: '16px',
        background: 'var(--ds-amber)',
        boxShadow: '0 4px 20px color-mix(in srgb, var(--ds-amber) 30%, transparent)' 
      }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
    >
      {icon && <span className="material-symbols-filled text-[22px]">{icon}</span>}
      {children}
    </button>
  )
}
