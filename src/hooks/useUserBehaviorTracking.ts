import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userBehaviorDataCollectionService } from '@/services/userBehaviorDataCollection.service'
import { ExtendedUserBehaviorEventType, ExtendedLearningContentType } from '@/services/userBehaviorAnalysis.service'

// 扩展SessionUser类型以包含id
interface ExtendedSessionUser {
  id?: string
  sub?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// 缓存用户ID以避免重复的类型转换
const getUserId = (user: unknown): string | null => {
  return (user as ExtendedSessionUser)?.id || (user as ExtendedSessionUser)?.sub || null
}

/**
 * 用户行为跟踪Hook
 * 提供简单的方法来记录用户行为事件
 */
export function useUserBehaviorTracking() {
  const { user } = useAuth()
  const userIdRef = useRef<string | null>(getUserId(user))
  const pageLoadTimeRef = useRef<number>(Date.now())
  const previousPageRef = useRef<string>('')

  // 更新用户ID引用
  useEffect(() => {
    userIdRef.current = getUserId(user)
  }, [user])

  // 记录页面加载事件
  useEffect(() => {
    const handlePageLoad = async () => {
      if (userIdRef.current) {
        await userBehaviorDataCollectionService.recordEvent(
          userIdRef.current,
          ExtendedUserBehaviorEventType.UI_INTERACTION,
          {
            metadata: {
              action: 'page_load',
              url: window.location.href,
              timestamp: new Date().toISOString()
            }
          }
        )
      }
    }

    handlePageLoad()
  }, [])

  // 记录页面离开事件
  useEffect(() => {
    const handlePageLeave = async () => {
      if (userIdRef.current) {
        const timeSpent = Math.round((Date.now() - pageLoadTimeRef.current) / 1000) // 秒
        
        await userBehaviorDataCollectionService.recordEvent(
          userIdRef.current,
          ExtendedUserBehaviorEventType.UI_INTERACTION,
          {
            timeSpent,
            metadata: {
              action: 'page_leave',
              url: window.location.href,
              timeSpent,
              timestamp: new Date().toISOString()
            }
          }
        )
      }
    }

    const handleBeforeUnload = () => {
      handlePageLeave()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handlePageLeave()
    }
  }, [])

  // 记录复习完成事件
  const trackReviewCompleted = useCallback(async (
    data: {
      contentId?: string
      isCorrect: boolean
      responseTime?: number
      difficulty?: number
      timeSpent?: number
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录复习完成事件')
      return
    }

    await userBehaviorDataCollectionService.recordReviewCompleted(userIdRef.current, data)
  }, [])

  // 记录记忆创建事件
  const trackMemoryCreated = useCallback(async (
    data: {
      contentId?: string
      category: string
      difficulty: number
      contentType?: ExtendedLearningContentType
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录记忆创建事件')
      return
    }

    await userBehaviorDataCollectionService.recordMemoryCreated(userIdRef.current, data)
  }, [])

  // 记录搜索操作事件
  const trackSearchPerformed = useCallback(async (
    data: {
      query: string
      resultsCount: number
      categoryId?: string
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录搜索操作事件')
      return
    }

    await userBehaviorDataCollectionService.recordSearchPerformed(userIdRef.current, data)
  }, [])

  // 记录页面导航事件
  const trackPageNavigation = useCallback(async (toPage: string) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录页面导航事件')
      return
    }

    const fromPage = previousPageRef.current || window.location.pathname
    const timeSpent = Math.round((Date.now() - pageLoadTimeRef.current) / 1000) // 秒

    await userBehaviorDataCollectionService.recordPageNavigation(userIdRef.current, {
      fromPage,
      toPage,
      timeSpent
    })

    // 更新引用
    previousPageRef.current = fromPage
    pageLoadTimeRef.current = Date.now()
  }, [])

  // 记录内容分享事件
  const trackContentShared = useCallback(async (
    data: {
      contentId: string
      contentType: ExtendedLearningContentType
      shareMethod: string
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录内容分享事件')
      return
    }

    await userBehaviorDataCollectionService.recordContentShared(userIdRef.current, data)
  }, [])

  // 记录设置变更事件
  const trackSettingChanged = useCallback(async (
    data: {
      settingName: string
      oldValue: unknown
      newValue: unknown
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录设置变更事件')
      return
    }

    await userBehaviorDataCollectionService.recordSettingChanged(userIdRef.current, data)
  }, [])

  // 记录错误事件
  const trackErrorEncountered = useCallback(async (
    data: {
      errorType: string
      errorMessage: string
      context?: Record<string, unknown>
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录错误事件')
      return
    }

    await userBehaviorDataCollectionService.recordErrorEncountered(userIdRef.current, data)
  }, [])

  // 记录社交互动事件
  const trackSocialInteraction = useCallback(async (
    data: {
      interactionType: string
      targetUserId?: string
      contentId?: string
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录社交互动事件')
      return
    }

    await userBehaviorDataCollectionService.recordSocialInteraction(userIdRef.current, data)
  }, [])

  // 记录通用UI交互事件
  const trackUIInteraction = useCallback(async (
    data: {
      element: string
      action: string
      metadata?: Record<string, unknown>
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录UI交互事件')
      return
    }

    await userBehaviorDataCollectionService.recordEvent(
      userIdRef.current,
      ExtendedUserBehaviorEventType.UI_INTERACTION,
      {
        metadata: {
          element: data.element,
          action: data.action,
          ...data.metadata
        }
      }
    )
  }, [])

  // 记录自定义事件
  const trackCustomEvent = useCallback(async (
    eventType: ExtendedUserBehaviorEventType,
    data?: {
      contentType?: ExtendedLearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    }
  ) => {
    if (!userIdRef.current) {
      console.warn('用户未登录，无法记录自定义事件')
      return
    }

    await userBehaviorDataCollectionService.recordEvent(userIdRef.current, eventType, data)
  }, [])

  // 获取队列状态
  const getQueueStatus = useCallback(() => {
    return userBehaviorDataCollectionService.getQueueStatus()
  }, [])

  return {
    trackReviewCompleted,
    trackMemoryCreated,
    trackSearchPerformed,
    trackPageNavigation,
    trackContentShared,
    trackSettingChanged,
    trackErrorEncountered,
    trackSocialInteraction,
    trackUIInteraction,
    trackCustomEvent,
    getQueueStatus,
    userId: userIdRef.current
  }
}