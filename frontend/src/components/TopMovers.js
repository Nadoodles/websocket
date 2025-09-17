import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TopMovers = ({ stocks, type = 'gainers', limit = 5 }) => {
  const sortedStocks = stocks
    .filter(stock => stock.change_percent !== null && stock.change_percent !== undefined)
    .sort((a, b) => {
      if (type === 'gainers') {
        return b.change_percent - a.change_percent;
      } else {
        return a.change_percent - b.change_percent;
      }
    })
    .slice(0, limit);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  const title = type === 'gainers' ? 'Top Gainers' : 'Top Losers';
  const icon = type === 'gainers' ? TrendingUp : TrendingDown;
  const Icon = icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Icon className={`h-5 w-5 mr-2 ${type === 'gainers' ? 'text-green-600' : 'text-red-600'}`} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {sortedStocks.length > 0 ? (
          sortedStocks.map((stock, index) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-600 truncate max-w-32">{stock.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatPrice(stock.latest_price)}</p>
                <div className="flex items-center space-x-1">
                  {getChangeIcon(stock.change_percent)}
                  <span className={`text-sm font-medium ${getChangeColor(stock.change_percent)}`}>
                    {formatChange(stock.change_percent)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMovers;
