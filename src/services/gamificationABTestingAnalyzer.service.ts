import { PrismaClient } from '@prisma/client'
import { GamificationABTestingService } from './gamificationABTesting.service'
import { GamificationABTestingMetricsService } from './gamificationABTestingMetrics.service'

const prisma = new PrismaClient()

/**
 * 游戏化A/B测试结果分析器
 * 
 * 负责分析游戏化A/B测试的结果，包括：
 * - 统计显著性分析
 * - 效果大小计算
 * - 置信区间计算
 * - 结果可视化
 * - 优化建议生成
 */
export class GamificationABTestingAnalyzer {
  private abTestingService: GamificationABTestingService
  private metricsService: GamificationABTestingMetricsService

  constructor() {
    this.abTestingService = new GamificationABTestingService()
    this.metricsService = new GamificationABTestingMetricsService()
  }

  /**
   * 分析A/B测试结果
   * @param testId A/B测试ID
   * @returns 分析结果
   */
  async analyzeTestResults(testId: string): Promise<{
    test: {
      id: string
      name: string
      status: string
      startDate: Date
      endDate: Date | null
    }
    variants: Array<{
      id: string
      name: string
      metrics: Record<string, Record<string, unknown>>
      performance: {
        primaryMetric: string
        value: number
        change: number
        changePercentage: number
        confidence: number
        significance: boolean
        winner: boolean
      }
    }>
    comparison: {
      betterVariant: string | null
      confidence: number
      recommendation: string
      riskLevel: 'low' | 'medium' | 'high'
      estimatedImprovement: number
    }
    insights: Array<{
      metric: string
      insight: string
      recommendation: string
      confidence: number
    }>
  }> {
    // 获取测试信息
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test) {
      throw new Error(`A/B测试不存在: ${testId}`)
    }

    // 获取每个变体的指标数据
    const variants = await Promise.all(
      test.variants.map(async (variant: {id: string, name: string}) => {
        const metrics = await this.metricsService.getMetricsSummary(testId, variant.id)
        
        // 确定主要指标的性能
        const primaryMetric = test.metrics.find((m: {primary?: boolean, name: string}) => m.primary)?.name || test.metrics[0]?.name
        const primaryMetricData = metrics[primaryMetric] || {}
        
        return {
          id: variant.id,
          name: variant.name,
          metrics,
          performance: {
            primaryMetric,
            value: Number(primaryMetricData.value) || 0,
            change: Number(primaryMetricData.change) || 0,
            changePercentage: Number(primaryMetricData.changePercentage) || 0,
            confidence: Number(primaryMetricData.confidence) || 0,
            significance: Boolean(primaryMetricData.significance) || false,
            winner: Number(primaryMetricData.value) > 0 // 简化判断，实际需要更复杂的逻辑
          }
        }
      })
    )

    // 比较变体性能
    const comparison = this.compareVariants(variants, test.metrics.find((m: {primary?: boolean, name: string}) => m.primary)?.name || '')

    // 生成洞察
    const insights = await this.generateInsights(test, variants)

    return {
      test: {
        id: test.id,
        name: test.name,
        status: test.status,
        startDate: test.startDate as Date,
        endDate: test.endDate as Date | null
      },
      variants,
      comparison,
      insights
    }
  }

  /**
   * 比较变体性能
   * @param variants 变体列表
   * @param primaryMetric 主要指标名称
   * @returns 比较结果
   */
  private compareVariants(
    variants: Array<{
      id: string
      name: string
      metrics: Record<string, Record<string, unknown>>
      performance: {
        primaryMetric: string
        value: number
        change: number
        changePercentage: number
        confidence: number
        significance: boolean
        winner: boolean
      }
    }>,
    primaryMetric: string
  ): {
    betterVariant: string | null
    confidence: number
    recommendation: string
    riskLevel: 'low' | 'medium' | 'high'
    estimatedImprovement: number
  } {
    if (variants.length < 2) {
      return {
        betterVariant: null,
        confidence: 0,
        recommendation: '需要至少两个变体进行比较',
        riskLevel: 'high',
        estimatedImprovement: 0
      }
    }

    // 按主要指标值排序
    const sortedVariants = [...variants].sort((a, b) => 
      b.performance.value - a.performance.value
    )

    const bestVariant = sortedVariants[0]
    const secondBest = sortedVariants[1]

    // 计算改进幅度
    const estimatedImprovement = secondBest.performance.value > 0 
      ? ((bestVariant.performance.value - secondBest.performance.value) / secondBest.performance.value) * 100
      : 0

    // 确定置信度
    const confidence = bestVariant.performance.confidence || 0

    // 确定风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (confidence >= 0.95) riskLevel = 'low'
    else if (confidence < 0.8) riskLevel = 'high'

    // 生成建议
    let recommendation = '继续测试'
    if (confidence >= 0.95 && estimatedImprovement > 5) {
      recommendation = `采用变体"${bestVariant.name}"，预计可提升${estimatedImprovement.toFixed(2)}%`
    } else if (confidence >= 0.9 && estimatedImprovement > 2) {
      recommendation = `倾向于采用变体"${bestVariant.name}"，但建议继续观察`
    } else if (confidence < 0.8) {
      recommendation = '测试结果不显著，建议继续收集数据或调整测试策略'
    }

    return {
      betterVariant: bestVariant.id,
      confidence,
      recommendation,
      riskLevel,
      estimatedImprovement
    }
  }

  /**
   * 生成洞察
   * @param test 测试信息
   * @param variants 变体列表
   * @returns 洞察列表
   */
  private async generateInsights(
    test: {
      metrics: Array<{
        name: string
        primary?: boolean
      }>
    },
    variants: Array<{
      id: string
      name: string
      metrics: Record<string, Record<string, unknown>>
      performance: {
        primaryMetric: string
        value: number
        change: number
        changePercentage: number
        confidence: number
        significance: boolean
        winner: boolean
      }
    }>
  ): Promise<Array<{
    metric: string
    insight: string
    recommendation: string
    confidence: number
  }>> {
    const insights: Array<{
      metric: string
      insight: string
      recommendation: string
      confidence: number
    }> = []

    // 分析每个指标
    for (const metric of test.metrics) {
      const metricName = metric.name
      const metricValues = variants.map(v => Number(v.metrics[metricName]?.value) || 0)
      const maxChange = Math.max(...metricValues)
      const minChange = Math.min(...metricValues)
      const range = maxChange - minChange

      // 生成洞察
      if (range > 0.1) {
        const bestVariant = variants.reduce((best, current) => 
          (current.metrics[metricName]?.value || 0) > (best.metrics[metricName]?.value || 0) 
            ? current : best
        )

        insights.push({
          metric: metricName,
          insight: `变体"${bestVariant.name}"在${metricName}指标上表现最佳，比最差变体高出${(range * 100).toFixed(2)}%`,
          recommendation: `考虑采用变体"${bestVariant.name}"的${metricName}策略`,
          confidence: bestVariant.performance.confidence || 0.8
        })
      } else {
        insights.push({
          metric: metricName,
          insight: `各变体在${metricName}指标上表现相近，差异不显著`,
          recommendation: '可以尝试调整测试策略或寻找其他影响更大的因素',
          confidence: 0.6
        })
      }
    }

    // 添加跨指标洞察
    if (test.metrics.length > 1) {
      const primaryMetric = test.metrics.find((m: {primary?: boolean, name: string}) => m.primary)?.name
      const secondaryMetrics = test.metrics.filter((m: {primary?: boolean, name: string}) => !m.primary).map((m: {name: string}) => m.name)

      for (const secondaryMetric of secondaryMetrics) {
        // 分析主要指标和次要指标的相关性
        const primaryValues = primaryMetric ? variants.map(v => Number(v.metrics[primaryMetric]?.value) || 0) : []
        const secondaryValues = variants.map(v => Number(v.metrics[secondaryMetric]?.value) || 0)
        
        // 简单的相关性分析
        const correlation = this.calculateCorrelation(primaryValues, secondaryValues)
        
        if (Math.abs(correlation) > 0.7) {
          insights.push({
            metric: `${primaryMetric} vs ${secondaryMetric}`,
            insight: `${primaryMetric}和${secondaryMetric}之间存在强相关性（${correlation > 0 ? '正相关' : '负相关'}）`,
            recommendation: correlation > 0 
              ? `优化${primaryMetric}可能会同时提升${secondaryMetric}`
              : `需要在${primaryMetric}和${secondaryMetric}之间找到平衡点`,
            confidence: Math.abs(correlation)
          })
        }
      }
    }

    return insights
  }

  /**
   * 计算两个数组的简单相关性
   * @param array1 第一个数组
   * @param array2 第二个数组
   * @returns 相关系数
   */
  private calculateCorrelation(array1: number[], array2: number[]): number {
    if (array1.length !== array2.length || array1.length === 0) {
      return 0
    }

    const n = array1.length
    const sum1 = array1.reduce((a, b) => a + b, 0)
    const sum2 = array2.reduce((a, b) => a + b, 0)
    const sum1Sq = array1.reduce((a, b) => a + b * b, 0)
    const sum2Sq = array2.reduce((a, b) => a + b * b, 0)
    const pSum = array1.reduce((sum, x, i) => sum + x * array2[i], 0)

    const num = pSum - (sum1 * sum2 / n)
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))

    return den === 0 ? 0 : num / den
  }

  /**
   * 获取测试结果的详细统计信息
   * @param testId A/B测试ID
   * @param variantId 变体ID
   * @returns 统计信息
   */
  async getDetailedStatistics(
    testId: string,
    variantId: string
  ): Promise<{
    sampleSize: number
    mean: number
    standardDeviation: number
    standardError: number
    confidenceInterval: {
      lower: number
      upper: number
      level: number
    }
    pValue: number
    effectSize: number
    power: number
  }> {
    // 获取变体的结果数据
    const results = await prisma.aBTestResult.findMany({
      where: {
        testId,
        variantId
      }
    })

    if (results.length === 0) {
      throw new Error(`找不到测试结果: ${testId}, ${variantId}`)
    }

    // 提取指标值
    const values = results.map((r: {value: number}) => r.value)
    
    // 计算基本统计量
    const sampleSize = values.length
    const mean = values.reduce((a: number, b: number) => a + b, 0) / sampleSize
    const variance = values.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / (sampleSize - 1)
    const standardDeviation = Math.sqrt(variance)
    const standardError = standardDeviation / Math.sqrt(sampleSize)

    // 计算95%置信区间
    const tValue = 1.96 // 简化实现，实际应根据自由度查表
    const confidenceInterval = {
      lower: mean - tValue * standardError,
      upper: mean + tValue * standardError,
      level: 0.95
    }

    // 计算p值（简化实现）
    const pValue = this.calculatePValue(mean, standardError, 0) // 假设原假设是均值为0

    // 计算效应大小（Cohen's d）
    const effectSize = mean / standardDeviation

    // 计算统计功效（简化实现）
    const power = this.calculatePower(effectSize, sampleSize, 0.05)

    return {
      sampleSize,
      mean,
      standardDeviation,
      standardError,
      confidenceInterval,
      pValue,
      effectSize,
      power
    }
  }

  /**
   * 计算p值（简化实现）
   * @param mean 样本均值
   * @param standardError 标准误差
   * @param nullValue 原假设值
   * @returns p值
   */
  private calculatePValue(mean: number, standardError: number, nullValue: number): number {
    // 简化实现，实际应该使用正态分布或t分布
    const z = (mean - nullValue) / standardError
    return 2 * (1 - this.cumulativeNormalDistribution(Math.abs(z)))
  }

  /**
   * 计算统计功效（简化实现）
   * @param effectSize 效应大小
   * @param sampleSize 样本量
   * @param alpha 显著性水平
   * @returns 统计功效
   */
  private calculatePower(effectSize: number, sampleSize: number, alpha: number): number {
    // 简化实现，实际应该使用功效分析
    const ncp = effectSize * Math.sqrt(sampleSize / 2)
    const criticalValue = this.inverseNormalDistribution(1 - alpha / 2)
    const power = 1 - this.cumulativeNormalDistribution(criticalValue - ncp) + 
                  this.cumulativeNormalDistribution(-criticalValue - ncp)
    return Math.max(0, Math.min(1, power))
  }

  /**
   * 累积正态分布函数（简化实现）
   * @param x 值
   * @returns 累积概率
   */
  private cumulativeNormalDistribution(x: number): number {
    // 简化实现，实际应该使用更精确的算法
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)))
  }

  /**
   * 误差函数（简化实现）
   * @param x 值
   * @returns 误差函数值
   */
  private erf(x: number): number {
    // 简化实现，实际应该使用更精确的算法
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911
    
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)
    
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    
    return sign * y
  }

  /**
   * 正态分布分位数函数（简化实现）
   * @param p 概率
   * @returns 分位数
   */
  private inverseNormalDistribution(p: number): number {
    // 简化实现，实际应该使用更精确的算法
    if (p <= 0 || p >= 1) {
      throw new Error('概率必须在0和1之间')
    }
    
    // 使用近似算法
    return Math.sqrt(2) * this.inverseErf(2 * p - 1)
  }

  /**
   * 误差函数的反函数（简化实现）
   * @param y 误差函数值
   * @returns 反函数值
   */
  private inverseErf(y: number): number {
    // 简化实现，实际应该使用更精确的算法
    const a = 0.147
    const ln1y2 = Math.log(1 - y * y)
    const pi = Math.PI
    
    const sqrt_ln1y2 = Math.sqrt(ln1y2)
    const numerator = 2 / (pi * a) + ln1y2 / 2
    const denominator = 1 / (a * pi)
    
    return Math.sign(y) * Math.sqrt(sqrt_ln1y2 - numerator / denominator)
  }

  /**
   * 生成测试报告
   * @param testId A/B测试ID
   * @returns 测试报告
   */
  async generateTestReport(testId: string): Promise<{
    testId: string
    testName: string
    status: string
    startDate: Date
    endDate: Date | null
    duration: number
    totalUsers: number
    variants: Array<{
      id: string
      name: string
      users: number
      percentage: number
      metrics: Record<string, any>
    }>
    keyFindings: string[]
    recommendations: string[]
    nextSteps: string[]
  }> {
    // 获取测试基本信息
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        variants: {
          include: {
            results: true
          }
        },
        metrics: true
      }
    })

    if (!test) {
      throw new Error(`A/B测试不存在: ${testId}`)
    }

    // 计算测试持续时间
    const duration = test.endDate && test.startDate
      ? test.endDate.getTime() - test.startDate.getTime()
      : test.startDate ? Date.now() - test.startDate.getTime() : 0

    // 计算总用户数
    const totalUsers = test.variants.reduce((sum: number, variant: {trafficAllocation?: number, trafficPercentage?: number}) => sum + (variant.trafficAllocation || variant.trafficPercentage || 0), 0)

    // 准备变体数据
    const variants = test.variants.map((variant: {id: string, name: string, trafficAllocation?: number, trafficPercentage?: number, results: unknown[]}) => {
      // 计算变体用户数
      const trafficAllocation = variant.trafficAllocation || variant.trafficPercentage || 0
      const users = Math.floor(totalUsers * (trafficAllocation / 100))
      const percentage = trafficAllocation

      // 获取变体指标
      const metrics: Record<string, Record<string, unknown>> = {}
      for (const metric of test.metrics) {
        const result = variant.results.find((r: {metricId: string}) => r.metricId === metric.id)
        if (result) {
          metrics[metric.name] = {
            value: result.value,
            change: result.change,
            changePercentage: result.changePercentage,
            confidence: result.confidence,
            significance: result.significance
          }
        }
      }

      return {
        id: variant.id,
        name: variant.name,
        users,
        percentage,
        metrics
      }
    })

    // 分析测试结果
    const analysis = await this.analyzeTestResults(testId)

    // 生成关键发现
    const keyFindings: string[] = []
    if (analysis.comparison.betterVariant) {
      const betterVariant = test.variants.find((v: {id: string, name: string}) => v.id === analysis.comparison.betterVariant)
      if (betterVariant) {
        keyFindings.push(`变体"${betterVariant.name}"表现最佳，预计可提升${analysis.comparison.estimatedImprovement.toFixed(2)}%`)
      }
    }
    keyFindings.push(`测试置信度为${(analysis.comparison.confidence * 100).toFixed(2)}%`)
    keyFindings.push(`风险等级：${analysis.comparison.riskLevel === 'low' ? '低' : analysis.comparison.riskLevel === 'medium' ? '中' : '高'}`)

    // 添加洞察作为关键发现
    for (const insight of analysis.insights.slice(0, 3)) {
      keyFindings.push(`${insight.metric}: ${insight.insight}`)
    }

    // 生成建议
    const recommendations: string[] = []
    recommendations.push(analysis.comparison.recommendation)
    
    // 添加洞察中的建议
    for (const insight of analysis.insights.slice(0, 2)) {
      recommendations.push(insight.recommendation)
    }

    // 生成后续步骤
    const nextSteps: string[] = []
    if (analysis.comparison.confidence >= 0.95) {
      nextSteps.push('实施最佳变体')
      nextSteps.push('监控实施后的表现')
    } else if (analysis.comparison.confidence >= 0.8) {
      nextSteps.push('考虑延长测试时间')
      nextSteps.push('增加样本量')
    } else {
      nextSteps.push('重新设计测试策略')
      nextSteps.push('考虑调整测试变量')
    }
    nextSteps.push('记录测试经验教训')
    nextSteps.push('规划下一轮测试')

    return {
      testId: test.id,
      testName: test.name,
      status: test.status,
      startDate: test.startDate as Date,
      endDate: test.endDate as Date | null,
      duration,
      totalUsers: Number(totalUsers),
      variants,
      keyFindings,
      recommendations,
      nextSteps
    }
  }
}