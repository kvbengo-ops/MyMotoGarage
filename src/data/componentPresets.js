/**
 * componentPresets.js
 * Smart component presets per motorcycle category.
 * Used by Quick Setup to pre-fill common parts with industry-standard thresholds.
 *
 * Each preset: { componentType, category, brand, model, replacementThreshold (km) }
 * - brand/model left empty for user customization
 * - thresholds represent conservative real-world averages
 */

const COMPONENT_PRESETS = {
  'Naked / Streetfighter': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 25000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 30000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 30000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 12000 },
      { componentType: 'Rear Tire',       replacementThreshold: 8000  },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 15000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 20000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 5000  },
      { componentType: 'Coolant',         replacementThreshold: 24000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 40000 },
    ],
  },

  'Sportbike': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 20000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 25000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 25000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 8000  },
      { componentType: 'Rear Tire',       replacementThreshold: 5000  },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 12000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 18000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 4000  },
      { componentType: 'Coolant',         replacementThreshold: 20000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 35000 },
    ],
  },

  'Cruiser': {
    Drivetrain: [
      { componentType: 'Drive Belt',      replacementThreshold: 80000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 15000 },
      { componentType: 'Rear Tire',       replacementThreshold: 12000 },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 20000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 25000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 8000  },
      { componentType: 'Coolant',         replacementThreshold: 30000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 45000 },
    ],
  },

  'Adventure / Touring': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 30000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 35000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 35000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 15000 },
      { componentType: 'Rear Tire',       replacementThreshold: 10000 },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 18000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 22000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 6000  },
      { componentType: 'Coolant',         replacementThreshold: 24000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 40000 },
    ],
  },

  'Scrambler': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 22000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 28000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 28000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 10000 },
      { componentType: 'Rear Tire',       replacementThreshold: 7000  },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 15000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 20000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 5000  },
      { componentType: 'Coolant',         replacementThreshold: 24000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 40000 },
    ],
  },

  'Cafe Racer': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 25000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 30000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 30000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 12000 },
      { componentType: 'Rear Tire',       replacementThreshold: 8000  },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 15000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 20000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 5000  },
      { componentType: 'Coolant',         replacementThreshold: 24000 },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 40000 },
    ],
  },

  'Dirt / Enduro': {
    Drivetrain: [
      { componentType: 'Drive Chain',     replacementThreshold: 15000 },
      { componentType: 'Front Sprocket',  replacementThreshold: 20000 },
      { componentType: 'Rear Sprocket',   replacementThreshold: 20000 },
    ],
    Tires: [
      { componentType: 'Front Tire',      replacementThreshold: 6000  },
      { componentType: 'Rear Tire',       replacementThreshold: 4000  },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 10000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 12000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',      replacementThreshold: 3000  },
    ],
    Electronics: [
      { componentType: 'Battery',         replacementThreshold: 30000 },
    ],
  },

  'Scooter': {
    Drivetrain: [
      { componentType: 'CVT Belt',         replacementThreshold: 20000 },
      { componentType: 'Roller Weights',   replacementThreshold: 15000 },
      { componentType: 'CVT Clutch Shoes', replacementThreshold: 20000 },
      { componentType: 'Drive Face',       replacementThreshold: 30000 },
    ],
    Tires: [
      { componentType: 'Front Tire',       replacementThreshold: 15000 },
      { componentType: 'Rear Tire',        replacementThreshold: 10000 },
    ],
    Brakes: [
      { componentType: 'Front Brake Pads', replacementThreshold: 15000 },
      { componentType: 'Rear Brake Pads',  replacementThreshold: 20000 },
      { componentType: 'Brake Fluid',      replacementThreshold: 24000 },
    ],
    Oils: [
      { componentType: 'Engine Oil',       replacementThreshold: 3000  },
      { componentType: 'Gear Oil',         replacementThreshold: 8000  },
    ],
    Filters: [
      { componentType: 'Air Filter',       replacementThreshold: 8000  },
      { componentType: 'Fuel Filter',      replacementThreshold: 12000 },
      { componentType: 'Oil Filter',       replacementThreshold: 6000  },
    ],
    Ignition: [
      { componentType: 'Spark Plug',       replacementThreshold: 8000  },
    ],
    Electronics: [
      { componentType: 'Battery',          replacementThreshold: 40000 },
    ],
  },
}

// Components considered "consumables" for the Fresh Service clean slate mode.
// These get reset to 0 km wear. Long-life items stay as "Unknown".
export const CONSUMABLE_TYPES = [
  'Engine Oil', 'Gear Oil', 'Drive Chain', 'CVT Belt', 'CVT Clutch Shoes',
  'Front Brake Pads', 'Rear Brake Pads', 'Brake Fluid',
  'Front Sprocket', 'Rear Sprocket', 'Roller Weights',
  'Air Filter', 'Oil Filter', 'Fuel Filter', 'Spark Plug',
]

/**
 * Get all preset components for a given category, flattened into a single array.
 * Each component gets a unique ID and the category tag.
 */
export function getPresetsForCategory(bikeCategory) {
  // Try exact match first, then fall back to Naked / Streetfighter as a sensible default
  const presets = COMPONENT_PRESETS[bikeCategory] || COMPONENT_PRESETS['Naked / Streetfighter']
  
  const flatList = []
  for (const [category, parts] of Object.entries(presets)) {
    for (const part of parts) {
      flatList.push({
        id: Math.random().toString(36).substring(2, 9),
        category,
        componentType: part.componentType,
        brand: '',
        model: '',
        replacementThreshold: part.replacementThreshold.toString(),
        wearState: 'Brand New',
        estimatedKmUsed: '',
        lastServiceDate: '',
      })
    }
  }
  return flatList
}

/**
 * Apply a "Clean Slate" mode to a set of preset components.
 *
 * @param {'brandNew' | 'freshService'} mode
 * @param {Array} components - The pre-filled component list
 * @returns {Array} - Components with wear states applied
 */
export function applyCleanSlate(mode, components) {
  const today = new Date().toISOString().split('T')[0]

  return components.map(comp => {
    if (mode === 'brandNew') {
      // Everything is fresh — 0 km, today's date
      return {
        ...comp,
        wearState: 'Brand New',
        estimatedKmUsed: '',
        lastServiceDate: today,
      }
    }
    
    if (mode === 'freshService') {
      const isConsumable = CONSUMABLE_TYPES.includes(comp.componentType)
      if (isConsumable) {
        // Consumable → just serviced, 0 km
        return {
          ...comp,
          wearState: 'Brand New',
          estimatedKmUsed: '',
          lastServiceDate: today,
        }
      } else {
        // Long-life item → unknown wear, flag for later review
        return {
          ...comp,
          wearState: 'Currently Used',
          estimatedKmUsed: '',
          lastServiceDate: '',
        }
      }
    }

    // Default: no changes (manual mode)
    return comp
  })
}

export default COMPONENT_PRESETS
