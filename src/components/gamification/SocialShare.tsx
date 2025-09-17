'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Share2,
  Copy,
  CheckCircle,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Download,
  QrCode,
  Link,
  X,
  Image,
  Edit,
  BarChart3,
  History,
  Settings,
  Sparkles,
  Award,
  Trophy,
  Star,
  TrendingUp,
  Zap,
  Users,
  Heart,
  Eye
} from 'lucide-react'
import { Achievement, UserAchievement, GamificationProfile } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
  animations,
  cardEffects,
  textEffects,
  gamificationEffects,
  gamificationUtils,
  backgroundEffects,
  buttonEffects
} from '@/lib/inspira-ui'
import { motion } from 'framer-motion'

// 社交平台类型
type SocialPlatform = 'wechat' | 'weibo' | 'qq' | 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'douyin'

// 分享内容类型
type ShareContentType = 'achievement' | 'badge' | 'profile' | 'progress' | 'leaderboard'

// 分享历史记录类型
interface ShareHistory {
  id: string
  platform: SocialPlatform
  contentType: ShareContentType
  contentId: string
  shareText: string
  shareImage?: string
  sharedAt: Date
  views?: number
  likes?: number
  shares?: number
}

// 社交分享组件属性
interface SocialShareProps {
  // 分享内容类型
  contentType: ShareContentType
  // 内容ID
  contentId: string
  // 成就数据（如果分享类型是成就）
  achievement?: Achievement & { userAchievement?: UserAchievement }
  // 游戏化资料（如果分享类型是个人资料或进度）
  profile?: GamificationProfile
  // 是否显示模态框
  isOpen: boolean
  // 关闭回调
  onClose: () => void
  // 用户ID
  userId: string
}

export function SocialShare({ 
  contentType, 
  contentId, 
  achievement, 
  profile, 
  isOpen, 
  onClose, 
  userId 
}: SocialShareProps) {
  // 状态管理
  const [copied, setCopied] = useState(false)
  const [shareText, setShareText] = useState('')
  const [activeTab, setActiveTab] = useState<'share' | 'customize' | 'history' | 'stats'>('share')
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('wechat')
  const [shareHistory, setShareHistory] = useState<ShareHistory[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [shareImage, setShareImage] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  
  // 引用
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 初始化分享文本
  useEffect(() => {
    generateDefaultShareText()
  }, [contentType, achievement, profile])
  
  // 生成默认分享文本
  const generateDefaultShareText = () => {
    let defaultText = ''
    
    switch (contentType) {
      case 'achievement':
        if (achievement) {
          defaultText = `我刚刚解锁了成就「${achievement.name}」！🏆 ${achievement.description}`
        }
        break
      case 'badge':
        if (achievement) {
          defaultText = `我获得了新徽章「${achievement.name}」！✨ 在记忆助手中不断进步，感觉太棒了！`
        }
        break
      case 'profile':
        if (profile) {
          defaultText = `我在记忆助手已经达到${profile.level}级，获得了${profile.points}积分！🚀 挑战自我，不断成长！`
        }
        break
      case 'progress':
        if (profile) {
          defaultText = `我在记忆助手已经连续学习${profile.streak}天了！📚 坚持就是胜利，每一天都是新的开始！`
        }
        break
      case 'leaderboard':
        defaultText = `我在记忆助手的排行榜上取得了不错的成绩！🏆 和我一起挑战记忆力，提升学习效率吧！`
        break
    }
    
    setShareText(defaultText)
    setCustomTitle(defaultText.split('！')[0] + '！')
    setCustomDescription(defaultText)
  }
  
  // 复制链接到剪贴板
  const copyToClipboard = () => {
    const shareUrl = generateShareUrl()
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    // 记录分享历史
    recordShareHistory('link')
  }
  
  // 生成分享URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/share/${contentType}/${contentId}`
  }
  
  // 分享到社交媒体
  const shareToSocial = (platform: SocialPlatform) => {
    const shareUrl = encodeURIComponent(generateShareUrl())
    const text = encodeURIComponent(shareText)
    
    switch (platform) {
      case 'wechat':
        // 微信分享通常需要特殊处理，这里复制到剪贴板
        copyToClipboard()
        alert('链接已复制到剪贴板，请在微信中粘贴分享')
        break
      case 'weibo':
        window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${shareUrl}`, '_blank')
        break
      case 'qq':
        window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${shareUrl}&title=${text}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`, '_blank')
        break
      case 'instagram':
        // Instagram 不支持直接分享链接，这里可以复制到剪贴板并提示用户
        copyToClipboard()
        alert('链接已复制到剪贴板，请在Instagram应用中粘贴分享')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${text}`, '_blank')
        break
      case 'douyin':
        // 抖音分享通常需要特殊处理，这里复制到剪贴板
        copyToClipboard()
        alert('链接已复制到剪贴板，请在抖音中粘贴分享')
        break
    }
    
    // 记录分享历史
    recordShareHistory(platform)
  }
  
  // 记录分享历史
  const recordShareHistory = (platform: SocialPlatform | 'link') => {
    const newShare: ShareHistory = {
      id: Date.now().toString(),
      platform: platform === 'link' ? 'wechat' : platform,
      contentType,
      contentId,
      shareText,
      shareImage: shareImage || undefined,
      sharedAt: new Date(),
      views: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20)
    }
    
    setShareHistory(prev => [newShare, ...prev.slice(0, 9)]) // 只保留最近10条记录
    
    // 这里可以添加API调用，将分享记录保存到服务器
    // saveShareHistoryToServer(newShare)
  }
  
  // 生成QR码
  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateShareUrl())}`
  }
  
  // 生成分享图片
  const generateShareImage = async () => {
    setIsGeneratingImage(true)
    
    try {
      // 这里使用html2canvas或类似库来生成图片
      // 由于这是一个示例，我们将使用一个占位符
      // 在实际项目中，您需要安装并使用html2canvas
      
      // 模拟异步生成图片的过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 在实际项目中，这里会是生成的图片数据URL
      const mockImageUrl = `https://via.placeholder.com/800x600/3b82f6/ffffff?text=${encodeURIComponent('分享图片')}`
      setShareImage(mockImageUrl)
    } catch (error) {
      console.error('生成分享图片失败:', error)
      alert('生成分享图片失败，请稍后再试')
    } finally {
      setIsGeneratingImage(false)
    }
  }
  
  // 下载分享图片
  const downloadShareImage = () => {
    if (!shareImage) {
      alert('请先生成分享图片')
      return
    }
    
    const link = document.createElement('a')
    link.href = shareImage
    link.download = `记忆助手-${contentType}-${contentId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 记录分享历史
    recordShareHistory('wechat') // 假设下载是为了在微信分享
  }
  
  // 获取平台图标
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'wechat':
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case 'weibo':
        return <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">微</div>
      case 'qq':
        return <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q</div>
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />
      case 'linkedin':
        return <div className="h-5 w-5 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">in</div>
      case 'douyin':
        return <div className="h-5 w-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">抖</div>
    }
  }
  
  // 获取平台名称
  const getPlatformName = (platform: SocialPlatform) => {
    switch (platform) {
      case 'wechat':
        return '微信'
      case 'weibo':
        return '微博'
      case 'qq':
        return 'QQ'
      case 'twitter':
        return 'Twitter'
      case 'facebook':
        return 'Facebook'
      case 'instagram':
        return 'Instagram'
      case 'linkedin':
        return 'LinkedIn'
      case 'douyin':
        return '抖音'
    }
  }
  
  // 渲染分享内容预览
  const renderSharePreview = () => {
    return (
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-lg",
        cardEffects.glass
      )}>
        <CardContent className="p-4 space-y-4">
          {/* 根据内容类型渲染不同的预览 */}
          {contentType === 'achievement' && achievement && (
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg",
                gamificationEffects.achievementUnlock
              )}>
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    +{gamificationUtils.formatPoints(achievement.points)} 积分
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {contentType === 'badge' && achievement && (
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg",
                gamificationEffects.achievementUnlock
              )}>
                <div className="text-2xl">🏆</div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-blue-100 text-blue-800">
                    徽章
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {contentType === 'profile' && profile && (
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg",
                gamificationEffects.levelUp
              )}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">游戏化资料</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm">等级 {profile.level}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm">{gamificationUtils.formatPoints(profile.points)} 积分</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm">{profile.streak} 天连续学习</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {contentType === 'progress' && profile && (
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg",
                gamificationEffects.streakEffect(profile.streak)
              )}>
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">学习进度</h3>
                <p className="text-sm text-gray-600">连续学习 {profile.streak} 天</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, profile.streak * 5)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {contentType === 'leaderboard' && (
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
              )}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">排行榜成绩</h3>
                <p className="text-sm text-gray-600">在记忆助手排行榜上取得优异成绩</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-red-100 text-red-800">
                    排行榜
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* 分享文本 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{shareText}</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // 渲染自定义内容编辑器
  const renderCustomizeEditor = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分享标题
          </label>
          <Input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="输入分享标题"
            className={cn(
              "transition-all duration-300",
              "focus:border-blue-500"
            )}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分享描述
          </label>
          <Textarea
            value={customDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomDescription(e.target.value)}
            placeholder="输入分享描述"
            rows={3}
            className={cn(
              "transition-all duration-300",
              "focus:border-blue-500"
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={generateDefaultShareText}
            className={cn(
              "transition-all duration-300",
              "hover:scale-105"
            )}
          >
            重置为默认
          </Button>
          <Button
            onClick={() => {
              setShareText(customTitle + ' ' + customDescription)
              setActiveTab('share')
            }}
            className={cn(
              "transition-all duration-300",
              "hover:scale-105"
            )}
          >
            应用更改
          </Button>
        </div>
      </div>
    )
  }
  
  // 渲染分享历史
  const renderShareHistory = () => {
    if (shareHistory.length === 0) {
      return (
        <div className="text-center py-8">
          <History className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">暂无分享历史</p>
          <p className="text-sm text-gray-400 mt-1">分享内容后将显示在这里</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {shareHistory.map((history) => (
          <Card 
            key={history.id} 
            className={cn(
              "transition-all duration-300",
              "hover:shadow-md",
              cardEffects.hover
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getPlatformIcon(history.platform)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-sm">{getPlatformName(history.platform)}</span>
                      <Badge className="ml-2 text-xs" variant="outline">
                        {history.contentType === 'achievement' && '成就'}
                        {history.contentType === 'badge' && '徽章'}
                        {history.contentType === 'profile' && '资料'}
                        {history.contentType === 'progress' && '进度'}
                        {history.contentType === 'leaderboard' && '排行榜'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(history.sharedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {history.shareText}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="h-3 w-3 mr-1" />
                    {history.views}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="h-3 w-3 mr-1" />
                    {history.likes}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Share2 className="h-3 w-3 mr-1" />
                    {history.shares}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // 渲染分享统计
  const renderShareStats = () => {
    // 计算统计数据
    const totalShares = shareHistory.length
    const totalViews = shareHistory.reduce((sum, history) => sum + (history.views || 0), 0)
    const totalLikes = shareHistory.reduce((sum, history) => sum + (history.likes || 0), 0)
    const totalReShares = shareHistory.reduce((sum, history) => sum + (history.shares || 0), 0)
    
    // 按平台统计
    const platformStats = shareHistory.reduce((stats, history) => {
      stats[history.platform] = (stats[history.platform] || 0) + 1
      return stats
    }, {} as Record<SocialPlatform, number>)
    
    // 按内容类型统计
    const contentTypeStats = shareHistory.reduce((stats, history) => {
      stats[history.contentType] = (stats[history.contentType] || 0) + 1
      return stats
    }, {} as Record<ShareContentType, number>)
    
    return (
      <div className="space-y-6">
        {/* 总览统计 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-blue-50 to-indigo-50",
            "border border-blue-100",
            cardEffects.hover
          )}>
            <CardContent className="p-4 text-center">
              <Share2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{totalShares}</div>
              <div className="text-xs text-blue-600">总分享次数</div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-green-50 to-emerald-50",
            "border border-green-100",
            cardEffects.hover
          )}>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold text-green-700">{totalViews}</div>
              <div className="text-xs text-green-600">总浏览量</div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-red-50 to-rose-50",
            "border border-red-100",
            cardEffects.hover
          )}>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <div className="text-2xl font-bold text-red-700">{totalLikes}</div>
              <div className="text-xs text-red-600">总点赞数</div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-purple-50 to-violet-50",
            "border border-purple-100",
            cardEffects.hover
          )}>
            <CardContent className="p-4 text-center">
              <Share2 className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-bold text-purple-700">{totalReShares}</div>
              <div className="text-xs text-purple-600">总转发数</div>
            </CardContent>
          </Card>
        </div>
        
        {/* 平台分布 */}
        <Card className={cn(
          "overflow-hidden transition-all duration-500",
          "bg-gradient-to-br from-white/90 to-white/70",
          "backdrop-blur-xl border border-white/30",
          "shadow-lg",
          cardEffects.glass
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              平台分布
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Object.entries(platformStats).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(platform as SocialPlatform)}
                    <span className="text-sm font-medium">{getPlatformName(platform as SocialPlatform)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / totalShares) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 内容类型分布 */}
        <Card className={cn(
          "overflow-hidden transition-all duration-500",
          "bg-gradient-to-br from-white/90 to-white/70",
          "backdrop-blur-xl border border-white/30",
          "shadow-lg",
          cardEffects.glass
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              内容类型分布
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Object.entries(contentTypeStats).map(([contentType, count]) => (
                <div key={contentType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {contentType === 'achievement' && '成就'}
                      {contentType === 'badge' && '徽章'}
                      {contentType === 'profile' && '资料'}
                      {contentType === 'progress' && '进度'}
                      {contentType === 'leaderboard' && '排行榜'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(count / totalShares) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={cn(
        "relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-2xl",
        animations.fadeIn(300)
      )}>
        {/* 背景装饰 */}
        <div className={cn(
          "absolute inset-0 -z-10 overflow-hidden rounded-2xl",
          backgroundEffects.particles
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20 rounded-2xl"></div>
          {/* 浮动元素 */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        </div>
        
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "text-xl font-bold flex items-center gap-2",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>
                <Share2 className="h-5 w-5" />
                社交分享
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={cn(
                  "rounded-full p-2 transition-all duration-300",
                  "hover:bg-white/20 hover:scale-105"
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 选项卡导航 */}
            <Card className={cn(
              "overflow-hidden transition-all duration-500",
              "bg-gradient-to-br from-white/90 to-white/70",
              "backdrop-blur-xl border border-white/30",
              "shadow-lg",
              cardEffects.glass
            )}>
              <CardContent className="p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('share')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      activeTab === 'share'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    <Share2 className="h-4 w-4 inline mr-1" />
                    分享
                  </button>
                  <button
                    onClick={() => setActiveTab('customize')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      activeTab === 'customize'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    自定义
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      activeTab === 'history'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    <History className="h-4 w-4 inline mr-1" />
                    历史
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      activeTab === 'stats'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-1" />
                    统计
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* 分享内容 */}
            {activeTab === 'share' && (
              <div className="space-y-6">
                {/* 分享预览 */}
                {renderSharePreview()}
                
                {/* 分享文本编辑 */}
                <Card className={cn(
                  "overflow-hidden transition-all duration-500",
                  "bg-gradient-to-br from-white/90 to-white/70",
                  "backdrop-blur-xl border border-white/30",
                  "shadow-lg",
                  cardEffects.glass,
                  animations.slideIn('up', 300)
                )}>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1 text-gray-900">分享文本</div>
                      <Textarea
                        value={shareText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShareText(e.target.value)}
                        placeholder="输入分享内容..."
                        rows={3}
                        className={cn(
                          "transition-all duration-300",
                          "focus:border-blue-500"
                        )}
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-1 text-gray-900">分享链接</div>
                      <div className="flex mt-1">
                        <Input
                          value={generateShareUrl()}
                          readOnly
                          className={cn(
                            "rounded-r-none transition-all duration-300",
                            "focus:border-blue-500"
                          )}
                        />
                        <Button
                          onClick={copyToClipboard}
                          className={cn(
                            "rounded-l-none transition-all duration-300",
                            copied ? "bg-green-500 hover:bg-green-600" : "hover:scale-105"
                          )}
                        >
                          {copied ? <CheckCircle className="h-4 w-4 animate-pulse" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 社交平台选择 */}
                <Card className={cn(
                  "overflow-hidden transition-all duration-500",
                  "bg-gradient-to-br from-white/90 to-white/70",
                  "backdrop-blur-xl border border-white/30",
                  "shadow-lg",
                  cardEffects.glass
                )}>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-3 text-gray-900">分享到社交媒体</div>
                    <div className="grid grid-cols-4 gap-3">
                      {(['wechat', 'weibo', 'qq', 'twitter', 'facebook', 'instagram', 'linkedin', 'douyin'] as SocialPlatform[]).map((platform) => (
                        <Button
                          key={platform}
                          onClick={() => shareToSocial(platform)}
                          className={cn(
                            "flex flex-col items-center gap-2 h-auto py-3 transition-all duration-300",
                            "hover:scale-105 hover:shadow-md"
                          )}
                          variant="outline"
                        >
                          {getPlatformIcon(platform)}
                          <span className="text-xs">{getPlatformName(platform)}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* 图片分享选项 */}
                <Card className={cn(
                  "overflow-hidden transition-all duration-500",
                  "bg-gradient-to-br from-white/90 to-white/70",
                  "backdrop-blur-xl border border-white/30",
                  "shadow-lg",
                  cardEffects.glass
                )}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">分享图片</div>
                      <Button
                        onClick={generateShareImage}
                        disabled={isGeneratingImage}
                        className={cn(
                          "transition-all duration-300",
                          "hover:scale-105",
                          isGeneratingImage && "opacity-70"
                        )}
                        variant="outline"
                        size="sm"
                      >
                        {isGeneratingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            生成中...
                          </>
                        ) : (
                          <>
                            <Image className="h-4 w-4 mr-2" />
                            生成图片
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {shareImage && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2 text-gray-900">分享图片预览</div>
                        <div className="relative">
                          <img 
                            src={shareImage} 
                            alt="分享图片预览" 
                            className="w-full rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <Button
                              onClick={downloadShareImage}
                              className={cn(
                                "opacity-0 hover:opacity-100 transition-opacity duration-300",
                                "hover:scale-105"
                              )}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              下载图片
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* 关闭按钮 */}
                <Button
                  onClick={onClose}
                  className={cn(
                    "w-full transition-all duration-300",
                    "hover:scale-105 hover:shadow-md"
                  )}
                  variant="outline"
                >
                  关闭
                </Button>
              </div>
            )}
            
            {/* 自定义内容 */}
            {activeTab === 'customize' && renderCustomizeEditor()}
            
            {/* 分享历史 */}
            {activeTab === 'history' && renderShareHistory()}
            
            {/* 分享统计 */}
            {activeTab === 'stats' && renderShareStats()}
          </CardContent>
        </Card>
      </div>
      
      {/* 隐藏的Canvas用于生成图片 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}