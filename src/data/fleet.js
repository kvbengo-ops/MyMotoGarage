// ── Static Mock Fleet Data ──────────────────────────────────────────────────

export const fleet = [
  {
    id: 'mt07',
    name: '2023 YAMAHA MT-07',
    category: 'Street / Naked',
    status: 'readyToRide',
    image: '/images/mt07.png',
    odometer: 4250,
    fuelRange: 180,
    year: '2023',
    make: 'Yamaha',
    model: 'MT-07',
    engine: '689cc Liquid-cooled',
    weight: '406 lbs',
    diagnosticPins: [
      { icon: 'water_drop', color: 'amber', title: 'Oil: Check Levels' },
      { icon: 'battery_alert', color: 'amber', title: 'Battery: Check Soon' },
    ],
    diagnostics: [
      { label: 'Oil Life',       percent: 82, icon: 'oil_barrel',   color: 'amber' },
      { label: 'Tire Tread',     percent: 65, icon: 'tire_repair',  color: 'amber' },
      { label: 'Brake Pad Wear', percent: 90, icon: 'stop_circle',  color: 'green' },
    ],
    maintenanceLogs: [
      { icon: 'stop_circle', iconColor: 'green', title: 'New Brembo Brake Pads',   date: 'Oct 12, 2023', status: 'DONE' },
      { icon: 'hardware',    iconColor: 'amber', title: 'Ohlins Rear Shock Install', date: 'Sep 28, 2023', status: 'DONE' },
      { icon: 'build',       iconColor: 'gray',  title: 'Chain Cleaned & Lubed',    date: 'Sep 15, 2023', status: 'DONE' },
    ],
    rideHistory: [
      { icon: 'map',           iconColor: 'amber', title: 'Cross-Country Trip', subtitle: 'Epic Journey',    distance: 2150 },
      { icon: 'terrain',       iconColor: 'gray',  title: 'Canyon Run',         subtitle: 'Twisty Roads',    distance: 145  },
      { icon: 'wb_sunny',      iconColor: 'gray',  title: 'Sunday Cruise',      subtitle: 'Relaxed Pace',    distance: 85   },
      { icon: 'location_city', iconColor: 'gray',  title: 'City Commute',       subtitle: 'Urban Stop & Go', distance: 12   },
    ],
    // -- Dynamic System Status Data --
    systemStatus: [
      { id: 'oil',   icon: 'oil_barrel',        label: 'Engine Oil',  percent: 82, lastKm: '12,400 KM', lastDate: '08 OCT 23' },
      { id: 'tires', icon: 'tire_repair',       label: 'Tires',       percent: 65, lastKm: '14,200 KM', lastDate: '12 JAN 24' },
      { id: 'brake', icon: 'slow_motion_video', label: 'Brakes',      percent: 98, lastKm: '15,800 KM', lastDate: '02 MAR 24' },
      { id: 'chain', icon: 'link',              label: 'Drive Chain', percent: 40, lastKm: '15,100 KM', lastDate: '15 FEB 24' },
    ],
    smartAlerts: [
      {
        id: 'chain-alert',
        type: 'warning',
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
    ],
    recentUpgrades: [
      { id: 1, title: 'New Brembo Brake Pads',   subtitle: 'Sintered Performance Series', date: '02 MAR 24', borderColor: 'amber' },
      { id: 2, title: 'Chain Cleaned & Lubed',   subtitle: 'Motul C2 Maintenance',        date: '15 FEB 24', borderColor: 'gray'  },
      { id: 3, title: 'Mirror Extension Blocks', subtitle: 'CNC Aluminum Anodized',       date: '20 JAN 24', borderColor: 'gray'  },
    ],
    // -- Dynamic Chat Thread --
    chatThread: [
      { id: 1, isUser: false, text: "Hello, Rider. I've run a full diagnostic on your MT-07. Overall system health is at 79%. Your drive chain is the primary concern.", time: '10:31 AM' },
      { id: 2, isUser: false, text: "I'd recommend cleaning and lubricating the chain this weekend. Do you have Motul C2 lube?", time: '10:31 AM' },
      { id: 3, isUser: true,  text: "How long before it's a serious problem?", time: '10:33 AM' },
      { id: 4, isUser: false, text: "Based on your 85mi weekly average, about 3-4 weeks before efficiency drops below 70%.", time: '10:33 AM' },
    ]
  },
  {
    id: 'panigale',
    name: '2019 DUCATI PANIGALE V4',
    category: 'Sport / Track',
    status: 'serviceDue',
    image: '/images/panigale.png',
    odometer: 15120,
    fuelRange: 120,
    year: '2019',
    make: 'Ducati',
    model: 'Panigale V4',
    engine: '1103cc Desmosedici',
    weight: '436 lbs',
    diagnosticPins: [
      { icon: 'warning', color: 'red',   title: 'Brakes: Critical' },
      { icon: 'adjust',  color: 'amber', title: 'Tire: Check Soon' },
    ],
    diagnostics: [
      { label: 'Brake Pad Wear', percent: 22, icon: 'stop_circle', color: 'red'   },
      { label: 'Tire Tread',     percent: 48, icon: 'tire_repair', color: 'amber' },
      { label: 'Oil Life',       percent: 71, icon: 'oil_barrel',  color: 'amber' },
    ],
    maintenanceLogs: [
      { icon: 'build',       iconColor: 'amber', title: 'Valve Clearance Check',  date: 'Jan 05, 2024', status: 'DONE' },
      { icon: 'tire_repair', iconColor: 'gray',  title: 'Pirelli SC2 Tires Fit',  date: 'Nov 18, 2023', status: 'DONE' },
      { icon: 'settings',    iconColor: 'gray',  title: 'ECU Quickshifter Tune',  date: 'Oct 02, 2023', status: 'DONE' },
    ],
    rideHistory: [
      { icon: 'flag', iconColor: 'amber', title: 'Track Day @ Batangas Racing Circuit', subtitle: 'Hot Laps', distance: 98 },
      { icon: 'terrain', iconColor: 'gray', title: 'Tagaytay Ridge Run', subtitle: 'Weekend Escape', distance: 220 },
      { icon: 'route', iconColor: 'gray', title: 'Southbound Highway', subtitle: 'Night Cruise', distance: 75 },
    ],
    // -- Dynamic System Status Data --
    systemStatus: [
      { id: 'brake', icon: 'slow_motion_video', label: 'Brake Pads', percent: 22, lastKm: '12,500 KM', lastDate: '15 MAR 23' },
      { id: 'valve', icon: 'settings',          label: 'Desmo Valves', percent: 15, lastKm: '10,000 KM', lastDate: '10 MAY 23' },
      { id: 'tires', icon: 'tire_repair',       label: 'Supercorsas', percent: 48, lastKm: '14,000 KM', lastDate: '20 DEC 23' },
    ],
    smartAlerts: [
      {
        id: 'desmo-alert',
        type: 'warning',
        icon: 'warning',
        title: 'Desmo Valve Clearance Check Due',
        body: 'You have reached 15,000 miles. Desmoservice is critical for Ducati V4 engines.',
        action: 'SCHEDULE SERVICE',
      },
    ],
    recentUpgrades: [
      { id: 1, title: 'Termignoni Exhaust', subtitle: 'Full Racing System', date: '01 APR 24', borderColor: 'amber' },
      { id: 2, title: 'Carbon Fiber Winglets', subtitle: 'Aero Kit', date: '25 FEB 24', borderColor: 'gray' },
    ],
    // -- Dynamic Chat Thread --
    chatThread: [
      { id: 1, isUser: true,  text: "Can you pull up the Ducati service schedule?", time: '10:38 AM' },
      { id: 2, isUser: false, text: "⚠️ ALERT — Your Panigale V4 is overdue for service. Brake pad wear is critically low at 22%. Desmo valve inspection is also due at 15,000 mi.", time: '10:38 AM' },
    ]
  },
  {
    id: 'zx6r',
    name: '2024 KAWASAKI ZX-6R',
    category: 'Sportbike',
    status: 'needsSetup',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80',
    odometer: 0,
    fuelRange: 0,
    year: '2024',
    make: 'Kawasaki',
    model: 'ZX-6R',
    engine: '636cc Inline-Four',
    weight: '430 lbs',
    diagnosticPins: [],
    diagnostics: [],
    maintenanceLogs: [],
    rideHistory: [],
    systemStatus: [],
    smartAlerts: [],
    recentUpgrades: [],
    chatThread: []
  },
]

export const getBikeById = (id) => fleet.find((b) => b.id === id)
