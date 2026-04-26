export default function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
      <h3 className="text-[16px] font-bold text-[#f3dfd1]">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="text-[12px] font-bold uppercase tracking-wider text-[#FF8C00] hover:text-[#ffb77d] transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  )
}
