import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StockCard = ({ stock }) => {
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
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBgColor = (change) => {
    if (change > 0) return 'bg-green-50 border-green-200';
    if (change < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <Link to={`/stock/${stock.symbol}`}>
      <div className={`card-hover bg-white rounded-lg border p-6 ${getChangeBgColor(stock.change_percent)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 truncate max-w-48">{stock.name}</p>
          </div>
          <div className={`flex items-center space-x-1 ${getChangeColor(stock.change_percent)}`}>
            {getChangeIcon(stock.change_percent)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price</span>
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(stock.latest_price)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Change</span>
            <span className={`font-semibold ${getChangeColor(stock.change_percent)}`}>
              {formatChange(stock.change_percent)}
            </span>
          </div>
        </div>

        {stock.sector && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Sector</span>
              <span className="text-xs font-medium text-gray-700">{stock.sector}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default StockCard;

