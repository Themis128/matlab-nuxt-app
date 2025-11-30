import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface DataQualityReport {
  overview: {
    totalRows: number
    totalColumns: number
    cleanedDatasetAvailable: boolean
  }
  missingValues: Array<{
    column: string
    count: number
    percentage: number
    severity: 'low' | 'moderate' | 'high'
  }>
  outliers: Array<{
    column: string
    issue: string
    currentRange: string
    expectedRange: string
    severity: 'warning' | 'critical'
  }>
  dataTypes: Record<string, string>
  recommendations: string[]
  qualityScores: {
    completeness: number
    consistency: number
    accuracy: number
    overall: number
  }
  eurPrices: {
    available: boolean
    range: string
    median: number
  }
}

export default defineEventHandler(async (): Promise<DataQualityReport> => {
  const projectRoot = process.cwd()
  const summaryPath = join(projectRoot, 'data', 'Mobiles_Dataset_Final_fixes_report.json')

  if (!existsSync(summaryPath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cleaned dataset summary not found. Please run fix_dataset_issues.py first.',
    })
  }

  try {
    const summaryContent = readFileSync(summaryPath, 'utf-8')
    const summary = JSON.parse(summaryContent)

    const finalStats = summary.final_stats || {}
    const numericRanges = finalStats.numeric_ranges || {}

    // Analyze missing values
    const missingValues = Object.entries(finalStats.missing_values || {})
      .filter(([_, count]) => (count as number) > 0)
      .map(([column, count]) => {
        const numCount = count as number
        const percentage = (numCount / finalStats.total_rows) * 100
        let severity: 'low' | 'moderate' | 'high' = 'low'

        if (percentage > 10) severity = 'high'
        else if (percentage > 1) severity = 'moderate'

        return {
          column,
          count: numCount,
          percentage: Math.round(percentage * 10) / 10,
          severity,
        }
      })
      .sort((a, b) => b.count - a.count)

    // Check for outliers (should be fixed now)
    const outliers: DataQualityReport['outliers'] = []

    if (numericRanges.ram && numericRanges.ram.max > 24) {
      outliers.push({
        column: 'ram',
        issue: `Maximum value ${numericRanges.ram.max}GB exceeds realistic range`,
        currentRange: `${numericRanges.ram.min}-${numericRanges.ram.max} GB`,
        expectedRange: '1-24 GB',
        severity: 'critical',
      })
    }

    if (numericRanges.back_camera && numericRanges.back_camera.max > 200) {
      outliers.push({
        column: 'back_camera',
        issue: `Maximum value ${numericRanges.back_camera.max}MP is physically impossible`,
        currentRange: `${numericRanges.back_camera.min}-${numericRanges.back_camera.max} MP`,
        expectedRange: '5-200 MP',
        severity: 'critical',
      })
    }

    if (numericRanges.front_camera && numericRanges.front_camera.max > 60) {
      outliers.push({
        column: 'front_camera',
        issue: `Maximum value ${numericRanges.front_camera.max}MP exceeds realistic range`,
        currentRange: `${numericRanges.front_camera.min}-${numericRanges.front_camera.max} MP`,
        expectedRange: '2-60 MP',
        severity: 'warning',
      })
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (outliers.length === 0) {
      recommendations.push('✅ All critical outliers have been fixed!')
    } else {
      const criticalOutliers = outliers.filter(o => o.severity === 'critical')
      if (criticalOutliers.length > 0) {
        recommendations.push(
          `Fix critical outliers in: ${criticalOutliers.map(o => o.column).join(', ')}`
        )
      }
    }

    if (missingValues.length > 0) {
      const highMissing = missingValues.filter(m => m.severity === 'high')
      if (highMissing.length > 0) {
        recommendations.push(
          `Impute ${highMissing.length} column(s) with high missing values: ${highMissing.map(m => m.column).join(', ')}`
        )
      }
    }

    if (finalStats.columns && finalStats.columns.includes('price_eur')) {
      recommendations.push('✅ EUR prices available - use for European market analysis')
    }
    recommendations.push('Add derived feature: phone age (2025 - year)')
    recommendations.push('Add brand tier classification (budget/mid/premium)')

    // Calculate quality scores
    const totalMissing = Object.values(finalStats.missing_values || {}).reduce(
      (sum: number, count) => sum + (count as number),
      0
    )
    const totalCells = finalStats.total_rows * finalStats.columns.length
    const completeness = ((totalCells - totalMissing) / totalCells) * 100

    const accuracy = outliers.length > 0 ? 85 : 95
    const consistency = 95

    const overall = completeness * 0.4 + accuracy * 0.4 + consistency * 0.2

    return {
      overview: {
        totalRows: finalStats.total_rows,
        totalColumns: finalStats.columns?.length || 0,
        cleanedDatasetAvailable: true,
      },
      missingValues,
      outliers,
      dataTypes: {
        company: 'object',
        model: 'object',
        processor: 'object',
        storage: 'float64',
        ram: 'float64',
        battery: 'int64',
        screen: 'float64',
        weight: 'float64',
        year: 'int64',
        front_camera: 'float64',
        back_camera: 'float64',
        price_eur: 'float64',
        price_usd: 'float64',
        price_pkr: 'float64',
        price_inr: 'int64',
        price_cny: 'int64',
        price_aed: 'int64',
      },
      recommendations,
      qualityScores: {
        completeness: Math.round(completeness * 10) / 10,
        consistency,
        accuracy,
        overall: Math.round(overall * 10) / 10,
      },
      eurPrices: {
        available: numericRanges.price_eur ? true : false,
        range: numericRanges.price_eur
          ? `€${numericRanges.price_eur.min.toFixed(2)} - €${numericRanges.price_eur.max.toFixed(2)}`
          : 'N/A',
        median: numericRanges.price_eur ? numericRanges.price_eur.median : 0,
      },
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate quality report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
