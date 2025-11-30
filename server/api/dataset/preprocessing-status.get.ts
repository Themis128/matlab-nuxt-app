import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface PreprocessingStatus {
  cleanedDatasetExists: boolean
  originalDatasetExists: boolean
  summaryReportExists: boolean
  preprocessingReportExists: boolean
  cleanedDataset: {
    path: string | null
    rows: number
    columns: number
    columnNames: string[]
    missingValues: Record<string, number>
    dataQuality: {
      completeness: number
      accuracy: string
      overallScore: number
    }
  }
  recommendations: string[]
  nextSteps: string[]
}

export default defineEventHandler(async (): Promise<PreprocessingStatus> => {
  const projectRoot = process.cwd()

  const paths = {
    cleaned: join(projectRoot, 'data', 'Mobiles_Dataset_Final.csv'),
    original: join(projectRoot, 'data', 'Mobiles Dataset (2025).csv'),
    summary: join(projectRoot, 'data', 'Mobiles_Dataset_Final_fixes_report.json'),
    report: join(projectRoot, 'data', 'preprocessing_report.json'),
  }

  const status: PreprocessingStatus = {
    cleanedDatasetExists: existsSync(paths.cleaned),
    originalDatasetExists: existsSync(paths.original),
    summaryReportExists: existsSync(paths.summary),
    preprocessingReportExists: existsSync(paths.report),
    cleanedDataset: {
      path: null,
      rows: 0,
      columns: 0,
      columnNames: [],
      missingValues: {},
      dataQuality: {
        completeness: 0,
        accuracy: 'Unknown',
        overallScore: 0,
      },
    },
    recommendations: [],
    nextSteps: [],
  }

  // Load summary if available
  if (status.summaryReportExists) {
    try {
      const summaryContent = readFileSync(paths.summary, 'utf-8')
      const summary = JSON.parse(summaryContent)

      status.cleanedDataset = {
        path: paths.cleaned,
        rows: summary.final_rows || 0,
        columns: summary.columns?.length || 0,
        columnNames: summary.columns || [],
        missingValues: summary.missing_values || {},
        dataQuality: {
          completeness: calculateCompleteness(summary.missing_values, summary.final_rows),
          accuracy: determineAccuracy(summary.numeric_ranges),
          overallScore: 89, // From preprocessing report
        },
      }

      // Generate recommendations based on missing values
      const missingValues = summary.missing_values || {}
      Object.entries(missingValues).forEach(([col, count]) => {
        const numCount = count as number
        if (numCount > 0) {
          const percentage = ((numCount / summary.final_rows) * 100).toFixed(1)
          if (numCount > 100) {
            status.recommendations.push(
              `High missing values in ${col}: ${numCount} (${percentage}%) - requires imputation`
            )
          } else if (numCount > 0) {
            status.recommendations.push(
              `Missing values in ${col}: ${numCount} (${percentage}%) - minor imputation needed`
            )
          }
        }
      })

      // Check for outliers in numeric ranges
      const ranges = summary.numeric_ranges || {}
      if (ranges.ram && ranges.ram.max > 24) {
        status.recommendations.push(
          `RAM outliers detected: Max ${ranges.ram.max}GB exceeds realistic range (1-24GB)`
        )
      }
      if (ranges.back_camera && ranges.back_camera.max > 200) {
        status.recommendations.push(
          `Back camera outliers detected: Max ${ranges.back_camera.max}MP - likely data entry errors`
        )
      }
      if (ranges.front_camera && ranges.front_camera.max > 60) {
        status.recommendations.push(
          `Front camera outliers detected: Max ${ranges.front_camera.max}MP - requires validation`
        )
      }
      if (ranges.price_usd && ranges.price_usd.max > 5000) {
        status.recommendations.push(
          `Price outliers detected: Max $${ranges.price_usd.max} - review high-priced entries`
        )
      }

      // Next steps
      if (status.recommendations.length > 0) {
        status.nextSteps.push('Handle outliers in RAM, cameras, and prices')
      }
      if (missingValues.storage && (missingValues.storage as number) > 50) {
        status.nextSteps.push('Impute missing storage values (extract from model names)')
      }
      status.nextSteps.push('Feature engineering: brand tiers, age, price ratios')
      status.nextSteps.push('Encode categorical variables for ML models')
      status.nextSteps.push('Train-test split and model training')
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  return status
})

function calculateCompleteness(missingValues: Record<string, number>, totalRows: number): number {
  if (!missingValues || totalRows === 0) return 100

  const totalMissing = Object.values(missingValues).reduce((sum, count) => sum + count, 0)
  const totalCells = totalRows * Object.keys(missingValues).length
  const completeness = ((totalCells - totalMissing) / totalCells) * 100

  return Math.round(completeness * 10) / 10
}

function determineAccuracy(ranges: Record<string, { min: number; max: number }>): string {
  if (!ranges) return 'Unknown'

  let hasOutliers = false

  if (ranges.ram && ranges.ram.max > 24) hasOutliers = true
  if (ranges.back_camera && ranges.back_camera.max > 200) hasOutliers = true
  if (ranges.front_camera && ranges.front_camera.max > 60) hasOutliers = true
  if (ranges.price_usd && ranges.price_usd.max > 10000) hasOutliers = true

  if (hasOutliers) return 'Moderate (outliers detected)'
  return 'Good'
}
