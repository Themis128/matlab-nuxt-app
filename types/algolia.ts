export interface AlgoliaRecord {
  objectID: string
  title: string
  brand?: string
  price: number
  ram?: number
  battery?: number
  screen?: number
  storage?: number
  processor?: string
  year?: number
  [key: string]: any
}
