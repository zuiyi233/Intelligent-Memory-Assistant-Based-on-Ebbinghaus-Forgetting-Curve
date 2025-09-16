# PowerShell script to set environment variables and test database connection
Write-Host "Setting up environment for database connection..." -ForegroundColor Green

# Set PGPASSWORD environment variable for the current session
$env:PGPASSWORD = "123456"
Write-Host "PGPASSWORD environment variable set to: 123456" -ForegroundColor Yellow

# Check if .env file exists and update it if needed
$envFilePath = ".\.env"
if (Test-Path $envFilePath) {
    $envContent = Get-Content $envFilePath
    $databaseUrlLine = $envContent | Where-Object { $_ -match "DATABASE_URL" }
    
    if ($databaseUrlLine) {
        Write-Host "Found DATABASE_URL in .env file: $databaseUrlLine" -ForegroundColor Yellow
    } else {
        Write-Host "DATABASE_URL not found in .env file. Adding it..." -ForegroundColor Yellow
        Add-Content -Path $envFilePath -Value "DATABASE_URL=`"postgresql://postgres:123456@localhost:4090/memory_assistant`""
    }
} else {
    Write-Host ".env file not found. Creating one with DATABASE_URL..." -ForegroundColor Yellow
    Set-Content -Path $envFilePath -Value "DATABASE_URL=`"postgresql://postgres:123456@localhost:4090/memory_assistant`""
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Green
try {
    npx prisma generate
    Write-Host "Prisma client generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to generate Prisma client. Please ensure Prisma is installed." -ForegroundColor Red
    exit 1
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Green
try {
    # Run the JavaScript test script
    node scripts/test-db-connection.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection test passed!" -ForegroundColor Green
    } else {
        Write-Host "Database connection test failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above and ensure:" -ForegroundColor Red
        Write-Host "1. PostgreSQL server is running on localhost:4090" -ForegroundColor Red
        Write-Host "2. The database 'memory_assistant' exists" -ForegroundColor Red
        Write-Host "3. Your username and password are correct" -ForegroundColor Red
        Write-Host "4. Try running 'npx prisma generate' to regenerate the Prisma client" -ForegroundColor Red
    }
} catch {
    Write-Host "Error running database test: $_" -ForegroundColor Red
}

Write-Host "Setup complete!" -ForegroundColor Green