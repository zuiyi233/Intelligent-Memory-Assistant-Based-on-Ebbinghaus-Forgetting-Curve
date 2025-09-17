// 测试环境变量加载
require('dotenv').config();

console.log('环境变量测试:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '已设置' : '未设置');

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL 值:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
}

if (process.env.PGPASSWORD) {
  console.log('PGPASSWORD 值:', '***');
}