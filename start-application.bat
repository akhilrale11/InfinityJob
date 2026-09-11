@echo off
title InfinityJob Career Accelerator Platform Launcher
color 0B

echo ===================================================================
echo             INFINITYJOB EDTECH CAREER ACCELERATOR
echo ===================================================================
echo.
echo [1/2] Launching Spring Boot Backend API on port 8080...
start "InfinityJob Backend API (Port 8080)" cmd /k "cd backend && mvn spring-boot:run"

echo [2/2] Launching React + Vite Frontend on port 5173...
start "InfinityJob Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================================
echo  Both services are starting!
echo.
echo  - Frontend Web App:  http://localhost:5173
echo  - Backend API:       http://localhost:8080/api/students
echo  - H2 Console:        http://localhost:8080/h2-console
echo.
echo  Demo Accounts:
echo    * Student Portal:  student / student123
echo    * Admin Portal:    admin   / admin123
echo ===================================================================
echo.

timeout /t 6 >nul
start http://localhost:5173

echo InfinityJob opened in your default browser.
pause
