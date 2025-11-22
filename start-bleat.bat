@echo off
REM Bleat Child Security System - Full Stack Startup
REM This batch script starts both backend and frontend in separate terminals

setlocal enabledelayedexpansion

echo ==========================================
echo Bleat Child Security System
echo Full Stack Startup
echo ==========================================
echo.

REM Get the project root directory
cd /d "%~dp0"

set BACKEND_PATH=Bleat_ChildSecuritySystem\Backend
set FRONTEND_PATH=Bleat_ChildSecuritySystem\Frontend\bleatf

echo Starting Backend (Spring Boot on port 8081)...
cd /d "%BACKEND_PATH%"
start "Bleat Backend" cmd /k "mvn clean spring-boot:run"
cd /d "%~dp0"
timeout /t 3 /nobreak

echo Starting Frontend (Next.js on port 3000)...
cd /d "%FRONTEND_PATH%"
start "Bleat Frontend" cmd /k "npm run dev"
cd /d "%~dp0"
timeout /t 2 /nobreak

echo.
echo ==========================================
echo System Startup Complete!
echo ==========================================
echo.
echo Backend:  http://localhost:8081/bleat
echo Frontend: http://localhost:3000
echo.
echo Windows opened in background terminals.
echo.
pause
