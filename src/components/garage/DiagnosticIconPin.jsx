const colorMap = {
  amber: { border: 'rgba(255,140,0,0.5)', glow: 'rgba(255,140,0,0.3)', text: '#FF8C00' },
  red:   { border: 'rgba(244,67,54,0.5)', glow: 'rgba(244,67,54,0.3)', text: '#f47c7c' },
}

export default function DiagnosticIconPin({ icon, color = 'amber', title }) {
  const c = colorMap[color] || colorMap.amber
  return (
    <div
      title={title}
      className="w-9 h-9 rounded-full flex items-center justify-center cursor-default"
      style={{
        background: 'rgba(34,34,34,0.85)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 10px ${c.glow}`,
      }}
    >
      <span className="material-symbols-filled text-[18px]" style={{ color: c.text }}>
        {icon}
      </span>
    </div>
  )
}
