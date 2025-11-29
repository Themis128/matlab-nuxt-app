import { readFileSync, existsSync } from 'fs'
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
  imageUrl?: string
}

export default defineEventHandler(async (event): Promise<PhoneModel | null> => {
  try {
    const modelName = getRouterParam(event, 'name')

    if (!modelName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Model name parameter is required',
      })
    }

    // Find dataset file
    const projectRoot = process.cwd()
    const datasetPaths = [
      join(projectRoot, 'data', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'preprocessed', 'preprocessed_data.csv'),
    ]

    let datasetContent: string | null = null

    for (const path of datasetPaths) {
      try {
        datasetContent = readFileSync(path, 'utf-8')
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

    // Parse CSV
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
    const firstLine = lines[0] || ''
    const headers = parseCSVLine(firstLine).map(h => h.replace(/^"|"$/g, '').trim())

    // Find column indices
    const getColumnIndex = (exactName: string, fallbackNames: string[] = []): number => {
      const exactIdx = headers.findIndex(h => h === exactName)
      if (exactIdx !== -1) return exactIdx

      for (const fallback of fallbackNames) {
        const idx = headers.findIndex(h => h && h.toLowerCase().includes(fallback.toLowerCase()))
        if (idx !== -1) return idx
      }
      return -1
    }

    const modelNameIdx = getColumnIndex('Model Name', ['model'])
    const companyIdx = getColumnIndex('Company Name', ['company', 'brand'])
    const priceIdx = getColumnIndex('Launched Price (USA)', ['price', 'usd'])
    const ramIdx = getColumnIndex('RAM', ['ram'])
    const batteryIdx = getColumnIndex('Battery Capacity', ['battery'])
    const screenIdx = getColumnIndex('Screen Size', ['screen', 'display'])
    const weightIdx = getColumnIndex('Mobile Weight', ['weight'])
    const yearIdx = getColumnIndex('Launched Year', ['year', 'launched'])
    const frontCameraIdx = getColumnIndex('Front Camera', ['front', 'camera'])
    const backCameraIdx = getColumnIndex('Back Camera', ['back', 'camera'])
    const storageIdx = getColumnIndex('Storage', ['storage', 'internal'])
    const processorIdx = getColumnIndex('Processor', ['processor'])
    const displayTypeIdx = getColumnIndex('Display Type', ['display type', 'screen type'])
    const refreshRateIdx = getColumnIndex('Refresh Rate', ['refresh', 'hz'])
    const resolutionIdx = getColumnIndex('Resolution', ['resolution'])

    // Helper to extract number
    const extractNumber = (str: string): number | null => {
      if (!str || str.trim() === '' || str.toLowerCase() === 'nan') return null
      const cleaned = str
        .toString()
        .replace(/(USD|PKR|INR|CNY|AED|\$)/gi, '')
        .replace(/[$,\s]/g, '')
        .replace(/(mAh|GB|MP|g|inches|"|'|Hz|TB|MB)/gi, '')
      const match = cleaned.match(/(\d+\.?\d*)/)
      if (match && match[1]) {
        const num = parseFloat(match[1])
        return isNaN(num) || num <= 0 ? null : num
      }
      return null
    }

    // Search for model (case-insensitive, partial match)
    const searchName = modelName.toLowerCase().trim()

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i] || ''
      const values = parseCSVLine(row).map(v => v.replace(/^"|"$/g, '').trim())

      if (values.length < headers.length) continue

      const modelNameValue = modelNameIdx !== -1 ? values[modelNameIdx] : ''
      const currentModelName = modelNameValue ? modelNameValue.toLowerCase() : ''

      // Check if model name matches (exact or contains)
      if (!currentModelName.includes(searchName) && !searchName.includes(currentModelName)) {
        continue
      }

      // Extract all fields
      const phonePrice =
        priceIdx !== -1 && values[priceIdx] ? extractNumber(values[priceIdx]) : null
      const phoneRam = ramIdx !== -1 && values[ramIdx] ? extractNumber(values[ramIdx]) : null
      const phoneBattery =
        batteryIdx !== -1 && values[batteryIdx] ? extractNumber(values[batteryIdx]) : null
      const phoneScreen =
        screenIdx !== -1 && values[screenIdx] ? extractNumber(values[screenIdx]) : null
      const phoneWeight =
        weightIdx !== -1 && values[weightIdx] ? extractNumber(values[weightIdx]) : null
      const phoneYear = yearIdx !== -1 && values[yearIdx] ? extractNumber(values[yearIdx]) : null

      if (!phonePrice || !phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear) {
        continue
      }

      const company =
        (companyIdx !== -1 && values[companyIdx] ? values[companyIdx] : '') || 'Unknown Brand'
      const modelNameFull =
        (modelNameIdx !== -1 && values[modelNameIdx] ? values[modelNameIdx] : '') || 'Unknown Model'

      // Check for image (try different extensions)
      const imageBaseName = modelNameFull.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
      const imageDir = join(projectRoot, 'public', 'mobile_images')
      const imageExtensions = ['.jpg', '.jpeg', '.png']

      let imageUrl: string | undefined = undefined
      for (const ext of imageExtensions) {
        const imagePath = join(imageDir, `${imageBaseName}${ext}`)
        if (existsSync(imagePath)) {
          imageUrl = `/mobile_images/${imageBaseName}${ext}`
          break
        }
      }

      // Extract optional fields with proper null checks
      const frontCamera =
        frontCameraIdx !== -1 && values[frontCameraIdx]
          ? extractNumber(values[frontCameraIdx]) || undefined
          : undefined

      const backCamera =
        backCameraIdx !== -1 && values[backCameraIdx]
          ? extractNumber(values[backCameraIdx]) || undefined
          : undefined

      const storage =
        storageIdx !== -1 && values[storageIdx]
          ? extractNumber(values[storageIdx]) || undefined
          : undefined

      const processor =
        processorIdx !== -1 && values[processorIdx] ? values[processorIdx] || undefined : undefined

      const displayType =
        displayTypeIdx !== -1 && values[displayTypeIdx]
          ? values[displayTypeIdx] || undefined
          : undefined

      const refreshRate =
        refreshRateIdx !== -1 && values[refreshRateIdx]
          ? extractNumber(values[refreshRateIdx]) || undefined
          : undefined

      const resolution =
        resolutionIdx !== -1 && values[resolutionIdx]
          ? values[resolutionIdx] || undefined
          : undefined

      return {
        modelName: modelNameFull,
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
        imageUrl,
      }
    }

    // Model not found
    throw createError({
      statusCode: 404,
      statusMessage: `Model "${modelName}" not found in dataset`,
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get model details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
