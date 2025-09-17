import { NextRequest, NextResponse } from 'next/server'
import { UserCustomizationService } from '@/services/userCustomization.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const customizationService = new UserCustomizationService()
    const customization = await customizationService.getUserCustomization(userId)
    
    return NextResponse.json(customization)
  } catch (error) {
    console.error('获取用户自定义配置失败:', error)
    return NextResponse.json(
      { error: '获取用户自定义配置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, type, data } = await request.json()
    
    if (!userId || !type || !data) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const customizationService = new UserCustomizationService()
    let result

    switch (type) {
      case 'avatar':
        result = await customizationService.updateUserAvatar(userId, data.avatar)
        break
      case 'theme':
        result = await customizationService.updateUserTheme(userId, data.themeId)
        break
      default:
        return NextResponse.json(
          { error: '不支持的自定义类型' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('更新用户自定义配置失败:', error)
    return NextResponse.json(
      { error: '更新用户自定义配置失败' },
      { status: 500 }
    )
  }
}