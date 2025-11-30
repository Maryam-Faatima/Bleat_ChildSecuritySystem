<#
start-postgres-and-backend.ps1

This script will:
- Try to ensure Docker Desktop is running (starts it if found)
- Wait for the Docker daemon to become available
- Run `docker compose up -d` using the repo's docker-compose.yml
- Start the backend with Maven (`mvn -DskipTests spring-boot:run`) from `Backend` folder

Usage (run from repo root):
    powershell -ExecutionPolicy Bypass -File .\start-postgres-and-backend.ps1

You can pass -NoBackend to only start Docker/Postgres.
#>

param(
    [switch]$NoBackend
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerComposeFile = Join-Path $repoRoot 'docker-compose.yml'
$dockerDesktopPaths = @("C:\Program Files\Docker\Docker\Docker Desktop.exe", "C:\Program Files\Docker\Docker\DockerDesktop.exe")

function Write-Log($msg) { Write-Host "[start-script] $msg" }

if (-not (Test-Path $dockerComposeFile)) {
    # fallback: check current working directory and parent directory
    $fallback = Join-Path (Get-Location) 'docker-compose.yml'
    if (Test-Path $fallback) {
        Write-Log "docker-compose.yml not found at script location; using $fallback"
        $dockerComposeFile = $fallback
    } else {
        $parent = Join-Path (Split-Path $repoRoot -Parent) 'docker-compose.yml'
        if (Test-Path $parent) {
            Write-Log "docker-compose.yml found in parent directory: $parent"
            $dockerComposeFile = $parent
        } else {
            # last resort: search recursively under repo root for any docker-compose.yml
            Write-Log "docker-compose.yml not found in expected locations; searching repo for docker-compose.yml..."
            try {
                $matches = Get-ChildItem -Path $repoRoot -Filter 'docker-compose.yml' -Recurse -Force -ErrorAction SilentlyContinue | Select-Object -First 1
            } catch {
                $matches = $null
            }
            if ($matches) {
                $dockerComposeFile = $matches.FullName
                Write-Log "Found docker-compose.yml at: $dockerComposeFile"
            } else {
                Write-Log "ERROR: docker-compose.yml not found at $dockerComposeFile nor $fallback nor $parent"
                Write-Log "Repo root listing (top-level):"
                Get-ChildItem -Path $repoRoot -Force | ForEach-Object { Write-Log $_.Name }
                exit 2
            }
        }
    }
}

# Check docker command
function Test-Docker {
    try {
        docker info > $null 2>&1
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Docker)) {
    Write-Log "Docker daemon unreachable. Attempting to start Docker Desktop..."
    $found = $false
    foreach ($p in $dockerDesktopPaths) {
        if (Test-Path $p) {
            Write-Log "Found Docker Desktop at: $p -- starting it"
            Start-Process -FilePath $p -WindowStyle Hidden
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Log "Docker Desktop executable not found in standard locations. Please start Docker Desktop manually and re-run this script."
        exit 3
    }

    # wait up to 120 seconds for docker to become ready
    $tries = 0
    while ($tries -lt 24) {
        Start-Sleep -Seconds 5
        if (Test-Docker) { break }
        $tries++
        Write-Log "Waiting for Docker daemon... ($($tries*5)s)"
    }
    if (-not (Test-Docker)) {
        Write-Log "Timed out waiting for Docker daemon. Please open Docker Desktop and wait until it reports 'Docker is running'."
        exit 4
    }
    Write-Log "Docker daemon is ready."
} else {
    Write-Log "Docker daemon is already available."
}

# Run docker compose up -d
Write-Log "Running: docker compose -f `"$dockerComposeFile`" up -d"
& docker compose -f $dockerComposeFile up -d
if ($LASTEXITCODE -ne 0) {
    Write-Log "docker compose failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Log "Docker Compose completed. Containers status:"
& docker compose -f $dockerComposeFile ps

if ($NoBackend) {
    Write-Log "Skipping backend start because -NoBackend was specified."
    exit 0
}

# Start backend with mvn
$backendDir = Join-Path $repoRoot 'Backend'
if (-not (Test-Path $backendDir)) {
    Write-Log "ERROR: Backend directory not found at $backendDir"
    exit 5
}

# Ensure mvn is available
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Log "Maven (mvn) not found in PATH. Please install Maven or run the backend manually from the Backend folder."
    exit 6
}

Write-Log "Starting backend: mvn -DskipTests spring-boot:run (working dir: $backendDir)"
Set-Location -LiteralPath $backendDir
# Run Maven in the current console so user sees logs; user can Ctrl+C to stop
& mvn -DskipTests spring-boot:run

# End of script
