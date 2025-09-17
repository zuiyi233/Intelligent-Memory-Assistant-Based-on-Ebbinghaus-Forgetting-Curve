# 社交分享功能文档

## 概述

社交分享功能允许用户分享他们在游戏化系统中的成就、徽章、个人资料、进度和排行榜到各种社交平台。该功能包括：

- 多平台分享支持（微信、微博、QQ、Twitter、Facebook、Instagram、LinkedIn、抖音）
- 自定义分享内容编辑器
- 分享图片生成功能
- 分享历史记录
- 分享统计和分析

## 组件

### SocialShare

主要的社交分享组件，提供全面的分享功能。

#### 使用方法

```tsx
import { SocialShare } from '@/components/gamification/SocialShare'

function MyComponent() {
  const [showShare, setShowShare] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowShare(true)}>分享成就</button>
      
      <SocialShare
        contentType="achievement" // achievement, badge, profile, progress, leaderboard
        contentId="achievement-id"
        achievement={achievementData}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        userId="user-id"
      />
    </div>
  )
}
```

#### 属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| contentType | string | 是 | 分享内容类型：achievement, badge, profile, progress, leaderboard |
| contentId | string | 是 | 分享内容的ID |
| achievement | Achievement | 否 | 成就数据（当contentType为achievement或badge时需要） |
| profile | Profile | 否 | 用户资料数据（当contentType为profile时需要） |
| isOpen | boolean | 是 | 是否显示分享模态框 |
| onClose | function | 是 | 关闭模态框的回调函数 |
| userId | string | 是 | 用户ID |

### BadgeShare

徽章分享组件，提供徽章特定的分享功能，集成了SocialShare组件。

#### 使用方法

```tsx
import { BadgeShare } from '@/components/gamification/BadgeShare'

function MyComponent() {
  const [showShare, setShowShare] = useState(false)
  const [badge, setBadge] = useState(achievementData)
  
  return (
    <div>
      <button onClick={() => setShowShare(true)}>分享徽章</button>
      
      <BadgeShare
        badge={badge}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        userId="user-id"
      />
    </div>
  )
}
```

#### 属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| badge | Achievement | 是 | 徽章数据 |
| isOpen | boolean | 是 | 是否显示分享模态框 |
| onClose | function | 是 | 关闭模态框的回调函数 |
| userId | string | 否 | 用户ID（高级分享功能需要） |

## API

### 分享记录API

#### POST /api/gamification/social-share

记录用户的分享行为。

**请求体：**

```json
{
  "platform": "wechat",
  "contentType": "badge",
  "contentId": "badge-id",
  "shareText": "我刚刚解锁了徽章「徽章名称」！",
  "shareImage": "https://example.com/share-image.png"
}
```

**响应：**

```json
{
  "success": true,
  "share": {
    "id": "share-id",
    "userId": "user-id",
    "platform": "wechat",
    "contentType": "badge",
    "contentId": "badge-id",
    "shareText": "我刚刚解锁了徽章「徽章名称」！",
    "shareImage": "https://example.com/share-image.png",
    "createdAt": "2023-05-20T12:00:00Z"
  }
}
```

#### GET /api/gamification/social-share

获取用户的分享历史。

**查询参数：**

- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10

**响应：**

```json
{
  "success": true,
  "shares": [
    {
      "id": "share-id",
      "userId": "user-id",
      "platform": "wechat",
      "contentType": "badge",
      "contentId": "badge-id",
      "shareText": "我刚刚解锁了徽章「徽章名称」！",
      "shareImage": "https://example.com/share-image.png",
      "createdAt": "2023-05-20T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "stats": {
    "totalShares": 1,
    "platformStats": {
      "wechat": 1
    },
    "contentTypeStats": {
      "badge": 1
    }
  }
}
```

## 分享平台

支持以下社交平台：

| 平台 | 标识 | 分享方式 |
|------|------|----------|
| 微信 | wechat | 复制链接到剪贴板 |
| 微博 | weibo | 打开微博分享页面 |
| QQ | qq | 打开QQ分享页面 |
| Twitter | twitter | 打开Twitter分享页面 |
| Facebook | facebook | 打开Facebook分享页面 |
| Instagram | instagram | 复制链接到剪贴板 |
| LinkedIn | linkedin | 打开LinkedIn分享页面 |
| 抖音 | douyin | 复制链接到剪贴板 |

## 分享内容类型

支持以下内容类型：

| 类型 | 标识 | 描述 |
|------|------|------|
| 成就 | achievement | 用户的成就记录 |
| 徽章 | badge | 用户获得的徽章 |
| 个人资料 | profile | 用户的个人资料 |
| 进度 | progress | 用户的学习进度 |
| 排行榜 | leaderboard | 用户在排行榜中的位置 |

## 最佳实践

1. **自定义分享内容**：鼓励用户自定义分享文本，增加个性化。
2. **分享图片**：为每种内容类型提供默认的分享图片，确保在不同平台上显示良好。
3. **分享激励**：考虑为分享行为提供奖励，如积分或徽章。
4. **分析分享数据**：定期分析分享数据，了解用户分享偏好，优化分享功能。
5. **平台适配**：根据不同平台的特点，调整分享内容的格式和样式。

## 故障排除

### 分享不工作

1. 检查网络连接是否正常。
2. 确认分享平台的API是否可用。
3. 检查分享内容是否符合平台要求。

### 分享图片不显示

1. 确认图片URL是否正确且可访问。
2. 检查图片格式和大小是否符合平台要求。
3. 确认图片生成功能是否正常工作。

### 分享历史不显示

1. 检查用户是否已登录。
2. 确认API请求是否正确发送。
3. 检查数据库连接是否正常。

## 更新日志

### v1.0.0 (2023-05-20)

- 初始版本发布
- 支持多种社交平台
- 实现自定义分享内容编辑器
- 添加分享图片生成功能
- 实现分享历史记录和统计