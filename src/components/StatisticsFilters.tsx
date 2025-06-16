import React, { useMemo } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType, PaymentStatusFilter } from '../types/statistics';
import { createDynamicQuickDateRanges } from '../utils/dynamicDateUtils';

interface StatisticsFiltersProps {
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onViewTypeChange: (viewType: ViewType) => void;
  onStatusFilterChange: (status: PaymentStatusFilter) => void;
  onQuickDateRange: (rangeGetter: () => {start: string, end: string}) => void;
}

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  startDate,
  endDate,
  viewType,
  statusFilter,
  onStartDateChange,
  onEndDateChange,
  onViewTypeChange,
  onStatusFilterChange,
  onQuickDateRange
}) => {
  // 현재 선택된 날짜를 기준으로 동적 빠른 날짜 범위 생성
  const quickDateRanges = useMemo(() => {
    return createDynamicQuickDateRanges(startDate);
  }, [startDate]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center mb-4">
        <Filter size={20} className="text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">필터 설정</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        {/* 기간 선택 */}
        <div className="lg:col-span-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">기간 선택</label>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full sm:w-auto flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
            />
            <span className="text-gray-500 hidden sm:inline">~</span>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full sm:w-auto flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
            />
          </div>
          
          {/* 빠른 날짜 선택 */}
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickDateRanges.map(qdr => (
              <div key={qdr.label} className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => onQuickDateRange(qdr.getPrevRange)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={`이전 ${qdr.type === 'day' ? '일' : qdr.type === 'week' ? '주' : qdr.type === 'month' ? '달' : '년'}`}
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => onQuickDateRange(qdr.getRange)}
                  className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-center"
                >
                  {qdr.label}
                </button>
                <button 
                  onClick={() => onQuickDateRange(qdr.getNextRange)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={`다음 ${qdr.type === 'day' ? '일' : qdr.type === 'week' ? '주' : qdr.type === 'month' ? '달' : '년'}`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 통계 단위 선택 */}
        <div>
          <label htmlFor="viewType" className="block text-sm font-medium text-gray-700 mb-1">차트 표시 단위</label>
          <select
            id="viewType"
            value={viewType}
            onChange={(e) => onViewTypeChange(e.target.value as ViewType)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
          >
            <option value="daily">일간</option>
            <option value="weekly">주간</option>
            <option value="monthly">월간</option>
          </select>
        </div>

        {/* 상태 필터 선택 */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PaymentStatusFilter)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
          >
            <option value="전체">전체</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
            <option value="환불">환불</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilters; 