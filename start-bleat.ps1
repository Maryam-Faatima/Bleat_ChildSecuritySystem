# Bleat System - Full Stack Startup Script
# This script starts both the backend (Java/Spring Boot) and frontend (Next.js) simultaneously

param(
    [switch]$Backend = $false,
    [switch]$Frontend = $false,
    [switch]$Both = $true
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "Bleat_ChildSecuritySystem\Backend"
$frontendPath = Join-Path $projectRoot "Bleat_ChildSecuritySystem\Frontend\bleatf"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Bleat Child Security System" -ForegroundColor Cyan
Write-Host "Full Stack Startup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend if requested
if ($Both -or $Backend) {
    Write-Host "Starting Backend (Java/Spring Boot on port 8081)..." -ForegroundColor Green
    $backendJob = Start-Job -ScriptBlock {
        param($backendPath)
        Push-Location -LiteralPath $backendPath
        Write-Host "Backend directory: $backendPath" -ForegroundColor Gray
        & mvn clean spring-boot:run 2>&1
    } -ArgumentList $backendPath
    Write-Host "Backend job ID: $($backendJob.Id)" -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

# Start Frontend if requested
if ($Both -or $Frontend) {
    Write-Host "Starting Frontend (Next.js on port 3000)..." -ForegroundColor Green
    $frontendJob = Start-Job -ScriptBlock {
        param($frontendPath)
        Push-Location -LiteralPath $frontendPath
        Write-Host "Frontend directory: $frontendPath" -ForegroundColor Gray
        & npm run dev 2>&1
    } -ArgumentList $frontendPath
    Write-Host "Frontend job ID: $($frontendJob.Id)" -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "System Startup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($Both) {
    Write-Host "Backend:  http://localhost:8081/bleat" -ForegroundColor Yellow
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Running background jobs:" -ForegroundColor Cyan
    Get-Job | Format-Table Id, Name, State
    Write-Host ""
    Write-Host "To stop all services, run: Get-Job | Stop-Job" -ForegroundColor Cyan
    Write-Host "To view backend logs, run: Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor Cyan
    Write-Host "To view frontend logs, run: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor Cyan
}
