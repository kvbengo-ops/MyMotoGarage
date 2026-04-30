/**
 * brandLogos.js
 * Brand identity map for each motorcycle make.
 * Uses Simple Icons CDN (HTTPS) where available, local SVGs as fallback.
 */

export const BRAND_META = {
  Yamaha: {
    abbrev: 'YMH',
    fullName: 'Yamaha',
    shortName: 'YAMAHA',
    color: '#1F2ABF',
    bgColor: 'rgba(31,42,191,0.15)',
    logo: '/logos/yamaha.svg',
  },
  Ducati: {
    abbrev: 'DUC',
    fullName: 'Ducati',
    shortName: 'DUCATI',
    color: '#E8000D',
    bgColor: 'rgba(232,0,13,0.15)',
    logo: 'https://cdn.simpleicons.org/ducati',
  },
  Honda: {
    abbrev: 'HRC',
    fullName: 'Honda',
    shortName: 'HONDA',
    color: '#CC0000',
    bgColor: 'rgba(204,0,0,0.15)',
    logo: 'https://cdn.simpleicons.org/honda',
  },
  Kawasaki: {
    abbrev: 'KWS',
    fullName: 'Kawasaki',
    shortName: 'KAWASAKI',
    color: '#00A651',
    bgColor: 'rgba(0,166,81,0.15)',
    logo: '/logos/kawasaki.svg',
  },
  Suzuki: {
    abbrev: 'SUZ',
    fullName: 'Suzuki',
    shortName: 'SUZUKI',
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.12)',
    logo: 'https://cdn.simpleicons.org/suzuki',
  },
  BMW: {
    abbrev: 'BMW',
    fullName: 'BMW',
    shortName: 'BMW',
    color: '#1C69D4',
    bgColor: 'rgba(28,105,212,0.15)',
    logo: 'https://cdn.simpleicons.org/bmw',
  },
  Triumph: {
    abbrev: 'TRI',
    fullName: 'Triumph',
    shortName: 'TRIUMPH',
    color: '#C8A951',
    bgColor: 'rgba(200,169,81,0.15)',
    logo: '/logos/triumph.svg',
  },
  KTM: {
    abbrev: 'KTM',
    fullName: 'KTM',
    shortName: 'KTM',
    color: '#FF6600',
    bgColor: 'rgba(255,102,0,0.15)',
    logo: 'https://cdn.simpleicons.org/ktm',
  },
  'Harley-Davidson': {
    abbrev: 'H-D',
    fullName: 'Harley-Davidson',
    shortName: 'HARLEY',
    color: '#FF6600',
    bgColor: 'rgba(255,102,0,0.15)',
    logo: '/logos/harley-davidson.svg',
  },
  Indian: {
    abbrev: 'IND',
    fullName: 'Indian',
    shortName: 'INDIAN',
    color: '#C8102E',
    bgColor: 'rgba(200,16,46,0.15)',
    logo: '/logos/indian.svg',
  },
  Aprilia: {
    abbrev: 'APR',
    fullName: 'Aprilia',
    shortName: 'APRILIA',
    color: '#B40000',
    bgColor: 'rgba(180,0,0,0.15)',
    logo: '/logos/aprilia.svg',
  },
  Other: {
    abbrev: '•••',
    fullName: 'Other',
    shortName: 'OTHER',
    color: '#888888',
    bgColor: 'rgba(136,136,136,0.12)',
    logo: null,
  },
}

export const MAKES = Object.keys(BRAND_META)
