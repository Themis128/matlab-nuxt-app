import { readFileSync } from 'fs'
import { join } from 'path'

interface ColumnInfo {
  name: string
  dtype: string
  nonNull: number
  null: number
  nullPercentage: number
  unique: number
  sample: string[]
}

// DatasetAnalysis interface removed: it was unused in this module

export default defineEventHandler(async (): Promise<string[]> => {
  try {
    const projectRoot = process.cwd()
    const datasetPaths = [
      join(projectRoot, 'data', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'preprocessed', 'preprocessed_data.csv'),
    ]

    let datasetPath: string | null = null
    let datasetContent: string | null = null

    for (const path of datasetPaths) {
      try {
        datasetContent = readFileSync(path, 'utf-8')
        datasetPath = path
        break
      } catch {
        continue
      }
    }

    if (!datasetContent || !datasetPath) {
      return []
    }

    // Simple CSV parsing - split by comma and handle basic quotes
    const parseCSVLine = (line: string): string[] => {
      // Simple approach: split by comma but be careful with quoted fields
      if (line.includes('"')) {
        // For quoted fields, use a basic parser
        const result: string[] = []
        let current = ''
        let inQuotes = false
        let i = 0

        while (i < line.length) {
          const char = line[i]
          if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
              // Escaped quote
              current += '"'
              i += 2
              continue
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
          i++
        }
        result.push(current.trim())
        return result
      } else {
        // Simple comma splitting for non-quoted lines
        return line.split(',').map(field => field.trim())
      }
    }

    const lines = datasetContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('Invalid dataset format')
    }

    // Parse header
    const firstLine = lines[0] || ''
    const headers = parseCSVLine(firstLine).map(h => h.replace(/^"|"$/g, '').trim())
    const dataRows = lines.slice(1).filter(row => row.trim())

    // Analyze each column
    const columns: ColumnInfo[] = []
    const columnData: Record<string, string[]> = {}

    // Initialize column data
    headers.forEach(header => {
      columnData[header] = []
    })

    // Parse data rows (sample first 500 rows for performance)
    const sampleSize = Math.min(500, dataRows.length)
    for (let i = 0; i < sampleSize; i++) {
      try {
        const row = dataRows[i] || ''
        const values = parseCSVLine(row)
        headers.forEach((header, idx) => {
          const headerData = columnData[header]
          if (headerData && values[idx] !== undefined) {
            headerData.push(values[idx]?.replace(/^"|"$/g, '')?.trim() || '')
          }
        })
      } catch (error) {
        // Skip problematic rows
        console.warn(`Skipping row ${i} due to parsing error:`, error)
      }
    }

    // Analyze columns
    headers.forEach(header => {
      const values = columnData[header] || []
      const nonNull = values.filter(v => v && v !== '' && v.toLowerCase() !== 'nan').length
      const nullCount = values.length - nonNull
      const nullPercentage = values.length > 0 ? (nullCount / values.length) * 100 : 0

      // Get unique values
      const uniqueSet = new Set(values.filter(v => v && v !== ''))
      const unique = uniqueSet.size

      // Get sample values
      const sample = Array.from(uniqueSet)
        .slice(0, 3)
        .map(v => {
          if (!v) return ''
          const str = String(v)
          return str.length > 50 ? str.substring(0, 50) + '...' : str
        })

      // Determine data type
      let dtype = 'string'
      const numericValues = values.filter(v => v && v !== '').slice(0, 100)
      if (numericValues.length > 0) {
        const numericCount = numericValues.filter(
          v => v && /^-?\d+\.?\d*$/.test(v.replace(/,/g, ''))
        ).length
        if (numericValues.length > 0 && numericCount / numericValues.length > 0.8) {
          dtype = 'numeric'
        }
      }

      columns.push({
        name: header,
        dtype,
        nonNull,
        null: nullCount,
        nullPercentage: Math.round(nullPercentage * 10) / 10,
        unique,
        sample,
      })
    })

    // Check for specific features
    const featureChecks: Record<string, string[]> = {
      RAM: ['RAM', 'ram', 'Ram'],
      Battery: ['Battery Capacity', 'BatteryCapacity', 'Battery_Capacity', 'battery'],
      'Screen Size': ['Screen Size', 'ScreenSize', 'Screen_Size', 'screen'],
      Weight: ['Mobile Weight', 'MobileWeight', 'Mobile_Weight', 'Weight', 'weight'],
      Year: ['Launched Year', 'LaunchedYear', 'Launched_Year', 'Year', 'year'],
      Company: ['Company Name', 'CompanyName', 'Company_Name', 'Company', 'company'],
      Price: [
        'Launched Price (USA)',
        'LaunchedPrice_USA',
        'Price_USA',
        'Price_USD',
        'Price',
        'price',
      ],
      'Front Camera': ['Front Camera', 'FrontCamera', 'Front_Camera', 'FrontCamera_MP'],
      'Back Camera': ['Back Camera', 'BackCamera', 'Back_Camera', 'BackCamera_MP'],
      Processor: ['Processor', 'processor', 'Processor_Name', 'ProcessorName'],
      Storage: ['Storage', 'storage', 'Internal Storage', 'InternalStorage'],
      'Model Name': ['Model Name', 'ModelName', 'Model_Name', 'model'],
      'Price (Pakistan)': ['Price (Pakistan)', 'Price_Pakistan', 'Pakistan_Price'],
      'Price (India)': ['Price (India)', 'Price_India', 'India_Price'],
      'Price (China)': ['Price (China)', 'Price_China', 'China_Price'],
      'Price (Dubai)': ['Price (Dubai)', 'Price_Dubai', 'Dubai_Price'],
    }

    const foundFeatures: Record<string, { column: string; count: number; percentage: number }> = {}
    const missingFeatures: string[] = []

    Object.entries(featureChecks).forEach(([featureName, possibleNames]) => {
      let found = false
      let matchingCol: string | null = null

      for (const col of headers) {
        const colLower = col.toLowerCase()
        for (const possible of possibleNames) {
          if (
            colLower.includes(possible.toLowerCase()) ||
            possible.toLowerCase().includes(colLower)
          ) {
            found = true
            matchingCol = col
            break
          }
        }
        if (found) break
      }

      if (found && matchingCol) {
        const colInfo = columns.find(c => c.name === matchingCol)
        if (colInfo && dataRows.length > 0) {
          foundFeatures[featureName] = {
            column: matchingCol,
            count: colInfo.nonNull,
            percentage: Math.round((colInfo.nonNull / dataRows.length) * 100 * 10) / 10,
          }
        }
      } else {
        missingFeatures.push(featureName)
      }
    })

    // Generate recommendations
    const _recommendations = {
      cameraAvailable: 'Front Camera' in foundFeatures && 'Back Camera' in foundFeatures,
      storageAvailable: 'Storage' in foundFeatures || 'Model Name' in foundFeatures,
      processorAvailable: 'Processor' in foundFeatures,
      regionalPricesAvailable: [
        'Price (Pakistan)',
        'Price (India)',
        'Price (China)',
        'Price (Dubai)',
      ].some(p => p in foundFeatures),
    }

    return columns.map(c => c.name)
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze dataset: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
