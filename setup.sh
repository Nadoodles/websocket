#!/bin/bash

# Stock Tracker Pro - Setup Script
echo "🚀 Setting up Stock Tracker Pro..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your Alpha Vantage API key"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/staticfiles
mkdir -p frontend/build

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run Django migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@example.com || true

# Collect static files
echo "📦 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Start Celery worker
echo "🔄 Starting Celery worker..."
docker-compose exec -d backend celery -A stocktracker worker --loglevel=info

# Start Celery beat
echo "⏰ Starting Celery beat..."
docker-compose exec -d backend celery -A stocktracker beat --loglevel=info

echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "📊 To start tracking stocks:"
echo "   1. Add your Alpha Vantage API key to .env file"
echo "   2. Restart services: docker-compose restart"
echo "   3. Visit http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
