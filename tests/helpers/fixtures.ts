/**
 * Test fixtures and mock data for Playwright tests
 */

export interface PhoneSpecsFixture {
  ram: number
  battery: number
  screen: number
  weight: number
  year: number
  price: number
  company?: string
  frontCamera?: number
  backCamera?: number
  processor?: string
  storage?: number
}

/**
 * Valid phone specifications for testing
 */
export const validPhoneSpecs: PhoneSpecsFixture = {
  ram: 8,
  battery: 4000,
  screen: 6.1,
  weight: 174,
  year: 2024,
  price: 999,
  company: 'Samsung',
  frontCamera: 12,
  backCamera: 48,
  processor: 'Snapdragon 8 Gen 2',
  storage: 128
}

/**
 * Alternative valid specs for comparison tests
 */
export const validPhoneSpecs2: PhoneSpecsFixture = {
  ram: 12,
  battery: 5000,
  screen: 6.7,
  weight: 200,
  year: 2024,
  price: 1299,
  company: 'Apple',
  frontCamera: 12,
  backCamera: 48,
  processor: 'A17 Pro',
  storage: 256
}

/**
 * Budget phone specs
 */
export const budgetPhoneSpecs: PhoneSpecsFixture = {
  ram: 4,
  battery: 3000,
  screen: 5.5,
  weight: 150,
  year: 2023,
  price: 299,
  company: 'Xiaomi',
  frontCamera: 8,
  backCamera: 13,
  storage: 64
}

/**
 * Flagship phone specs
 */
export const flagshipPhoneSpecs: PhoneSpecsFixture = {
  ram: 16,
  battery: 5500,
  screen: 6.8,
  weight: 220,
  year: 2025,
  price: 1599,
  company: 'Samsung',
  frontCamera: 16,
  backCamera: 200,
  processor: 'Snapdragon 8 Gen 3',
  storage: 512
}

/**
 * Invalid specs for negative testing
 */
export const invalidPhoneSpecs: Partial<PhoneSpecsFixture>[] = [
  { ram: -1, battery: 4000, screen: 6.1, weight: 174, year: 2024, price: 999 }, // negative RAM
  { ram: 8, battery: 0, screen: 6.1, weight: 174, year: 2024, price: 999 }, // zero battery
  { ram: 8, battery: 4000, screen: 0, weight: 174, year: 2024, price: 999 }, // zero screen
  { ram: 8, battery: 4000, screen: 6.1, weight: 0, year: 2024, price: 999 }, // zero weight
  { ram: 8, battery: 4000, screen: 6.1, weight: 174, year: 1990, price: 999 }, // old year
  { ram: 8, battery: 4000, screen: 6.1, weight: 174, year: 2024, price: -100 }, // negative price
]

/**
 * Search filter combinations for testing
 */
export const searchFilters = {
  priceRange: {
    minPrice: 300,
    maxPrice: 1000
  },
  ramRange: {
    minRam: 6,
    maxRam: 12
  },
  batteryRange: {
    minBattery: 3500,
    maxBattery: 5000
  },
  screenRange: {
    minScreen: 6.0,
    maxScreen: 6.5
  },
  brands: ['Samsung', 'Apple', 'Xiaomi'],
  years: [2023, 2024, 2025]
}

/**
 * Expected API response shapes
 */
export interface PredictionResponse {
  price?: number
  ram?: number
  battery?: number
  brand?: string
}

export interface SearchResponse {
  models: any[]
  totalCount: number
  offset: number
  limit: number
}

export interface ModelsByPriceResponse {
  models: any[]
  totalCount: number
  priceRange: {
    min: number
    max: number
    requested: number
    tolerance: number
  }
  brands: string[]
}

/**
 * Test timeout values
 */
export const timeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  api: 15000,
  matlab: 60000 // MATLAB predictions can be slow
}

/**
 * Common test URLs
 */
export const urls = {
  home: '/',
  demo: '/demo',
  search: '/search',
  recommendations: '/recommendations',
  compare: '/compare',
  apiDocs: '/api-docs'
}
