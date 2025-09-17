import { prisma } from '@/lib/db'

// 临时定义用户自定义模型
const UserCustomization = {
  findUnique: async (args: any) => {
    // 临时模拟实现，直到Prisma客户端更新
    return null
  },
  create: async (args: any) => {
    // 临时模拟实现，直到Prisma客户端更新
    return args.data
  },
  update: async (args: any) => {
    // 临时模拟实现，直到Prisma客户端更新
    return { ...args.data, id: 'temp-id' }
  }
}

// 临时添加到prisma
;(prisma as any).userCustomization = UserCustomization

// 头像选项类型
export interface AvatarOption {
  id: string
  name: string
  type: 'base' | 'accessory' | 'background'
  category: string
  imageUrl: string
  unlockLevel?: number
  unlockCondition?: string
  points?: number
}

// 主题选项类型
export interface ThemeOption {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  unlockLevel?: number
  unlockCondition?: string
  points?: number
  isActive?: boolean
}

// 用户自定义配置类型
export interface UserCustomization {
  id: string
  userId: string
  avatar: {
    base: string
    accessories: string[]
    background: string
  }
  theme: string
  unlockedAvatars: string[]
  unlockedThemes: string[]
  createdAt: Date
  updatedAt: Date
}

// 用户自定义配置服务
export class UserCustomizationService {
  /**
   * 获取用户自定义配置
   */
  async getUserCustomization(userId: string): Promise<UserCustomization | null> {
    try {
      // 检查是否已有用户配置
      let customization = await (prisma as any).userCustomization.findUnique({
        where: { userId }
      })

      // 如果没有配置，创建默认配置
      if (!customization) {
        customization = await this.createDefaultCustomization(userId)
      }

      return customization
    } catch (error) {
      console.error('获取用户自定义配置失败:', error)
      throw error
    }
  }

  /**
   * 创建默认用户自定义配置
   */
  private async createDefaultCustomization(userId: string): Promise<UserCustomization> {
    const defaultCustomization = {
      userId,
      avatar: {
        base: 'default-avatar',
        accessories: [],
        background: 'default-background'
      },
      theme: 'default-theme',
      unlockedAvatars: ['default-avatar', 'default-background'],
      unlockedThemes: ['default-theme']
    }

    return await (prisma as any).userCustomization.create({
      data: defaultCustomization
    })
  }

  /**
   * 更新用户头像
   */
  async updateUserAvatar(
    userId: string,
    avatar: {
      base: string
      accessories: string[]
      background: string
    }
  ): Promise<UserCustomization> {
    try {
      // 检查用户是否拥有这些头像部件
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        throw new Error('用户自定义配置不存在')
      }

      const allAvatarParts = [
        avatar.base,
        ...avatar.accessories,
        avatar.background
      ]

      const hasAllParts = allAvatarParts.every(part =>
        customization.unlockedAvatars.includes(part)
      )

      if (!hasAllParts) {
        throw new Error('用户未拥有某些头像部件')
      }

      // 更新头像
      const updatedCustomization = await (prisma as any).userCustomization.update({
        where: { userId },
        data: { avatar },
        include: {
          user: true
        }
      })

      return updatedCustomization
    } catch (error) {
      console.error('更新用户头像失败:', error)
      throw error
    }
  }

  /**
   * 更新用户主题
   */
  async updateUserTheme(userId: string, themeId: string): Promise<UserCustomization> {
    try {
      // 检查用户是否拥有该主题
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        throw new Error('用户自定义配置不存在')
      }

      if (!customization.unlockedThemes.includes(themeId)) {
        throw new Error('用户未拥有该主题')
      }

      // 更新主题
      const updatedCustomization = await (prisma as any).userCustomization.update({
        where: { userId },
        data: { theme: themeId },
        include: {
          user: true
        }
      })

      return updatedCustomization
    } catch (error) {
      console.error('更新用户主题失败:', error)
      throw error
    }
  }

  /**
   * 解锁头像部件
   */
  async unlockAvatar(userId: string, avatarId: string): Promise<UserCustomization> {
    try {
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        throw new Error('用户自定义配置不存在')
      }

      // 如果已经解锁，直接返回
      if (customization.unlockedAvatars.includes(avatarId)) {
        return customization
      }

      // 添加到已解锁列表
      const unlockedAvatars = [...customization.unlockedAvatars, avatarId]

      const updatedCustomization = await (prisma as any).userCustomization.update({
        where: { userId },
        data: { unlockedAvatars },
        include: {
          user: true
        }
      })

      return updatedCustomization
    } catch (error) {
      console.error('解锁头像部件失败:', error)
      throw error
    }
  }

  /**
   * 解锁主题
   */
  async unlockTheme(userId: string, themeId: string): Promise<UserCustomization> {
    try {
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        throw new Error('用户自定义配置不存在')
      }

      // 如果已经解锁，直接返回
      if (customization.unlockedThemes.includes(themeId)) {
        return customization
      }

      // 添加到已解锁列表
      const unlockedThemes = [...customization.unlockedThemes, themeId]

      const updatedCustomization = await (prisma as any).userCustomization.update({
        where: { userId },
        data: { unlockedThemes },
        include: {
          user: true
        }
      })

      return updatedCustomization
    } catch (error) {
      console.error('解锁主题失败:', error)
      throw error
    }
  }

  /**
   * 获取所有可用的头像选项
   */
  async getAvailableAvatarOptions(): Promise<AvatarOption[]> {
    // 这里可以从数据库或配置文件中获取所有可用的头像选项
    // 目前返回硬编码的示例数据
    return [
      {
        id: 'default-avatar',
        name: '默认头像',
        type: 'base',
        category: '基础',
        imageUrl: '/avatars/default.png',
        points: 0
      },
      {
        id: 'avatar-1',
        name: '经典头像',
        type: 'base',
        category: '基础',
        imageUrl: '/avatars/classic.png',
        unlockLevel: 2,
        points: 100
      },
      {
        id: 'avatar-2',
        name: '现代头像',
        type: 'base',
        category: '基础',
        imageUrl: '/avatars/modern.png',
        unlockLevel: 5,
        points: 500
      },
      {
        id: 'glasses-1',
        name: '经典眼镜',
        type: 'accessory',
        category: '配饰',
        imageUrl: '/accessories/glasses-1.png',
        unlockLevel: 3,
        points: 200
      },
      {
        id: 'hat-1',
        name: '棒球帽',
        type: 'accessory',
        category: '配饰',
        imageUrl: '/accessories/hat-1.png',
        unlockLevel: 4,
        points: 300
      },
      {
        id: 'bg-1',
        name: '蓝色背景',
        type: 'background',
        category: '背景',
        imageUrl: '/backgrounds/blue.png',
        unlockLevel: 1,
        points: 50
      },
      {
        id: 'bg-2',
        name: '绿色背景',
        type: 'background',
        category: '背景',
        imageUrl: '/backgrounds/green.png',
        unlockLevel: 3,
        points: 250
      }
    ]
  }

  /**
   * 获取所有可用的主题选项
   */
  async getAvailableThemeOptions(): Promise<ThemeOption[]> {
    // 这里可以从数据库或配置文件中获取所有可用的主题选项
    // 目前返回硬编码的示例数据
    return [
      {
        id: 'default-theme',
        name: '默认主题',
        description: '简洁清爽的默认主题',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#ffffff',
          text: '#1f2937'
        },
        points: 0
      },
      {
        id: 'dark-theme',
        name: '深色主题',
        description: '护眼的深色主题',
        colors: {
          primary: '#60a5fa',
          secondary: '#a78bfa',
          accent: '#f472b6',
          background: '#1f2937',
          text: '#f9fafb'
        },
        unlockLevel: 2,
        points: 150
      },
      {
        id: 'nature-theme',
        name: '自然主题',
        description: '清新的自然色彩主题',
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#f0fdf4',
          text: '#064e3b'
        },
        unlockLevel: 5,
        points: 500
      },
      {
        id: 'sunset-theme',
        name: '日落主题',
        description: '温暖的日落色彩主题',
        colors: {
          primary: '#f97316',
          secondary: '#ea580c',
          accent: '#fb923c',
          background: '#fff7ed',
          text: '#431407'
        },
        unlockLevel: 8,
        points: 800
      }
    ]
  }

  /**
   * 检查用户是否可以解锁某个头像部件
   */
  async canUnlockAvatar(userId: string, avatarId: string): Promise<{ canUnlock: boolean; reason?: string }> {
    try {
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        return { canUnlock: false, reason: '用户配置不存在' }
      }

      // 如果已经解锁
      if (customization.unlockedAvatars.includes(avatarId)) {
        return { canUnlock: false, reason: '已经解锁' }
      }

      // 获取头像选项
      const avatarOptions = await this.getAvailableAvatarOptions()
      const avatarOption = avatarOptions.find(option => option.id === avatarId)
      
      if (!avatarOption) {
        return { canUnlock: false, reason: '头像选项不存在' }
      }

      // 检查解锁条件
      if (avatarOption.unlockLevel) {
        const userProfile = await prisma.gamificationProfile.findUnique({
          where: { userId }
        })

        if (!userProfile || userProfile.level < avatarOption.unlockLevel) {
          return { 
            canUnlock: false, 
            reason: `需要达到等级 ${avatarOption.unlockLevel}` 
          }
        }
      }

      if (avatarOption.points) {
        const userProfile = await prisma.gamificationProfile.findUnique({
          where: { userId }
        })

        if (!userProfile || userProfile.points < avatarOption.points) {
          return { 
            canUnlock: false, 
            reason: `需要 ${avatarOption.points} 积分` 
          }
        }
      }

      return { canUnlock: true }
    } catch (error) {
      console.error('检查头像解锁条件失败:', error)
      return { canUnlock: false, reason: '检查失败' }
    }
  }

  /**
   * 检查用户是否可以解锁某个主题
   */
  async canUnlockTheme(userId: string, themeId: string): Promise<{ canUnlock: boolean; reason?: string }> {
    try {
      const customization = await this.getUserCustomization(userId)
      if (!customization) {
        return { canUnlock: false, reason: '用户配置不存在' }
      }

      // 如果已经解锁
      if (customization.unlockedThemes.includes(themeId)) {
        return { canUnlock: false, reason: '已经解锁' }
      }

      // 获取主题选项
      const themeOptions = await this.getAvailableThemeOptions()
      const themeOption = themeOptions.find(option => option.id === themeId)
      
      if (!themeOption) {
        return { canUnlock: false, reason: '主题选项不存在' }
      }

      // 检查解锁条件
      if (themeOption.unlockLevel) {
        const userProfile = await prisma.gamificationProfile.findUnique({
          where: { userId }
        })

        if (!userProfile || userProfile.level < themeOption.unlockLevel) {
          return { 
            canUnlock: false, 
            reason: `需要达到等级 ${themeOption.unlockLevel}` 
          }
        }
      }

      if (themeOption.points) {
        const userProfile = await prisma.gamificationProfile.findUnique({
          where: { userId }
        })

        if (!userProfile || userProfile.points < themeOption.points) {
          return { 
            canUnlock: false, 
            reason: `需要 ${themeOption.points} 积分` 
          }
        }
      }

      return { canUnlock: true }
    } catch (error) {
      console.error('检查主题解锁条件失败:', error)
      return { canUnlock: false, reason: '检查失败' }
    }
  }

  /**
   * 应用主题到CSS变量
   */
  applyTheme(theme: ThemeOption): void {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-text', theme.colors.text)
  }
}