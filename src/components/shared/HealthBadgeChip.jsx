const statusConfig = {
  readyToRide: {
    label: 'READY TO RIDE',
    dotClass: 'bg-green-400',
    ping: true,
    borderClass: 'border-green-500/50',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
  },
  serviceDue: {
    label: 'SERVICE DUE',
    dotClass: 'bg-[#ffb4ab]',
    ping: false,
    borderClass: 'border-[#ffb4ab]/50',
    bgClass: 'bg-[#ffb4ab]/20',
    textClass: 'text-[#ffb4ab]',
  },
  warning: {
    label: 'WARNING',
    dotClass: 'bg-yellow-400',
    ping: true,
    borderClass: 'border-yellow-400/50',
    bgClass: 'bg-yellow-400/20',
    textClass: 'text-yellow-400',
  },
}

export default function HealthBadgeChip({ status }) {
  const cfg = statusConfig[status] || statusConfig.readyToRide
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.bgClass} ${cfg.borderClass}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <span className="relative flex h-2 w-2">
        {cfg.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotClass}`} />
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.textClass}`}>{cfg.label}</span>
    </div>
  )
}
