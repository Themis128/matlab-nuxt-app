import { readFileSync } from 'fs'
import { join } from 'path'

interface PhoneModel {
  modelName: string
  company: string
  price: number
  ram: number
  battery: number
  screenSize: number
  weight: number
  year: number
  frontCamera?: number
  backCamera?: number
  storage?: number
  processor?: string
  displayType?: string
  refreshRate?: number
  resolution?: string
}

interface ModelsByPriceResponse {
  models: PhoneModel[]
  totalCount: number
  priceRange: {
    min: number
    max: number
    requested: number
    tolerance: number
  }
  brands: string[]
}

export default defineEventHandler(async (event): Promise<ModelsByPriceResponse> => {
  try {
    const query = getQuery(event)
    const price = parseFloat(query.price as string)
    const tolerance = parseFloat((query.tolerance as string) || '0.2') // Default 20% tolerance
    const maxResults = parseInt((query.maxResults as string) || '100') // Limit results

    if (!price || isNaN(price) || price <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid price parameter. Please provide a valid price number.',
      })
    }

    // Calculate price range
    const minPrice = price * (1 - tolerance)
    const maxPrice = price * (1 + tolerance)

    // Find dataset file
    const projectRoot = process.cwd()
    const datasetPaths = [
      join(projectRoot, 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'preprocessed', 'preprocessed_data.csv'),
    ]

    let datasetContent: string | null = null
    let datasetPath: string | null = null

    for (const path of datasetPaths) {
      try {
        datasetContent = readFileSync(path, 'utf-8')
        datasetPath = path
        break
      } catch {
        continue
      }
    }

    if (!datasetContent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Dataset file not found',
      })
    }

    // Parse CSV (handle quoted values properly)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const lines = datasetContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Dataset file is empty or invalid',
      })
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())

    // Helper function to find column index
    const getColumnIndex = (exactName: string, fallbackNames: string[] = []): number => {
      const exactIdx = headers.findIndex(h => h === exactName)
      if (exactIdx !== -1) return exactIdx

      for (const fallback of fallbackNames) {
        const idx = headers.findIndex(h => h.toLowerCase().includes(fallback.toLowerCase()))
        if (idx !== -1) return idx
      }
      return -1
    }

    // Find column indices using exact names first, then fallbacks
    const modelNameIdx = getColumnIndex('Model Name', ['model'])
    const companyIdx = getColumnIndex('Company Name', ['company', 'brand'])
    const priceIdx = getColumnIndex('Launched Price (USA)', ['price', 'usd'])
    const ramIdx = getColumnIndex('RAM', ['ram'])
    const batteryIdx = getColumnIndex('Battery Capacity', ['battery'])
    const screenIdx = getColumnIndex('Screen Size', ['screen', 'display'])
    const weightIdx = getColumnIndex('Mobile Weight', ['weight'])
    const yearIdx = getColumnIndex('Launched Year', ['year', 'launched'])
    const frontCameraIdx = headers.findIndex(
      h => h.toLowerCase().includes('front') && h.toLowerCase().includes('camera')
    )
    const backCameraIdx = headers.findIndex(
      h => h.toLowerCase().includes('back') && h.toLowerCase().includes('camera')
    )
    const storageIdx = headers.findIndex(
      h => h.toLowerCase().includes('storage') || h.toLowerCase().includes('internal')
    )
    const processorIdx = headers.findIndex(h => h.toLowerCase().includes('processor'))
    const displayTypeIdx = headers.findIndex(
      h => h.toLowerCase().includes('display type') || h.toLowerCase().includes('screen type')
    )
    const refreshRateIdx = headers.findIndex(
      h => h.toLowerCase().includes('refresh') || h.toLowerCase().includes('hz')
    )
    const resolutionIdx = headers.findIndex(h => h.toLowerCase().includes('resolution'))

    // Helper to extract number from string (handles formats like "$999", "USD 799", "999", "1,199", "3,600mAh", etc.)
    const extractNumber = (str: string | undefined): number | null => {
      if (!str || str.trim() === '' || str.toLowerCase() === 'nan') return null

      // Remove common currency symbols (USD, $, PKR, INR, CNY, etc.), commas, spaces
      let cleaned = str
        .toString()
        .replace(/(USD|PKR|INR|CNY|AED|\$)/gi, '') // Remove currency codes
        .replace(/[$,\s]/g, '') // Remove $, commas, spaces

      // Remove units like "mAh", "GB", "MP", "g", "inches", etc.
      cleaned = cleaned.replace(/(mAh|GB|MP|g|inches|"|'|Hz|TB|MB)/gi, '')

      // Try to extract first number (handles formats like "$1,199", "USD 799", "1199", "3,600mAh", etc.)
      const match = cleaned.match(/(\d+\.?\d*)/)
      if (match) {
        const num = parseFloat(match[1])
        return isNaN(num) || num <= 0 ? null : num
      }
      return null
    }

    // Debug: Log column indices found
    console.log('Column indices:', {
      modelName: modelNameIdx,
      company: companyIdx,
      price: priceIdx,
      ram: ramIdx,
      battery: batteryIdx,
      screen: screenIdx,
      weight: weightIdx,
      year: yearIdx,
    })
    console.log('Price range:', { min: minPrice, max: maxPrice, requested: price })

    // Parse dataset and filter by price
    const models: PhoneModel[] = []
    const brandsSet = new Set<string>()
    let processedCount = 0
    let priceMatchCount = 0
    let missingRequiredCount = 0

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i] ?? ''
      const values = parseCSVLine(rawLine).map(v => v.replace(/^"|"$/g, '').trim())

      if (values.length < headers.length) continue
      processedCount++

      // Extract price
      const phonePrice = priceIdx !== -1 ? extractNumber(values[priceIdx]) : null
      if (!phonePrice) continue

      // Check price range
      if (phonePrice < minPrice || phonePrice > maxPrice) continue
      priceMatchCount++

      // Extract required fields
      const phoneRam = ramIdx !== -1 ? extractNumber(values[ramIdx]) : null
      const phoneBattery = batteryIdx !== -1 ? extractNumber(values[batteryIdx]) : null
      const phoneScreen = screenIdx !== -1 ? extractNumber(values[screenIdx]) : null
      const phoneWeight = weightIdx !== -1 ? extractNumber(values[weightIdx]) : null
      const phoneYear = yearIdx !== -1 ? extractNumber(values[yearIdx]) : null

      // Skip if required fields are missing
      if (!phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear) {
        missingRequiredCount++
        continue
      }

      // Filter out unrealistic values
      if (phoneRam < 1 || phoneRam > 24) continue
      if (phoneBattery < 1000 || phoneBattery > 10000) continue
      if (phoneScreen < 3 || phoneScreen > 10) continue
      if (phoneWeight < 50 || phoneWeight > 500) continue
      if (phoneYear < 2015 || phoneYear > 2025) continue

      const modelName = (modelNameIdx !== -1 ? values[modelNameIdx] : '') || 'Unknown Model'
      const company = (companyIdx !== -1 ? values[companyIdx] : '') || 'Unknown Brand'

      brandsSet.add(company)

      // Extract optional fields
      const frontCamera =
        frontCameraIdx !== -1 ? (extractNumber(values[frontCameraIdx]) ?? undefined) : undefined
      const backCamera =
        backCameraIdx !== -1 ? (extractNumber(values[backCameraIdx]) ?? undefined) : undefined
      const storage =
        storageIdx !== -1 ? (extractNumber(values[storageIdx]) ?? undefined) : undefined
      const processor = processorIdx !== -1 ? values[processorIdx] || undefined : undefined
      const displayType = displayTypeIdx !== -1 ? values[displayTypeIdx] || undefined : undefined
      const refreshRate =
        refreshRateIdx !== -1 ? (extractNumber(values[refreshRateIdx]) ?? undefined) : undefined
      const resolution = resolutionIdx !== -1 ? values[resolutionIdx] || undefined : undefined

      models.push({
        modelName,
        company,
        price: phonePrice,
        ram: phoneRam,
        battery: phoneBattery,
        screenSize: phoneScreen,
        weight: phoneWeight,
        year: phoneYear,
        frontCamera,
        backCamera,
        storage,
        processor,
        displayType,
        refreshRate,
        resolution,
      })
    }

    // Sort by price difference (closest to requested price first)
    models.sort((a, b) => {
      const diffA = Math.abs(a.price - price)
      const diffB = Math.abs(b.price - price)
      return diffA - diffB
    })

    // Limit results
    const limitedModels = models.slice(0, maxResults)

    // Debug logging
    console.log('Search results:', {
      processedRows: processedCount,
      priceMatches: priceMatchCount,
      missingRequired: missingRequiredCount,
      finalModels: models.length,
    })

    return {
      models: limitedModels,
      totalCount: models.length,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        requested: price,
        tolerance: tolerance,
      },
      brands: Array.from(brandsSet).sort(),
    }
  } catch (error: unknown) {
    if ((error as any)?.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to query models by price: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
