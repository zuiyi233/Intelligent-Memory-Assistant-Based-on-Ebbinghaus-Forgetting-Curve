import { prisma, isPrismaInitialized } from '@/lib/db'
import {
  Tutorial,
  TutorialStep,
  TutorialAction,
  UserTutorialProgress,
  TutorialSession,
  TutorialConfig,
  TutorialCenterQueryParams,
  TutorialStats,
  TutorialRecommendation,
  TutorialFeedback
} from '@/types'
import { gamificationService } from './gamification.service'
import { DifficultyLevel, PointTransactionType } from '@prisma/client'

/**
 * 新手引导服务类
 */
export class TutorialService {
  /**
   * 获取所有教程
   */
  async getAllTutorials(params?: TutorialCenterQueryParams): Promise<{
    tutorials: Tutorial[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        category,
        audience,
        difficulty,
        search,
        tags,
        isActive = true,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 20
      } = params || {}

      const skip = (page - 1) * limit

      // 构建查询条件
      const where: Record<string, unknown> = {
        isActive
      }

      if (category) {
        where.category = category
      }

      if (audience) {
        where.audience = audience
      }

      if (difficulty) {
        where.difficulty = difficulty
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags
        }
      }

      // 构建排序条件
      const orderBy: Record<string, 'asc' | 'desc'> = {}
      orderBy[sortBy] = sortOrder

      // 获取教程列表
      const [tutorials, total] = await Promise.all([
        prisma.tutorial.findMany({
          where,
          include: {
            steps: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.tutorial.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        tutorials: tutorials as Tutorial[],
        total,
        page,
        limit,
        totalPages
      }
    } catch (error: unknown) {
      console.error('获取教程列表失败:', error)
      throw error
    }
  }

  /**
   * 获取教程详情
   */
  async getTutorialById(id: string): Promise<Tutorial | null> {
    try {
      const tutorial = await prisma.tutorial.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: {
              actions: {
                orderBy: { id: 'asc' }
              }
            }
          }
        }
      })

      return tutorial as Tutorial | null
    } catch (error: unknown) {
      console.error('获取教程详情失败:', error)
      throw error
    }
  }

  /**
   * 创建教程
   */
  async createTutorial(data: {
    name: string
    description: string
    category: Tutorial['category']
    audience: Tutorial['audience']
    difficulty: Tutorial['difficulty']
    estimatedTime: number
    points: number
    tags: string[]
    prerequisites?: string[]
    steps: Omit<TutorialStep, 'id' | 'tutorialId'>[]
  }): Promise<Tutorial> {
    try {
      const { steps, ...tutorialData } = data

      // 创建教程
      const tutorial = await prisma.tutorial.create({
        data: {
          ...tutorialData,
          isActive: true,
          steps: {
            create: steps.map((step, index) => ({
              ...step,
              order: index,
              actions: step.actions ? {
                create: step.actions.map(action => ({
                  ...action,
                  id: `${step.title.replace(/\s+/g, '-')}-action-${Date.now()}`
                }))
              } : undefined
            }))
          }
        },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: {
              actions: {
                orderBy: { id: 'asc' }
              }
            }
          }
        }
      })

      return tutorial as Tutorial
    } catch (error: unknown) {
      console.error('创建教程失败:', error)
      throw error
    }
  }

  /**
   * 更新教程
   */
  async updateTutorial(
    id: string,
    data: {
      name?: string
      description?: string
      category?: Tutorial['category']
      audience?: Tutorial['audience']
      difficulty?: Tutorial['difficulty']
      estimatedTime?: number
      points?: number
      isActive?: boolean
      tags?: string[]
      prerequisites?: string[]
    }
  ): Promise<Tutorial> {
    try {
      const tutorial = await prisma.tutorial.update({
        where: { id },
        data,
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: {
              actions: {
                orderBy: { id: 'asc' }
              }
            }
          }
        }
      })

      return tutorial as Tutorial
    } catch (error: unknown) {
      console.error('更新教程失败:', error)
      throw error
    }
  }

  /**
   * 删除教程
   */
  async deleteTutorial(id: string): Promise<void> {
    try {
      await prisma.tutorial.delete({
        where: { id }
      })
    } catch (error: unknown) {
      console.error('删除教程失败:', error)
      throw error
    }
  }

  /**
   * 获取用户的教程进度
   */
  async getUserTutorialProgress(userId: string, tutorialId?: string): Promise<UserTutorialProgress[]> {
    try {
      const where: Record<string, unknown> = { userId }
      
      if (tutorialId) {
        where.tutorialId = tutorialId
      }

      const progressList = await prisma.userTutorialProgress.findMany({
        where,
        include: {
          tutorial: {
            include: {
              steps: {
                orderBy: { order: 'asc' }
              }
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      })

      return progressList as UserTutorialProgress[]
    } catch (error: unknown) {
      console.error('获取用户教程进度失败:', error)
      throw error
    }
  }

  /**
   * 获取或创建用户教程进度
   */
  async getOrCreateUserTutorialProgress(userId: string, tutorialId: string): Promise<UserTutorialProgress> {
    try {
      let progress = await prisma.userTutorialProgress.findUnique({
        where: {
          userId_tutorialId: {
            userId,
            tutorialId
          }
        },
        include: {
          tutorial: {
            include: {
              steps: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      })

      if (!progress) {
        const tutorial = await this.getTutorialById(tutorialId)
        if (!tutorial) {
          throw new Error('教程不存在')
        }

        progress = await prisma.userTutorialProgress.create({
          data: {
            userId,
            tutorialId,
            currentStep: 0,
            completedSteps: 0,
            status: 'NOT_STARTED',
            startedAt: new Date(),
            timeSpent: 0
          },
          include: {
            tutorial: {
              include: {
                steps: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        })
      }

      return progress as UserTutorialProgress
    } catch (error: unknown) {
      console.error('获取或创建用户教程进度失败:', error)
      throw error
    }
  }

  /**
   * 更新用户教程进度
   */
  async updateUserTutorialProgress(
    userId: string,
    tutorialId: string,
    data: {
      currentStep?: number
      completedSteps?: number
      status?: UserTutorialProgress['status']
      timeSpent?: number
      skipReason?: string
    }
  ): Promise<UserTutorialProgress> {
    try {
      const existingProgress = await this.getOrCreateUserTutorialProgress(userId, tutorialId)

      const updateData: Record<string, unknown> = {
        ...data
      }

      // 如果状态变为已完成，设置完成时间
      if (data.status === 'COMPLETED' && existingProgress.status !== 'COMPLETED') {
        updateData.completedAt = new Date()
      }

      // 如果状态从NOT_STARTED变为IN_PROGRESS，设置开始时间
      if (data.status === 'IN_PROGRESS' && existingProgress.status === 'NOT_STARTED') {
        updateData.startedAt = new Date()
      }

      const updatedProgress = await prisma.userTutorialProgress.update({
        where: {
          userId_tutorialId: {
            userId,
            tutorialId
          }
        },
        data: updateData,
        include: {
          tutorial: {
            include: {
              steps: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      })

      // 如果教程完成，添加积分奖励
      if (data.status === 'COMPLETED' && existingProgress.status !== 'COMPLETED') {
        const tutorial = await this.getTutorialById(tutorialId)
        if (tutorial) {
          await gamificationService.addPoints(
            userId,
            tutorial.points,
            PointTransactionType.MANUAL_ADJUST,
            `完成教程: ${tutorial.name}`
          )
        }
      }

      return updatedProgress as UserTutorialProgress
    } catch (error: unknown) {
      console.error('更新用户教程进度失败:', error)
      throw error
    }
  }

  /**
   * 开始教程
   */
  async startTutorial(userId: string, tutorialId: string): Promise<UserTutorialProgress> {
    try {
      const tutorial = await this.getTutorialById(tutorialId)
      if (!tutorial) {
        throw new Error('教程不存在')
      }

      // 检查前置教程是否已完成
      if (tutorial.prerequisites && tutorial.prerequisites.length > 0) {
        const prerequisitesProgress = await this.getUserTutorialProgress(userId)
        const incompletePrerequisites = tutorial.prerequisites.filter(
          prereqId => !prerequisitesProgress.some(
            p => p.tutorialId === prereqId && p.status === 'COMPLETED'
          )
        )

        if (incompletePrerequisites.length > 0) {
          throw new Error('请先完成前置教程')
        }
      }

      const progress = await this.getOrCreateUserTutorialProgress(userId, tutorialId)
      
      if (progress.status === 'NOT_STARTED') {
        return await this.updateUserTutorialProgress(userId, tutorialId, {
          status: 'IN_PROGRESS',
          currentStep: 0
        })
      }

      return progress
    } catch (error: unknown) {
      console.error('开始教程失败:', error)
      throw error
    }
  }

  /**
   * 完成教程步骤
   */
  async completeTutorialStep(
    userId: string,
    tutorialId: string,
    stepId: string,
    timeSpent: number = 0
  ): Promise<UserTutorialProgress> {
    try {
      const progress = await this.getOrCreateUserTutorialProgress(userId, tutorialId)
      const tutorial = await this.getTutorialById(tutorialId)
      
      if (!tutorial) {
        throw new Error('教程不存在')
      }

      // 确保步骤属于该教程
      const stepExists = tutorial.steps.some(step => step.id === stepId)
      if (!stepExists) {
        throw new Error('步骤不存在或不属于该教程')
      }

      // 更新已完成步骤数
      const completedSteps = (typeof progress.completedStepIds === 'number' ? progress.completedStepIds : 0) + 1
      
      // 计算新进度
      const newProgress = Math.round((completedSteps / tutorial.steps.length) * 100)
      
      // 确定下一步
      const currentStepIndex = typeof progress.currentStepId === 'number' ? progress.currentStepId : 0
      const nextStepIndex = currentStepIndex + 1

      // 更新进度
      const updatedProgress = await this.updateUserTutorialProgress(userId, tutorialId, {
        currentStep: nextStepIndex,
        completedSteps,
        timeSpent: progress.timeSpent + timeSpent,
        status: newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
      })

      // 如果步骤有积分奖励，添加积分
      const currentStepData = tutorial.steps.find(step => step.id === stepId)
      if (currentStepData?.points) {
        await gamificationService.addPoints(
          userId,
          currentStepData.points,
          PointTransactionType.MANUAL_ADJUST,
          `完成教程步骤: ${currentStepData.title}`
        )
      }

      return updatedProgress
    } catch (error: unknown) {
      console.error('完成教程步骤失败:', error)
      throw error
    }
  }

  /**
   * 跳过教程
   */
  async skipTutorial(userId: string, tutorialId: string, reason?: string): Promise<UserTutorialProgress> {
    try {
      return await this.updateUserTutorialProgress(userId, tutorialId, {
        status: 'SKIPPED',
        skipReason: reason
      })
    } catch (error: unknown) {
      console.error('跳过教程失败:', error)
      throw error
    }
  }

  /**
   * 重置教程进度
   */
  async resetTutorialProgress(userId: string, tutorialId: string): Promise<UserTutorialProgress> {
    try {
      const tutorial = await this.getTutorialById(tutorialId)
      if (!tutorial) {
        throw new Error('教程不存在')
      }

      return await this.updateUserTutorialProgress(userId, tutorialId, {
        currentStep: 0,
        completedSteps: 0,
        status: 'NOT_STARTED',
        timeSpent: 0
      })
    } catch (error: unknown) {
      console.error('重置教程进度失败:', error)
      throw error
    }
  }

  /**
   * 获取教程统计
   */
  async getTutorialStats(userId?: string): Promise<TutorialStats> {
    try {
      const [
        totalTutorials,
        userProgressList,
        tutorialCompletions
      ] = await Promise.all([
        prisma.tutorial.count({ where: { isActive: true } }),
        userId ? this.getUserTutorialProgress(userId) : Promise.resolve([]),
        prisma.userTutorialProgress.groupBy({
          by: ['tutorialId'],
          where: { status: 'COMPLETED' },
          _count: { tutorialId: true }
        })
      ])

      const completedTutorials = userProgressList.filter(p => p.status === 'COMPLETED').length
      const inProgressTutorials = userProgressList.filter(p => p.status === 'IN_PROGRESS').length
      
      const totalPoints = userProgressList.reduce((sum, progress) => {
        if (progress.status === 'COMPLETED' && progress.tutorial) {
          return sum + progress.tutorial.points
        }
        return sum
      }, 0)

      const averageCompletionTime = userProgressList.length > 0
        ? userProgressList.reduce((sum, progress) => sum + progress.timeSpent, 0) / userProgressList.length
        : 0

      const popularTutorials = await Promise.all(
        tutorialCompletions
          .sort((a, b) => b._count.tutorialId - a._count.tutorialId)
          .slice(0, 5)
          .map(async (completion) => {
            const tutorial = await this.getTutorialById(completion.tutorialId)
            return {
              tutorialId: completion.tutorialId,
              name: tutorial?.name || '未知教程',
              completionCount: completion._count.tutorialId
            }
          })
      )

      const categoryStats: Record<Tutorial['category'], { total: number; completed: number }> = {
        BASICS: { total: 0, completed: 0 },
        ADVANCED: { total: 0, completed: 0 },
        FEATURES: { total: 0, completed: 0 },
        ACHIEVEMENTS: { total: 0, completed: 0 },
        REWARDS: { total: 0, completed: 0 },
        CHALLENGES: { total: 0, completed: 0 }
      }

      // 获取各类别统计
      const allTutorials = await this.getAllTutorials()
      allTutorials.tutorials.forEach(tutorial => {
        categoryStats[tutorial.category].total++
      })

      userProgressList.forEach(progress => {
        if (progress.status === 'COMPLETED' && progress.tutorial) {
          categoryStats[progress.tutorial.category].completed++
        }
      })

      return {
        totalTutorials,
        completedTutorials,
        inProgressTutorials,
        totalPoints,
        averageCompletionTime,
        popularTutorials,
        categoryStats
      }
    } catch (error: unknown) {
      console.error('获取教程统计失败:', error)
      throw error
    }
  }

  /**
   * 获取教程推荐
   */
  async getTutorialRecommendations(userId: string): Promise<TutorialRecommendation[]> {
    try {
      const userProgress = await this.getUserTutorialProgress(userId)
      const allTutorials = await this.getAllTutorials()
      
      // 获取用户已完成的教程类别
      const completedCategories = new Set(
        userProgress
          .filter(p => p.status === 'COMPLETED')
          .map(p => p.tutorial?.category)
          .filter(Boolean)
      )

      // 获取用户正在进行的教程
      const inProgressTutorialIds = new Set(
        userProgress
          .filter(p => p.status === 'IN_PROGRESS')
          .map(p => p.tutorialId)
      )

      // 筛选推荐教程
      const recommendations: TutorialRecommendation[] = []
      
      for (const tutorial of allTutorials.tutorials) {
        // 跳过已完成或正在进行的教程
        if (
          userProgress.some(p => p.tutorialId === tutorial.id && p.status === 'COMPLETED') ||
          inProgressTutorialIds.has(tutorial.id)
        ) {
          continue
        }

        // 检查前置教程
        if (tutorial.prerequisites && tutorial.prerequisites.length > 0) {
          const prerequisitesCompleted = tutorial.prerequisites.every(prereqId =>
            userProgress.some(p => p.tutorialId === prereqId && p.status === 'COMPLETED')
          )
          
          if (!prerequisitesCompleted) {
            continue
          }
        }

        // 计算推荐分数
        let confidence = 0.5 // 基础分数

        // 如果用户已完成同类别教程，增加推荐分数
        if (completedCategories.has(tutorial.category)) {
          confidence += 0.2
        }

        // 根据难度调整推荐分数
        const completedAdvancedCount = userProgress.filter(
          p => p.status === 'COMPLETED' && p.tutorial?.difficulty === 'ADVANCED'
        ).length
        
        if (tutorial.difficulty === 'BEGINNER' || completedAdvancedCount > 0) {
          confidence += 0.1
        }

        // 根据用户类型调整推荐分数
        const totalCompleted = userProgress.filter(p => p.status === 'COMPLETED').length
        if (tutorial.audience === 'NEW_USER' && totalCompleted < 3) {
          confidence += 0.2
        } else if (tutorial.audience === 'POWER_USER' && totalCompleted > 5) {
          confidence += 0.2
        }

        recommendations.push({
          id: `rec-${userId}-${tutorial.id}-${Date.now()}`,
          userId,
          tutorialId: tutorial.id,
          reason: this.generateRecommendationReason(tutorial, userProgress),
          confidence: Math.min(1, confidence),
          createdAt: new Date()
        })
      }

      // 按推荐分数排序并返回前5个
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
    } catch (error: unknown) {
      console.error('获取教程推荐失败:', error)
      throw error
    }
  }

  /**
   * 生成推荐理由
   */
  private generateRecommendationReason(tutorial: Tutorial, userProgress: UserTutorialProgress[]): string {
    const totalCompleted = userProgress.filter(p => p.status === 'COMPLETED').length
    const completedCategories = new Set(
      userProgress
        .filter(p => p.status === 'COMPLETED')
        .map(p => p.tutorial?.category)
        .filter(Boolean)
    )

    if (tutorial.audience === 'NEW_USER' && totalCompleted < 3) {
      return '适合新手的入门教程'
    }

    if (tutorial.audience === 'POWER_USER' && totalCompleted > 5) {
      return '为高级用户推荐的高级教程'
    }

    if (completedCategories.has(tutorial.category)) {
      return `基于您对${tutorial.category}类教程的兴趣推荐`
    }

    return '根据您的学习进度推荐'
  }

  /**
   * 提交教程反馈
   */
  async submitTutorialFeedback(
    userId: string,
    tutorialId: string,
    data: {
      stepId?: string
      rating: number
      comment?: string
      helpful: boolean
      suggestions?: string
    }
  ): Promise<TutorialFeedback> {
    try {
      const feedback = await prisma.tutorialFeedback.create({
        data: {
          userId,
          tutorialId,
          ...data
        }
      })

      return feedback as TutorialFeedback
    } catch (error: unknown) {
      console.error('提交教程反馈失败:', error)
      throw error
    }
  }

  /**
   * 初始化默认教程
   */
  async initializeDefaultTutorials(): Promise<void> {
    try {
      const defaultTutorials = [
        {
          name: '游戏化系统入门',
          description: '了解游戏化系统的基本概念和功能，包括积分、等级、成就等核心元素。',
          category: 'BASICS' as const,
          audience: 'NEW_USER' as const,
          difficulty: 'BEGINNER' as const,
          estimatedTime: 10,
          points: 50,
          tags: ['基础', '入门', '游戏化'],
          steps: [
            {
              title: '欢迎来到游戏化系统',
              content: '游戏化系统通过积分、等级、成就等元素，让您的学习过程更加有趣和富有挑战性。在本教程中，您将了解系统的基本功能。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 0,
              isRequired: true,
              points: 10,
              actions: []
            },
            {
              title: '了解积分系统',
              content: '积分是游戏化系统的核心货币。您可以通过完成各种任务和挑战来获得积分，积分可以用来兑换奖励和特权。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 1,
              isRequired: true,
              points: 10,
              actions: []
            },
            {
              title: '掌握等级和经验值',
              content: '通过积累经验值，您可以提升等级。每个等级都会解锁新的功能和奖励，让您有持续学习的动力。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 2,
              isRequired: true,
              points: 10,
              actions: []
            },
            {
              title: '探索成就系统',
              content: '成就是您完成特定目标后获得的荣誉。收集成就不仅能够获得积分奖励，还能展示您的学习成果。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 3,
              isRequired: true,
              points: 10,
              actions: []
            },
            {
              title: '开始您的游戏化之旅',
              content: '现在您已经了解了游戏化系统的基本概念，可以开始您的学习之旅了。完成更多任务，解锁更多成就，成为学习达人！',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 4,
              isRequired: true,
              points: 10,
              actions: []
            }
          ]
        },
        {
          name: '成就系统详解',
          description: '深入了解成就系统的工作原理，如何解锁成就，以及成就奖励机制。',
          category: 'ACHIEVEMENTS' as const,
          audience: 'RETURNING_USER' as const,
          difficulty: 'INTERMEDIATE' as const,
          estimatedTime: 15,
          points: 100,
          tags: ['成就', '进阶', '奖励'],
          prerequisites: ['游戏化系统入门'],
          steps: [
            {
              title: '成就系统概述',
              content: '成就系统是游戏化的重要组成部分，通过设置具体目标来激励用户学习和成长。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 0,
              isRequired: true,
              points: 20,
              actions: []
            },
            {
              title: '成就类型详解',
              content: '成就分为多种类型，包括复习成就、连续学习成就、等级成就等。每种成就都有不同的解锁条件和奖励。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 1,
              isRequired: true,
              points: 20,
              actions: []
            },
            {
              title: '查看您的成就',
              content: '在成就页面，您可以查看所有可用的成就，以及您已经解锁的成就。每个成就都有详细的解锁条件说明。',
              type: 'NAVIGATION' as const,
              target: '[data-achievement-tab]',
              position: 'bottom' as const,
              order: 2,
              isRequired: true,
              points: 30,
              actions: [
                {
                  id: 'click-achievement-tab',
                  type: 'CLICK' as const,
                  selector: '[data-achievement-tab]',
                  instruction: '点击成就标签页查看成就列表'
                }
              ]
            },
            {
              title: '成就奖励机制',
              content: '解锁成就不仅能获得积分奖励，还能解锁特殊功能和特权。某些稀有成就还有独特的视觉奖励。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 3,
              isRequired: true,
              points: 30,
              actions: []
            }
          ]
        },
        {
          name: '奖励商店指南',
          description: '学习如何使用积分在奖励商店兑换各种奖励和特权。',
          category: 'REWARDS' as const,
          audience: 'RETURNING_USER' as const,
          difficulty: 'INTERMEDIATE' as const,
          estimatedTime: 12,
          points: 80,
          tags: ['奖励', '商店', '积分'],
          prerequisites: ['游戏化系统入门'],
          steps: [
            {
              title: '奖励商店介绍',
              content: '奖励商店是您使用积分兑换各种奖励和特权的地方。这里有虚拟商品、特殊功能、个性化选项等多种奖励。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 0,
              isRequired: true,
              points: 20,
              actions: []
            },
            {
              title: '浏览奖励商店',
              content: '在奖励商店页面，您可以浏览所有可用的奖励。奖励按类别分类，您可以使用筛选器快速找到感兴趣的奖励。',
              type: 'NAVIGATION' as const,
              target: '[data-reward-store-tab]',
              position: 'bottom' as const,
              order: 1,
              isRequired: true,
              points: 20,
              actions: [
                {
                  id: 'click-reward-store-tab',
                  type: 'CLICK' as const,
                  selector: '[data-reward-store-tab]',
                  instruction: '点击奖励商店标签页浏览奖励'
                }
              ]
            },
            {
              title: '兑换奖励',
              content: '选择您喜欢的奖励，点击兑换按钮即可使用积分兑换。请注意，某些奖励可能有库存限制或兑换次数限制。',
              type: 'INTERACTION' as const,
              target: '[data-reward-item]',
              position: 'top' as const,
              order: 2,
              isRequired: true,
              points: 20,
              actions: [
                {
                  id: 'select-reward',
                  type: 'CLICK' as const,
                  selector: '[data-reward-item]:first-child',
                  instruction: '选择一个奖励商品'
                },
                {
                  id: 'claim-reward',
                  type: 'CLICK' as const,
                  selector: '[data-claim-button]',
                  instruction: '点击兑换按钮兑换奖励'
                }
              ]
            },
            {
              title: '管理您的奖励',
              content: '在"我的奖励"页面，您可以查看已兑换的奖励及其状态。某些奖励可能需要手动激活或使用。',
              type: 'INFO' as const,
              position: 'center' as const,
              order: 3,
              isRequired: true,
              points: 20,
              actions: []
            }
          ]
        }
      ]

      for (const tutorialData of defaultTutorials) {
        const existing = await prisma.tutorial.findFirst({
          where: { name: tutorialData.name }
        })

        if (!existing) {
          await this.createTutorial(tutorialData)
        }
      }
    } catch (error: unknown) {
      console.error('初始化默认教程失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const tutorialService = new TutorialService()