import { readFileSync } from 'fs'
import { join } from 'path'

interface DatasetStatistics {
  // Keep legacy 'totalRecords' but add 'totalModels' for compatibility with tests
  totalRecords: number
  totalModels?: number
  columns: string[]
  companies: string[]
  // Add 'brands' key alias for compatibility
  brands?: string[]
  yearRange: { min: number; max: number }
  priceRange: { min: number; max: number; avg: number }
  ramRange: { min: number; max: number; avg: number }
  batteryRange: { min: number; max: number; avg: number }
  screenRange: { min: number; max: number; avg: number }
  companyDistribution: Record<string, number>
  yearDistribution: Record<string, number>
}

export default defineEventHandler(async (): Promise<DatasetStatistics> => {
  try {
    const projectRoot = process.cwd()
    const csvPath = join(projectRoot, 'data', 'Mobiles Dataset (2025).csv')

    // Read CSV file
    const csvContent = readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows')
    }

    // Parse header
    const firstLine = lines[0] || ''
    const headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    // Initialize statistics
    const stats: DatasetStatistics = {
      totalRecords: dataRows.length,
      columns: headers,
      companies: [],
      yearRange: { min: Infinity, max: -Infinity },
      priceRange: { min: Infinity, max: -Infinity, avg: 0 },
      ramRange: { min: Infinity, max: -Infinity, avg: 0 },
      batteryRange: { min: Infinity, max: -Infinity, avg: 0 },
      screenRange: { min: Infinity, max: -Infinity, avg: 0 },
      companyDistribution: {},
      yearDistribution: {},
    }

    // Find column indices
    const companyIdx = headers.findIndex(
      h => h && (h.toLowerCase().includes('company') || h.toLowerCase().includes('brand'))
    )
    const yearIdx = headers.findIndex(
      h => h && (h.toLowerCase().includes('year') || h.toLowerCase().includes('launched'))
    )
    const priceIdx = headers.findIndex(
      h => h && (h.toLowerCase().includes('price') || h.toLowerCase().includes('usd'))
    )
    const ramIdx = headers.findIndex(h => h && h.toLowerCase() === 'ram')
    const batteryIdx = headers.findIndex(h => h && h.toLowerCase().includes('battery'))
    const screenIdx = headers.findIndex(
      h => h && (h.toLowerCase().includes('screen') || h.toLowerCase().includes('display'))
    )

    // Parse data
    let priceSum = 0
    let ramSum = 0
    let batterySum = 0
    let screenSum = 0
    let validPriceCount = 0
    let validRamCount = 0
    let validBatteryCount = 0
    let validScreenCount = 0

    for (const row of dataRows) {
      if (!row.trim()) continue

      const values = row.split(',').map(v => v.trim().replace(/"/g, ''))

      // Parse company
      if (companyIdx >= 0 && values[companyIdx]) {
        const company = values[companyIdx]
        if (!stats.companies.includes(company)) {
          stats.companies.push(company)
        }
        stats.companyDistribution[company] = (stats.companyDistribution[company] || 0) + 1
      }

      // Parse year
      if (yearIdx >= 0 && values[yearIdx]) {
        const year = parseInt(values[yearIdx])
        if (!isNaN(year)) {
          stats.yearRange.min = Math.min(stats.yearRange.min, year)
          stats.yearRange.max = Math.max(stats.yearRange.max, year)
          const yearStr = year.toString()
          stats.yearDistribution[yearStr] = (stats.yearDistribution[yearStr] || 0) + 1
        }
      }

      // Parse price (extract number from string like "$999" or "999")
      if (priceIdx >= 0 && values[priceIdx]) {
        const priceStr = values[priceIdx].replace(/[^0-9.]/g, '')
        const price = parseFloat(priceStr)
        if (!isNaN(price) && price > 0) {
          stats.priceRange.min = Math.min(stats.priceRange.min, price)
          stats.priceRange.max = Math.max(stats.priceRange.max, price)
          priceSum += price
          validPriceCount++
        }
      }

      // Parse RAM (extract number from string like "8 GB" or "8")
      if (ramIdx >= 0 && values[ramIdx]) {
        const ramStr = values[ramIdx].replace(/[^0-9.]/g, '')
        const ram = parseFloat(ramStr)
        if (!isNaN(ram) && ram > 0) {
          stats.ramRange.min = Math.min(stats.ramRange.min, ram)
          stats.ramRange.max = Math.max(stats.ramRange.max, ram)
          ramSum += ram
          validRamCount++
        }
      }

      // Parse battery (extract number from string like "4000 mAh" or "4000")
      if (batteryIdx >= 0 && values[batteryIdx]) {
        const batteryStr = values[batteryIdx].replace(/[^0-9.]/g, '')
        const battery = parseFloat(batteryStr)
        if (!isNaN(battery) && battery > 0) {
          stats.batteryRange.min = Math.min(stats.batteryRange.min, battery)
          stats.batteryRange.max = Math.max(stats.batteryRange.max, battery)
          batterySum += battery
          validBatteryCount++
        }
      }

      // Parse screen size (extract number from string like "6.1 inches" or "6.1")
      if (screenIdx >= 0 && values[screenIdx]) {
        const screenStr = values[screenIdx].replace(/[^0-9.]/g, '')
        const screen = parseFloat(screenStr)
        if (!isNaN(screen) && screen > 0) {
          stats.screenRange.min = Math.min(stats.screenRange.min, screen)
          stats.screenRange.max = Math.max(stats.screenRange.max, screen)
          screenSum += screen
          validScreenCount++
        }
      }
    }

    // Calculate averages
    if (validPriceCount > 0) {
      stats.priceRange.avg = Math.round(priceSum / validPriceCount)
    }
    if (validRamCount > 0) {
      stats.ramRange.avg = Math.round((ramSum / validRamCount) * 10) / 10
    }
    if (validBatteryCount > 0) {
      stats.batteryRange.avg = Math.round(batterySum / validBatteryCount)
    }
    if (validScreenCount > 0) {
      stats.screenRange.avg = Math.round((screenSum / validScreenCount) * 10) / 10
    }

    // Fix infinity values
    if (stats.priceRange.min === Infinity) stats.priceRange.min = 0
    if (stats.priceRange.max === -Infinity) stats.priceRange.max = 0
    if (stats.ramRange.min === Infinity) stats.ramRange.min = 0
    if (stats.ramRange.max === -Infinity) stats.ramRange.max = 0
    if (stats.batteryRange.min === Infinity) stats.batteryRange.min = 0
    if (stats.batteryRange.max === -Infinity) stats.batteryRange.max = 0
    if (stats.screenRange.min === Infinity) stats.screenRange.min = 0
    if (stats.screenRange.max === -Infinity) stats.screenRange.max = 0
    if (stats.yearRange.min === Infinity) stats.yearRange.min = 2020
    if (stats.yearRange.max === -Infinity) stats.yearRange.max = 2025

    // Add compatibility keys
    return {
      ...stats,
      totalModels: stats.totalRecords,
      brands: stats.companies,
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to read dataset statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
