@echo off
REM Fixed startup script with absolute paths

set BACKEND="C:\Users\USR\OneDrive\Documents\Bleat_ChildSecuritySystem[1]\Bleat_ChildSecuritySystem\Backend"
set FRONTEND="C:\Users\USR\OneDrive\Documents\Bleat_ChildSecuritySystem[1]\Bleat_ChildSecuritySystem\Frontend\bleatf"

echo Starting Bleat Backend and Frontend...

echo Starting Backend (Spring Boot on port 8081)...
cd /d %BACKEND%
start "Bleat Backend" cmd /k "mvn -DskipTests spring-boot:run"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting Frontend (Next.js on port 3000)...
cd /d %FRONTEND%
start "Bleat Frontend" cmd /k "npm install && npm run dev"

echo Startup commands dispatched. Check the opened windows for logs.
echo Backend:  http://localhost:8081/bleat
echo Frontend: http://localhost:3000
echo.
pause
