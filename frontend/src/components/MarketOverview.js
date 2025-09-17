import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

const MarketOverview = ({ stats }) => {
  const { totalStocks, gainers, losers, unchanged } = stats;

  const gainerPercentage = totalStocks > 0 ? ((gainers / totalStocks) * 100).toFixed(1) : 0;
  const loserPercentage = totalStocks > 0 ? ((losers / totalStocks) * 100).toFixed(1) : 0;

  const overviewItems = [
    {
      label: 'Total Stocks',
      value: totalStocks,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Gainers',
      value: gainers,
      percentage: gainerPercentage,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Losers',
      value: losers,
      percentage: loserPercentage,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Unchanged',
      value: unchanged,
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-center">
              <div className={`${item.color} p-2 rounded-md`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-semibold ${item.color}`}>
                    {item.value}
                  </p>
                  {item.percentage !== undefined && (
                    <p className="ml-2 text-sm text-gray-500">
                      ({item.percentage}%)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketOverview;
