@echo off
setlocal enabledelayedexpansion

REM FROST-CHAIN Docker Deployment Script for Windows
REM This script automates the Docker deployment process on Windows

echo 🚀 FROST-CHAIN Docker Deployment Script
echo ========================================

REM Function to print colored output (Windows doesn't support colors easily, so we use simple text)
set "info_prefix=[INFO]"
set "success_prefix=[SUCCESS]"
set "warning_prefix=[WARNING]"
set "error_prefix=[ERROR]"

REM Check if Docker is installed and running
echo %info_prefix% Checking Docker installation...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %error_prefix% Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo %error_prefix% Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo %success_prefix% Docker is installed and running

REM Check if docker-compose is available
echo %info_prefix% Checking Docker Compose...

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %error_prefix% Docker Compose is not installed.
    exit /b 1
)

echo %success_prefix% Docker Compose is available

REM Check if required ports are available
echo %info_prefix% Checking port availability...

netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo %warning_prefix% Port 3000 is in use. The frontend might conflict.
)

netstat -an | findstr ":8545" >nul 2>&1
if %errorlevel% equ 0 (
    echo %warning_prefix% Port 8545 is in use. The blockchain node might conflict.
)

echo %success_prefix% Port check completed

REM Handle command line arguments
if "%1"=="help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="logs" goto :show_logs
if "%1"=="stop" goto :stop_services
if "%1"=="restart" goto :restart_services
if "%1"=="status" goto :show_status
if "%1"=="clean" goto :clean_services

REM Main deployment
goto :deploy

:deploy
echo.
echo %info_prefix% Building and starting FROST-CHAIN services...

REM Copy environment file
if exist ".env.docker" (
    copy ".env.docker" ".env" >nul
    echo %success_prefix% Environment configuration loaded
) else (
    echo %warning_prefix% No .env.docker file found, using defaults
)

REM Build and start services
echo %info_prefix% Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo %error_prefix% Failed to build Docker images
    exit /b 1
)

echo %info_prefix% Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo %error_prefix% Failed to start services
    exit /b 1
)

echo %success_prefix% Services started successfully

echo.
echo %info_prefix% Waiting for services to be ready...

REM Wait for blockchain node
echo %info_prefix% Waiting for blockchain node...
set /a counter=0
set /a timeout=120

:wait_blockchain
curl -s http://localhost:8545 >nul 2>&1
if %errorlevel% equ 0 (
    echo %success_prefix% Blockchain node is ready
    goto :wait_frontend
)

timeout /t 2 /nobreak >nul
set /a counter+=2

if %counter% geq %timeout% (
    echo %error_prefix% Timeout waiting for blockchain node
    exit /b 1
)

goto :wait_blockchain

:wait_frontend
REM Wait for frontend
echo %info_prefix% Waiting for frontend...
set /a counter=0

:wait_frontend_loop
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo %success_prefix% Frontend is ready
    goto :show_final_status
)

timeout /t 2 /nobreak >nul
set /a counter+=2

if %counter% geq %timeout% (
    echo %error_prefix% Timeout waiting for frontend
    exit /b 1
)

goto :wait_frontend_loop

:show_final_status
echo.
echo %info_prefix% Deployment Status:
echo.
docker-compose ps
echo.

echo %success_prefix% 🎉 FROST-CHAIN is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo ⛓️  Blockchain RPC: http://localhost:8545
echo.
echo 📖 Setup MetaMask:
echo    - Network: Custom RPC
echo    - RPC URL: http://localhost:8545
echo    - Chain ID: 31337
echo    - Currency: ETH
echo.
echo 🔧 Useful commands:
echo    - View logs: deploy.bat logs
echo    - Stop services: deploy.bat stop
echo    - Restart: deploy.bat restart
echo.
goto :end

:show_help
echo FROST-CHAIN Docker Deployment Script for Windows
echo.
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   help, -h, --help    Show this help message
echo   logs               Show service logs
echo   stop               Stop all services
echo   restart            Restart all services
echo   status             Show service status
echo   clean              Stop and remove all containers
echo.
echo Examples:
echo   %0                 Deploy FROST-CHAIN
echo   %0 logs            View logs
echo   %0 stop            Stop services
echo.
goto :end

:show_logs
docker-compose logs -f
goto :end

:stop_services
echo %info_prefix% Stopping FROST-CHAIN services...
docker-compose down
echo %success_prefix% Services stopped
goto :end

:restart_services
echo %info_prefix% Restarting FROST-CHAIN services...
docker-compose restart
echo %success_prefix% Services restarted
goto :end

:show_status
docker-compose ps
goto :end

:clean_services
echo %info_prefix% Cleaning up FROST-CHAIN deployment...
docker-compose down -v --remove-orphans
echo %success_prefix% Cleanup completed
goto :end

:end
endlocal
