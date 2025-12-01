import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getQuery, createError, defineEventHandler } from 'h3'
import type { H3Event } from 'h3'

interface CleanedDataSample {
  columns: string[]
  rows: Array<Record<string, string | number | null>>
  totalRows: number
  sampleSize: number
  statistics: {
    numeric: Record<
      string,
      {
        min: number
        max: number
        mean: number
        median: number
      }
    >
    categorical: Record<
      string,
      {
        uniqueCount: number
        topValues: Array<{ value: string; count: number }>
      }
    >
  }
}

export default defineEventHandler(
  async (event: H3Event): Promise<Array<Record<string, string | number | null>>> => {
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 10, 100)
    const offset = parseInt(query.offset as string) || 0

    const projectRoot = process.cwd()
    const cleanedPath = join(projectRoot, 'data', 'Mobiles_Dataset_Final.csv')
    const summaryPath = join(projectRoot, 'data', 'Mobiles_Dataset_Final_fixes_report.json')

    if (!existsSync(cleanedPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Cleaned dataset not found. Please run preprocessing first.',
      })
    }

    try {
      // Read cleaned CSV
      const csvContent = readFileSync(cleanedPath, 'utf-8')
      const lines = csvContent.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        throw new Error('Invalid CSV format')
      }

      // Parse header
      const header = lines[0] || ''
      const columns = header.split(',').map(col => col.trim().replace(/^"|"$/g, ''))

      // Parse data rows
      const dataLines = lines.slice(1)
      const totalRows = dataLines.length

      // Get requested sample
      const sampleLines = dataLines.slice(offset, offset + limit)
      const rows: Array<Record<string, string | number | null>> = []

      for (const line of sampleLines) {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, string | number | null> = {}

        columns.forEach((col, idx) => {
          const value = values[idx]
          if (!value || value === '' || value.toLowerCase() === 'nan') {
            row[col] = null
          } else {
            // Try to parse as number
            const num = parseFloat(value)
            if (!isNaN(num) && value.match(/^-?\d+\.?\d*$/)) {
              row[col] = num
            } else {
              row[col] = value
            }
          }
        })

        rows.push(row)
      }

      // Load statistics from summary if available
      let statistics: CleanedDataSample['statistics'] = {
        numeric: {},
        categorical: {},
      }

      if (existsSync(summaryPath)) {
        const summaryContent = readFileSync(summaryPath, 'utf-8')
        const summary = JSON.parse(summaryContent)

        // Add numeric statistics
        if (summary.numeric_ranges) {
          Object.entries(summary.numeric_ranges).forEach(([col, range]) => {
            const r = range as { min: number; max: number; mean: number; median: number }
            statistics.numeric[col] = {
              min: r.min,
              max: r.max,
              mean: r.mean,
              median: r.median,
            }
          })
        }

        // Calculate categorical statistics from sample data
        const categoricalColumns = ['company', 'model', 'processor']
        for (const col of categoricalColumns) {
          if (columns.includes(col)) {
            const values = dataLines
              .slice(0, Math.min(1000, dataLines.length)) // Sample first 1000 rows
              .map(line => {
                const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const idx = columns.indexOf(col)
                return vals[idx] || ''
              })
              .filter(v => v && v !== '')

            const uniqueCount = new Set(values).size

            // Count occurrences
            const counts: Record<string, number> = {}
            values.forEach(v => {
              counts[v] = (counts[v] || 0) + 1
            })

            // Get top 5 values
            const topValues = Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([value, count]) => ({ value, count }))

            statistics.categorical[col] = {
              uniqueCount,
              topValues,
            }
          }
        }
      }

      return rows
    } catch (error: unknown) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to read cleaned dataset: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }
)
