<#
start-dev.ps1

Opens two PowerShell windows: backend (Postgres) and frontend (Next dev).
Usage: from repo root run: `powershell -ExecutionPolicy Bypass -File .\start-dev.ps1`

This script sets required env vars and launches two windows so the servers remain running.
#>

param(
    [string]$DbHost = 'localhost',
    [int]$DbPort = 5432,
    [string]$DbName = 'bleat2',
    [string]$DbUser = 'bleat2',
    [string]$DbPass = 'bleat_pass'
)

Set-StrictMode -Version Latest

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repo 'Backend'
$frontendDir = Join-Path $repo 'Frontend\bleatf'

$jdbc = "jdbc:postgresql://$DbHost:$DbPort/$DbName"

Write-Host "Launcher: backend=$backendDir frontend=$frontendDir db=$jdbc"

# Backend command (runs jar, builds if needed)
$backendCommand = @(
    "Set-Location -LiteralPath '$backendDir'",
    "if (-not (Test-Path 'target\\bleat-backend-1.0.0.jar')) { mvn -DskipTests package }",
    "`$env:DB_USE_H2='false'",
    "`$env:DB_VENDOR='postgres'",
    "`$env:DB_URL='$jdbc'",
    "`$env:DB_USER='$DbUser'",
    "`$env:DB_PASS='$DbPass'",
    "`$env:SPRING_DATASOURCE_URL='$jdbc'",
    "`$env:SPRING_DATASOURCE_USERNAME='$DbUser'",
    "`$env:SPRING_DATASOURCE_PASSWORD='$DbPass'",
    "java -jar target\\bleat-backend-1.0.0.jar"
 ) -join '; '

# Frontend command
$frontendCommand = @(
    "Set-Location -LiteralPath '$frontendDir'",
    "`$env:NEXT_PUBLIC_API_URL='http://localhost:8081/bleat/api'",
    "if (-not (Test-Path node_modules)) { npm install }",
    "npm run dev"
) -join '; '

Write-Host 'Starting backend window...'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$backendCommand

Start-Sleep -Milliseconds 500

Write-Host 'Starting frontend window...'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$frontendCommand

Write-Host 'Launched backend and frontend windows.'
