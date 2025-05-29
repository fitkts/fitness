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
  const isPositive = change !== undefined && change >= 0;
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    if (chartType === 'line') {
      return (
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart data={chartData}>
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      );
    }

    if (chartType === 'pie') {
      return (
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={30}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        <button
          onClick={onDetailClick}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="상세 보기"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* 증감률 표시 */}
      {change !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">
            전년 동기 대비
          </span>
        </div>
      )}

      {/* 미니 차트 */}
      {chartData && chartData.length > 0 && (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KPICard; 