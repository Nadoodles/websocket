import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Star, Plus, Trash2, Search } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import StockCard from '../components/StockCard';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';
import axios from 'axios';

const Watchlist = () => {
  const { stocks } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const queryClient = useQueryClient();

  // Fetch watchlists
  const { data: watchlists = [], isLoading: watchlistsLoading } = useQuery(
    'watchlists',
    () => axios.get('/api/watchlists/').then(res => res.data)
  );

  // Fetch all stocks for adding to watchlist
  const { data: allStocks = [] } = useQuery(
    'all-stocks',
    () => axios.get('/api/stocks/stocks/').then(res => res.data),
    { enabled: showAddModal }
  );

  // Create watchlist mutation
  const createWatchlistMutation = useMutation(
    (data) => axios.post('/api/watchlists/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('watchlists');
        toast.success('Watchlist created successfully');
      },
      onError: () => {
        toast.error('Failed to create watchlist');
      },
    }
  );

  // Add stock to watchlist mutation
  const addStockMutation = useMutation(
    ({ watchlistId, stockId }) => 
      axios.post(`/api/watchlists/${watchlistId}/add_stock/`, { stock_id: stockId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('watchlists');
        toast.success('Stock added to watchlist');
        setShowAddModal(false);
        setSelectedStock(null);
      },
      onError: () => {
        toast.error('Failed to add stock to watchlist');
      },
    }
  );

  // Remove stock from watchlist mutation
  const removeStockMutation = useMutation(
    ({ watchlistId, stockId }) => 
      axios.delete(`/api/watchlists/${watchlistId}/remove_stock/`, { 
        data: { stock_id: stockId } 
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('watchlists');
        toast.success('Stock removed from watchlist');
      },
      onError: () => {
        toast.error('Failed to remove stock from watchlist');
      },
    }
  );

  const handleCreateWatchlist = () => {
    const name = prompt('Enter watchlist name:');
    if (name) {
      createWatchlistMutation.mutate({ name });
    }
  };

  const handleAddStock = (watchlistId) => {
    setSelectedStock(watchlistId);
    setShowAddModal(true);
  };

  const handleSelectStock = (stock) => {
    addStockMutation.mutate({
      watchlistId: selectedStock,
      stockId: stock.id
    });
  };

  const handleRemoveStock = (watchlistId, stockId) => {
    if (window.confirm('Remove this stock from watchlist?')) {
      removeStockMutation.mutate({ watchlistId, stockId });
    }
  };

  const filteredStocks = allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (watchlistsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Watchlists</h1>
          <p className="text-gray-600 mt-1">Track your favorite stocks</p>
        </div>
        <button
          onClick={handleCreateWatchlist}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Watchlist
        </button>
      </div>

      {/* Watchlists */}
      {watchlists.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No watchlists yet</h3>
          <p className="text-gray-600 mb-4">Create your first watchlist to start tracking stocks</p>
          <button
            onClick={handleCreateWatchlist}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Watchlist
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {watchlists.map((watchlist) => (
            <div key={watchlist.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{watchlist.name}</h3>
                  <p className="text-sm text-gray-600">{watchlist.item_count} stocks</p>
                </div>
                <button
                  onClick={() => handleAddStock(watchlist.id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stock
                </button>
              </div>

              {watchlist.items && watchlist.items.length > 0 ? (
                <div className="stock-grid">
                  {watchlist.items.map((item) => {
                    const stock = stocks[item.stock.symbol] || item.stock;
                    return (
                      <div key={item.id} className="relative">
                        <StockCard stock={stock} />
                        <button
                          onClick={() => handleRemoveStock(watchlist.id, item.stock.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No stocks in this watchlist</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock to Watchlist</h3>
              
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search stocks to add..."
              />
              
              <div className="mt-4 max-h-64 overflow-y-auto">
                {filteredStocks.slice(0, 20).map((stock) => (
                  <button
                    key={stock.id}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {stock.latest_price ? `$${stock.latest_price.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
