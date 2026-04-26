const barColor = {
  amber: '#FF8C00',
  green: '#4ade80',
  red:   '#f87171',
}

export default function DiagnosticGaugeRow({ label, percent, icon, color = 'amber' }) {
  const fill = barColor[color] || barColor.amber
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-neutral-400">{icon}</span>
          <span className="text-[14px] text-neutral-300">{label}</span>
        </div>
        <span className="text-[12px] font-bold text-[#f3dfd1]">{percent}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#181818' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, background: fill }}
        />
      </div>
    </div>
  )
}
