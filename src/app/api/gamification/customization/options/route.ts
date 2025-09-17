import { NextRequest, NextResponse } from 'next/server'
import { UserCustomizationService } from '@/services/userCustomization.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    if (!type) {
      return NextResponse.json(
        { error: '缺少类型参数' },
        { status: 400 }
      )
    }

    const customizationService = new UserCustomizationService()
    let result

    switch (type) {
      case 'avatars':
        result = await customizationService.getAvailableAvatarOptions()
        break
      case 'themes':
        result = await customizationService.getAvailableThemeOptions()
        break
      default:
        return NextResponse.json(
          { error: '不支持的选项类型' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('获取自定义选项失败:', error)
    return NextResponse.json(
      { error: '获取自定义选项失败' },
      { status: 500 }
    )
  }
}