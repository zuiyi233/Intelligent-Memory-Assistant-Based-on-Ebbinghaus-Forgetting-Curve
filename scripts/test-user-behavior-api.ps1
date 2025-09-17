# 用户行为分析API测试脚本
# 用于测试用户行为分析相关的API路由功能

Write-Host "🚀 开始运行用户行为分析API测试..." -ForegroundColor Green

# 检查node是否安装
try {
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Node.js未安装，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查测试脚本是否存在
$testScriptPath = Join-Path $PSScriptRoot "test-user-behavior-api.js"
if (-not (Test-Path $testScriptPath)) {
    Write-Host "❌ 测试脚本不存在: $testScriptPath" -ForegroundColor Red
    exit 1
}

# 运行测试
try {
    Push-Location $PSScriptRoot
    node test-user-behavior-api.js
    $exitCode = $LASTEXITCODE
    Pop-Location

    if ($exitCode -eq 0) {
        Write-Host "`n✅ 测试完成" -ForegroundColor Green
    } else {
        Write-Host "`n❌ 测试失败，退出代码: $exitCode" -ForegroundColor Red
        exit $exitCode
    }
} catch {
    Write-Host "`n❌ 运行测试时出错: $_" -ForegroundColor Red
    exit 1
}