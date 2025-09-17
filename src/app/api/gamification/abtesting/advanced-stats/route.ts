import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import {
  successResponse,
  errorResponse,
  ErrorCodes,
  ErrorMessages,
  validateRequiredParams,
  withErrorHandler
} from '@/lib/apiResponse'

/**
 * 获取A/B测试高级统计数据
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const { testId, timeRange, segments, metrics, includeUserBreakdown } = body

  // 验证必需参数
  const validation = validateRequiredParams({ testId }, ['testId'])
  if (!validation.valid) {
    return validation.error!
  }

  // 获取基本统计数据
  const basicStats = await abTestingService.getTestStats({
    testId,
    startDate: timeRange?.startDate ? new Date(timeRange.startDate) : undefined,
    endDate: timeRange?.endDate ? new Date(timeRange.endDate) : undefined,
    segment: segments?.primarySegment,
    metricIds: metrics
  })

  // 获取测试报告
  const report = await abTestingService.getTestReport(testId)

  if (!report) {
    return errorResponse(
      ErrorCodes.TEST_NOT_FOUND,
      ErrorMessages[ErrorCodes.TEST_NOT_FOUND],
      404
    )
  }

  // 计算高级统计指标
  const advancedStats = calculateAdvancedStats(basicStats, report)

  // 如果需要用户细分数据
  let userBreakdown = null
  if (includeUserBreakdown) {
    userBreakdown = await calculateUserBreakdown(testId, segments)
  }

  // 计算趋势数据
  const trends = await calculateTrends(testId, timeRange)

  // 生成洞察和建议
  const insights = generateInsights(advancedStats, trends, report)

  return successResponse({
    basicStats,
    advancedStats,
    userBreakdown,
    trends,
    insights,
    report: {
      ...report,
      // 移除不必要的大量数据
      results: report.results.map(r => ({
        metricId: r.metricId,
        variantId: r.variantId,
        value: r.value,
        change: r.change,
        changePercentage: r.changePercentage,
        confidence: r.confidence,
        significance: r.significance,
        sampleSize: r.sampleSize
      }))
    }
  })
})

/**
 * 计算高级统计指标
 */
function calculateAdvancedStats(basicStats: any, report: any) {
  const advancedStats: any = {
    overallPerformance: {},
    variantComparison: {},
    metricAnalysis: {},
    statisticalSignificance: {},
    confidenceIntervals: {},
    effectSizes: {}
  }

  // 计算整体表现
  let totalSampleSize = 0
  let totalValue = 0
  const variantData: Record<string, { value: number; sampleSize: number }> = {}

  for (const metricId in basicStats) {
    const metricData = basicStats[metricId]
    for (const variantId in metricData.variants) {
      const variant = metricData.variants[variantId]
      if (variant.stats) {
        totalSampleSize += variant.stats.sampleSize
        totalValue += variant.stats.avgValue * variant.stats.sampleSize

        if (!variantData[variantId]) {
          variantData[variantId] = { value: 0, sampleSize: 0 }
        }
        variantData[variantId].value += variant.stats.avgValue * variant.stats.sampleSize
        variantData[variantId].sampleSize += variant.stats.sampleSize
      }
    }
  }

  advancedStats.overallPerformance = {
    totalSampleSize,
    overallAverage: totalSampleSize > 0 ? totalValue / totalSampleSize : 0
  }

  // 变体比较
  for (const variantId in variantData) {
    const variant = variantData[variantId]
    const overallAvg = advancedStats.overallPerformance.overallAverage
    const performance = overallAvg > 0 ? (variant.value / variant.sampleSize) / overallAvg : 1

    advancedStats.variantComparison[variantId] = {
      averageValue: variant.value / variant.sampleSize,
      sampleSize: variant.sampleSize,
      relativePerformance: performance - 1, // 相对于整体平均的表现
      contribution: totalValue > 0 ? variant.value / totalValue : 0 // 对总体的贡献
    }
  }

  // 指标分析
  for (const metricId in basicStats) {
    const metricData = basicStats[metricId]
    const metricAnalysis: any = {
      name: metricData.metric.name,
      type: metricData.metric.type,
      variants: {},
      overall: {}
    }

    let totalMetricValue = 0
    let totalMetricSampleSize = 0

    for (const variantId in metricData.variants) {
      const variant = metricData.variants[variantId]
      if (variant.stats) {
        totalMetricValue += variant.stats.avgValue * variant.stats.sampleSize
        totalMetricSampleSize += variant.stats.sampleSize

        metricAnalysis.variants[variantId] = {
          ...variant.stats,
          coefficientOfVariation: variant.stats.avgValue > 0 
            ? variant.stats.stdDev / variant.stats.avgValue 
            : 0
        }
      }
    }

    metricAnalysis.overall = {
      average: totalMetricSampleSize > 0 ? totalMetricValue / totalMetricSampleSize : 0,
      sampleSize: totalMetricSampleSize
    }

    advancedStats.metricAnalysis[metricId] = metricAnalysis
  }

  // 统计显著性和置信区间
  for (const metricId in basicStats) {
    const metricData = basicStats[metricId]
    const variants = Object.values(metricData.variants).filter((v: any) => v.stats)
    
    if (variants.length >= 2) {
      const significanceTests = performSignificanceTests(variants as any[])
      const confidenceIntervals = calculateConfidenceIntervals(variants as any[])
      const effectSizes = calculateEffectSizes(variants as any[])

      advancedStats.statisticalSignificance[metricId] = significanceTests
      advancedStats.confidenceIntervals[metricId] = confidenceIntervals
      advancedStats.effectSizes[metricId] = effectSizes
    }
  }

  return advancedStats
}

/**
 * 执行显著性测试
 */
function performSignificanceTests(variants: any[]) {
  const results: any = {}

  // 简化版：只比较第一个变体（对照组）和其他变体
  const control = variants[0]
  
  for (let i = 1; i < variants.length; i++) {
    const treatment = variants[i]
    const testKey = `${control.variant.id}_vs_${treatment.variant.id}`

    // 使用简化的t检验
    const tStatistic = calculateTStatistic(
      control.stats.avgValue,
      treatment.stats.avgValue,
      control.stats.stdDev,
      treatment.stats.stdDev,
      control.stats.sampleSize,
      treatment.stats.sampleSize
    )

    const pValue = calculatePValue(tStatistic, control.stats.sampleSize + treatment.stats.sampleSize - 2)

    results[testKey] = {
      tStatistic,
      pValue,
      isSignificant: pValue < 0.05,
      confidenceLevel: 1 - pValue
    }
  }

  return results
}

/**
 * 计算t统计量
 */
function calculateTStatistic(
  mean1: number,
  mean2: number,
  std1: number,
  std2: number,
  n1: number,
  n2: number
) {
  const pooledVariance = ((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2)
  const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2))
  return (mean1 - mean2) / standardError
}

/**
 * 计算p值（简化版）
 */
function calculatePValue(tStatistic: number, degreesOfFreedom: number) {
  // 简化版：使用近似值
  const absT = Math.abs(tStatistic)
  if (absT < 1.96) return 0.05 + (1.96 - absT) * 0.1
  if (absT < 2.58) return 0.01 + (2.58 - absT) * 0.04
  return 0.001
}

/**
 * 计算置信区间
 */
function calculateConfidenceIntervals(variants: any[]) {
  const results: any = {}

  for (const variant of variants) {
    const { stats, variant: variantInfo } = variant
    const marginOfError = 1.96 * (stats.stdDev / Math.sqrt(stats.sampleSize))

    results[variantInfo.id] = {
      lower: stats.avgValue - marginOfError,
      upper: stats.avgValue + marginOfError,
      marginOfError,
      confidenceLevel: 0.95
    }
  }

  return results
}

/**
 * 计算效应量
 */
function calculateEffectSizes(variants: any[]) {
  const results: any = {}
  const control = variants[0]

  for (let i = 1; i < variants.length; i++) {
    const treatment = variants[i]
    const testKey = `${control.variant.id}_vs_${treatment.variant.id}`

    // Cohen's d
    const pooledStdDev = Math.sqrt(
      ((control.stats.sampleSize - 1) * control.stats.stdDev * control.stats.stdDev +
       (treatment.stats.sampleSize - 1) * treatment.stats.stdDev * treatment.stats.stdDev) /
      (control.stats.sampleSize + treatment.stats.sampleSize - 2)
    )

    const cohensD = (treatment.stats.avgValue - control.stats.avgValue) / pooledStdDev

    results[testKey] = {
      cohensD,
      magnitude: getCohensDMagnitude(cohensD)
    }
  }

  return results
}

/**
 * 获取Cohen's d的效应量大小
 */
function getCohensDMagnitude(d: number): string {
  const absD = Math.abs(d)
  if (absD < 0.2) return 'small'
  if (absD < 0.5) return 'medium'
  return 'large'
}

/**
 * 计算用户细分数据（简化版）
 */
async function calculateUserBreakdown(testId: string, segments: any) {
  // 这里应该是实际查询数据库获取用户细分数据
  // 为演示目的，返回模拟数据
  return {
    bySegment: {
      new_users: { total: 120, converted: 85, conversionRate: 0.71 },
      active_users: { total: 340, converted: 260, conversionRate: 0.76 },
      premium_users: { total: 80, converted: 72, conversionRate: 0.90 }
    },
    byCohort: {
      cohort_1: { total: 200, converted: 150, conversionRate: 0.75 },
      cohort_2: { total: 180, converted: 130, conversionRate: 0.72 },
      cohort_3: { total: 160, converted: 137, conversionRate: 0.86 }
    }
  }
}

/**
 * 计算趋势数据（简化版）
 */
async function calculateTrends(testId: string, timeRange: any) {
  // 这里应该是实际查询数据库获取趋势数据
  // 为演示目的，返回模拟数据
  const days = timeRange?.endDate && timeRange?.startDate 
    ? Math.ceil((new Date(timeRange.endDate).getTime() - new Date(timeRange.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30

  const trends = []
  const baseDate = timeRange?.startDate ? new Date(timeRange.startDate) : new Date()
  baseDate.setDate(baseDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)

    trends.push({
      date: date.toISOString().split('T')[0],
      variant_a: Math.floor(Math.random() * 100) + 50,
      variant_b: Math.floor(Math.random() * 100) + 40,
      variant_c: Math.floor(Math.random() * 100) + 45
    })
  }

  return trends
}

/**
 * 生成洞察和建议
 */
function generateInsights(advancedStats: any, trends: any, report: any) {
  const insights: any = {
    summary: [],
    recommendations: [],
    warnings: [],
    opportunities: []
  }

  // 分析整体表现
  const overallPerf = advancedStats.overallPerformance
  if (overallPerf.totalSampleSize < 100) {
    insights.warnings.push('样本量较小，可能影响结果的可靠性')
  }

  // 分析变体表现
  const bestVariant = Object.entries(advancedStats.variantComparison).reduce((best, [id, data]: [string, any]) => {
    if (!best || data.relativePerformance > best.data.relativePerformance) {
      return { id, data }
    }
    return best
  }, null)

  if (bestVariant) {
    insights.summary.push(`变体 ${bestVariant.id} 表现最佳，相对性能提升 ${(bestVariant.data.relativePerformance * 100).toFixed(1)}%`)
    insights.recommendations.push(`考虑将变体 ${bestVariant.id} 作为默认选项`)
  }

  // 分析统计显著性
  for (const metricId in advancedStats.statisticalSignificance) {
    const significanceTests = advancedStats.statisticalSignificance[metricId]
    for (const testKey in significanceTests) {
      const test = significanceTests[testKey]
      if (test.isSignificant) {
        insights.summary.push(`${metricId} 指标在 ${testKey} 比较中显示统计显著性 (p=${test.pValue.toFixed(4)})`)
      }
    }
  }

  // 分析效应量
  for (const metricId in advancedStats.effectSizes) {
    const effectSizes = advancedStats.effectSizes[metricId]
    for (const testKey in effectSizes) {
      const effect = effectSizes[testKey]
      if (effect.magnitude === 'large') {
        insights.opportunities.push(`${metricId} 指标在 ${testKey} 比较中显示大效应量 (${effect.cohensD.toFixed(2)})`)
      }
    }
  }

  // 基于报告的建议
  if (report.recommendations && report.recommendations.length > 0) {
    insights.recommendations.push(...report.recommendations)
  }

  return insights
}