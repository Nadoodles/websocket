# Stock Tracker Pro

A full-stack real-time stock tracking application built with Django, React, PostgreSQL, Celery, and WebSockets. Monitor 500+ stocks with live market data, personalized watchlists, and price alerts.

## 🚀 Features

- **Real-time Market Data**: Live stock prices updated every minute via WebSockets
- **500+ Stock Coverage**: Track popular stocks from major exchanges
- **Interactive Dashboard**: Modern React UI with real-time charts and market overview
- **Personalized Watchlists**: Create and manage custom stock watchlists
- **Price Alerts**: Set alerts for price targets and get notified instantly
- **Historical Data**: View detailed stock charts and historical performance
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **High Performance**: Optimized API responses under 200ms

## 🏗️ Architecture

### Backend (Django)

- **Django REST Framework**: RESTful API endpoints
- **Django Channels**: WebSocket support for real-time updates
- **PostgreSQL**: Primary database for stock data and user information
- **Celery + Redis**: Background task processing and caching
- **Alpha Vantage API**: Real-time stock data integration

### Frontend (React)

- **React 18**: Modern React with hooks and context
- **React Query**: Data fetching and caching
- **Chart.js**: Interactive stock charts
- **Tailwind CSS**: Utility-first CSS framework
- **WebSocket Client**: Real-time data updates

### Infrastructure

- **Docker**: Containerized development and deployment
- **Redis**: Caching and message broker
- **PostgreSQL**: Relational database
- **AWS/Vercel**: Production deployment ready

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### Installation

1. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd websocket
   ./setup.sh
   ```

2. **Configure API key**:

   ```bash
   # Edit .env file and add your Alpha Vantage API key
   nano .env
   ```

3. **Restart services**:

   ```bash
   docker-compose restart
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## 📊 API Endpoints

### Stocks

- `GET /api/stocks/stocks/` - List all stocks
- `GET /api/stocks/stocks/{id}/` - Get stock details
- `GET /api/stocks/stocks/{id}/prices/` - Get price history
- `GET /api/stocks/stocks/{id}/historical/` - Get historical data
- `GET /api/stocks/stocks/top_gainers/` - Get top gaining stocks
- `GET /api/stocks/stocks/top_losers/` - Get top losing stocks

### Watchlists

- `GET /api/watchlists/` - List user watchlists
- `POST /api/watchlists/` - Create watchlist
- `POST /api/watchlists/{id}/add_stock/` - Add stock to watchlist
- `DELETE /api/watchlists/{id}/remove_stock/` - Remove stock from watchlist

### Alerts

- `GET /api/alerts/alerts/` - List user alerts
- `POST /api/alerts/alerts/` - Create price alert
- `DELETE /api/alerts/alerts/{id}/` - Delete alert

### WebSocket

- `ws://localhost:8000/ws/stocks/` - Real-time stock updates

## 🔧 Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Celery Worker

```bash
cd backend
celery -A stocktracker worker --loglevel=info
```

### Celery Beat (Scheduler)

```bash
cd backend
celery -A stocktracker beat --loglevel=info
```

## 🚀 Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Deployment

1. **EC2 Instance**: Deploy backend with Docker
2. **RDS**: PostgreSQL database
3. **ElastiCache**: Redis for caching
4. **Vercel**: Frontend deployment

### Environment Variables

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=False
DB_NAME=stocktracker
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your-api-key

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_WS_URL=wss://your-api-domain.com
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Cached API responses and market data
- **WebSocket Compression**: Efficient real-time data transmission
- **React Query**: Client-side caching and background updates
- **CDN**: Static asset delivery optimization
- **Connection Pooling**: Database connection optimization

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Email: support@stocktrackerpro.com

---

**Built with ❤️ for the financial community**
