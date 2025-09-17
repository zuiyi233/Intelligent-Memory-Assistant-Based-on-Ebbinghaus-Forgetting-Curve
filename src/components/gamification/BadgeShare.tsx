'use client'

import React, { useState, ChangeEvent } from 'react'
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
  X
} from 'lucide-react'
import { Achievement } from '@prisma/client'
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
import { SocialShare } from './SocialShare'

// 徽章分享组件
interface BadgeShareProps {
  badge: Achievement
  isOpen: boolean
  onClose: () => void
  userId?: string
}

export function BadgeShare({ badge, isOpen, onClose, userId }: BadgeShareProps) {
  const [copied, setCopied] = useState(false)
  const [shareText, setShareText] = useState(`我刚刚解锁了徽章「${badge.name}」！🏆 ${badge.description}`)
  const [sharePlatform, setSharePlatform] = useState<'link' | 'social' | 'qr'>('link')
  const [showAdvancedShare, setShowAdvancedShare] = useState(false)
  
  // 复制链接到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // 分享到社交媒体
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'instagram' | 'wechat') => {
    const shareUrl = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(shareText)
    
    switch (platform) {
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
      case 'wechat':
        // 微信分享通常需要特殊处理，这里复制到剪贴板
        copyToClipboard()
        alert('链接已复制到剪贴板，请在微信中粘贴分享')
        break
    }
  }
  
  // 生成QR码（这里使用一个占位符，实际项目中可以使用QR码生成库）
  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`
  }
  
  // 下载徽章图片（这里使用一个占位符，实际项目中可以使用html2canvas等库）
  const downloadBadgeImage = () => {
    alert('徽章图片下载功能正在开发中')
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
        "relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl",
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
                分享徽章
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
            {/* 徽章预览 */}
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg transition-all duration-300",
                "hover:shadow-xl hover:scale-105",
                gamificationEffects.achievementUnlock
              )}>
                <div className={cn(
                  "w-28 h-28 rounded-full bg-white flex items-center justify-center transition-all duration-300",
                  "hover:scale-105"
                )}>
                  <div className="text-5xl animate-pulse">🏆</div>
                </div>
              </div>
              <div className="text-center">
                <h3 className={cn(
                  "text-lg font-bold text-gray-900 transition-all duration-300",
                  textEffects.gradient(["var(--primary)", "var(--accent)"])
                )}>
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 transition-all duration-300">{badge.description}</p>
              </div>
            </div>
            
            {/* 分享选项卡 */}
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
                    onClick={() => setSharePlatform('link')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      sharePlatform === 'link'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    链接分享
                  </button>
                  <button
                    onClick={() => setSharePlatform('social')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      sharePlatform === 'social'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    社交媒体
                  </button>
                  <button
                    onClick={() => setSharePlatform('qr')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
                      sharePlatform === 'qr'
                        ? "bg-white shadow text-gray-900 scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    )}
                  >
                    二维码
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* 分享内容 */}
            {sharePlatform === 'link' && (
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
                    <div
                      id="shareText"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => setShareText(e.currentTarget.textContent || '')}
                      className={cn(
                        "mt-1 min-h-[75px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                      )}
                    >
                      {shareText}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1 text-gray-900">分享链接</div>
                    <div className="flex mt-1">
                      <Input
                        id="shareLink"
                        value={window.location.href}
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
                  
                  <Button
                    onClick={downloadBadgeImage}
                    className={cn(
                      "w-full transition-all duration-300",
                      "hover:scale-105 hover:shadow-md"
                    )}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载徽章图片
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {sharePlatform === 'social' && (
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
                    <div className="text-sm font-medium mb-1 text-gray-900">分享内容</div>
                    <div
                      id="socialText"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => setShareText(e.currentTarget.textContent || '')}
                      className={cn(
                        "mt-1 min-h-[75px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                      )}
                    >
                      {shareText}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        "hover:scale-105 hover:shadow-md"
                      )}
                      variant="outline"
                    >
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Twitter
                    </Button>
                    
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        "hover:scale-105 hover:shadow-md"
                      )}
                      variant="outline"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </Button>
                    
                    <Button
                      onClick={() => shareToSocial('instagram')}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        "hover:scale-105 hover:shadow-md"
                      )}
                      variant="outline"
                    >
                      <Instagram className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Button>
                    
                    <Button
                      onClick={() => shareToSocial('wechat')}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        "hover:scale-105 hover:shadow-md"
                      )}
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      微信
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {sharePlatform === 'qr' && (
              <Card className={cn(
                "overflow-hidden transition-all duration-500",
                "bg-gradient-to-br from-white/90 to-white/70",
                "backdrop-blur-xl border border-white/30",
                "shadow-lg",
                cardEffects.glass,
                animations.slideIn('up', 300)
              )}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className={cn(
                      "bg-white p-4 rounded-xl transition-all duration-300",
                      "hover:shadow-lg hover:scale-105"
                    )}>
                      <img
                        src={generateQRCode()}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      扫描二维码查看徽章详情
                    </p>
                  </div>
                  
                  <Button
                    onClick={copyToClipboard}
                    className={cn(
                      "w-full transition-all duration-300",
                      copied ? "bg-green-500 hover:bg-green-600" : "hover:scale-105 hover:shadow-md"
                    )}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    {copied ? '链接已复制' : '复制链接'}
                  </Button>
                </CardContent>
              </Card>
            )}
            
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
            
            {/* 高级分享按钮 */}
            <Button
              onClick={() => setShowAdvancedShare(true)}
              className={cn(
                "w-full transition-all duration-300",
                "hover:scale-105 hover:shadow-md"
              )}
            >
              <Share2 className="h-4 w-4 mr-2" />
              高级分享
            </Button>
            
            {/* 高级分享模态框 */}
            {showAdvancedShare && userId && (
              <SocialShare
                contentType="badge"
                contentId={badge.id}
                achievement={badge}
                isOpen={showAdvancedShare}
                onClose={() => setShowAdvancedShare(false)}
                userId={userId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}