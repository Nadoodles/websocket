import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import StockCard from '../components/StockCard';
import MarketOverview from '../components/MarketOverview';
import TopMovers from '../components/TopMovers';
import SearchBar from '../components/SearchBar';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

const Dashboard = () => {
  const { stocks, isConnected } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [filterBy, setFilterBy] = useState('all');

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = Object.values(stocks);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by change direction
    if (filterBy === 'gainers') {
      filtered = filtered.filter(stock => stock.change_percent > 0);
    } else if (filterBy === 'losers') {
      filtered = filtered.filter(stock => stock.change_percent < 0);
    }

    // Sort stocks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.latest_price || 0) - (a.latest_price || 0);
        case 'change':
          return (b.change_percent || 0) - (a.change_percent || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

    return filtered;
  }, [stocks, searchTerm, sortBy, filterBy]);

  const marketStats = useMemo(() => {
    const stockValues = Object.values(stocks);
    const totalStocks = stockValues.length;
    const gainers = stockValues.filter(stock => stock.change_percent > 0).length;
    const losers = stockValues.filter(stock => stock.change_percent < 0).length;
    const unchanged = totalStocks - gainers - losers;

    return { totalStocks, gainers, losers, unchanged };
  }, [stocks]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time stock market data and analysis</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Market Overview */}
      <MarketOverview stats={marketStats} />

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMovers stocks={Object.values(stocks)} type="gainers" />
        <TopMovers stocks={Object.values(stocks)} type="losers" />
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="symbol">Symbol</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="change">Change %</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stocks</option>
              <option value="gainers">Gainers</option>
              <option value="losers">Losers</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedStocks.length} stocks
        </div>
      </div>

      {/* Stock Grid */}
      <div className="stock-grid">
        {filteredAndSortedStocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>

      {filteredAndSortedStocks.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No stocks match your current filters'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

