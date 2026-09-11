# InfinityJob PowerShell Launcher
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "          INFINITYJOB EDTECH CAREER ACCELERATOR PLATFORM" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = $PSScriptRoot

Write-Host "[1/2] Starting Spring Boot Backend API (Port 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\backend'; Write-Host 'Starting InfinityJob Backend...'; mvn spring-boot:run"

Write-Host "[2/2] Starting React + Vite Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\frontend'; Write-Host 'Starting InfinityJob Frontend...'; npm run dev"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host " InfinityJob services initiated!" -ForegroundColor White
Write-Host "  - Frontend Web App:  http://localhost:5173" -ForegroundColor Yellow
Write-Host "  - Backend REST API:  http://localhost:8080/api/courses" -ForegroundColor Yellow
Write-Host "  - H2 DB Console:     http://localhost:8080/h2-console" -ForegroundColor Yellow
Write-Host ""
Write-Host " Demo Logins:" -ForegroundColor White
Write-Host "   * Student Portal:   student / student123" -ForegroundColor Green
Write-Host "   * Admin Portal:     admin   / admin123" -ForegroundColor Magenta
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"
Write-Host "Opened InfinityJob in your default web browser." -ForegroundColor Green
