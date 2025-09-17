'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Palette,
  User,
  Lock,
  Unlock,
  Star,
  RefreshCw,
  Check,
  Crown
} from 'lucide-react'
import { UserCustomizationService, AvatarOption, ThemeOption } from '@/services/userCustomization.service'
import type { UserCustomization } from '@/services/userCustomization.service'
import { cn, animations, cardEffects, textEffects, buttonEffects, gamificationEffects } from '@/lib/inspira-ui'

interface UserCustomizationProps {
  userId: string
}

export function UserCustomization({ userId }: UserCustomizationProps) {
  const [customization, setCustomization] = useState<UserCustomization | null>(null)
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([])
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'avatar' | 'theme'>('avatar')
  const [selectedAvatar, setSelectedAvatar] = useState({
    base: '',
    accessories: [] as string[],
    background: ''
  })
  const [selectedTheme, setSelectedTheme] = useState('')
  const [unlockStatus, setUnlockStatus] = useState<Record<string, boolean>>({})
  const [unlockReasons, setUnlockReasons] = useState<Record<string, string>>({})

  const customizationService = new UserCustomizationService()

  useEffect(() => {
    fetchCustomizationData()
  }, [userId])

  const fetchCustomizationData = async () => {
    setLoading(true)
    
    try {
      // 获取用户自定义配置
      const [customizationData, avatars, themes] = await Promise.all([
        customizationService.getUserCustomization(userId),
        customizationService.getAvailableAvatarOptions(),
        customizationService.getAvailableThemeOptions()
      ])
      
      setCustomization(customizationData)
      setAvatarOptions(avatars)
      setThemeOptions(themes)
      
      if (customizationData) {
        setSelectedAvatar({
          base: customizationData.avatar.base,
          accessories: customizationData.avatar.accessories,
          background: customizationData.avatar.background
        })
        setSelectedTheme(customizationData.theme)
      }
      
      // 检查解锁状态
      await checkUnlockStatus(avatars, themes)
    } catch (error) {
      console.error('获取自定义数据失败:', error)
    } finally {
      // 添加延迟以展示加载动画效果
      setTimeout(() => setLoading(false), 500)
    }
  }

  const checkUnlockStatus = async (avatars: AvatarOption[], themes: ThemeOption[]) => {
    const status: Record<string, boolean> = {}
    const reasons: Record<string, string> = {}
    
    // 检查头像解锁状态
    for (const avatar of avatars) {
      const check = await customizationService.canUnlockAvatar(userId, avatar.id)
      status[avatar.id] = check.canUnlock
      reasons[avatar.id] = check.reason || ''
    }
    
    // 检查主题解锁状态
    for (const theme of themes) {
      const check = await customizationService.canUnlockTheme(userId, theme.id)
      status[theme.id] = check.canUnlock
      reasons[theme.id] = check.reason || ''
    }
    
    setUnlockStatus(status)
    setUnlockReasons(reasons)
  }

  const updateAvatar = async () => {
    try {
      await customizationService.updateUserAvatar(userId, selectedAvatar)
      // 添加成功反馈动画
      const saveButton = document.querySelector('[data-save-avatar]')
      if (saveButton) {
        saveButton.classList.add('animate-ping-slow')
        setTimeout(() => {
          saveButton.classList.remove('animate-ping-slow')
        }, 1000)
      }
      await fetchCustomizationData()
    } catch (error) {
      console.error('更新头像失败:', error)
    }
  }

  const updateTheme = async (themeId: string) => {
    try {
      await customizationService.updateUserTheme(userId, themeId)
      
      // 添加主题切换动画效果
      const themeCards = document.querySelectorAll('[data-theme-card]')
      themeCards.forEach(card => {
        card.classList.add('animate-pulse-slow')
        setTimeout(() => {
          card.classList.remove('animate-pulse-slow')
        }, 1000)
      })
      
      await fetchCustomizationData()
      
      // 应用主题到页面
      const theme = themeOptions.find(t => t.id === themeId)
      if (theme) {
        customizationService.applyTheme(theme)
      }
    } catch (error) {
      console.error('更新主题失败:', error)
    }
  }

  const unlockItem = async (type: 'avatar' | 'theme', itemId: string) => {
    try {
      // 添加解锁动画效果
      const unlockButton = document.querySelector(`[data-unlock-${type}="${itemId}"]`)
      if (unlockButton) {
        unlockButton.classList.add('animate-ping-slow')
        setTimeout(() => {
          unlockButton.classList.remove('animate-ping-slow')
        }, 1000)
      }
      
      if (type === 'avatar') {
        await customizationService.unlockAvatar(userId, itemId)
      } else {
        await customizationService.unlockTheme(userId, itemId)
      }
      
      await fetchCustomizationData()
    } catch (error) {
      console.error(`解锁${type === 'avatar' ? '头像' : '主题'}失败:`, error)
    }
  }

  const isUnlocked = (itemId: string) => {
    if (!customization) return false
    
    // 检查是否是默认项
    if (itemId === 'default-avatar' || itemId === 'default-background' || itemId === 'default-theme') {
      return true
    }
    
    // 检查是否在已解锁列表中
    return customization.unlockedAvatars.includes(itemId) || 
           customization.unlockedThemes.includes(itemId)
  }

  const getAvatarPartsByType = (type: 'base' | 'accessory' | 'background') => {
    return avatarOptions.filter(option => option.type === type)
  }

  if (loading) {
    return (
      <Card className={cn(
        "w-full inspira-glass-effect inspira-card-shimmer",
        cardEffects.glass
      )}>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className={cn(
              "animate-spin rounded-full h-8 w-8 border-b-2",
              "border-transparent border-t-primary animate-pulse-slow"
            )}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标签切换 */}
      <div className={cn(
        "flex border-b border-border",
        "overflow-hidden rounded-lg bg-card"
      )}>
        <button
          onClick={() => setActiveTab('avatar')}
          className={cn(
            "px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all duration-300",
            "relative overflow-hidden",
            activeTab === 'avatar'
              ? cn(
                  "text-primary",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                  "after:bg-gradient-to-r after:from-primary after:to-accent",
                  "inspira-gradient-text"
                )
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <User className="h-4 w-4" />
          头像自定义
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={cn(
            "px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all duration-300",
            "relative overflow-hidden",
            activeTab === 'theme'
              ? cn(
                  "text-primary",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                  "after:bg-gradient-to-r after:from-primary after:to-accent",
                  "inspira-gradient-text"
                )
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Palette className="h-4 w-4" />
          主题选择
        </button>
      </div>

      {/* 头像自定义 */}
      {activeTab === 'avatar' && (
        <div className="space-y-6 animate-slide-up">
          {/* 头像预览 */}
          <Card className={cn(
            "inspira-glass-effect inspira-hover-lift",
            cardEffects.glass,
            "overflow-hidden"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "flex items-center gap-2",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>
                <User className="h-5 w-5" />
                头像预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="relative group">
                  {/* 背景圆环 */}
                  <div className={cn(
                    "h-28 w-28 rounded-full overflow-hidden bg-muted flex items-center justify-center",
                    "transition-all duration-300 group-hover:scale-105",
                    "border-2 border-border"
                  )}>
                    {selectedAvatar.background ? (
                      <img src={selectedAvatar.background} alt="背景" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-lg">BG</span>
                      </div>
                    )}
                  </div>
                  {/* 头像主体 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "h-20 w-20 rounded-full overflow-hidden bg-background flex items-center justify-center",
                      "transition-all duration-300 group-hover:scale-110",
                      "border-2 border-border shadow-lg"
                    )}>
                      {selectedAvatar.base ? (
                        <img src={selectedAvatar.base} alt="头像" className="h-full w-full object-cover" />
                      ) : (
                        <span className={cn(
                          "text-2xl font-bold",
                          textEffects.gradient(["var(--primary)", "var(--accent)"])
                        )}>{userId.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  {/* 发光效果 */}
                  <div className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-gradient-to-r from-primary/20 to-accent/20",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "animate-pulse-slow"
                  )}></div>
                </div>
                <Button
                  onClick={updateAvatar}
                  data-save-avatar
                  className={cn(
                    "flex items-center gap-2",
                    buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
                    "inspira-ripple-effect",
                    "text-white font-medium px-6 py-2 rounded-full",
                    "transition-all duration-300 hover:scale-105 active:scale-95"
                  )}
                >
                  <Check className="h-4 w-4" />
                  保存头像
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 头像选项 */}
          <div className="space-y-6">
            {/* 基础头像 */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className={cn(
                "text-lg font-semibold mb-4",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>基础头像</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getAvatarPartsByType('base').map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 overflow-hidden",
                      "inspira-hover-lift inspira-glow-effect",
                      "group",
                      selectedAvatar.base === option.id
                        ? cn(
                            "ring-2 ring-primary",
                            gamificationEffects.achievementUnlock
                          )
                        : "hover:shadow-lg hover:shadow-primary/10"
                    )}
                    onClick={() => {
                      if (isUnlocked(option.id)) {
                        // 添加选择动画效果
                        const card = document.querySelector(`[data-avatar-base="${option.id}"]`)
                        if (card) {
                          card.classList.add('animate-scale-up')
                          setTimeout(() => {
                            card.classList.remove('animate-scale-up')
                          }, 500)
                        }
                        setSelectedAvatar({ ...selectedAvatar, base: option.id })
                      }
                    }}
                    data-avatar-base={option.id}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative group">
                          <div className={cn(
                            "h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center",
                            "transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
                            "border-2 border-border shadow-sm",
                            "relative z-10"
                          )}>
                            {option.imageUrl ? (
                              <img src={option.imageUrl} alt={option.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className={cn(
                                "text-foreground text-lg font-bold",
                                "group-hover:text-primary transition-colors duration-300"
                              )}>{option.name.charAt(0)}</span>
                            )}
                          </div>
                          {!isUnlocked(option.id) && (
                            <div className={cn(
                              "absolute inset-0 bg-black/70 rounded-full flex items-center justify-center",
                              "backdrop-blur-sm transition-all duration-300",
                              "group-hover:bg-black/80"
                            )}>
                              <Lock className="h-6 w-6 text-white animate-pulse-slow" />
                            </div>
                          )}
                          {/* 悬停时的光晕效果 */}
                          <div className={cn(
                            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-300 pointer-events-none",
                            "bg-gradient-to-r from-primary/20 to-accent/20 blur-sm",
                            "animate-pulse-slow -z-10"
                          )}></div>
                        </div>
                        <span className="text-xs font-medium text-center text-foreground">{option.name}</span>
                        {option.points && option.points > 0 && (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <Star className="h-3 w-3 mr-1" />
                            {option.points}
                          </span>
                        )}
                        {!isUnlocked(option.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            data-unlock-avatar={option.id}
                            className={cn(
                              "text-xs w-full",
                              buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
                              "text-white border-0",
                              "transition-all duration-300 hover:scale-105 active:scale-95",
                              unlockStatus[option.id]
                                ? "hover:shadow-lg hover:shadow-primary/30"
                                : "opacity-50 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              unlockItem('avatar', option.id)
                            }}
                            disabled={!unlockStatus[option.id]}
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            解锁
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 配饰 */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className={cn(
                "text-lg font-semibold mb-4",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>配饰</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getAvatarPartsByType('accessory').map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 overflow-hidden",
                      "inspira-hover-lift inspira-glow-effect",
                      "group",
                      selectedAvatar.accessories.includes(option.id)
                        ? cn(
                            "ring-2 ring-primary",
                            gamificationEffects.achievementUnlock
                          )
                        : "hover:shadow-lg hover:shadow-primary/10"
                    )}
                    onClick={() => {
                      if (isUnlocked(option.id)) {
                        // 添加选择动画效果
                        const card = document.querySelector(`[data-avatar-accessory="${option.id}"]`)
                        if (card) {
                          card.classList.add('animate-scale-up')
                          setTimeout(() => {
                            card.classList.remove('animate-scale-up')
                          }, 500)
                        }
                        const newAccessories = selectedAvatar.accessories.includes(option.id)
                          ? selectedAvatar.accessories.filter(a => a !== option.id)
                          : [...selectedAvatar.accessories, option.id]
                        setSelectedAvatar({ ...selectedAvatar, accessories: newAccessories })
                      }
                    }}
                    data-avatar-accessory={option.id}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative group">
                          <div className={cn(
                            "h-16 w-16 bg-muted rounded-lg flex items-center justify-center",
                            "transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
                            "border-2 border-border shadow-sm",
                            "relative z-10"
                          )}>
                            <img src={option.imageUrl} alt={option.name} className="h-12 w-12 object-contain" />
                          </div>
                          {!isUnlocked(option.id) && (
                            <div className={cn(
                              "absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center",
                              "backdrop-blur-sm transition-all duration-300",
                              "group-hover:bg-black/80"
                            )}>
                              <Lock className="h-6 w-6 text-white animate-pulse-slow" />
                            </div>
                          )}
                          {/* 悬停时的光晕效果 */}
                          <div className={cn(
                            "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-300 pointer-events-none",
                            "bg-gradient-to-r from-primary/20 to-accent/20 blur-sm",
                            "animate-pulse-slow -z-10"
                          )}></div>
                        </div>
                        <span className="text-xs font-medium text-center text-foreground">{option.name}</span>
                        {option.points && option.points > 0 && (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <Star className="h-3 w-3 mr-1" />
                            {option.points}
                          </span>
                        )}
                        {!isUnlocked(option.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            data-unlock-avatar={option.id}
                            className={cn(
                              "text-xs w-full",
                              buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
                              "text-white border-0",
                              "transition-all duration-300 hover:scale-105 active:scale-95",
                              unlockStatus[option.id]
                                ? "hover:shadow-lg hover:shadow-primary/30"
                                : "opacity-50 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              unlockItem('avatar', option.id)
                            }}
                            disabled={!unlockStatus[option.id]}
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            解锁
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 背景 */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className={cn(
                "text-lg font-semibold mb-4",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>背景</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getAvatarPartsByType('background').map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 overflow-hidden",
                      "inspira-hover-lift inspira-glow-effect",
                      "group",
                      selectedAvatar.background === option.id
                        ? cn(
                            "ring-2 ring-primary",
                            gamificationEffects.achievementUnlock
                          )
                        : "hover:shadow-lg hover:shadow-primary/10"
                    )}
                    onClick={() => {
                      if (isUnlocked(option.id)) {
                        // 添加选择动画效果
                        const card = document.querySelector(`[data-avatar-background="${option.id}"]`)
                        if (card) {
                          card.classList.add('animate-scale-up')
                          setTimeout(() => {
                            card.classList.remove('animate-scale-up')
                          }, 500)
                        }
                        setSelectedAvatar({ ...selectedAvatar, background: option.id })
                      }
                    }}
                    data-avatar-background={option.id}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative group">
                          <div className={cn(
                            "h-16 w-16 rounded-lg overflow-hidden",
                            "transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
                            "border-2 border-border shadow-sm",
                            "relative z-10"
                          )}>
                            <img src={option.imageUrl} alt={option.name} className="h-full w-full object-cover" />
                          </div>
                          {!isUnlocked(option.id) && (
                            <div className={cn(
                              "absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center",
                              "backdrop-blur-sm transition-all duration-300",
                              "group-hover:bg-black/80"
                            )}>
                              <Lock className="h-6 w-6 text-white animate-pulse-slow" />
                            </div>
                          )}
                          {/* 悬停时的光晕效果 */}
                          <div className={cn(
                            "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-300 pointer-events-none",
                            "bg-gradient-to-r from-primary/20 to-accent/20 blur-sm",
                            "animate-pulse-slow -z-10"
                          )}></div>
                        </div>
                        <span className="text-xs font-medium text-center text-foreground">{option.name}</span>
                        {option.points && option.points > 0 && (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <Star className="h-3 w-3 mr-1" />
                            {option.points}
                          </span>
                        )}
                        {!isUnlocked(option.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            data-unlock-avatar={option.id}
                            className={cn(
                              "text-xs w-full",
                              buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
                              "text-white border-0",
                              "transition-all duration-300 hover:scale-105 active:scale-95",
                              unlockStatus[option.id]
                                ? "hover:shadow-lg hover:shadow-primary/30"
                                : "opacity-50 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              unlockItem('avatar', option.id)
                            }}
                            disabled={!unlockStatus[option.id]}
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            解锁
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主题选择 */}
      {activeTab === 'theme' && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themeOptions.map((theme) => (
              <Card
                key={theme.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 overflow-hidden",
                  "inspira-hover-lift inspira-glow-effect",
                  "group",
                  selectedTheme === theme.id
                    ? cn(
                        "ring-2 ring-primary",
                        gamificationEffects.achievementUnlock
                      )
                    : "hover:shadow-lg hover:shadow-primary/10"
                )}
                onClick={() => {
                  if (isUnlocked(theme.id)) {
                    updateTheme(theme.id)
                  }
                }}
                data-theme-card
              >
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-semibold text-lg transition-all duration-300",
                        selectedTheme === theme.id
                          ? textEffects.gradient(["var(--primary)", "var(--accent)"])
                          : "group-hover:text-primary"
                      )}>{theme.name}</h3>
                      <div className="flex items-center gap-2">
                        {isUnlocked(theme.id) && selectedTheme === theme.id && (
                          <div className={cn(
                            "h-6 w-6 rounded-full bg-green-500 flex items-center justify-center",
                            "animate-fade-in shadow-lg shadow-green-500/30"
                          )}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {theme.id === 'default-theme' && (
                          <Crown className={cn(
                            "h-5 w-5 text-yellow-500",
                            "animate-pulse-slow drop-shadow-lg shadow-yellow-500/30"
                          )} />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                    
                    {/* 颜色预览 */}
                    <div className="flex space-x-3">
                      {Object.values(theme.colors).map((color, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-10 w-10 rounded-md border-2 border-border",
                            "transition-all duration-300 hover:scale-110 hover:shadow-md hover:rotate-6",
                            "cursor-pointer relative overflow-hidden group/color",
                            "before:absolute before:inset-0 before:bg-white/20 before:opacity-0",
                            "hover:before:opacity-100 before:transition-opacity before:duration-300"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {/* 颜色悬停时的光泽效果 */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover/color:opacity-100",
                            "transition-opacity duration-300",
                            "bg-gradient-to-br from-white/30 to-transparent"
                          )}></div>
                        </div>
                      ))}
                    </div>
                    
                    {theme.points && theme.points > 0 && (
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        <Star className="h-3 w-3 mr-1" />
                        {theme.points}
                      </span>
                    )}
                    
                    {!isUnlocked(theme.id) && (
                      <div className="pt-2">
                        <p className="text-xs text-destructive mb-3 font-medium">
                          {unlockReasons[theme.id] || '需要解锁'}
                        </p>
                        <Button
                          size="sm"
                          data-unlock-theme={theme.id}
                          className={cn(
                            "w-full text-xs",
                            buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
                            "text-white border-0",
                            "transition-all duration-300 hover:scale-105 active:scale-95",
                            unlockStatus[theme.id]
                              ? "hover:shadow-lg hover:shadow-primary/30"
                              : "opacity-50 cursor-not-allowed"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            unlockItem('theme', theme.id)
                          }}
                          disabled={!unlockStatus[theme.id]}
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          解锁主题
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 刷新按钮 */}
      <div className="flex justify-end animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <Button
          variant="outline"
          onClick={fetchCustomizationData}
          className={cn(
            "flex items-center gap-2 group",
            buttonEffects.gradient(["var(--primary)", "var(--accent)"]),
            "text-white border-0 inspira-ripple-effect",
            "transition-all duration-300 hover:scale-105 active:scale-95"
          )}
        >
          <RefreshCw className={cn(
            "h-4 w-4 transition-transform duration-500",
            "group-hover:rotate-180"
          )} />
          刷新
        </Button>
      </div>
    </div>
  )
}