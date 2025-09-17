import { NextRequest, NextResponse } from 'next/server'
import { personalizedConfigService } from '@/services/personalizedConfig.service'
import { PersonalizedConfigRecommendationResponse } from '@/types'
import { LearningStyleType } from '@prisma/client'

/**
 * 获取基于学习风格的个性化配置推荐
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const learningStyle = searchParams.get('learningStyle') as LearningStyleType

    if (!userId) {
      return NextResponse.json<PersonalizedConfigRecommendationResponse>(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    if (!learningStyle) {
      return NextResponse.json<PersonalizedConfigRecommendationResponse>(
        { success: false, error: '缺少学习风格参数' },
        { status: 400 }
      )
    }

    // 验证学习风格参数
    const validLearningStyles = Object.values(LearningStyleType)
    if (!validLearningStyles.includes(learningStyle)) {
      return NextResponse.json<PersonalizedConfigRecommendationResponse>(
        { 
          success: false, 
          error: '无效的学习风格参数',
          message: `支持的学习风格: ${validLearningStyles.join(', ')}`
        },
        { status: 400 }
      )
    }

    const recommendation = await personalizedConfigService.generatePersonalizedConfigRecommendation(
      userId,
      learningStyle
    )

    return NextResponse.json<PersonalizedConfigRecommendationResponse>({
      success: true,
      data: recommendation,
      message: '获取个性化配置推荐成功'
    })
  } catch (error) {
    console.error('获取个性化配置推荐失败:', error)
    return NextResponse.json<PersonalizedConfigRecommendationResponse>(
      { 
        success: false, 
        error: '获取个性化配置推荐失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}