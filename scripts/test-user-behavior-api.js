const fetch = require('node-fetch');

/**
 * 用户行为分析API测试脚本
 * 用于测试用户行为分析相关的API路由功能
 */

// 测试配置
const API_BASE_URL = 'http://localhost:3400/api/user-behavior';
const TEST_USER_ID = 'test_user_123';
const TEST_SESSION_ID = 'test_session_456';

// 测试用的用户行为事件数据
const testEvent = {
  userId: TEST_USER_ID,
  eventType: 'UI_INTERACTION',
  data: {
    contentType: 'TEXT',
    timeSpent: 30,
    accuracy: 1.0,
    difficulty: 1,
    success: true,
    metadata: {
      action: 'button_click',
      element: 'test_button',
      page: '/test'
    }
  },
  sessionId: TEST_SESSION_ID
};

// 测试用的批量事件数据
const testBatchEvents = [
  {
    userId: TEST_USER_ID,
    eventType: 'REVIEW_COMPLETED',
    data: {
      contentType: 'QUIZ',
      timeSpent: 120,
      accuracy: 0.9,
      difficulty: 3,
      success: true,
      metadata: {
        contentId: 'quiz_123',
        responseTime: 45
      }
    }
  },
  {
    userId: TEST_USER_ID,
    eventType: 'MEMORY_CREATED',
    data: {
      contentType: 'TEXT',
      categoryId: 'test_category',
      difficulty: 2,
      metadata: {
        contentId: 'memory_456'
      }
    }
  }
];

/**
 * 测试记录单个用户行为事件
 */
async function testRecordEvent() {
  console.log('测试记录单个用户行为事件...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 记录单个用户行为事件成功:', result);
      return true;
    } else {
      console.error('❌ 记录单个用户行为事件失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 记录单个用户行为事件出错:', error);
    return false;
  }
}

/**
 * 测试批量记录用户行为事件
 */
async function testBatchRecordEvents() {
  console.log('测试批量记录用户行为事件...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/record`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: testBatchEvents,
        sessionId: TEST_SESSION_ID
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 批量记录用户行为事件成功:', result);
      return true;
    } else {
      console.error('❌ 批量记录用户行为事件失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 批量记录用户行为事件出错:', error);
    return false;
  }
}

/**
 * 测试获取队列状态
 */
async function testGetQueueStatus() {
  console.log('测试获取队列状态...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/record?action=queue-status`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取队列状态成功:', result);
      return true;
    } else {
      console.error('❌ 获取队列状态失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取队列状态出错:', error);
    return false;
  }
}

/**
 * 测试刷新队列
 */
async function testFlushQueue() {
  console.log('测试刷新队列...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/record?action=flush-queue`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 刷新队列成功:', result);
      return true;
    } else {
      console.error('❌ 刷新队列失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 刷新队列出错:', error);
    return false;
  }
}

/**
 * 测试获取用户行为分析
 */
async function testGetUserBehaviorAnalysis() {
  console.log('测试获取用户行为分析...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/analysis?userId=${TEST_USER_ID}&days=7`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取用户行为分析成功:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
      return true;
    } else {
      console.error('❌ 获取用户行为分析失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取用户行为分析出错:', error);
    return false;
  }
}

/**
 * 测试获取用户行为洞察
 */
async function testGetUserBehaviorInsights() {
  console.log('测试获取用户行为洞察...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/insights?userId=${TEST_USER_ID}&days=7&type=predictive`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取用户行为洞察成功:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
      return true;
    } else {
      console.error('❌ 获取用户行为洞察失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取用户行为洞察出错:', error);
    return false;
  }
}

/**
 * 测试获取系统级行为分析
 */
async function testGetSystemBehaviorAnalysis() {
  console.log('测试获取系统级行为分析...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/system?days=7`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取系统级行为分析成功:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
      return true;
    } else {
      console.error('❌ 获取系统级行为分析失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取系统级行为分析出错:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行用户行为分析API测试...\n');
  
  const tests = [
    testRecordEvent,
    testBatchRecordEvents,
    testGetQueueStatus,
    testFlushQueue,
    testGetUserBehaviorAnalysis,
    testGetUserBehaviorInsights,
    testGetSystemBehaviorAnalysis
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
      console.log(''); // 添加空行分隔测试结果
    } catch (error) {
      console.error('❌ 测试出错:', error);
      results.push(false);
      console.log(''); // 添加空行分隔测试结果
    }
  }
  
  const passedTests = results.filter(result => result).length;
  const totalTests = results.length;
  
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️ 部分测试失败，请检查错误信息');
  }
}

// 运行测试
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testRecordEvent,
  testBatchRecordEvents,
  testGetQueueStatus,
  testFlushQueue,
  testGetUserBehaviorAnalysis,
  testGetUserBehaviorInsights,
  testGetSystemBehaviorAnalysis,
  runAllTests
};