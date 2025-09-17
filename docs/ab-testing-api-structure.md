# A/B测试API结构设计

## 1. RESTful API设计原则

### 1.1 资源导向设计
将A/B测试系统中的各个实体视为资源，使用HTTP方法对这些资源进行操作。

### 1.2 URL结构
- 使用名词复数形式表示资源集合
- 使用层级结构表示资源间的关系
- 使用查询参数进行过滤、排序和分页

### 1.3 HTTP方法使用
- GET：获取资源
- POST：创建资源
- PUT：更新资源（全量更新）
- PATCH：部分更新资源
- DELETE：删除资源

## 2. API路由结构

### 2.1 测试管理
```
GET    /api/ab-tests                 # 获取所有测试列表
POST   /api/ab-tests                 # 创建新测试
GET    /api/ab-tests/{id}            # 获取特定测试详情
PUT    /api/ab-tests/{id}            # 更新测试（全量）
PATCH  /api/ab-tests/{id}            # 部分更新测试
DELETE /api/ab-tests/{id}            # 删除测试

POST   /api/ab-tests/batch           # 批量创建测试
GET    /api/ab-tests/export          # 导出测试数据
```

### 2.2 测试变体管理
```
GET    /api/ab-tests/{id}/variants   # 获取测试的所有变体
POST   /api/ab-tests/{id}/variants   # 为测试添加新变体
GET    /api/ab-tests/{id}/variants/{variantId}  # 获取特定变体详情
PUT    /api/ab-tests/{id}/variants/{variantId}  # 更新变体
DELETE /api/ab-tests/{id}/variants/{variantId}  # 删除变体
```

### 2.3 测试指标管理
```
GET    /api/ab-tests/{id}/metrics    # 获取测试的所有指标
POST   /api/ab-tests/{id}/metrics    # 为测试添加新指标
GET    /api/ab-tests/{id}/metrics/{metricId}   # 获取特定指标详情
PUT    /api/ab-tests/{id}/metrics/{metricId}   # 更新指标
DELETE /api/ab-tests/{id}/metrics/{metricId}   # 删除指标
```

### 2.4 用户分配管理
```
POST   /api/ab-tests/{id}/assignments        # 为用户分配测试变体
GET    /api/ab-tests/{id}/assignments        # 获取测试的所有用户分配
GET    /api/ab-tests/{id}/assignments/{userId} # 获取特定用户的分配情况
DELETE /api/ab-tests/{id}/assignments/{userId} # 取消用户分配

POST   /api/ab-tests/assignments/batch       # 批量分配用户
GET    /api/users/{userId}/ab-tests          # 获取用户参与的所有测试
```

### 2.5 测试结果管理
```
GET    /api/ab-tests/{id}/results           # 获取测试的所有结果
POST   /api/ab-tests/{id}/results           # 记录测试结果
GET    /api/ab-tests/{id}/results/{resultId} # 获取特定结果详情
PUT    /api/ab-tests/{id}/results/{resultId} # 更新结果
DELETE /api/ab-tests/{id}/results/{resultId} # 删除结果
```

### 2.6 测试状态管理
```
POST   /api/ab-tests/{id}/start            # 启动测试
POST   /api/ab-tests/{id}/pause            # 暂停测试
POST   /api/ab-tests/{id}/resume           # 恢复测试
POST   /api/ab-tests/{id}/complete         # 完成测试
POST   /api/ab-tests/{id}/cancel           # 取消测试
```

### 2.7 统计分析
```
GET    /api/ab-tests/{id}/stats            # 获取测试基础统计数据
GET    /api/ab-tests/{id}/stats/advanced   # 获取高级统计分析
GET    /api/ab-tests/{id}/report           # 获取测试报告
```

### 2.8 测试模板管理
```
GET    /api/ab-test-templates              # 获取所有测试模板
POST   /api/ab-test-templates              # 创建新测试模板
GET    /api/ab-test-templates/{id}         # 获取特定模板详情
PUT    /api/ab-test-templates/{id}         # 更新模板
DELETE /api/ab-test-templates/{id}         # 删除模板
POST   /api/ab-test-templates/{id}/use     # 使用模板创建测试
```

### 2.9 用户细分管理
```
GET    /api/ab-tests/segments              # 获取所有用户细分
POST   /api/ab-tests/segments              # 创建新用户细分
GET    /api/ab-tests/segments/{id}         # 获取特定细分详情
PUT    /api/ab-tests/segments/{id}         # 更新细分
DELETE /api/ab-tests/segments/{id}         # 删除细分

GET    /api/ab-tests/segments/{id}/users   # 获取细分中的用户
POST   /api/ab-tests/segments/{id}/users   # 向细分添加用户
DELETE /api/ab-tests/segments/{id}/users/{userId} # 从细分中移除用户
```

### 2.10 历史数据查询
```
GET    /api/ab-tests/history               # 获取历史测试数据
GET    /api/ab-tests/{id}/history          # 获取特定测试的历史数据
GET    /api/ab-tests/{id}/results/history  # 获取测试结果历史
```

## 3. 响应格式标准化

### 3.1 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

### 3.2 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2023-01-01T00:00:00Z"
}
```

### 3.3 分页响应
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
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## 4. 查询参数标准化

### 4.1 分页参数
- `page`: 页码（从1开始）
- `limit`: 每页数量

### 4.2 过滤参数
- `status`: 状态过滤
- `startDate`: 开始日期
- `endDate`: 结束日期
- `createdBy`: 创建者

### 4.3 排序参数
- `sortBy`: 排序字段
- `sortOrder`: 排序方向（asc/desc）

### 4.4 搜索参数
- `query`: 搜索关键词
- `fields`: 搜索字段