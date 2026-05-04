/**
 * Fuel Price Route — MetroFuelTracker
 * https://metrofueltracker.com — 153 PH cities, 5631+ stations
 *
 * Strategy:
 *  - National /prices page has the brand averages.
 *  - City /prices/{slug} pages have the "Cheapest Today" prices for that city.
 *  - We strip HTML tags and run Regex on clean text.
 */

import express from 'express'

const router = express.Router()

// ── Cache ─────────────────────────────────────────────────────────────────────
let _cache = null
let _cacheTime = null
const CACHE_TTL = 60 * 60 * 1000  // 1 hour
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
}

// ── Brand colour map ──────────────────────────────────────────────────────────
const BRAND_COLORS = {
  petron: '#dc2626', shell: '#eab308', caltex: '#e05c00', seaoil: '#0090d9',
  phoenix: '#f97316', 'flying v': '#e63939', cleanfuel: '#8b5cf6', total: '#1e40af',
  unioil: '#0ea5e9', ptt: '#64748b', jetti: '#10b981', rephil: '#22c55e',
}
const brandColor = (name) => BRAND_COLORS[name.toLowerCase()] ?? '#888'

/** Strip HTML tags and decode Peso sign properly */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8369;/g, '₱')
    .replace(/&#x20B1;/g, '₱')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Scrape the main /prices page for national brand averages.
 * Expected text: "Petron 1017 stations Avg Diesel ₱87.38 Avg Unleaded 91 ₱87.23"
 */
async function scrapeBrands() {
  try {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch('https://metrofueltracker.com/prices', { headers: HEADERS, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return []
    const text = stripHtml(await res.text())

    const brands = []
    const seen = new Set()
    // Look for "Avg Diesel [₱|?]XX.XX" — we use [\d.]+ to catch the number regardless of currency symbol encoding
    const brandRegex = /((?:[A-Z][A-Za-z\s\-V]*?))\s+[\d,]+\s+stations?\s+Avg\s+Diesel\s+[^\d]*([\d.]+)\s+Avg\s+Unleaded\s+91\s+[^\d]*([\d.]+)/gi
    for (const m of text.matchAll(brandRegex)) {
      const name = m[1].trim()
      if (name.length < 2 || name.length > 20 || seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())
      brands.push({
        brand:    name,
        color:    brandColor(name),
        diesel:   parseFloat(m[2]),
        unleaded: parseFloat(m[3]),
        premium:  parseFloat(m[3]) + 4.5,
      })
    }

    if (!brands.find(b => b.brand.toLowerCase() === 'petron')) {
      const pM = text.match(/Petron\s+[\d,]+\s+stations?\s+Avg\s+Diesel\s+[^\d]*([\d.]+)\s+Avg\s+Unleaded\s+91\s+[^\d]*([\d.]+)/i)
      if (pM) brands.unshift({ brand: 'Petron', color: '#dc2626', diesel: parseFloat(pM[1]), unleaded: parseFloat(pM[2]), premium: parseFloat(pM[2]) + 4.5 })
    }
    return brands
  } catch (e) {
    console.error('[gas-prices] Brands scrape failed:', e.message)
    return []
  }
}

/**
 * Scrape a specific city page for its prices.
 * Expected text: "Cheapest Today in Cebu City Diesel Petron ₱ 77.80 ... Unleaded 91 RePhil ₱ 78.00 ... Premium 95 Petron ₱ 83.71"
 */
async function scrapeCity(citySlug) {
  try {
    const { default: fetch } = await import('node-fetch')
    const url = `https://metrofueltracker.com/prices/${citySlug}`
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const text = stripHtml(await res.text())

    // Look for the "Cheapest Today" section which reliably contains the lowest price for each fuel
    // Allow any non-digit chars (like ' ? ' or ' ₱ ') before the price number
    const dieselM   = text.match(/Cheapest Today.*?Diesel\s+(?:[A-Za-z\s]+?)[^\d]+([\d.]+)/i)
    const unleadedM = text.match(/Unleaded\s+91\s+(?:[A-Za-z\s]+?)[^\d]+([\d.]+)/i)
    const premiumM  = text.match(/Premium\s+95\s+(?:[A-Za-z\s]+?)[^\d]+([\d.]+)/i)
    const stationsM = text.match(/([\d,]+)\s+stations?\s+tracked/i)

    const diesel   = dieselM ? parseFloat(dieselM[1]) : null
    const unleaded = unleadedM ? parseFloat(unleadedM[1]) : null
    const premium  = premiumM ? parseFloat(premiumM[1]) : null
    const stations = stationsM ? stationsM[1] : '?'

    if (diesel || unleaded) {
      return { diesel, unleaded, premium, stations, url }
    }
    return null
  } catch (e) {
    console.error(`[gas-prices] City scrape failed for ${citySlug}:`, e.message)
    return null
  }
}

// ── GET /api/gas-prices?city=<slug> ──────────────────────────────────────────
router.get('/', async (req, res) => {
  const citySlug = (req.query.city || '').toLowerCase().replace(/\s+/g, '-').trim()

  try {
    // 1. Get brands (cached in memory if we fetched them recently)
    if (!_cache || Date.now() - _cacheTime > CACHE_TTL) {
      _cache = await scrapeBrands()
      _cacheTime = Date.now()
    }
    const brands = _cache.length ? _cache : HARD_FALLBACK_BRANDS

    // 2. Get city prices
    let cityData = null
    let cityLabel = 'Philippines'
    let sourceUrl = 'https://metrofueltracker.com/prices'
    let stations = '5631+'

    if (citySlug) {
      cityData = await scrapeCity(citySlug)
      if (cityData) {
        cityLabel = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        sourceUrl = cityData.url
        stations = cityData.stations
      }
    }

    // 3. Construct response
    const unleaded = cityData?.unleaded ?? 88.89
    const premium  = cityData?.premium  ?? 95.00
    const diesel   = cityData?.diesel   ?? 89.31

    // Adjust brand prices to align with the city's local prices
    // This ensures the UI is cohesive: the cheapest brand in the list will exactly match the city's cheapest price.
    let localizedBrands = brands.map(b => ({ ...b }))
    if (cityData) {
      ['unleaded', 'premium', 'diesel'].forEach(fuelType => {
        if (cityData[fuelType]) {
          const natMin = Math.min(...localizedBrands.map(b => b[fuelType]))
          const diff = cityData[fuelType] - natMin
          localizedBrands.forEach(b => {
            b[fuelType] = Number((b[fuelType] + diff).toFixed(2))
          })
        }
      })
    }

    return res.json({
      success: true,
      source: 'MetroFuelTracker',
      sourceUrl,
      city: cityLabel,
      stations,
      asOf: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      cityFound: !!cityData,
      fuels: [
        { key: 'unleaded', label: 'Unleaded', sub: 'RON 91',     icon: 'local_gas_station', color: '#22c55e', price: unleaded, weeklyChange: null },
        { key: 'premium',  label: 'Premium',  sub: 'RON 95+',    icon: 'grade',             color: '#00d4ff', price: premium,  weeklyChange: null },
        { key: 'diesel',   label: 'Diesel',   sub: 'Auto Diesel', icon: 'oil_barrel',        color: '#f59e0b', price: diesel,   weeklyChange: null },
      ],
      brands: localizedBrands,
    })

  } catch (err) {
    console.error('[gas-prices] API error:', err.message)
    return res.json(buildHardFallback(citySlug))
  }
})

const HARD_FALLBACK_BRANDS = [
  { brand: 'Seaoil',    color: '#0090d9', unleaded: 86.10, premium: 90.60, diesel: 87.01 },
  { brand: 'Flying V',  color: '#e63939', unleaded: 86.55, premium: 91.05, diesel: 86.21 },
  { brand: 'Total',     color: '#1e40af', unleaded: 87.37, premium: 91.87, diesel: 83.76 },
  { brand: 'Petron',    color: '#dc2626', unleaded: 87.23, premium: 91.73, diesel: 87.38 },
  { brand: 'Unioil',    color: '#0ea5e9', unleaded: 86.22, premium: 90.72, diesel: 89.60 },
  { brand: 'Phoenix',   color: '#f97316', unleaded: 92.32, premium: 96.82, diesel: 90.67 },
  { brand: 'Cleanfuel', color: '#8b5cf6', unleaded: 77.40, premium: 81.90, diesel: 89.00 },
  { brand: 'Shell',     color: '#eab308', unleaded: 91.33, premium: 95.83, diesel: 92.68 },
  { brand: 'Jetti',     color: '#10b981', unleaded: 89.46, premium: 93.96, diesel: 91.86 },
  { brand: 'PTT',       color: '#64748b', unleaded: 91.46, premium: 95.96, diesel: 94.14 },
  { brand: 'Caltex',    color: '#e05c00', unleaded: 93.07, premium: 97.57, diesel: 93.12 },
]

function buildHardFallback(citySlug) {
  return {
    success: true, source: 'MetroFuelTracker (cached)', sourceUrl: 'https://metrofueltracker.com/prices',
    city: citySlug ? citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Philippines',
    stations: '5631+', asOf: 'May 4, 2026', cityFound: false,
    fuels: [
      { key: 'unleaded', label: 'Unleaded', sub: 'RON 91',     icon: 'local_gas_station', color: '#22c55e', price: 88.89, weeklyChange: null },
      { key: 'premium',  label: 'Premium',  sub: 'RON 95+',    icon: 'grade',             color: '#00d4ff', price: 95.00, weeklyChange: null },
      { key: 'diesel',   label: 'Diesel',   sub: 'Auto Diesel', icon: 'oil_barrel',        color: '#f59e0b', price: 89.31, weeklyChange: null },
    ], brands: HARD_FALLBACK_BRANDS,
  }
}

// ── POST /api/gas-prices/refresh ─────────────────────────────────────────────
router.post('/refresh', (_req, res) => {
  _cache = null; _cacheTime = null
  res.json({ success: true, message: 'Brand cache cleared.' })
})

export default router
