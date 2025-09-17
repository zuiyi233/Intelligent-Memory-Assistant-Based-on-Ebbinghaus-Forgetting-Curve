import { Tutorial, UserTutorialProgress, TutorialSession } from '@/types'

/**
 * 教程存储服务类
 * 用于管理引导状态的本地存储和会话管理
 */
export class TutorialStorageService {
  private static readonly STORAGE_KEYS = {
    USER_PROGRESS: 'tutorial_user_progress',
    CURRENT_SESSION: 'tutorial_current_session',
    COMPLETED_TUTORIALS: 'tutorial_completed_list',
    SKIPPED_TUTORIALS: 'tutorial_skipped_list',
    SETTINGS: 'tutorial_settings'
  }

  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30分钟

  /**
   * 保存用户教程进度
   */
  static saveUserProgress(userId: string, progress: UserTutorialProgress): void {
    try {
      const allProgress = this.getAllUserProgress()
      allProgress[userId] = progress
      localStorage.setItem(this.STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress))
    } catch (error) {
      console.error('保存用户教程进度失败:', error)
    }
  }

  /**
   * 获取用户教程进度
   */
  static getUserProgress(userId: string): UserTutorialProgress | null {
    try {
      const allProgress = this.getAllUserProgress()
      return allProgress[userId] || null
    } catch (error) {
      console.error('获取用户教程进度失败:', error)
      return null
    }
  }

  /**
   * 获取所有用户教程进度
   */
  static getAllUserProgress(): Record<string, UserTutorialProgress> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROGRESS)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('获取所有用户教程进度失败:', error)
      return {}
    }
  }

  /**
   * 删除用户教程进度
   */
  static deleteUserProgress(userId: string): void {
    try {
      const allProgress = this.getAllUserProgress()
      delete allProgress[userId]
      localStorage.setItem(this.STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress))
    } catch (error) {
      console.error('删除用户教程进度失败:', error)
    }
  }

  /**
   * 保存当前教程会话
   */
  static saveCurrentSession(session: TutorialSession): void {
    try {
      const sessionWithTimeout = {
        ...session,
        timeout: Date.now() + this.SESSION_TIMEOUT
      }
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionWithTimeout))
    } catch (error) {
      console.error('保存当前教程会话失败:', error)
    }
  }

  /**
   * 获取当前教程会话
   */
  static getCurrentSession(): TutorialSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION)
      if (!stored) return null

      const session = JSON.parse(stored)
      
      // 检查会话是否已过期
      if (session.timeout && Date.now() > session.timeout) {
        this.clearCurrentSession()
        return null
      }

      return session
    } catch (error) {
      console.error('获取当前教程会话失败:', error)
      return null
    }
  }

  /**
   * 清除当前教程会话
   */
  static clearCurrentSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION)
    } catch (error) {
      console.error('清除当前教程会话失败:', error)
    }
  }

  /**
   * 添加已完成教程
   */
  static addCompletedTutorial(userId: string, tutorialId: string): void {
    try {
      const completedList = this.getCompletedTutorials(userId)
      if (!completedList.includes(tutorialId)) {
        completedList.push(tutorialId)
        const key = `${this.STORAGE_KEYS.COMPLETED_TUTORIALS}_${userId}`
        localStorage.setItem(key, JSON.stringify(completedList))
      }
    } catch (error) {
      console.error('添加已完成教程失败:', error)
    }
  }

  /**
   * 获取用户已完成教程列表
   */
  static getCompletedTutorials(userId: string): string[] {
    try {
      const key = `${this.STORAGE_KEYS.COMPLETED_TUTORIALS}_${userId}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('获取已完成教程列表失败:', error)
      return []
    }
  }

  /**
   * 检查教程是否已完成
   */
  static isTutorialCompleted(userId: string, tutorialId: string): boolean {
    return this.getCompletedTutorials(userId).includes(tutorialId)
  }

  /**
   * 添加已跳过教程
   */
  static addSkippedTutorial(userId: string, tutorialId: string): void {
    try {
      const skippedList = this.getSkippedTutorials(userId)
      if (!skippedList.includes(tutorialId)) {
        skippedList.push(tutorialId)
        const key = `${this.STORAGE_KEYS.SKIPPED_TUTORIALS}_${userId}`
        localStorage.setItem(key, JSON.stringify(skippedList))
      }
    } catch (error) {
      console.error('添加已跳过教程失败:', error)
    }
  }

  /**
   * 获取用户已跳过教程列表
   */
  static getSkippedTutorials(userId: string): string[] {
    try {
      const key = `${this.STORAGE_KEYS.SKIPPED_TUTORIALS}_${userId}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('获取已跳过教程列表失败:', error)
      return []
    }
  }

  /**
   * 检查教程是否已跳过
   */
  static isTutorialSkipped(userId: string, tutorialId: string): boolean {
    return this.getSkippedTutorials(userId).includes(tutorialId)
  }

  /**
   * 保存教程设置
   */
  static saveSettings(userId: string, settings: {
    autoStart?: boolean
    showHints?: boolean
    skipOnClose?: boolean
    soundEffects?: boolean
    animations?: boolean
  }): void {
    try {
      const key = `${this.STORAGE_KEYS.SETTINGS}_${userId}`
      const existingSettings = this.getSettings(userId)
      const newSettings = { ...existingSettings, ...settings }
      localStorage.setItem(key, JSON.stringify(newSettings))
    } catch (error) {
      console.error('保存教程设置失败:', error)
    }
  }

  /**
   * 获取教程设置
   */
  static getSettings(userId: string): {
    autoStart: boolean
    showHints: boolean
    skipOnClose: boolean
    soundEffects: boolean
    animations: boolean
  } {
    try {
      const key = `${this.STORAGE_KEYS.SETTINGS}_${userId}`
      const stored = localStorage.getItem(key)
      const defaultSettings = {
        autoStart: true,
        showHints: true,
        skipOnClose: false,
        soundEffects: true,
        animations: true
      }
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch (error) {
      console.error('获取教程设置失败:', error)
      return {
        autoStart: true,
        showHints: true,
        skipOnClose: false,
        soundEffects: true,
        animations: true
      }
    }
  }

  /**
   * 清除所有教程相关数据
   */
  static clearAllTutorialData(userId: string): void {
    try {
      this.deleteUserProgress(userId)
      this.clearCurrentSession()
      localStorage.removeItem(`${this.STORAGE_KEYS.COMPLETED_TUTORIALS}_${userId}`)
      localStorage.removeItem(`${this.STORAGE_KEYS.SKIPPED_TUTORIALS}_${userId}`)
      localStorage.removeItem(`${this.STORAGE_KEYS.SETTINGS}_${userId}`)
    } catch (error) {
      console.error('清除所有教程数据失败:', error)
    }
  }

  /**
   * 检查是否应该显示教程
   */
  static shouldShowTutorial(userId: string, tutorialId: string): boolean {
    // 如果已跳过，不显示
    if (this.isTutorialSkipped(userId, tutorialId)) {
      return false
    }

    // 如果已完成，不显示
    if (this.isTutorialCompleted(userId, tutorialId)) {
      return false
    }

    // 如果有活跃会话，不显示新教程
    const currentSession = this.getCurrentSession()
    if (currentSession && currentSession.userId === userId) {
      return false
    }

    return true
  }

  /**
   * 获取教程统计数据
   */
  static getTutorialStats(userId: string): {
    totalTutorials: number
    completedTutorials: number
    skippedTutorials: number
    inProgressTutorials: number
    totalTimeSpent: number
    averageCompletionTime: number
  } {
    try {
      const progress = this.getUserProgress(userId)
      const completed = this.getCompletedTutorials(userId)
      const skipped = this.getSkippedTutorials(userId)
      
      // 假设总教程数，可以从API获取或配置
      const totalTutorials = 10 // 这里应该从实际数据源获取
      
      return {
        totalTutorials,
        completedTutorials: completed.length,
        skippedTutorials: skipped.length,
        inProgressTutorials: progress && progress.status === 'IN_PROGRESS' ? 1 : 0,
        totalTimeSpent: progress?.timeSpent || 0,
        averageCompletionTime: progress?.timeSpent || 0
      }
    } catch (error) {
      console.error('获取教程统计数据失败:', error)
      return {
        totalTutorials: 0,
        completedTutorials: 0,
        skippedTutorials: 0,
        inProgressTutorials: 0,
        totalTimeSpent: 0,
        averageCompletionTime: 0
      }
    }
  }

  /**
   * 导出用户数据
   */
  static exportUserData(userId: string): string {
    try {
      const userData = {
        userId,
        progress: this.getUserProgress(userId),
        completedTutorials: this.getCompletedTutorials(userId),
        skippedTutorials: this.getSkippedTutorials(userId),
        settings: this.getSettings(userId),
        exportDate: new Date().toISOString()
      }
      return JSON.stringify(userData, null, 2)
    } catch (error) {
      console.error('导出用户数据失败:', error)
      return '{}'
    }
  }

  /**
   * 导入用户数据
   */
  static importUserData(userId: string, jsonData: string): boolean {
    try {
      const userData = JSON.parse(jsonData)
      
      // 验证数据格式
      if (!userData.userId || userData.userId !== userId) {
        throw new Error('用户ID不匹配')
      }

      // 导入数据
      if (userData.progress) {
        this.saveUserProgress(userId, userData.progress)
      }
      
      if (userData.completedTutorials && Array.isArray(userData.completedTutorials)) {
        const key = `${this.STORAGE_KEYS.COMPLETED_TUTORIALS}_${userId}`
        localStorage.setItem(key, JSON.stringify(userData.completedTutorials))
      }
      
      if (userData.skippedTutorials && Array.isArray(userData.skippedTutorials)) {
        const key = `${this.STORAGE_KEYS.SKIPPED_TUTORIALS}_${userId}`
        localStorage.setItem(key, JSON.stringify(userData.skippedTutorials))
      }
      
      if (userData.settings) {
        this.saveSettings(userId, userData.settings)
      }

      return true
    } catch (error) {
      console.error('导入用户数据失败:', error)
      return false
    }
  }
}