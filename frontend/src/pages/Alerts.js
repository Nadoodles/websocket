import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';
import axios from 'axios';

const Alerts = () => {
  const { stocks } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [alertType, setAlertType] = useState('price_above');
  const [targetValue, setTargetValue] = useState('');
  const queryClient = useQueryClient();

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery(
    'alerts',
    () => axios.get('/api/alerts/alerts/').then(res => res.data)
  );

  // Fetch all stocks for adding alerts
  const { data: allStocks = [] } = useQuery(
    'all-stocks',
    () => axios.get('/api/stocks/stocks/').then(res => res.data),
    { enabled: showAddModal }
  );

  // Create alert mutation
  const createAlertMutation = useMutation(
    (data) => axios.post('/api/alerts/alerts/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('alerts');
        toast.success('Alert created successfully');
        setShowAddModal(false);
        setSelectedStock(null);
        setTargetValue('');
      },
      onError: () => {
        toast.error('Failed to create alert');
      },
    }
  );

  // Delete alert mutation
  const deleteAlertMutation = useMutation(
    (alertId) => axios.delete(`/api/alerts/alerts/${alertId}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('alerts');
        toast.success('Alert deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete alert');
      },
    }
  );

  const handleCreateAlert = () => {
    if (!selectedStock || !targetValue) {
      toast.error('Please select a stock and enter a target value');
      return;
    }

    createAlertMutation.mutate({
      stock_id: selectedStock,
      alert_type: alertType,
      target_value: parseFloat(targetValue),
    });
  };

  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Delete this alert?')) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const filteredStocks = allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertTypeLabel = (type) => {
    const labels = {
      price_above: 'Price Above',
      price_below: 'Price Below',
      price_change_percent: 'Price Change %',
      volume_spike: 'Volume Spike',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      triggered: 'text-blue-600 bg-blue-100',
      cancelled: 'text-gray-600 bg-gray-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (alertsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-600 mt-1">Get notified when stocks hit your target prices</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts yet</h3>
          <p className="text-gray-600 mb-4">Create your first price alert to get notified</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => {
              const stock = stocks[alert.stock_symbol] || { symbol: alert.stock_symbol };
              return (
                <li key={alert.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {alert.stock_symbol} - {alert.stock_name}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {getAlertTypeLabel(alert.alert_type)} ${alert.target_value}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900">
                        Current: ${alert.current_value || 'N/A'}
                      </p>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Price Alert</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Stock
                  </label>
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search stocks..."
                  />
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {filteredStocks.slice(0, 10).map((stock) => (
                      <button
                        key={stock.id}
                        onClick={() => setSelectedStock(stock.id)}
                        className={`w-full text-left p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedStock === stock.id ? 'bg-blue-50' : ''
                        }`}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Type
                  </label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="price_change_percent">Price Change %</option>
                    <option value="volume_spike">Volume Spike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Enter target value"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!selectedStock || !targetValue || createAlertMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAlertMutation.isLoading ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
