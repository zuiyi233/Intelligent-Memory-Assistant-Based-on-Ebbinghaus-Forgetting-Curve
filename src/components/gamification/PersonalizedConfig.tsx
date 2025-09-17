'use client'

import React, { useState, useEffect } from 'react'
import { animations, cardEffects } from '@/lib/inspira-ui'
import {
  PersonalizedConfig as PersonalizedConfigType,
  DifficultyConfig,
  NotificationConfig,
  ThemeConfig,
  UserPreferences,
  LearningStyleAdaptationConfig,
  DifficultyLevel,
  NotificationType,
  NotificationMethod,
  ThemeStyle,
  LearningStyleAdaptationStrategy
} from '@/types'
import { LearningStyleType } from '@prisma/client'

interface PersonalizedConfigProps {
  userId: string
  initialConfig?: PersonalizedConfigType
  onConfigSave?: (config: PersonalizedConfigType) => void
  onConfigChange?: (config: Partial<PersonalizedConfigType>) => void
}

/**
 * 个性化配置组件
 * 基于学习风格提供智能的个性化配置选项
 */
export const PersonalizedConfig: React.FC<PersonalizedConfigProps> = ({
  userId,
  initialConfig,
  onConfigSave,
  onConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<'difficulty' | 'notifications' | 'theme' | 'preferences' | 'adaptation'>('difficulty')
  const [config, setConfig] = useState<Partial<PersonalizedConfigType>>(initialConfig || {})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<{
    reasoning: string[];
    confidence: number;
    recommendations: Partial<PersonalizedConfigType>;
  } | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // 加载用户配置
  useEffect(() => {
    const loadUserConfig = async () => {
      setInitialLoading(true)
      try {
        if (!initialConfig) {
          const response = await fetch(`/api/gamification/personalized-config?userId=${userId}`, {
            method: 'GET'
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setConfig(result.data)
              setInitialLoading(false)
              return
            }
          }
        }
        
        // 如果没有保存的配置，使用默认配置
        const defaultConfig: Partial<PersonalizedConfigType> = {
          difficulty: {
            level: DifficultyLevel.ADAPTIVE,
            adaptiveMode: true,
            autoAdjust: true,
            baseDifficulty: 3,
            contentDifficultyAdjustment: {
              text: 3,
              image: 3,
              audio: 3,
              video: 3,
              interactive: 3,
              quiz: 3
            },
            challengeProgression: {
              easy: 0.3,
              medium: 0.5,
              hard: 0.2
            }
          },
          notifications: {
            enabled: true,
            methods: [NotificationMethod.IN_APP],
            types: [
              NotificationType.REMINDER,
              NotificationType.ACHIEVEMENT,
              NotificationType.CHALLENGE,
              NotificationType.STREAK,
              NotificationType.LEVEL_UP,
              NotificationType.POINTS_EARNED
            ],
            frequency: {
              reminders: 'daily',
              achievements: 'immediate',
              challenges: 'daily',
              reports: 'weekly'
            },
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00'
            },
            learningStylePreferences: {
              visual: true,
              auditory: true,
              kinesthetic: true,
              reading: true
            }
          },
          theme: {
            style: ThemeStyle.AUTO,
            primaryColor: '#3B82F6',
            secondaryColor: '#60A5FA',
            accentColor: '#EF4444',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            fontSize: 'medium',
            fontFamily: 'sans-serif',
            borderRadius: 'medium',
            animations: {
              enabled: true,
              duration: 300,
              easing: 'ease-in-out'
            }
          },
          preferences: {
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            firstDayOfWeek: 1,
            accessibility: {
              highContrast: false,
              reducedMotion: false,
              screenReader: false,
              fontSize: 'medium'
            },
            privacy: {
              shareProgress: true,
              shareAchievements: true,
              analyticsEnabled: true,
              personalizedAds: false
            }
          },
          learningStyleAdaptation: {
            strategy: LearningStyleAdaptationStrategy.BALANCED,
            primaryStyle: LearningStyleType.MIXED,
            adaptationSettings: {
              visualWeight: 0.25,
              auditoryWeight: 0.25,
              kinestheticWeight: 0.25,
              readingWeight: 0.25
            },
            contentPreferences: {
              preferredContentTypes: [],
              preferredChallengeTypes: [],
              preferredInteractionModes: []
            },
            performanceTracking: {
              enabled: true,
              adaptationFrequency: 'weekly',
              feedbackSensitivity: 0.7
            }
          }
        }
        setConfig(defaultConfig)
      } catch (error) {
        console.error('加载用户配置失败:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserConfig()
  }, [userId, initialConfig])

  // 处理配置变更
  const handleConfigChange = (section: keyof PersonalizedConfigType, value: Record<string, unknown>) => {
    const currentSection = config[section] as unknown as Record<string, unknown> || {}
    const newConfig = {
      ...config,
      [section]: {
        ...currentSection,
        ...value
      }
    } as Partial<PersonalizedConfigType>
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  // 保存配置
  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/gamification/personalized-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          config
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onConfigSave?.(result.data as PersonalizedConfigType)
          alert('配置保存成功！')
        } else {
          alert(`保存失败: ${result.error}`)
        }
      } else {
        alert('保存失败，请稍后重试')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  // 获取用户学习风格
  const getUserLearningStyle = async () => {
    try {
      const response = await fetch(`/api/gamification/profile?userId=${userId}`, {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.learningStyle) {
          return result.data.learningStyle
        }
      }
      return LearningStyleType.MIXED // 默认值
    } catch (error) {
      console.error('获取用户学习风格失败:', error)
      return LearningStyleType.MIXED // 默认值
    }
  }

  // 获取推荐配置
  const handleGetRecommendations = async () => {
    setLoading(true)
    try {
      // 获取用户的学习风格
      const learningStyle = await getUserLearningStyle()
      
      const response = await fetch(`/api/gamification/personalized-config/recommendations?userId=${userId}&learningStyle=${learningStyle}`, {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRecommendations(result.data)
          setShowRecommendations(true)
        } else {
          alert(`获取推荐失败: ${result.error}`)
        }
      } else {
        alert('获取推荐失败，请稍后重试')
      }
    } catch (error) {
      console.error('获取推荐配置失败:', error)
      alert('获取推荐失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 应用推荐配置
  const handleApplyRecommendations = () => {
    if (recommendations) {
      setConfig(recommendations.recommendations)
      setShowRecommendations(false)
      onConfigChange?.(recommendations.recommendations as Partial<PersonalizedConfigType>)
    }
  }

  return (
    <div className="personalized-config-container animate-fade-in">
      {initialLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载您的个性化配置...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="config-header animate-slide-in-down">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">个性化配置</h1>
            <p className="text-gray-600 mb-6">根据您的学习风格和偏好自定义游戏化体验</p>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${cardEffects.glowBorder('#3B82F6')} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? '保存中...' : '保存配置'}
              </button>
              <button
                onClick={handleGetRecommendations}
                disabled={loading}
                className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${cardEffects.glowBorder('#10B981')} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? '获取中...' : '智能推荐'}
              </button>
            </div>
          </div>

          {/* 推荐配置弹窗 */}
          {showRecommendations && recommendations && (
            <div className="recommendations-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-scale-in">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 glass-effect">
                <h2 className="text-xl font-bold mb-4">智能推荐配置</h2>
                <p className="text-gray-600 mb-4">
                  基于您的学习风格分析，我们为您推荐以下配置：
                </p>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">推荐理由：</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {recommendations.reasoning.map((reason: string, index: number) => (
                      <li key={index} className="text-gray-700">{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">置信度：</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${recommendations.confidence * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.round(recommendations.confidence * 100)}% 匹配您的学习风格
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleApplyRecommendations}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    应用推荐
                  </button>
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 配置选项卡 */}
          <div className="config-tabs">
            <div className="tab-navigation flex border-b animate-slide-in-up">
              {[
                { id: 'difficulty', label: '难度调整' },
                { id: 'notifications', label: '通知设置' },
                { id: 'theme', label: '视觉主题' },
                { id: 'preferences', label: '偏好设置' },
                { id: 'adaptation', label: '学习适配' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'difficulty' | 'notifications' | 'theme' | 'preferences' | 'adaptation')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content p-6 animate-fade-in">
              {activeTab === 'difficulty' && (
                <div className="difficulty-config">
                  <h2 className="text-xl font-semibold mb-4">难度调整</h2>
                  <p className="text-gray-600 mb-6">
                    根据您的学习风格和能力水平调整学习内容的难度
                  </p>
                  
                  <div className="space-y-6">
                    {/* 难度模式选择 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">难度模式</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span>自适应难度</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.difficulty?.adaptiveMode || false}
                            onChange={(e) => handleConfigChange('difficulty', {
                              adaptiveMode: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>自动调整</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.difficulty?.autoAdjust || false}
                            onChange={(e) => handleConfigChange('difficulty', {
                              autoAdjust: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    {/* 基础难度设置 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">基础难度</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">简单</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={config.difficulty?.baseDifficulty || 3}
                          onChange={(e) => handleConfigChange('difficulty', {
                            baseDifficulty: parseInt(e.target.value)
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">困难</span>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">
                        当前难度: {config.difficulty?.baseDifficulty || 3}
                      </div>
                    </div>
                    
                    {/* 内容类型难度调整 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">内容类型难度调整</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'text', label: '文本内容' },
                          { key: 'image', label: '图像内容' },
                          { key: 'audio', label: '音频内容' },
                          { key: 'video', label: '视频内容' },
                          { key: 'interactive', label: '交互内容' },
                          { key: 'quiz', label: '测验内容' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span>{item.label}</span>
                            <div className="flex items-center space-x-4 w-48">
                              <span className="text-xs text-gray-600">简单</span>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={config.difficulty?.contentDifficultyAdjustment?.[item.key as keyof typeof config.difficulty.contentDifficultyAdjustment] || 3}
                                onChange={(e) => handleConfigChange('difficulty', {
                                  contentDifficultyAdjustment: {
                                    ...config.difficulty?.contentDifficultyAdjustment,
                                    [item.key]: parseInt(e.target.value)
                                  }
                                })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-xs text-gray-600">困难</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 挑战进度分布 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">挑战进度分布</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'easy', label: '简单', color: 'bg-green-500' },
                          { key: 'medium', label: '中等', color: 'bg-yellow-500' },
                          { key: 'hard', label: '困难', color: 'bg-red-500' }
                        ].map((item) => (
                          <div key={item.key} className="space-y-2">
                            <div className="flex justify-between">
                              <span>{item.label}</span>
                              <span className="text-sm text-gray-600">
                                {Math.round((config.difficulty?.challengeProgression?.[item.key as keyof typeof config.difficulty.challengeProgression] || 0.33) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`${item.color} h-2.5 rounded-full`}
                                style={{ width: `${(config.difficulty?.challengeProgression?.[item.key as keyof typeof config.difficulty.challengeProgression] || 0.33) * 100}%` }}
                              ></div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={config.difficulty?.challengeProgression?.[item.key as keyof typeof config.difficulty.challengeProgression] || 0.33}
                              onChange={(e) => handleConfigChange('difficulty', {
                                challengeProgression: {
                                  ...config.difficulty?.challengeProgression,
                                  [item.key]: parseFloat(e.target.value)
                                }
                              })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        提示：调整挑战难度分布可以影响学习体验的平衡性
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="notifications-config">
                  <h2 className="text-xl font-semibold mb-4">通知设置</h2>
                  <p className="text-gray-600 mb-6">
                    自定义您接收通知的方式、类型和频率
                  </p>
                  
                  <div className="space-y-6">
                    {/* 通知总开关 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">启用通知</h3>
                          <p className="text-sm text-gray-600">开启或关闭所有通知功能</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.notifications?.enabled || false}
                            onChange={(e) => handleConfigChange('notifications', {
                              enabled: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    {/* 通知方式 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">通知方式</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'IN_APP', label: '应用内通知' },
                          { key: 'EMAIL', label: '电子邮件' },
                          { key: 'SMS', label: '短信通知' },
                          { key: 'PUSH', label: '推送通知' }
                        ].map((method) => (
                          <div key={method.key} className="flex items-center justify-between">
                            <span>{method.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.notifications?.methods?.includes(method.key as NotificationMethod) || false}
                                onChange={(e) => {
                                  const currentMethods = config.notifications?.methods || []
                                  const newMethods = e.target.checked
                                    ? [...currentMethods, method.key as NotificationMethod]
                                    : currentMethods.filter(m => m !== method.key as NotificationMethod)
                                  handleConfigChange('notifications', { methods: newMethods })
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 通知类型 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">通知类型</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'REMINDER', label: '学习提醒' },
                          { key: 'ACHIEVEMENT', label: '成就解锁' },
                          { key: 'CHALLENGE', label: '挑战通知' },
                          { key: 'STREAK', label: '连续学习' },
                          { key: 'LEVEL_UP', label: '等级提升' },
                          { key: 'POINTS_EARNED', label: '积分获取' }
                        ].map((type) => (
                          <div key={type.key} className="flex items-center justify-between">
                            <span>{type.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.notifications?.types?.includes(type.key as NotificationType) || false}
                                onChange={(e) => {
                                  const currentTypes = config.notifications?.types || []
                                  const newTypes = e.target.checked
                                    ? [...currentTypes, type.key as NotificationType]
                                    : currentTypes.filter(t => t !== type.key as NotificationType)
                                  handleConfigChange('notifications', { types: newTypes })
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 通知频率 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">通知频率</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'reminders', label: '学习提醒', options: ['immediate', 'hourly', 'daily', 'weekly'] },
                          { key: 'achievements', label: '成就通知', options: ['immediate', 'daily', 'weekly'] },
                          { key: 'challenges', label: '挑战通知', options: ['immediate', 'daily', 'weekly'] },
                          { key: 'reports', label: '学习报告', options: ['daily', 'weekly', 'monthly'] }
                        ].map((frequency) => (
                          <div key={frequency.key} className="flex items-center justify-between">
                            <span>{frequency.label}</span>
                            <select
                              value={config.notifications?.frequency?.[frequency.key as keyof typeof config.notifications.frequency] || 'daily'}
                              onChange={(e) => handleConfigChange('notifications', {
                                frequency: {
                                  ...config.notifications?.frequency,
                                  [frequency.key]: e.target.value
                                }
                              })}
                              className="border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                              {frequency.options.map(option => (
                                <option key={option} value={option}>
                                  {option === 'immediate' ? '即时' : 
                                   option === 'hourly' ? '每小时' :
                                   option === 'daily' ? '每天' :
                                   option === 'weekly' ? '每周' : '每月'}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 免打扰时间 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">免打扰时间</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span>启用免打扰时间</span>
                          <p className="text-sm text-gray-600">在指定时间段内不接收通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.notifications?.quietHours?.enabled || false}
                            onChange={(e) => handleConfigChange('notifications', {
                              quietHours: {
                                ...config.notifications?.quietHours,
                                enabled: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {config.notifications?.quietHours?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                            <input
                              type="time"
                              value={config.notifications?.quietHours?.start || '22:00'}
                              onChange={(e) => handleConfigChange('notifications', {
                                quietHours: {
                                  ...config.notifications?.quietHours,
                                  start: e.target.value
                                }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                            <input
                              type="time"
                              value={config.notifications?.quietHours?.end || '08:00'}
                              onChange={(e) => handleConfigChange('notifications', {
                                quietHours: {
                                  ...config.notifications?.quietHours,
                                  end: e.target.value
                                }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 学习风格偏好 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">学习风格通知偏好</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'visual', label: '视觉学习者' },
                          { key: 'auditory', label: '听觉学习者' },
                          { key: 'kinesthetic', label: '动觉学习者' },
                          { key: 'reading', label: '阅读学习者' }
                        ].map((style) => (
                          <div key={style.key} className="flex items-center justify-between">
                            <span>{style.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.notifications?.learningStylePreferences?.[style.key as keyof typeof config.notifications.learningStylePreferences] || false}
                                onChange={(e) => handleConfigChange('notifications', {
                                  learningStylePreferences: {
                                    ...config.notifications?.learningStylePreferences,
                                    [style.key]: e.target.checked
                                  }
                                })}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="theme-config">
                  <h2 className="text-xl font-semibold mb-4">视觉主题</h2>
                  <p className="text-gray-600 mb-6">
                    选择适合您学习风格的视觉主题和界面样式
                  </p>
                  
                  <div className="space-y-6">
                    {/* 主题风格 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">主题风格</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { key: 'AUTO', label: '自动', desc: '跟随系统设置' },
                          { key: 'LIGHT', label: '浅色', desc: '明亮清新' },
                          { key: 'DARK', label: '深色', desc: '护眼舒适' },
                          { key: 'CUSTOM', label: '自定义', desc: '个性化设置' }
                        ].map((style) => (
                          <div
                            key={style.key}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              config.theme?.style === style.key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleConfigChange('theme', {
                              style: style.key as ThemeStyle
                            })}
                          >
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 自定义颜色 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">自定义颜色</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'primaryColor', label: '主色调', default: '#3B82F6' },
                          { key: 'secondaryColor', label: '次要色', default: '#60A5FA' },
                          { key: 'accentColor', label: '强调色', default: '#EF4444' },
                          { key: 'backgroundColor', label: '背景色', default: '#ffffff' },
                          { key: 'textColor', label: '文字色', default: '#333333' }
                        ].map((color) => (
                          <div key={color.key} className="flex items-center justify-between">
                            <span>{color.label}</span>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded border border-gray-300"
                                style={{ backgroundColor: config.theme?.[color.key as keyof typeof config.theme] as string || color.default }}
                              ></div>
                              <input
                                type="color"
                                value={config.theme?.[color.key as keyof typeof config.theme] as string || color.default}
                                onChange={(e) => handleConfigChange('theme', {
                                  [color.key]: e.target.value
                                })}
                                className="w-10 h-10 border-0 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={config.theme?.[color.key as keyof typeof config.theme] as string || color.default}
                                onChange={(e) => handleConfigChange('theme', {
                                  [color.key]: e.target.value
                                })}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 字体设置 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">字体设置</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">字体大小</label>
                          <select
                            value={config.theme?.fontSize || 'medium'}
                            onChange={(e) => handleConfigChange('theme', {
                              fontSize: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          >
                            <option value="small">小</option>
                            <option value="medium">中</option>
                            <option value="large">大</option>
                            <option value="x-large">特大</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">字体族</label>
                          <select
                            value={config.theme?.fontFamily || 'sans-serif'}
                            onChange={(e) => handleConfigChange('theme', {
                              fontFamily: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          >
                            <option value="sans-serif">无衬线字体</option>
                            <option value="serif">衬线字体</option>
                            <option value="monospace">等宽字体</option>
                            <option value="system">系统字体</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* 边框圆角 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">边框圆角</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">直角</span>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          value={
                            config.theme?.borderRadius === 'none' ? 0 :
                            config.theme?.borderRadius === 'small' ? 1 :
                            config.theme?.borderRadius === 'medium' ? 2 : 3
                          }
                          onChange={(e) => {
                            const values = ['none', 'small', 'medium', 'large']
                            handleConfigChange('theme', {
                              borderRadius: values[parseInt(e.target.value)] as 'none' | 'small' | 'medium' | 'large'
                            })
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">圆角</span>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">
                        当前: {
                          config.theme?.borderRadius === 'none' ? '无圆角' :
                          config.theme?.borderRadius === 'small' ? '小圆角' :
                          config.theme?.borderRadius === 'medium' ? '中圆角' : '大圆角'
                        }
                      </div>
                    </div>
                    
                    {/* 动画设置 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">动画设置</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span>启用动画</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.theme?.animations?.enabled || false}
                            onChange={(e) => handleConfigChange('theme', {
                              animations: {
                                ...config.theme?.animations,
                                enabled: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {config.theme?.animations?.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">动画时长</label>
                            <select
                              value={config.theme?.animations?.duration || 300}
                              onChange={(e) => handleConfigChange('theme', {
                                animations: {
                                  ...config.theme?.animations,
                                  duration: parseInt(e.target.value)
                                }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                              <option value="150">快速 (150ms)</option>
                              <option value="300">标准 (300ms)</option>
                              <option value="500">缓慢 (500ms)</option>
                              <option value="800">很慢 (800ms)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">缓动函数</label>
                            <select
                              value={config.theme?.animations?.easing || 'ease-in-out'}
                              onChange={(e) => handleConfigChange('theme', {
                                animations: {
                                  ...config.theme?.animations,
                                  easing: e.target.value
                                }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                              <option value="linear">线性</option>
                              <option value="ease">缓入缓出</option>
                              <option value="ease-in">缓入</option>
                              <option value="ease-out">缓出</option>
                              <option value="ease-in-out">标准缓动</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 主题预览 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium mb-3">主题预览</h3>
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: config.theme?.backgroundColor || '#ffffff',
                          color: config.theme?.textColor || '#333333',
                          fontFamily: config.theme?.fontFamily || 'sans-serif',
                          borderRadius: config.theme?.borderRadius === 'none' ? '0' :
                                     config.theme?.borderRadius === 'small' ? '0.25rem' :
                                     config.theme?.borderRadius === 'medium' ? '0.5rem' : '1rem'
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4
                            className="font-bold"
                            style={{ fontSize: config.theme?.fontSize === 'small' ? '1rem' :
                                              config.theme?.fontSize === 'medium' ? '1.25rem' :
                                              config.theme?.fontSize === 'large' ? '1.5rem' : '1.875rem' }}
                          >
                            示例标题
                          </h4>
                          <button
                            className="px-3 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: config.theme?.primaryColor || '#3B82F6' }}
                          >
                            示例按钮
                          </button>
                        </div>
                        <p className="mb-3">这是一段示例文本，用于预览当前主题的显示效果。</p>
                        <div className="flex space-x-2">
                          <span
                            className="inline-block w-6 h-6 rounded-full"
                            style={{ backgroundColor: config.theme?.primaryColor || '#3B82F6' }}
                          ></span>
                          <span
                            className="inline-block w-6 h-6 rounded-full"
                            style={{ backgroundColor: config.theme?.secondaryColor || '#60A5FA' }}
                          ></span>
                          <span
                            className="inline-block w-6 h-6 rounded-full"
                            style={{ backgroundColor: config.theme?.accentColor || '#EF4444' }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="preferences-config">
                  <h2 className="text-xl font-semibold mb-4">偏好设置</h2>
                  <p className="text-gray-600 mb-6">
                    设置您的语言、时区、日期格式和其他个人偏好
                  </p>
                  
                  {/* 偏好设置选项将在这里实现 */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-center text-gray-500">偏好设置配置选项正在开发中...</p>
                  </div>
                </div>
              )}

              {activeTab === 'adaptation' && (
                <div className="adaptation-config">
                  <h2 className="text-xl font-semibold mb-4">学习适配</h2>
                  <p className="text-gray-600 mb-6">
                    配置系统如何根据您的学习风格和表现进行智能适配
                  </p>
                  
                  {/* 学习适配配置选项将在这里实现 */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-center text-gray-500">学习适配配置选项正在开发中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PersonalizedConfig