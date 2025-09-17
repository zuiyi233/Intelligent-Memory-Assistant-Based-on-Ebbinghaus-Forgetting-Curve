import { NextRequest, NextResponse } from 'next/server'
import { UserCustomizationService } from '@/services/userCustomization.service'

export async function POST(request: NextRequest) {
  try {
    const { userId, type, itemId } = await request.json()
    
    if (!userId || !type || !itemId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const customizationService = new UserCustomizationService()
    let result

    switch (type) {
      case 'avatar':
        // 先检查是否可以解锁
        const avatarCheck = await customizationService.canUnlockAvatar(userId, itemId)
        if (!avatarCheck.canUnlock) {
          return NextResponse.json(
            { error: `无法解锁头像: ${avatarCheck.reason}` },
            { status: 400 }
          )
        }
        result = await customizationService.unlockAvatar(userId, itemId)
        break
      case 'theme':
        // 先检查是否可以解锁
        const themeCheck = await customizationService.canUnlockTheme(userId, itemId)
        if (!themeCheck.canUnlock) {
          return NextResponse.json(
            { error: `无法解锁主题: ${themeCheck.reason}` },
            { status: 400 }
          )
        }
        result = await customizationService.unlockTheme(userId, itemId)
        break
      default:
        return NextResponse.json(
          { error: '不支持的解锁类型' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('解锁自定义选项失败:', error)
    return NextResponse.json(
      { error: '解锁自定义选项失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')
    
    if (!userId || !type || !itemId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const customizationService = new UserCustomizationService()
    let result

    switch (type) {
      case 'avatar':
        result = await customizationService.canUnlockAvatar(userId, itemId)
        break
      case 'theme':
        result = await customizationService.canUnlockTheme(userId, itemId)
        break
      default:
        return NextResponse.json(
          { error: '不支持的检查类型' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('检查解锁条件失败:', error)
    return NextResponse.json(
      { error: '检查解锁条件失败' },
      { status: 500 }
    )
  }
}