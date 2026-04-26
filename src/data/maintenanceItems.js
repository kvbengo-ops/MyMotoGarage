// ── Static Maintenance / System Status Data ────────────────────────────────

export const maintenanceItems = [
  { id: 'oil',   icon: 'oil_barrel',        label: 'Engine Oil',  percent: 82, lastKm: '12,400 KM', lastDate: '08 OCT 23' },
  { id: 'tires', icon: 'tire_repair',       label: 'Tires',       percent: 65, lastKm: '14,200 KM', lastDate: '12 JAN 24' },
  { id: 'brake', icon: 'slow_motion_video', label: 'Brakes',      percent: 98, lastKm: '15,800 KM', lastDate: '02 MAR 24' },
  { id: 'chain', icon: 'link',              label: 'Drive Chain', percent: 40, lastKm: '15,100 KM', lastDate: '15 FEB 24' },
]

export const smartAlerts = [
  {
    id: 'chain-alert',
    type: 'warning', // 'warning' | 'info'
    icon: 'warning',
    title: 'Chain Tensioner Upgrade Recommended',
    body: 'Current drive chain efficiency is dropping. Automatic tensioners prevent rapid wear.',
    action: 'VIEW PARTS',
  },
  {
    id: 'spark-alert',
    type: 'info',
    icon: 'bolt',
    title: 'Time for High-Performance Spark Plugs',
    body: 'Optimizing ignition timing based on your last 500KM riding telemetry.',
    action: 'UPGRADE NOW',
  },
]

export const recentUpgrades = [
  { id: 1, title: 'New Brembo Brake Pads',   subtitle: 'Sintered Performance Series', date: '02 MAR 24', borderColor: 'amber' },
  { id: 2, title: 'Chain Cleaned & Lubed',   subtitle: 'Motul C2 Maintenance',        date: '15 FEB 24', borderColor: 'gray'  },
  { id: 3, title: 'Mirror Extension Blocks', subtitle: 'CNC Aluminum Anodized',       date: '20 JAN 24', borderColor: 'gray'  },
]
