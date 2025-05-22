import React from 'react';

interface PaymentFilterOptionsProps {
  dateFilter: 'all' | 'today' | 'this-week' | 'this-month';
  onDateFilterChange: (value: string) => void;
  statusFilter: 'all' | '완료' | '취소' | '환불';
  onStatusFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

const PaymentFilterOptions: React.FC<PaymentFilterOptionsProps> = ({
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center animate-fadeIn">
      <div>
        <label
          htmlFor="dateFilter"
          className="mr-2 font-medium text-gray-700"
        >
          기간:
        </label>
        <select
          id="dateFilter"
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
        >
          <option value="all">전체 기간</option>
          <option value="today">오늘</option>
          <option value="this-week">이번 주</option>
          <option value="this-month">이번 달</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="statusFilter"
          className="mr-2 font-medium text-gray-700"
        >
          상태:
        </label>
        <select
          id="statusFilter"
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="완료">완료</option>
          <option value="취소">취소</option>
          <option value="환불">환불</option>
        </select>
      </div>

      <button
        className="text-sm text-blue-500 hover:text-blue-700 ml-auto"
        onClick={onResetFilters}
      >
        필터 초기화
      </button>
    </div>
  );
};

export default PaymentFilterOptions; 