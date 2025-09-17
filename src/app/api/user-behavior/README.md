# 用户行为分析API路由文档

本目录包含用户行为分析相关的API路由，提供RESTful接口用于记录用户行为事件、查询分析结果和获取行为洞察数据。

## API路由列表

### 1. 记录用户行为事件

**路径**: `/api/user-behavior/record`

**方法**: `POST`, `PUT`, `GET`, `DELETE`

#### POST - 记录单个用户行为事件

**请求体**:
```json
{
  "userId": "用户ID",
  "eventType": "事件类型",
  "data": {
    "contentType": "内容类型（可选）",
    "categoryId": "类别ID（可选）",
    "timeSpent": 100,
    "accuracy": 0.8,
    "difficulty": 3,
    "success": true,
    "metadata": {
      "自定义字段": "自定义值"
    }
  },
  "sessionId": "会话ID（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "用户行为事件记录成功",
  "eventId": "event_1234567890_abc123"
}
```

#### PUT - 批量记录用户行为事件

**请求体**:
```json
{
  "events": [
    {
      "userId": "用户ID",
      "eventType": "事件类型",
      "data": {
        "contentType": "内容类型",
        "categoryId": "类别ID",
        "timeSpent": 100,
        "accuracy": 0.8,
        "difficulty": 3,
        "success": true,
        "metadata": {
          "自定义字段": "自定义值"
        }
      }
    }
  ],
  "sessionId": "会话ID（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "成功记录 1 个用户行为事件",
  "batchId": "batch_1234567890_abc123"
}
```

#### GET - 获取队列状态或刷新队列

**查询参数**:
- `action`: 操作类型，`queue-status`（获取队列状态）或 `flush-queue`（刷新队列）

**响应** (获取队列状态):
```json
{
  "success": true,
  "data": {
    "queueSize": 5,
    "isProcessing": false,
    "batchSize": 10
  }
}
```

**响应** (刷新队列):
```json
{
  "success": true,
  "message": "队列已刷新"
}
```

#### DELETE - 清空队列

**响应**:
```json
{
  "success": true,
  "message": "队列已清空"
}
```

### 2. 获取用户行为分析结果

**路径**: `/api/user-behavior/analysis`

**方法**: `GET`

**查询参数**:
- `userId` (必需): 用户ID
- `days` (可选): 分析天数，默认为30天，范围1-365

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "用户ID",
    "period": "2023-01-01 至 2023-01-31",
    "activityPatterns": {
      "dailyActivity": [...],
      "hourlyActivity": [...],
      "weeklyActivity": [...],
      "monthlyActivity": [...]
    },
    "featureUsage": {
      "mostUsedFeatures": [...],
      "featureInteractionDepth": {...},
      "featureUsageTrends": [...]
    },
    "learningPatterns": {
      "learningSessions": [...],
      "retentionRate": 75.5,
      "difficultyProgression": [...],
      "learningEfficiency": {...},
      "learningPreferences": {...}
    },
    "engagementMetrics": {
      "sessionFrequency": 2.5,
      "averageSessionLength": 15.3,
      "bounceRate": 12.5,
      "returnRate": 85.0,
      "depthEngagement": {...},
      "timeDistribution": {...}
    },
    "behaviorChanges": {
      "beforeGamification": {...},
      "afterGamification": {...},
      "improvementPercentage": {...}
    },
    "predictiveInsights": {
      "churnRisk": {...},
      "engagementForecast": {...},
      "nextActions": [...]
    },
    "socialBehavior": {
      "sharingFrequency": 5,
      "interactionTypes": [...],
      "networkInfluence": {...}
    }
  }
}
```

### 3. 获取用户行为洞察数据

**路径**: `/api/user-behavior/insights`

**方法**: `GET`

**查询参数**:
- `userId` (必需): 用户ID
- `days` (可选): 分析天数，默认为30天，范围1-365
- `type` (可选): 洞察类型，`all`（默认）、`predictive`、`social`、`learning`

**响应**:
```json
{
  "success": true,
  "data": {
    // 根据type参数返回不同的洞察数据
  },
  "metadata": {
    "userId": "用户ID",
    "period": "2023-01-01 至 2023-01-31",
    "insightType": "all"
  }
}
```

### 4. 获取系统级行为分析数据

**路径**: `/api/user-behavior/system`

**方法**: `GET`

**查询参数**:
- `days` (可选): 分析天数，默认为30天，范围1-365

**响应**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "activeUsers": 75,
    "averageSessionLength": 12.5,
    "topFeatures": [...],
    "behaviorTrends": {
      "increasing": [...],
      "decreasing": [...]
    }
  },
  "metadata": {
    "period": "最近30天",
    "generatedAt": "2023-01-31T12:00:00.000Z"
  }
}
```

## 事件类型

### 用户行为事件类型 (ExtendedUserBehaviorEventType)

- `REVIEW_COMPLETED` - 复习完成
- `MEMORY_CREATED` - 创建记忆
- `CATEGORY_FOCUS` - 类别专注
- `TIME_SPENT` - 花费时间
- `ACCURACY_HIGH` - 高准确率
- `ACCURACY_LOW` - 低准确率
- `STREAK_MAINTAINED` - 保持连续
- `CHALLENGE_COMPLETED` - 完成挑战
- `ACHIEVEMENT_UNLOCKED` - 解锁成就
- `LEVEL_UP` - 升级
- `POINTS_EARNED` - 获得积分
- `UI_INTERACTION` - UI交互
- `THEME_CHANGED` - 主题变更
- `CUSTOMIZATION` - 自定义
- `SEARCH_PERFORMED` - 搜索操作
- `FILTER_APPLIED` - 应用筛选
- `SORT_CHANGED` - 排序变更
- `PAGE_NAVIGATION` - 页面导航
- `CONTENT_SHARED` - 内容分享
- `CONTENT_EXPORTED` - 内容导出
- `SETTING_CHANGED` - 设置变更
- `HELP_ACCESSED` - 访问帮助
- `FEEDBACK_SUBMITTED` - 提交反馈
- `ERROR_ENCOUNTERED` - 遇到错误
- `OFFLINE_MODE` - 离线模式
- `SYNC_COMPLETED` - 同步完成
- `SOCIAL_INTERACTION` - 社交互动

### 学习内容类型 (ExtendedLearningContentType)

- `TEXT` - 文本
- `IMAGE` - 图像
- `AUDIO` - 音频
- `VIDEO` - 视频
- `INTERACTIVE` - 交互
- `QUIZ` - 测验
- `FLASHCARD` - 闪卡
- `ARTICLE` - 文章
- `COURSE` - 课程
- `EXERCISE` - 练习

## 使用示例

### 记录复习完成事件

```javascript
fetch('/api/user-behavior/record', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user123',
    eventType: 'REVIEW_COMPLETED',
    data: {
      contentType: 'QUIZ',
      timeSpent: 120,
      accuracy: 0.9,
      difficulty: 3,
      success: true,
      metadata: {
        contentId: 'quiz456',
        responseTime: 30
      }
    }
  }),
});
```

### 获取用户行为分析

```javascript
const userId = 'user123';
const days = 30;
fetch(`/api/user-behavior/analysis?userId=${userId}&days=${days}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### 获取预测性洞察

```javascript
const userId = 'user123';
fetch(`/api/user-behavior/insights?userId=${userId}&type=predictive`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## 错误处理

所有API路由都会返回标准的HTTP状态码和错误信息：

- `400` - 请求参数错误
- `500` - 服务器内部错误

错误响应格式：
```json
{
  "error": "错误描述"
}