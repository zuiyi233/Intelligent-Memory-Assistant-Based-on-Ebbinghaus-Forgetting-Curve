# RewardAnimations 组件文档

## 概述

RewardAnimations 是一个高级奖励动画组件，基于 framer-motion 和 Inspira UI 设计原则构建。它提供了丰富的视觉效果和交互体验，用于在游戏化应用中展示各种奖励。

## 主要特性

- 🎨 **Inspira UI 设计**：应用了 Inspira UI 的设计原则和效果
- ✨ **高级动画效果**：基于 framer-motion 的流畅动画
- 📱 **响应式设计**：在不同设备上都能提供良好的体验
- 🎵 **声音支持**：为不同类型的奖励提供相应的声音反馈
- 📳 **触摸反馈**：为支持的设备提供触觉反馈
- 🏆 **奖励稀有度**：支持不同稀有度的奖励展示
- ⚡ **性能优化**：使用 memo、useCallback 等技术优化渲染性能

## 组件结构

### 主要组件

1. **RewardAnimation**：主奖励动画组件
2. **RewardAnimationManager**：奖励动画管理器，用于处理多个奖励的顺序展示
3. **效果组件**：
   - ParticleEffect：粒子效果
   - HaloEffect：光环效果
   - SparkleEffect：闪光效果
   - RippleEffect：波纹效果

### 便捷函数

- `showRewardAnimation`：通用奖励动画显示函数
- `showPointsReward`：积分奖励
- `showBadgeReward`：徽章奖励
- `showTrophyReward`：奖杯奖励
- `showLevelUpReward`：升级奖励
- `showStreakBonusReward`：连续学习奖励
- `showSpecialGiftReward`：特别奖励
- `showAchievementUnlockReward`：成就解锁奖励

## 使用方法

### 基本使用

```tsx
import { RewardAnimation } from '@/components/gamification/RewardAnimations'

function MyComponent() {
  const [showReward, setShowReward] = useState(false)
  
  const reward = {
    id: 'reward-1',
    type: 'POINTS' as const,
    title: '获得积分！',
    description: '恭喜你获得了 100 积分',
    amount: 100,
    rarity: 'COMMON' as const,
  }
  
  return (
    <div>
      <button onClick={() => setShowReward(true)}>
        显示奖励
      </button>
      
      <RewardAnimation
        reward={reward}
        visible={showReward}
        onComplete={() => setShowReward(false)}
      />
    </div>
  )
}
```

### 使用管理器处理多个奖励

```tsx
import { RewardAnimationManager } from '@/components/gamification/RewardAnimations'

function MyComponent() {
  const [rewards, setRewards] = useState([
    {
      id: 'reward-1',
      type: 'POINTS' as const,
      title: '获得积分！',
      description: '恭喜你获得了 100 积分',
      amount: 100,
      rarity: 'COMMON' as const,
    },
    {
      id: 'reward-2',
      type: 'BADGE' as const,
      title: '获得徽章！',
      description: '恭喜你获得了新手上路徽章',
      rarity: 'RARE' as const,
    }
  ])
  
  const handleRewardComplete = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }
  
  return (
    <RewardAnimationManager
      rewards={rewards}
      onRewardComplete={handleRewardComplete}
    />
  )
}
```

### 使用便捷函数

```tsx
import { 
  showPointsReward,
  showBadgeReward,
  showLevelUpReward
} from '@/components/gamification/RewardAnimations'

function MyComponent() {
  const handleShowPointsReward = () => {
    showPointsReward(100, '完成每日任务', 'RARE')
  }
  
  const handleShowBadgeReward = () => {
    showBadgeReward('连续学习7天', 'EPIC')
  }
  
  const handleShowLevelUpReward = () => {
    showLevelUpReward(5, 6, 'LEGENDARY')
  }
  
  return (
    <div>
      <button onClick={handleShowPointsReward}>显示积分奖励</button>
      <button onClick={handleShowBadgeReward}>显示徽章奖励</button>
      <button onClick={handleShowLevelUpReward}>显示升级奖励</button>
    </div>
  )
}
```

## API 参考

### RewardAnimationProps

```typescript
interface RewardAnimationProps {
  reward: RewardData           // 奖励数据
  visible: boolean             // 是否显示动画
  onComplete: () => void      // 动画完成回调
  autoClose?: boolean          // 是否自动关闭，默认为 true
  duration?: number           // 动画持续时间（毫秒），默认为 3000
}
```

### RewardData

```typescript
interface RewardData {
  id: string                  // 奖励唯一标识
  type: RewardType            // 奖励类型
  title: string               // 奖励标题
  description: string         // 奖励描述
  amount?: number             // 奖励数量（可选）
  color?: string              // 自定义颜色（可选）
  icon?: React.ReactNode      // 自定义图标（可选）
  animation?: string          // 自定义动画（可选）
  rarity?: RewardRarity       // 奖励稀有度（可选）
  soundEnabled?: boolean      // 是否启用声音（可选）
  hapticEnabled?: boolean     // 是否启用触觉反馈（可选）
}
```

### RewardType

```typescript
type RewardType = 
  | 'POINTS'              // 积分
  | 'BADGE'               // 徽章
  | 'TROPHY'              // 奖杯
  | 'LEVEL_UP'           // 升级
  | 'STREAK_BONUS'       // 连续学习奖励
  | 'SPECIAL_GIFT'       // 特别奖励
  | 'ACHIEVEMENT_UNLOCK' // 成就解锁
```

### RewardRarity

```typescript
type RewardRarity = 
  | 'COMMON'    // 普通
  | 'RARE'      // 稀有
  | 'EPIC'      // 史诗
  | 'LEGENDARY' // 传说
```

## 自定义和扩展

### 自定义奖励类型

如果需要添加新的奖励类型，可以扩展 `RewardType` 类型，并在组件中添加相应的逻辑：

```typescript
// 扩展类型
type RewardType = 
  | 'POINTS'
  | 'BADGE'
  | 'TROPHY'
  | 'LEVEL_UP'
  | 'STREAK_BONUS'
  | 'SPECIAL_GIFT'
  | 'ACHIEVEMENT_UNLOCK'
  | 'CUSTOM_TYPE' // 新增的自定义类型
```

### 自定义效果

组件中的效果组件（粒子、光环、闪光、波纹）都可以通过调整参数来自定义：

```tsx
<ParticleEffect
  color="#FF0000"        // 自定义颜色
  count={50}             // 粒子数量
  duration={2000}        // 持续时间
  size="large"          // 粒子大小
  type="stars"          // 粒子类型
/>
```

## 性能优化

组件已经内置了多种性能优化措施：

1. **React.memo**：所有效果组件都使用 memo 包装，避免不必要的重新渲染
2. **useCallback**：所有函数都使用 useCallback 优化，避免重复创建
3. **声音缓存**：音频文件会被缓存，避免重复加载
4. **响应式效果**：根据屏幕尺寸动态调整效果参数
5. **requestAnimationFrame**：使用 requestAnimationFrame 优化动画帧性能

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. 确保在使用前安装了必要的依赖：`framer-motion` 和 `lucide-react`
2. 声音文件需要放在 `/sounds` 目录下
3. 在服务器端渲染时，组件需要被包装在 `'use client'` 指令中
4. 触觉反馈仅在支持的设备上可用

## 更新日志

### v2.0.0

- 重构组件结构，使用 framer-motion 替代原有动画库
- 应用 Inspira UI 设计原则
- 添加奖励稀有度系统
- 增强视觉效果和交互体验
- 实现响应式设计
- 添加声音和触觉反馈支持
- 优化性能和渲染效率