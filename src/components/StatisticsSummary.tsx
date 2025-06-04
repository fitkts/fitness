import React from 'react';
import { KPIData, ViewType, PaymentStatusFilter } from '../types/statistics';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface StatisticsSummaryProps {
  kpiData: KPIData;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
}

const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({
  kpiData,
  startDate,
  endDate,
  viewType,
  statusFilter
}) => {
  const getViewTypeLabel = (type: ViewType): string => {
    switch (type) {
      case 'daily': return '일간';
      case 'weekly': return '주간';
      case 'monthly': return '월간';
      default: return '월간';
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">선택 기간 주요 성과</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{formatCurrency(kpiData.totalRevenue)}</div>
          <div className="text-sm text-gray-600">총 매출 ({statusFilter})</div>
          <div className="text-xs text-gray-500 mt-1">
            {kpiData.revenueGrowth >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(kpiData.revenueGrowth))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{kpiData.newMembersThisMonth}</div>
          <div className="text-sm text-gray-600">신규 회원</div>
          <div className="text-xs text-gray-500 mt-1">
            {kpiData.memberGrowth >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(kpiData.memberGrowth))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{kpiData.attendanceToday}</div>
          <div className="text-sm text-gray-600">오늘 출석</div>
          <div className="text-xs text-gray-500 mt-1">실시간</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{formatPercent(kpiData.lockerUtilization)}</div>
          <div className="text-sm text-gray-600">락커 이용률</div>
          <div className="text-xs text-gray-500 mt-1">현재 기준</div>
        </div>
      </div>
      
      {/* 필터 정보 표시 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span><strong>기간:</strong> {startDate} ~ {endDate}</span>
          <span><strong>결제 상태:</strong> {statusFilter}</span>
          <span><strong>차트 단위:</strong> {getViewTypeLabel(viewType)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSummary; 