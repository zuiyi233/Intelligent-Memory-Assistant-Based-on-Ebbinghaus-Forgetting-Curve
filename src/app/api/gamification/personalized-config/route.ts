import { NextRequest, NextResponse } from 'next/server'
import { personalizedConfigService } from '@/services/personalizedConfig.service'
import { PersonalizedConfigResponse, PersonalizedConfigForm } from '@/types'

/**
 * 获取用户个性化配置
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json<PersonalizedConfigResponse>(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    const config = await personalizedConfigService.getUserPersonalizedConfig(userId)

    if (!config) {
      return NextResponse.json<PersonalizedConfigResponse>(
        { 
          success: false, 
          error: '未找到用户个性化配置',
          message: '用户尚未配置个性化设置'
        },
        { status: 404 }
      )
    }

    return NextResponse.json<PersonalizedConfigResponse>({
      success: true,
      data: config,
      message: '获取个性化配置成功'
    })
  } catch (error) {
    console.error('获取个性化配置失败:', error)
    return NextResponse.json<PersonalizedConfigResponse>(
      { 
        success: false, 
        error: '获取个性化配置失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

/**
 * 保存用户个性化配置
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, config } = await request.json()

    if (!userId || !config) {
      return NextResponse.json<PersonalizedConfigResponse>(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const savedConfig = await personalizedConfigService.saveUserPersonalizedConfig(
      userId,
      config as PersonalizedConfigForm
    )

    return NextResponse.json<PersonalizedConfigResponse>({
      success: true,
      data: savedConfig,
      message: '保存个性化配置成功'
    })
  } catch (error) {
    console.error('保存个性化配置失败:', error)
    return NextResponse.json<PersonalizedConfigResponse>(
      { 
        success: false, 
        error: '保存个性化配置失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}