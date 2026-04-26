export default function AddVehicleCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="dashed-border rounded-[12px] flex flex-col items-center justify-center p-8 cursor-pointer group transition-all duration-200"
      style={{ minHeight: '240px' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--ds-surface-hover)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-200"
        style={{ background: 'var(--ds-surface)' }}
      >
        <span className="material-symbols-outlined text-[32px] transition-colors duration-200" style={{ color: 'var(--ds-text-secondary)' }}>
          add_circle
        </span>
      </div>
      <h3 className="text-[18px] font-bold mb-1" style={{ color: 'var(--ds-text-primary)' }}>Add Vehicle</h3>
      <p className="text-[13px] text-center max-w-[180px] leading-relaxed" style={{ color: 'var(--ds-text-secondary)' }}>
        Connect a new machine to your digital garage.
      </p>
    </div>
  )
}
