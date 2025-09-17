import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Star, Bell } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockDetail = () => {
  const { symbol } = useParams();
  const { stocks } = useWebSocket();
  const [timeRange, setTimeRange] = useState('1D');
  const [chartData, setChartData] = useState(null);

  // Get current stock data from WebSocket
  const currentStock = stocks[symbol];

  // Fetch historical data
  const { data: historicalData = [], isLoading: historicalLoading } = useQuery(
    ['historical-data', symbol],
    () => axios.get(`/api/stocks/stocks/${symbol}/historical/`).then(res => res.data),
    { enabled: !!symbol }
  );

  // Fetch price history
  const { data: priceHistory = [], isLoading: priceLoading } = useQuery(
    ['price-history', symbol],
    () => axios.get(`/api/stocks/stocks/${symbol}/prices/?limit=100`).then(res => res.data),
    { enabled: !!symbol }
  );

  useEffect(() => {
    if (priceHistory.length > 0) {
      const labels = priceHistory.map(item => 
        new Date(item.timestamp).toLocaleTimeString()
      ).reverse();
      
      const prices = priceHistory.map(item => item.price).reverse();
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
          },
        ],
      });
    }
  }, [priceHistory]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-5 w-5" />;
    if (change < 0) return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!currentStock) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentStock.symbol}</h1>
          <p className="text-gray-600">{currentStock.name}</p>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Price</h3>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentStock.latest_price)}
              </span>
              <div className={`flex items-center space-x-1 ${getChangeColor(currentStock.change_percent)}`}>
                {getChangeIcon(currentStock.change_percent)}
                <span className="text-lg font-semibold">
                  {formatChange(currentStock.change_percent)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sector:</span>
                <span className="font-medium">{currentStock.sector || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium">{currentStock.industry || 'N/A'}</span>
              </div>
              {currentStock.market_cap && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap:</span>
                  <span className="font-medium">
                    ${(currentStock.market_cap / 1e9).toFixed(2)}B
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Star className="h-4 w-4 mr-2" />
                Add to Watchlist
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Bell className="h-4 w-4 mr-2" />
                Set Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          <div className="flex space-x-2">
            {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {chartData ? (
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Historical Data Table */}
      {historicalData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalData.slice(0, 10).map((row) => (
                  <tr key={row.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.open_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.high_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.low_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.close_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.volume.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
