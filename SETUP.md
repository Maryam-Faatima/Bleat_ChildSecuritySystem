# Bleat Child Security System - Full Stack Setup

This document explains how to run both the backend and frontend simultaneously.

## Prerequisites

- **Java 17+** (for backend)
- **Maven** (for backend)
- **Node.js 18+** (for frontend)
- **npm** (comes with Node.js)

## Project Structure

```
Bleat_ChildSecuritySystem/
├── Backend/              (Java/Spring Boot)
│   ├── src/main/java/
│   ├── pom.xml
│   └── ...
├── Frontend/bleatf/      (Next.js/React)
│   ├── app/
│   ├── lib/
│   ├── package.json
│   └── .env.local
├── start-bleat.bat       (Windows batch starter)
├── start-bleat.ps1       (PowerShell starter)
└── README.md
```

## Quick Start (Windows)

### Option 1: Using Batch Script (Easiest)

```cmd
Double-click: start-bleat.bat
```

This will:
1. Start the Backend server on http://localhost:8081/bleat
2. Start the Frontend server on http://localhost:3000
3. Open both in separate terminal windows

### Option 2: Using PowerShell Script

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-bleat.ps1
```

### Option 3: Manual Startup (in separate terminals)

**Terminal 1 - Backend:**
```powershell
Push-Location -LiteralPath 'C:\Users\USR\OneDrive\Documents\Bleat_ChildSecuritySystem[1]\Bleat_ChildSecuritySystem\Backend'
mvn clean spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd 'C:\Users\USR\OneDrive\Documents\Bleat_ChildSecuritySystem[1]\Bleat_ChildSecuritySystem\Frontend\bleatf'
npm run dev
```

## Access the Application

- **Frontend Web App:** http://localhost:3000
- **Backend API:** http://localhost:8081/bleat/api
- **API Health Check:** http://localhost:8081/bleat/api/auth/login (POST)

## Available API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register new user

### Parent Dashboard
- `GET /api/parent/children/{parentId}` - Get all children
- `POST /api/parent/{parentId}/add-child` - Add a new child
- `GET /api/parent/{parentId}/child/{childId}/location` - Get child location
- `POST /api/parent/{parentId}/child/{childId}/message` - Send message to child
- `POST /api/parent/{parentId}/child/{childId}/sos` - Trigger SOS alert

## Frontend Configuration

The frontend API URL is configured in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/bleat/api
```

If you need to change the backend URL, edit this file and restart the frontend.

## Backend Configuration

The backend server configuration is in `Backend/src/main/resources/application.properties`:

```properties
server.port=8081
server.servlet.context-path=/bleat
```

## Troubleshooting

### Port Already in Use

If you get "Port 8081 already in use" or "Port 3000 already in use":

**For Windows:**
```powershell
# Find what's using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Backend Compilation Error

Make sure you're in the correct directory:
```powershell
Push-Location -LiteralPath 'C:\Users\USR\OneDrive\Documents\Bleat_ChildSecuritySystem[1]\Bleat_ChildSecuritySystem\Backend'
```

### Frontend Module Not Found

Install dependencies:
```powershell
cd Frontend\bleatf
npm install
```

## Development Tips

### Hot Reload
- **Backend:** Changes to controller files will auto-reload (DevTools enabled)
- **Frontend:** Changes to React components will hot-reload automatically

### Viewing Logs
- Backend logs appear in the terminal running `mvn spring-boot:run`
- Frontend logs appear in the terminal running `npm run dev`

### API Testing

Use a tool like **Postman** or **Thunder Client** to test APIs:

**Example Login Request:**
```
POST http://localhost:8081/bleat/api/auth/login
Content-Type: application/json

{
  "userId": 1,
  "password": "pass1234"
}
```

## Stopping the Services

### Using Batch Script
Close the terminal windows opened by the script, or press Ctrl+C in each window.

### Using PowerShell
```powershell
# Get all running jobs
Get-Job

# Stop a specific job
Stop-Job -Id <job_id>

# Stop all jobs
Get-Job | Stop-Job
```

### Manual
- Press Ctrl+C in each terminal running the services

## Next Steps

1. ✅ Backend running on http://localhost:8081/bleat
2. ✅ Frontend running on http://localhost:3000
3. 📝 Update frontend components to use real API data
4. 🗄️ Connect backend to SQL Server database
5. 📊 Add more API endpoints for alerts, reports, etc.

## Support

For issues or questions, check the logs in the respective terminals or refer to the project documentation.
