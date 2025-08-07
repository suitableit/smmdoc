# Test API endpoints
Write-Host "Testing Cancel Request APIs..." -ForegroundColor Green

try {
    Write-Host "\n1. Testing Admin Cancel Requests API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/cancel-requests" -Method GET -ContentType "application/json"
    Write-Host "✅ Admin API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Admin API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

try {
    Write-Host "\n2. Testing Health API..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "✅ Health API Response:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json
} catch {
    Write-Host "❌ Health API Error: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Write-Host "\n3. Testing Cancel Request Creation (expect 401)..." -ForegroundColor Yellow
    $body = @{
        reason = "Test cancel request with minimum 10 characters"
    } | ConvertTo-Json
    
    $cancelResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/user/orders/1/cancel-request" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Cancel Request Response:" -ForegroundColor Green
    $cancelResponse | ConvertTo-Json
} catch {
    Write-Host "Expected Auth Error: $($_.Exception.Message)" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "\nAPI Test Complete!" -ForegroundColor Green