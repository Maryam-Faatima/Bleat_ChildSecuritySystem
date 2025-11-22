# Test end-to-end signup -> admin approve -> login flow

$baseUrl = "http://localhost:8081/bleat/api"

Write-Host "===== TEST: Signup Flow =====" -ForegroundColor Green

# 1. Signup a new parent
$signupData = @{
    name       = "TestParent_$(Get-Random)"
    password   = "TestPassword123"
    phoneNumber = "1234567890"
    role       = "PARENT"
} | ConvertTo-Json

Write-Host "1. Signing up new parent..."
$signupResp = Invoke-WebRequest -Uri "$baseUrl/auth/signup" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $signupData `
    -UseBasicParsing

$signupResult = $signupResp.Content | ConvertFrom-Json
Write-Host "   Signup Response: $($signupResult | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
$testName = ($signupData | ConvertFrom-Json).name
$testPassword = ($signupData | ConvertFrom-Json).password
$testUserId = $signupResult.userId

Write-Host "`n===== TEST: Get Pending Users (Admin) =====" -ForegroundColor Green

# 2. Get pending users
Write-Host "2. Fetching pending users (admin dashboard)..."
$pendingResp = Invoke-WebRequest -Uri "$baseUrl/admin/users/pending" `
    -Method GET `
    -Headers @{"Content-Type" = "application/json"} `
    -UseBasicParsing

$pendingList = $pendingResp.Content | ConvertFrom-Json
Write-Host "   Pending Users: $($pendingList | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow

Write-Host "`n===== TEST: Admin Approves User =====" -ForegroundColor Green

# 3. Admin approves the user
$authenticateData = @{
    approve = $true
    reason  = "Test approval"
} | ConvertTo-Json

Write-Host "3. Admin approving user (ID: $testUserId)..."
$authResp = Invoke-WebRequest -Uri "$baseUrl/admin/users/$testUserId/authenticate" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $authenticateData `
    -UseBasicParsing

$authResult = $authResp.Content | ConvertFrom-Json
Write-Host "   Authenticate Response: $($authResult | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow

Write-Host "`n===== TEST: Login with Approved Credentials =====" -ForegroundColor Green

# 4. Login with the newly approved user
$loginData = @{
    name     = $testName
    password = $testPassword
} | ConvertTo-Json

Write-Host "4. Logging in with name=$testName and password=$testPassword..."
$loginResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginData `
    -UseBasicParsing

$loginResult = $loginResp.Content | ConvertFrom-Json
Write-Host "   Login Response: $($loginResult | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow

if ($loginResult.success) {
    Write-Host "`nSUCCESS! End-to-end flow completed." -ForegroundColor Green
    Write-Host "   User logged in as: $($loginResult.name) (ID: $($loginResult.userId))"
} else {
    Write-Host "`nFAILED! Login unsuccessful." -ForegroundColor Red
    Write-Host "   Message: $($loginResult.message)"
}
