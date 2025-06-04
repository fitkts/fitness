import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { KPICardProps } from '../types/statistics';
import { formatPercent } from '../utils/formatters';

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  chartData,
  chartType = 'line',
  onDetailClick
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <button
          onClick={onDetailClick}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="상세보기"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* 값과 변화율 */}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{formatPercent(Math.abs(change))}</span>
            </div>
          )}
        </div>
      </div>

      {/* 미니 차트 */}
      {chartData && chartData.length > 0 && (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={8}
                  outerRadius={20}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#93C5FD'} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KPICard; 