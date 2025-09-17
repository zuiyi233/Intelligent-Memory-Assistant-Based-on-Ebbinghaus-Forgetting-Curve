/**
 * A/B测试API功能测试脚本
 * 
 * 此脚本用于测试新实现的A/B测试API的基本功能
 * 运行方式: node scripts/test-ab-testing-apis.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3400';

// 测试工具函数
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  return {
    status: response.status,
    data,
    ok: response.ok,
  };
};

// 测试结果记录
const testResults = [];

// 记录测试结果
const recordTest = (name, passed, details = '') => {
  const result = {
    name,
    passed,
    details,
    timestamp: new Date().toISOString(),
  };
  testResults.push(result);
  
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
};

// 测试套件
const runTests = async () => {
  console.log('🚀 开始测试A/B测试API...\n');

  // 1. 测试获取所有A/B测试
  try {
    const result = await apiRequest('/api/gamification/abtesting');
    recordTest(
      '获取所有A/B测试',
      result.ok,
      `状态: ${result.status}, 响应: ${JSON.stringify(result.data)}`
    );
  } catch (error) {
    recordTest(
      '获取所有A/B测试',
      false,
      `错误: ${error.message}`
    );
  }

  // 2. 测试创建A/B测试
  try {
    const testData = {
      name: '测试API创建的A/B测试',
      description: '这是一个用于测试API功能的A/B测试',
      targetAudience: {
        userSegments: ['new_users'],
        percentage: 50,
      },
      variants: [
        {
          name: '控制组',
          description: '当前版本',
          config: {},
          trafficPercentage: 50,
          isControl: true,
        },
        {
          name: '实验组',
          description: '新版本',
          config: { layout: 'new' },
          trafficPercentage: 50,
          isControl: false,
        },
      ],
      metrics: [
        {
          name: '点击率',
          description: '用户点击率',
          type: 'ENGAGEMENT',
          unit: '%',
          isActive: true,
        },
      ],
    };
    
    const result = await apiRequest('/api/gamification/abtesting', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
    
    if (result.ok) {
      recordTest(
        '创建A/B测试',
        true,
        `状态: ${result.status}, 测试ID: ${result.data?.data?.id}`
      );
      
      // 保存测试ID用于后续测试
      const testId = result.data?.data?.id;
      
      // 3. 测试用户分配
      if (testId) {
        try {
          const assignmentData = {
            userId: 'test_user_123',
            testId,
          };
          
          const assignmentResult = await apiRequest('/api/gamification/abtesting/assign', {
            method: 'POST',
            body: JSON.stringify(assignmentData),
          });
          
          recordTest(
            '用户分配测试变体',
            assignmentResult.ok,
            `状态: ${assignmentResult.status}, 变体ID: ${assignmentResult.data?.data?.variantId}`
          );
          
          // 4. 测试获取用户分配情况
          try {
            const getAssignmentResult = await apiRequest(
              `/api/gamification/abtesting/assign?userId=test_user_123&testId=${testId}`
            );
            
            recordTest(
              '获取用户测试变体分配',
              getAssignmentResult.ok,
              `状态: ${getAssignmentResult.status}`
            );
          } catch (error) {
            recordTest(
              '获取用户测试变体分配',
              false,
              `错误: ${error.message}`
            );
          }
          
          // 5. 测试应用测试变体配置
          try {
            const applyData = {
              userId: 'test_user_123',
              testId,
            };
            
            const applyResult = await apiRequest('/api/gamification/abtesting/apply', {
              method: 'POST',
              body: JSON.stringify(applyData),
            });
            
            recordTest(
              '应用测试变体配置',
              applyResult.ok,
              `状态: ${applyResult.status}`
            );
          } catch (error) {
            recordTest(
              '应用测试变体配置',
              false,
              `错误: ${error.message}`
            );
          }
          
          // 6. 测试获取测试历史数据
          try {
            const historyResult = await apiRequest(`/api/ab-tests/${testId}/history`);
            
            recordTest(
              '获取测试历史数据',
              historyResult.ok,
              `状态: ${historyResult.status}`
            );
          } catch (error) {
            recordTest(
              '获取测试历史数据',
              false,
              `错误: ${error.message}`
            );
          }
          
          // 7. 测试导出测试数据
          try {
            const exportResult = await apiRequest(`/api/ab-tests/${testId}/export?format=json`);
            
            recordTest(
              '导出测试数据',
              exportResult.ok,
              `状态: ${exportResult.status}`
            );
          } catch (error) {
            recordTest(
              '导出测试数据',
              false,
              `错误: ${error.message}`
            );
          }
        } catch (error) {
          recordTest(
            '用户分配测试变体',
            false,
            `错误: ${error.message}`
          );
        }
      }
    } else {
      recordTest(
        '创建A/B测试',
        false,
        `状态: ${result.status}, 错误: ${JSON.stringify(result.data)}`
      );
    }
  } catch (error) {
    recordTest(
      '创建A/B测试',
      false,
      `错误: ${error.message}`
    );
  }

  // 8. 测试获取所有测试模板
  try {
    const templatesResult = await apiRequest('/api/ab-test-templates');
    
    recordTest(
      '获取所有测试模板',
      templatesResult.ok,
      `状态: ${templatesResult.status}`
    );
  } catch (error) {
    recordTest(
      '获取所有测试模板',
      false,
      `错误: ${error.message}`
    );
  }

  // 9. 测试获取所有用户细分
  try {
    const segmentsResult = await apiRequest('/api/ab-tests/segments');
    
    recordTest(
      '获取所有用户细分',
      segmentsResult.ok,
      `状态: ${segmentsResult.status}`
    );
  } catch (error) {
    recordTest(
      '获取所有用户细分',
      false,
      `错误: ${error.message}`
    );
  }

  // 10. 测试获取历史测试数据
  try {
    const historyResult = await apiRequest('/api/ab-tests/history');
    
    recordTest(
      '获取历史测试数据',
      historyResult.ok,
      `状态: ${historyResult.status}`
    );
  } catch (error) {
    recordTest(
      '获取历史测试数据',
      false,
      `错误: ${error.message}`
    );
  }

  // 输出测试结果摘要
  console.log('\n📊 测试结果摘要:');
  console.log('================');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  
  console.log(`总测试数: ${total}`);
  console.log(`通过: ${passed} (${(passed / total * 100).toFixed(1)}%)`);
  console.log(`失败: ${failed} (${(failed / total * 100).toFixed(1)}%)`);
  
  if (failed > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`- ${r.name}: ${r.details}`);
    });
  }
  
  console.log('\n🏁 测试完成');
};

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});