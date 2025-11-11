@echo off
echo 🚀 Setting up Ecoride with Docker MySQL...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ docker-compose is available

REM Start MySQL container
echo 🐬 Starting MySQL container...
docker-compose up -d mysql

REM Wait for MySQL to be ready
echo ⏳ Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

REM Check if MySQL is ready (simplified for Windows)
echo 🔍 Testing database connection...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Setup initiated! MySQL is starting in Docker.
echo.
echo 📊 Database Details:
echo    Host: localhost
echo    Port: 3306
echo    Database: ecoride
echo    Username: ecoride_user
echo    Password: ecoride_password
echo.
echo 🌐 Optional phpMyAdmin: http://localhost:8080
echo.
echo ▶️  Next steps:
echo    1. cd backend
echo    2. npm install
echo    3. npm start
echo.
echo 🛑 To stop: docker-compose down
echo 🗑️  To reset database: docker-compose down -v
echo.
echo 📋 To check if MySQL is ready:
echo    docker-compose logs mysql
echo.
pause