<#
start-frontend.ps1

This script will:
- Verify Node/npm exist
- Change into the frontend folder `Frontend\bleatf`
- Run `npm install --no-audit --no-fund` if node_modules is missing
- Start the Next.js dev server with `npm run dev`

Usage (from repo root):
    powershell -ExecutionPolicy Bypass -File .\start-frontend.ps1

#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $repoRoot 'Frontend\bleatf'

function Write-Log($m) { Write-Host "[start-frontend] $m" }

if (-not (Test-Path $frontendDir)) {
    Write-Log "ERROR: frontend folder not found at $frontendDir"
    exit 2
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Log "Node is not installed or not on PATH. Please install Node.js (recommended 18+)."
    exit 3
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Log "npm is not installed or not on PATH. Please install Node.js (npm comes with it)."
    exit 3
}

Set-Location -LiteralPath $frontendDir
Write-Log "Working directory: $frontendDir"

if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
    Write-Log "node_modules not found — running npm install"
    npm install --no-audit --no-fund
} else {
    Write-Log "node_modules exists — skipping npm install"
}

Write-Log "Starting Next.js dev server (npm run dev). The server will be available at http://localhost:3000"
Write-Log "Press Ctrl+C to stop the server."

# Start dev server in this console so the user sees logs
npm run dev
