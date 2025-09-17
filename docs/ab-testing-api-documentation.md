# A/B测试API文档

## 概述

本文档描述了系统中所有A/B测试相关的API端点。这些API提供了创建、管理、分析A/B测试的功能，以及用户分配、结果统计和导出等功能。

## 基础信息

- **基础URL**: `/api`
- **认证**: 大部分API需要用户认证（通过NextAuth会话）
- **响应格式**: JSON
- **错误处理**: 统一的错误响应格式

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "timestamp": "2023-09-16T15:30:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息（可选）"
  },
  "timestamp": "2023-09-16T15:30:00.000Z"
}
```

### 分页响应

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-09-16T15:30:00.000Z"
}
```

## 错误代码

| 代码 | 描述 |
|------|------|
| `INTERNAL_ERROR` | 内部服务器错误 |
| `VALIDATION_ERROR` | 数据验证失败 |
| `NOT_FOUND` | 资源不存在 |
| `UNAUTHORIZED` | 未授权访问 |
| `FORBIDDEN` | 禁止访问 |
| `TEST_NOT_FOUND` | A/B测试不存在 |
| `INVALID_TEST_STATUS` | 无效的测试状态 |
| `TEST_ALREADY_ACTIVE` | 测试已处于激活状态 |
| `TEST_ALREADY_COMPLETED` | 测试已完成，无法修改 |
| `INVALID_VARIANT_CONFIG` | 无效的变体配置 |
| `INVALID_METRIC_CONFIG` | 无效的指标配置 |
| `USER_ALREADY_ASSIGNED` | 用户已分配到该测试 |
| `USER_NOT_FOUND` | 用户不存在 |
| `VARIANT_NOT_FOUND` | 变体不存在 |
| `ASSIGNMENT_FAILED` | 用户分配失败 |
| `BATCH_OPERATION_FAILED` | 批量操作失败 |
| `INVALID_BATCH_REQUEST` | 无效的批量操作请求 |
| `EXPORT_FAILED` | 导出失败 |
| `INVALID_EXPORT_FORMAT` | 无效的导出格式 |
| `TEMPLATE_NOT_FOUND` | 测试模板不存在 |
| `INVALID_TEMPLATE_CONFIG` | 无效的模板配置 |
| `SEGMENT_NOT_FOUND` | 用户细分不存在 |
| `INVALID_SEGMENT_CONFIG` | 无效的细分配置 |
| `USER_ALREADY_IN_SEGMENT` | 用户已在细分中 |
| `USER_NOT_IN_SEGMENT` | 用户不在细分中 |
| `MISSING_REQUIRED_PARAM` | 缺少必需参数 |
| `INVALID_PARAM_VALUE` | 参数值无效 |
| `INVALID_PAGINATION` | 分页参数无效 |

## API端点

### 1. A/B测试管理

#### 1.1 获取所有A/B测试

- **URL**: `/api/gamification/abtesting`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取系统中所有的A/B测试列表

**请求示例**:
```http
GET /api/gamification/abtesting
```

#### 1.2 创建A/B测试

- **URL**: `/api/gamification/abtesting`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 创建一个新的A/B测试

**请求体**:
```json
{
  "name": "首页布局测试",
  "description": "测试两种不同的首页布局对用户留存率的影响",
  "targetAudience": {
    "userSegments": ["new_users"],
    "percentage": 50,
    "criteria": {
      "isPremium": false,
      "minAccountAgeDays": 7
    }
  },
  "variants": [
    {
      "name": "控制组",
      "description": "当前首页布局",
      "config": {},
      "trafficPercentage": 50,
      "isControl": true
    },
    {
      "name": "实验组",
      "description": "新的首页布局",
      "config": {"layout": "new"},
      "trafficPercentage": 50,
      "isControl": false
    }
  ],
  "metrics": [
    {
      "name": "用户留存率",
      "description": "7日留存率",
      "type": "RETENTION",
      "unit": "%",
      "isActive": true
    }
  ]
}
```

### 2. 用户分配

#### 2.1 为用户分配测试变体

- **URL**: `/api/gamification/abtesting/assign`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 为指定用户分配A/B测试的变体

**请求体**:
```json
{
  "userId": "user_123",
  "testId": "test_123"
}
```

#### 2.2 获取用户的测试变体分配

- **URL**: `/api/gamification/abtesting/assign`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户的测试变体分配情况

**查询参数**:
- `userId` (必需): 用户ID
- `testId` (可选): 测试ID，如果提供则返回指定测试的分配情况，否则返回所有测试的分配情况

**请求示例**:
```http
GET /api/gamification/abtesting/assign?userId=user_123&testId=test_123
```

#### 2.3 应用测试变体配置

- **URL**: `/api/gamification/abtesting/apply`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 应用指定用户在指定测试中的变体配置

**请求体**:
```json
{
  "userId": "user_123",
  "testId": "test_123"
}
```

### 3. 高级统计

#### 3.1 获取A/B测试高级统计数据

- **URL**: `/api/gamification/abtesting/advanced-stats`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 获取A/B测试的高级统计数据，包括显著性分析、效应量、置信区间等

**请求体**:
```json
{
  "testId": "test_123",
  "timeRange": {
    "startDate": "2023-09-01T00:00:00.000Z",
    "endDate": "2023-09-16T00:00:00.000Z"
  },
  "segments": {
    "primarySegment": "new_users"
  },
  "metrics": ["metric_123", "metric_124"],
  "includeUserBreakdown": true
}
```

### 4. 批量操作

#### 4.1 批量创建A/B测试

- **URL**: `/api/ab-tests/batch`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 批量创建多个A/B测试

**请求体**:
```json
{
  "tests": [
    {
      "name": "首页布局测试",
      "description": "测试两种不同的首页布局对用户留存率的影响",
      "targetAudience": {
        "userSegments": ["new_users"],
        "percentage": 50
      },
      "variants": [
        {
          "name": "控制组",
          "description": "当前首页布局",
          "config": {},
          "trafficPercentage": 50,
          "isControl": true
        },
        {
          "name": "实验组",
          "description": "新的首页布局",
          "config": {"layout": "new"},
          "trafficPercentage": 50,
          "isControl": false
        }
      ],
      "metrics": [
        {
          "name": "用户留存率",
          "description": "7日留存率",
          "type": "RETENTION",
          "unit": "%",
          "isActive": true
        }
      ]
    }
  ]
}
```

#### 4.2 批量分配用户

- **URL**: `/api/ab-tests/assignments/batch`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 批量为多个用户分配A/B测试变体

**请求体**:
```json
{
  "assignments": [
    {
      "userId": "user_123",
      "testId": "test_123"
    },
    {
      "userId": "user_124",
      "testId": "test_123"
    }
  ]
}
```

### 5. 测试模板管理

#### 5.1 获取所有测试模板

- **URL**: `/api/ab-test-templates`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取系统中所有的A/B测试模板

**查询参数**:
- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10，最大为100
- `category` (可选): 模板分类
- `isActive` (可选): 是否激活，true或false

**请求示例**:
```http
GET /api/ab-test-templates?page=1&limit=10&category=UI&isActive=true
```

#### 5.2 创建测试模板

- **URL**: `/api/ab-test-templates`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 创建一个新的A/B测试模板

**请求体**:
```json
{
  "name": "UI布局测试模板",
  "description": "用于测试不同UI布局效果的模板",
  "category": "UI",
  "variants": [
    {
      "name": "控制组",
      "description": "当前UI布局",
      "config": {},
      "trafficPercentage": 50,
      "isControl": true
    },
    {
      "name": "实验组",
      "description": "新的UI布局",
      "config": {"layout": "new"},
      "trafficPercentage": 50,
      "isControl": false
    }
  ],
  "metrics": [
    {
      "name": "点击率",
      "description": "用户点击率",
      "type": "ENGAGEMENT",
      "unit": "%",
      "isActive": true
    }
  ],
  "targetAudience": {
    "userSegments": ["active_users"],
    "percentage": 50
  }
}
```

#### 5.3 获取特定测试模板

- **URL**: `/api/ab-test-templates/{id}`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定ID的A/B测试模板

**请求示例**:
```http
GET /api/ab-test-templates/template_123
```

#### 5.4 更新测试模板

- **URL**: `/api/ab-test-templates/{id}`
- **方法**: `PUT`
- **认证**: 需要
- **描述**: 更新指定ID的A/B测试模板

**请求体**:
```json
{
  "name": "更新后的UI布局测试模板",
  "description": "更新后的模板描述",
  "category": "UI",
  "isActive": false
}
```

#### 5.5 删除测试模板

- **URL**: `/api/ab-test-templates/{id}`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 删除指定ID的A/B测试模板

**请求示例**:
```http
DELETE /api/ab-test-templates/template_123
```

#### 5.6 使用模板创建测试

- **URL**: `/api/ab-test-templates/{id}/use`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 使用指定模板创建A/B测试

**请求体**:
```json
{
  "name": "首页UI测试",
  "description": "测试首页UI布局效果",
  "overrides": {
    "targetAudience": {
      "userSegments": ["new_users"],
      "percentage": 30
    }
  }
}
```

### 6. 用户细分管理

#### 6.1 获取所有用户细分

- **URL**: `/api/ab-tests/segments`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取系统中所有的用户细分

**查询参数**:
- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10，最大为100
- `isActive` (可选): 是否激活，true或false

**请求示例**:
```http
GET /api/ab-tests/segments?page=1&limit=10&isActive=true
```

#### 6.2 创建用户细分

- **URL**: `/api/ab-tests/segments`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 创建一个新的用户细分

**请求体**:
```json
{
  "name": "高活跃用户",
  "description": "每周活跃天数大于5天的用户",
  "criteria": {
    "weeklyActiveDays": {
      "operator": "greater_than",
      "value": 5
    },
    "isPremium": {
      "operator": "equals",
      "value": true
    }
  }
}
```

#### 6.3 获取特定用户细分

- **URL**: `/api/ab-tests/segments/{id}`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定ID的用户细分

**请求示例**:
```http
GET /api/ab-tests/segments/segment_123
```

#### 6.4 更新用户细分

- **URL**: `/api/ab-tests/segments/{id}`
- **方法**: `PUT`
- **认证**: 需要
- **描述**: 更新指定ID的用户细分

**请求体**:
```json
{
  "name": "高活跃高级用户",
  "description": "每周活跃天数大于5天且为高级用户的用户",
  "criteria": {
    "weeklyActiveDays": {
      "operator": "greater_than",
      "value": 5
    },
    "isPremium": {
      "operator": "equals",
      "value": true
    },
    "level": {
      "operator": "greater_than",
      "value": 10
    }
  },
  "isActive": true
}
```

#### 6.5 删除用户细分

- **URL**: `/api/ab-tests/segments/{id}`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 删除指定ID的用户细分

**请求示例**:
```http
DELETE /api/ab-tests/segments/segment_123
```

#### 6.6 获取细分中的用户

- **URL**: `/api/ab-tests/segments/{id}/users`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定用户细分中的用户列表

**查询参数**:
- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10，最大为100

**请求示例**:
```http
GET /api/ab-tests/segments/segment_123/users?page=1&limit=10
```

#### 6.7 添加用户到细分

- **URL**: `/api/ab-tests/segments/{id}/users`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 添加用户到指定用户细分

**请求体**:
```json
{
  "userIds": ["user_123", "user_124"]
}
```

#### 6.8 从细分中移除用户

- **URL**: `/api/ab-tests/segments/{id}/users/{userId}`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 从指定用户细分中移除用户

**请求示例**:
```http
DELETE /api/ab-tests/segments/segment_123/users/user_123
```

### 7. 历史数据查询

#### 7.1 获取历史测试数据

- **URL**: `/api/ab-tests/history`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取A/B测试的历史数据

**查询参数**:
- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10，最大为100
- `status` (可选): 测试状态，如"DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"
- `dateFrom` (可选): 开始日期，格式为YYYY-MM-DD
- `dateTo` (可选): 结束日期，格式为YYYY-MM-DD

**请求示例**:
```http
GET /api/ab-tests/history?page=1&limit=10&status=COMPLETED&dateFrom=2023-09-01&dateTo=2023-09-16
```

#### 7.2 获取特定测试的历史数据

- **URL**: `/api/ab-tests/{id}/history`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定A/B测试的历史数据

**查询参数**:
- `page` (可选): 页码，默认为1
- `limit` (可选): 每页数量，默认为10，最大为100
- `dataType` (可选): 数据类型，"all"（默认）、"results"或"assignments"

**请求示例**:
```http
GET /api/ab-tests/test_123/history?page=1&limit=10&dataType=all
```

### 8. 测试导出

#### 8.1 导出单个测试数据

- **URL**: `/api/ab-tests/{id}/export`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 导出指定A/B测试的数据

**查询参数**:
- `format` (可选): 导出格式，"json"（默认）或"csv"
- `includeResults` (可选): 是否包含结果数据，true或false
- `includeAssignments` (可选): 是否包含用户分配数据，true或false
- `includeReport` (可选): 是否包含测试报告，true或false

**请求示例**:
```http
GET /api/ab-tests/test_123/export?format=csv&includeResults=true&includeReport=true
```

#### 8.2 批量导出测试数据

- **URL**: `/api/ab-tests/export`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 批量导出A/B测试数据

**查询参数**:
- `format` (可选): 导出格式，"json"（默认）或"csv"
- `status` (可选): 测试状态，如"DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"
- `testIds` (可选): 测试ID列表，以逗号分隔
- `includeResults` (可选): 是否包含结果数据，true或false
- `includeAssignments` (可选): 是否包含用户分配数据，true或false
- `includeReport` (可选): 是否包含测试报告，true或false

**请求示例**:
```http
GET /api/ab-tests/export?format=csv&status=COMPLETED&includeResults=true&includeReport=true
```

## 类型定义

### ABTest

```typescript
interface ABTest {
  id: string
  name: string
  description: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  startDate?: Date
  endDate?: Date
  targetAudience?: ExtendedTargetAudience
  createdAt: Date
  updatedAt: Date
  variants: ABTestVariant[]
  metrics: ABTestMetric[]
  results: ABTestResult[]
}
```

### ABTestVariant

```typescript
interface ABTestVariant {
  id: string
  testId: string
  name: string
  description: string
  config: Record<string, unknown>
  trafficPercentage: number
  isControl: boolean
  createdAt: Date
}
```

### ABTestMetric

```typescript
interface ABTestMetric {
  id: string
  testId: string
  name: string
  description: string
  type: "ENGAGEMENT" | "RETENTION" | "CONVERSION" | "REVENUE" | "SATISFACTION" | "PERFORMANCE" | "CUSTOM"
  formula?: string
  unit?: string
  isActive: boolean
  createdAt: Date
}
```

### ABTestResult

```typescript
interface ABTestResult {
  id: string
  testId: string
  variantId: string
  metricId: string
  value: number
  change: number
  changePercentage: number
  confidence: number
  significance: boolean
  sampleSize: number
  createdAt: Date
  updatedAt: Date
}
```

### ABTestUserAssignment

```typescript
interface ABTestUserAssignment {
  id: string
  testId: string
  userId: string
  variantId: string
  assignedAt: Date
}
```

### ABTestTemplate

```typescript
interface ABTestTemplate {
  id: string
  name: string
  description: string
  category: string
  variants: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
  targetAudience?: ExtendedTargetAudience
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### ABSegment

```typescript
interface ABSegment {
  id: string
  name: string
  description: string
  criteria: Record<string, unknown>
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### ABSegmentUser

```typescript
interface ABSegmentUser {
  id: string
  segmentId: string
  userId: string
  addedAt: Date
}
```

### ExtendedTargetAudience

```typescript
interface ExtendedTargetAudience {
  userSegments: string[]
  percentage: number
  criteria?: TargetAudienceCriteria
  allocationStrategy?: AllocationStrategy
}
```

### TargetAudienceCriteria

```typescript
interface TargetAudienceCriteria {
  isPremium?: boolean
  minLevel?: number
  maxLevel?: number
  minPoints?: number
  maxPoints?: number
  minStreak?: number
  learningStyle?: {
    primary?: string
  }
  minAccountAgeDays?: number
  maxAccountAgeDays?: number
}
```

### AllocationStrategy

```typescript
interface AllocationStrategy {
  type: 'RANDOM' | 'FEATURE_BASED' | 'COHORT_BASED' | 'HASH_BASED'
  featureRules?: FeatureRule[]
  cohortRules?: CohortRule[]
}
```

### FeatureRule

```typescript
interface FeatureRule {
  feature: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'in'
  value: string | number | boolean | string[] | number[]
  variantId: string
}
```

### CohortRule

```typescript
interface CohortRule {
  conditions: FeatureRule[]
  cohortName: string
}
```

## 使用示例

### 创建A/B测试

```javascript
// 创建一个新的A/B测试
const response = await fetch('/api/gamification/abtesting', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '首页布局测试',
    description: '测试两种不同的首页布局对用户留存率的影响',
    targetAudience: {
      userSegments: ['new_users'],
      percentage: 50,
      criteria: {
        isPremium: false,
        minAccountAgeDays: 7
      }
    },
    variants: [
      {
        name: '控制组',
        description: '当前首页布局',
        config: {},
        trafficPercentage: 50,
        isControl: true
      },
      {
        name: '实验组',
        description: '新的首页布局',
        config: { layout: 'new' },
        trafficPercentage: 50,
        isControl: false
      }
    ],
    metrics: [
      {
        name: '用户留存率',
        description: '7日留存率',
        type: 'RETENTION',
        unit: '%',
        isActive: true
      }
    ]
  })
});

const result = await response.json();
if (result.success) {
  console.log('测试创建成功:', result.data);
} else {
  console.error('测试创建失败:', result.error);
}
```

### 为用户分配测试变体

```javascript
// 为用户分配测试变体
const response = await fetch('/api/gamification/abtesting/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user_123',
    testId: 'test_123'
  })
});

const result = await response.json();
if (result.success) {
  console.log('用户分配成功，变体ID:', result.data.variantId);
} else {
  console.error('用户分配失败:', result.error);
}
```

### 获取测试高级统计数据

```javascript
// 获取测试高级统计数据
const response = await fetch('/api/gamification/abtesting/advanced-stats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    testId: 'test_123',
    timeRange: {
      startDate: '2023-09-01T00:00:00.000Z',
      endDate: '2023-09-16T00:00:00.000Z'
    },
    segments: {
      primarySegment: 'new_users'
    },
    metrics: ['metric_123', 'metric_124'],
    includeUserBreakdown: true
  })
});

const result = await response.json();
if (result.success) {
  console.log('高级统计数据:', result.data);
  // 分析数据
  const insights = result.data.insights;
  insights.summary.forEach(summary => {
    console.log('摘要:', summary);
  });
  
  insights.recommendations.forEach(recommendation => {
    console.log('建议:', recommendation);
  });
} else {
  console.error('获取统计数据失败:', result.error);
}
```

### 导出测试数据

```javascript
// 导出测试数据为CSV格式
const response = await fetch('/api/ab-tests/test_123/export?format=csv&includeResults=true&includeReport=true');

if (response.ok) {
  // 获取CSV文件
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ab-test-test_123-export.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
} else {
  const result = await response.json();
  console.error('导出失败:', result.error);
}
```

## 最佳实践

1. **测试设计**
   - 确保每个测试有明确的目标和假设
   - 使用合适的指标来衡量测试效果
   - 确保测试组和对照组的样本量足够大

2. **用户分配**
   - 避免频繁更改用户的测试分配
   - 考虑用户的账户状态和行为特征
   - 确保分配策略的公平性

3. **数据分析**
   - 等待测试运行足够时间后再分析结果
   - 考虑统计显著性，而不仅仅是平均值差异
   - 综合考虑多个指标，避免单一指标偏差

4. **API使用**
   - 使用适当的错误处理机制
   - 遵循API速率限制
   - 缓存不常变化的数据

## 注意事项

1. **权限控制**
   - 大部分API需要用户认证
   - 某些操作可能需要特定权限

2. **数据限制**
   - 分页查询有最大限制（通常为100）
   - 批量操作有数量限制

3. **性能考虑**
   - 导出大量数据可能需要较长时间
   - 复杂的统计分析可能影响响应时间

4. **版本兼容性**
   - API可能会更新，请关注版本变更
   - 使用版本化的端点（如果可用）