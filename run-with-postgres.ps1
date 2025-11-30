<#
run-with-postgres.ps1

Usage:
  From repo root run:
    powershell -ExecutionPolicy Bypass -File .\run-with-postgres.ps1 -Host localhost -Port 5432 -Db bleat -User bleat -Password bleat_pass

This script sets env vars used by `DBHandler` and starts the backend via Maven.
#>

param(
    [Alias('Host')][string]$DbHost = 'localhost',
    [int]$Port = 5432,
    [string]$Db = 'bleat',
    [string]$User = 'bleat',
    [string]$Password = 'bleat_pass',
    [switch]$NoRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot 'Backend'

function Write-Log([string]$m) { Write-Host "[run-with-postgres] $m" }

if (-not (Test-Path $backendDir)) {
    Write-Log "Backend folder not found at $backendDir"
    exit 2
}

# Compose JDBC URL (build explicitly to avoid interpolation parsing issues)
$jdbc = 'jdbc:postgresql://' + $DbHost + ':' + $Port + '/' + $Db

# Export env vars for this process
$env:DB_USE_H2 = 'false'
$env:DB_VENDOR = 'postgres'
$env:DB_URL = $jdbc
$env:DB_USER = $User
$env:DB_PASS = $Password

# Also export Spring Boot datasource properties so Spring's auto-config uses Postgres
# This ensures Flyway and Spring Data use the external Postgres instead of embedded H2.
$env:SPRING_DATASOURCE_URL = $jdbc
$env:SPRING_DATASOURCE_USERNAME = $User
$env:SPRING_DATASOURCE_PASSWORD = $Password
# Optional: prevent Hibernate from trying to auto-create schemas in production-like DB
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'none'

Write-Log "DB env vars set: DB_URL=$jdbc DB_USER=$User"

if ($NoRun) {
    Write-Log "NoRun specified - skipping mvn. You can start backend manually in $backendDir"
    exit 0
}

# Ensure mvn exists
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Log "Maven (mvn) not found in PATH. Install Maven or run the backend manually from $backendDir"
    exit 3
}

# Start backend
Set-Location -LiteralPath $backendDir
Write-Log "Starting backend with Maven (shows logs in this console). Ctrl+C to stop."
& mvn -DskipTests spring-boot:run
