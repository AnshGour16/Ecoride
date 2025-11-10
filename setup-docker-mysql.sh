#!/bin/bash

echo "🚀 Setting up Ecoride with Docker MySQL..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed or not in PATH"
    exit 1
fi

echo "✅ docker-compose is available"

# Start MySQL container
echo "🐬 Starting MySQL container..."
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if MySQL is ready
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL is ready!"
        break
    fi
    echo "⏳ Attempt $attempt/$max_attempts: MySQL not ready yet, waiting..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ MySQL failed to start within the expected time"
    echo "📋 Checking MySQL logs:"
    docker-compose logs mysql
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if docker-compose exec -T mysql mysql -u ecoride_user -pecoride_password -e "SELECT 1" ecoride > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your MySQL database is running in Docker."
echo ""
echo "📊 Database Details:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: ecoride"
echo "   Username: ecoride_user"
echo "   Password: ecoride_password"
echo ""
echo "🌐 Optional phpMyAdmin: http://localhost:8080"
echo ""
echo "▶️  Next steps:"
echo "   1. cd backend"
echo "   2. npm install"
echo "   3. npm start"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🗑️  To reset database: docker-compose down -v"