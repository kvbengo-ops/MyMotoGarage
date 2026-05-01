/**
 * bikeSpecs.js
 * Motorcycle specifications database indexed by (make, model).
 * Used to auto-fill factory specs during vehicle onboarding.
 *
 * Each entry: { make, model, years[], cc, weight, fuelType, fuelCapacity, fuelConsumption, category }
 * - weight in kg
 * - fuelCapacity in liters
 * - fuelConsumption in km/L (approximate combined)
 */

const BIKE_SPECS = [
  // ── Yamaha Scooters ──────────────────────────────────
  { make: 'Yamaha', model: 'NMAX 155',        years: [2020,2021,2022,2023,2024,2025], cc: 155, weight: 131, fuelType: 'Standard (87)', fuelCapacity: 7.1,  fuelConsumption: 42, category: 'Scooter' },
  { make: 'Yamaha', model: 'NMAX 125',        years: [2021,2022,2023,2024,2025],       cc: 125, weight: 127, fuelType: 'Standard (87)', fuelCapacity: 5.8,  fuelConsumption: 45, category: 'Scooter' },
  { make: 'Yamaha', model: 'Aerox 155',       years: [2020,2021,2022,2023,2024,2025], cc: 155, weight: 125, fuelType: 'Standard (87)', fuelCapacity: 5.5,  fuelConsumption: 40, category: 'Scooter' },
  { make: 'Yamaha', model: 'Mio i 125',       years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 125, weight: 92, fuelType: 'Standard (87)', fuelCapacity: 4.2, fuelConsumption: 55, category: 'Scooter' },
  { make: 'Yamaha', model: 'Mio Sporty',      years: [2017,2018,2019,2020,2021,2022,2023,2024], cc: 113, weight: 86, fuelType: 'Standard (87)', fuelCapacity: 3.7, fuelConsumption: 50, category: 'Scooter' },
  { make: 'Yamaha', model: 'Mio Gravis',      years: [2021,2022,2023,2024,2025],       cc: 125, weight: 95, fuelType: 'Standard (87)', fuelCapacity: 4.2,  fuelConsumption: 52, category: 'Scooter' },
  { make: 'Yamaha', model: 'Force 115',       years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 115, weight: 96, fuelType: 'Standard (87)', fuelCapacity: 4.0, fuelConsumption: 48, category: 'Scooter' },
  { make: 'Yamaha', model: 'Freego 125',      years: [2019,2020,2021,2022,2023,2024,2025], cc: 125, weight: 103, fuelType: 'Standard (87)', fuelCapacity: 5.1, fuelConsumption: 47, category: 'Scooter' },

  // ── Honda Scooters ───────────────────────────────────
  { make: 'Honda', model: 'Click 125i',       years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 125, weight: 103, fuelType: 'Standard (87)', fuelCapacity: 5.5, fuelConsumption: 55, category: 'Scooter' },
  { make: 'Honda', model: 'Click 150i',       years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 150, weight: 118, fuelType: 'Standard (87)', fuelCapacity: 5.5, fuelConsumption: 47, category: 'Scooter' },
  { make: 'Honda', model: 'PCX 125',          years: [2021,2022,2023,2024,2025],       cc: 125, weight: 130, fuelType: 'Standard (87)', fuelCapacity: 8.1,  fuelConsumption: 50, category: 'Scooter' },
  { make: 'Honda', model: 'PCX 160',          years: [2021,2022,2023,2024,2025],       cc: 157, weight: 132, fuelType: 'Standard (87)', fuelCapacity: 8.1,  fuelConsumption: 44, category: 'Scooter' },
  { make: 'Honda', model: 'ADV 160',          years: [2022,2023,2024,2025],            cc: 157, weight: 135, fuelType: 'Standard (87)', fuelCapacity: 8.1,  fuelConsumption: 42, category: 'Scooter' },
  { make: 'Honda', model: 'Beat 110',         years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 109, weight: 93, fuelType: 'Standard (87)', fuelCapacity: 3.7, fuelConsumption: 59, category: 'Scooter' },
  { make: 'Honda', model: 'Vario 125',        years: [2018,2019,2020,2021,2022,2023,2024,2025], cc: 125, weight: 113, fuelType: 'Standard (87)', fuelCapacity: 5.5, fuelConsumption: 53, category: 'Scooter' },
  { make: 'Honda', model: 'Vario 160',        years: [2022,2023,2024,2025],            cc: 157, weight: 121, fuelType: 'Standard (87)', fuelCapacity: 5.5,  fuelConsumption: 46, category: 'Scooter' },
  { make: 'Honda', model: 'Scoopy',           years: [2020,2021,2022,2023,2024,2025],  cc: 109, weight: 96,  fuelType: 'Standard (87)', fuelCapacity: 3.7,  fuelConsumption: 56, category: 'Scooter' },

  // ── Suzuki Scooters ──────────────────────────────────
  { make: 'Suzuki', model: 'Skydrive 125',    years: [2018,2019,2020,2021,2022,2023,2024], cc: 125, weight: 107, fuelType: 'Standard (87)', fuelCapacity: 5.2, fuelConsumption: 50, category: 'Scooter' },
  { make: 'Suzuki', model: 'Address 115',     years: [2018,2019,2020,2021,2022,2023,2024], cc: 113, weight: 93,  fuelType: 'Standard (87)', fuelCapacity: 5.2, fuelConsumption: 52, category: 'Scooter' },
  { make: 'Suzuki', model: 'Burgman Street 125', years: [2020,2021,2022,2023,2024,2025], cc: 124, weight: 105, fuelType: 'Standard (87)', fuelCapacity: 5.6, fuelConsumption: 48, category: 'Scooter' },

  // ── Kawasaki Scooters ────────────────────────────────
  { make: 'Kawasaki', model: 'J125',          years: [2016,2017,2018,2019,2020,2021],   cc: 125, weight: 138, fuelType: 'Standard (87)', fuelCapacity: 9.8,  fuelConsumption: 42, category: 'Scooter' },
]



/**
 * Get all models for a given make.
 * Returns an array of unique model names.
 */
export function getModelsForMake(make) {
  if (!make || make === 'Other') return []
  return [...new Set(BIKE_SPECS.filter(s => s.make === make).map(s => s.model))]
}

/**
 * Fuzzy search models for a given make.
 * Simple but effective: matches if the query appears anywhere in the model name (case-insensitive).
 */
export function searchModels(make, query) {
  if (!make || !query) return getModelsForMake(make)
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '')
  return BIKE_SPECS
    .filter(s => s.make === make)
    .filter(s => {
      const normalized = s.model.toLowerCase().replace(/[^a-z0-9]/g, '')
      return normalized.includes(q) || q.includes(normalized)
    })
    .map(s => s.model)
    .filter((v, i, a) => a.indexOf(v) === i) // unique
}

/**
 * Get the full spec object for a given make + model.
 * Returns null if not found (user entered a custom model).
 */
export function getSpec(make, model) {
  return BIKE_SPECS.find(s => s.make === make && s.model === model) || null
}

/**
 * Get available years for a given make + model.
 * Returns sorted descending (newest first).
 */
export function getYearsForModel(make, model) {
  const spec = getSpec(make, model)
  if (!spec) return []
  return [...spec.years].sort((a, b) => b - a)
}

export default BIKE_SPECS
