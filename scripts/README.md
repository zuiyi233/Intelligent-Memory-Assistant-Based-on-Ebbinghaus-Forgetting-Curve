# A/B测试API测试脚本

## 概述

本目录包含用于测试A/B测试API功能的脚本。这些脚本可以帮助验证新实现的API是否正常工作，并提供测试结果的详细报告。

## 文件说明

- `test-ab-testing-apis.js` - 主要的API测试脚本，包含各种API端点的测试用例
- `README.md` - 本文件，提供测试脚本的使用说明

## 运行测试

### 前提条件

- 确保你的开发服务器正在运行（通常在端口3400）
- 如果你使用不同的端口，可以通过环境变量`BASE_URL`指定

### 运行方式

1. 使用默认端口（3400）运行测试：
   ```bash
   node scripts/test-ab-testing-apis.js
   ```

2. 使用自定义端口运行测试：
   ```bash
   BASE_URL=http://localhost:3000 node scripts/test-ab-testing-apis.js
   ```

## 测试内容

测试脚本包含以下测试用例：

1. **获取所有A/B测试** - 验证`GET /api/gamification/abtesting`端点
2. **创建A/B测试** - 验证`POST /api/gamification/abtesting`端点
3. **用户分配测试变体** - 验证`POST /api/gamification/abtesting/assign`端点
4. **获取用户测试变体分配** - 验证`GET /api/gamification/abtesting/assign`端点
5. **应用测试变体配置** - 验证`POST /api/gamification/abtesting/apply`端点
6. **获取测试历史数据** - 验证`GET /api/ab-tests/{id}/history`端点
7. **导出测试数据** - 验证`GET /api/ab-tests/{id}/export`端点
8. **获取所有测试模板** - 验证`GET /api/ab-test-templates`端点
9. **获取所有用户细分** - 验证`GET /api/ab-tests/segments`端点
10. **获取历史测试数据** - 验证`GET /api/ab-tests/history`端点

## 测试结果

测试运行后，你将看到类似以下的输出：

```
🚀 开始测试A/B测试API...

✅ 获取所有A/B测试
   状态: 200, 响�应: {"success":true,"data":[...],"timestamp":"..."}
✅ 创建A/B测试
   状态: 201, 测试ID: test_123
✅ 用户分配测试变体
   状态: 200, 变体ID: variant_123
...
❌ 获取用户测试变体分配
   错误: Cannot read properties of undefined (reading 'data')

📊 测试结果摘要:
================
总测试数: 10
通过: 8 (80.0%)
失败: 2 (20.0%)

❌ 失败的测试:
- 获取用户测试变体分配: 错误: Cannot read properties of undefined (reading 'data')

🏁 测试完成
```

## 故障排除

如果测试失败，请检查以下事项：

1. **服务器是否运行** - 确保开发服务器正在运行
2. **端口是否正确** - 确认使用的端口与服务器运行的端口匹配
3. **API端点是否实现** - 确认所有测试的API端点已经实现
4. **数据库连接** - 确认数据库连接正常，特别是对于涉及数据操作的测试
5. **认证问题** - 某些API可能需要认证，测试脚本目前没有处理认证

## 扩展测试

你可以通过修改`test-ab-testing-apis.js`文件来添加更多的测试用例或修改现有的测试逻辑。

### 添加新的测试用例

1. 在`runTests`函数中添加新的测试块
2. 使用`apiRequest`函数调用API端点
3. 使用`recordTest`函数记录测试结果

示例：
```javascript
// 测试新的API端点
try {
  const result = await apiRequest('/api/new-endpoint', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' }),
  });
  
  recordTest(
    '测试新端点',
    result.ok,
    `状态: ${result.status}`
  );
} catch (error) {
  recordTest(
    '测试新端点',
    false,
    `错误: ${error.message}`
  );
}
```

## 注意事项

- 测试脚本会创建测试数据，但不会自动清理
- 在生产环境中运行测试脚本可能会影响实际数据
- 某些API可能需要特定的权限或认证，测试脚本目前没有处理这些情况

## 反馈

如果你发现任何问题或有改进建议，请提交issue或pull request。