import { prisma } from '@/lib/db'
import type {
  ABTestTemplate,
  ABTestTemplateCreateForm,
  ABTestTemplateUpdateForm,
  ABTestCreateForm
} from '@/types'

// A/B测试模板服务
export class ABTestTemplateService {
  /**
   * 创建新的测试模板
   */
  async createTemplate(templateData: ABTestTemplateCreateForm, createdBy: string): Promise<ABTestTemplate> {
    const template = await prisma.abTestTemplate.create({
      data: {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        variants: templateData.variants as any,
        metrics: templateData.metrics as any,
        targetAudience: templateData.targetAudience as any,
        isActive: true,
        createdBy
      }
    })

    return {
      ...template,
      variants: templateData.variants,
      metrics: templateData.metrics,
      targetAudience: templateData.targetAudience
    } as ABTestTemplate
  }

  /**
   * 获取所有测试模板
   */
  async getAllTemplates(): Promise<ABTestTemplate[]> {
    const templates = await prisma.abTestTemplate.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return templates.map(template => ({
      ...template,
      variants: template.variants as any,
      metrics: template.metrics as any,
      targetAudience: template.targetAudience as any
    })) as ABTestTemplate[]
  }

  /**
   * 获取特定测试模板
   */
  async getTemplate(templateId: string): Promise<ABTestTemplate | null> {
    const template = await prisma.abTestTemplate.findUnique({
      where: { id: templateId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    if (!template) return null

    return {
      ...template,
      variants: template.variants as any,
      metrics: template.metrics as any,
      targetAudience: template.targetAudience as any
    } as ABTestTemplate
  }

  /**
   * 更新测试模板
   */
  async updateTemplate(templateId: string, updates: ABTestTemplateUpdateForm): Promise<ABTestTemplate | null> {
    const existingTemplate = await prisma.abTestTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) return null

    const updatedTemplate = await prisma.abTestTemplate.update({
      where: { id: templateId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.variants && { variants: updates.variants as any }),
        ...(updates.metrics && { metrics: updates.metrics as any }),
        ...(updates.targetAudience !== undefined && { targetAudience: updates.targetAudience as any }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive })
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return {
      ...updatedTemplate,
      variants: updates.variants || existingTemplate.variants as any,
      metrics: updates.metrics || existingTemplate.metrics as any,
      targetAudience: updates.targetAudience !== undefined 
        ? updates.targetAudience 
        : existingTemplate.targetAudience as any
    } as ABTestTemplate
  }

  /**
   * 删除测试模板
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      await prisma.abTestTemplate.delete({
        where: { id: templateId }
      })
      return true
    } catch (error) {
      console.error('删除测试模板失败:', error)
      return false
    }
  }

  /**
   * 使用模板创建测试
   */
  async createTestFromTemplate(templateId: string, testData: {
    name?: string
    description?: string
    createdBy?: string
  }): Promise<ABTestCreateForm | null> {
    const template = await prisma.abTestTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) return null

    return {
      name: testData.name || `${template.name} (来自模板)`,
      description: testData.description || template.description,
      targetAudience: template.targetAudience as any,
      variants: template.variants as any,
      metrics: template.metrics as any
    } as ABTestCreateForm
  }

  /**
   * 按类别获取模板
   */
  async getTemplatesByCategory(category: string): Promise<ABTestTemplate[]> {
    const templates = await prisma.abTestTemplate.findMany({
      where: { 
        category,
        isActive: true 
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return templates.map(template => ({
      ...template,
      variants: template.variants as any,
      metrics: template.metrics as any,
      targetAudience: template.targetAudience as any
    })) as ABTestTemplate[]
  }

  /**
   * 获取模板类别列表
   */
  async getTemplateCategories(): Promise<string[]> {
    const categories = await prisma.abTestTemplate.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      where: { isActive: true },
      orderBy: {
        category: 'asc'
      }
    })

    return categories.map(item => item.category)
  }

  /**
   * 创建预设模板
   */
  async createPresetTemplates(): Promise<void> {
    // 预设模板1：UI元素测试
    await this.createTemplate({
      name: 'UI元素测试模板',
      description: '用于测试不同UI元素对用户行为的影响',
      category: 'UI测试',
      variants: [
        {
          name: '对照组',
          description: '当前UI设计',
          config: { buttonColor: 'blue', buttonSize: 'medium', layout: 'current' },
          trafficPercentage: 50,
          isControl: true
        },
        {
          name: '实验组',
          description: '新UI设计',
          config: { buttonColor: 'green', buttonSize: 'large', layout: 'new' },
          trafficPercentage: 50,
          isControl: false
        }
      ],
      metrics: [
        {
          name: '点击率',
          description: '测量元素的点击率',
          type: 'CONVERSION',
          unit: '百分比',
          isActive: true
        },
        {
          name: '停留时间',
          description: '测量用户在页面上的停留时间',
          type: 'ENGAGEMENT',
          unit: '秒',
          isActive: true
        }
      ]
    }, 'system')

    // 预设模板2：内容推荐测试
    await this.createTemplate({
      name: '内容推荐测试模板',
      description: '用于测试不同内容推荐算法的效果',
      category: '推荐算法',
      variants: [
        {
          name: '基于协同过滤',
          description: '使用协同过滤算法推荐内容',
          config: { algorithm: 'collaborative_filtering', diversity: 0.3 },
          trafficPercentage: 33.3,
          isControl: true
        },
        {
          name: '基于内容',
          description: '使用内容特征推荐相似内容',
          config: { algorithm: 'content_based', diversity: 0.5 },
          trafficPercentage: 33.3,
          isControl: false
        },
        {
          name: '混合推荐',
          description: '结合协同过滤和内容特征的混合算法',
          config: { algorithm: 'hybrid', diversity: 0.7 },
          trafficPercentage: 33.4,
          isControl: false
        }
      ],
      metrics: [
        {
          name: '点击率',
          description: '测量推荐内容的点击率',
          type: 'CONVERSION',
          unit: '百分比',
          isActive: true
        },
        {
          name: '用户满意度',
          description: '测量用户对推荐内容的满意度',
          type: 'SATISFACTION',
          unit: '评分',
          isActive: true
        },
        {
          name: '留存率',
          description: '测量用户留存率',
          type: 'RETENTION',
          unit: '百分比',
          isActive: true
        }
      ]
    }, 'system')

    // 预设模板3：游戏化元素测试
    await this.createTemplate({
      name: '游戏化元素测试模板',
      description: '用于测试不同游戏化元素对用户参与度的影响',
      category: '游戏化',
      variants: [
        {
          name: '积分系统',
          description: '使用积分奖励系统',
          config: { gamificationType: 'points', rewardMultiplier: 1.0 },
          trafficPercentage: 25,
          isControl: true
        },
        {
          name: '徽章系统',
          description: '使用徽章成就系统',
          config: { gamificationType: 'badges', rewardMultiplier: 1.0 },
          trafficPercentage: 25,
          isControl: false
        },
        {
          name: '排行榜系统',
          description: '使用排行榜竞争系统',
          config: { gamificationType: 'leaderboard', rewardMultiplier: 1.0 },
          trafficPercentage: 25,
          isControl: false
        },
        {
          name: '混合系统',
          description: '结合积分、徽章和排行榜的混合系统',
          config: { gamificationType: 'hybrid', rewardMultiplier: 1.2 },
          trafficPercentage: 25,
          isControl: false
        }
      ],
      metrics: [
        {
          name: '活跃度',
          description: '测量用户活跃度',
          type: 'ENGAGEMENT',
          unit: '活跃指数',
          isActive: true
        },
        {
          name: '任务完成率',
          description: '测量用户任务完成率',
          type: 'CONVERSION',
          unit: '百分比',
          isActive: true
        },
        {
          name: '留存率',
          description: '测量用户留存率',
          type: 'RETENTION',
          unit: '百分比',
          isActive: true
        }
      ]
    }, 'system')
  }
}

// 导出单例实例
export const abTestTemplateService = new ABTestTemplateService()