import React from 'react';
import { X, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { KPICardConfig, MiniChartData, ViewType, PaymentStatusFilter } from '../types/statistics';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { Payment, Member, Locker, Staff } from '../models/types';
import RevenueDetailView from './details/RevenueDetailView';
import MemberDetailView from './details/MemberDetailView';
import OperationDetailView from './details/OperationDetailView';
import PerformanceDetailView from './details/PerformanceDetailView';
import StaffDetailView from './details/StaffDetailView';

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardConfig: KPICardConfig | null;
  kpiData: any;
  chartData: MiniChartData[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
  paymentsData?: Payment[];
  membersData?: Member[];
  lockersData?: Locker[];
  staffData?: Staff[];
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  isOpen,
  onClose,
  cardConfig,
  kpiData,
  chartData,
  value,
  change,
  startDate,
  endDate,
  viewType,
  statusFilter,
  paymentsData = [],
  membersData = [],
  lockersData = [],
  staffData = []
}) => {
  if (!isOpen || !cardConfig) return null;

  const isPositive = change !== undefined ? change >= 0 : true;

  // 카테고리별 상세보기 컴포넌트 렌더링
  const renderDetailContent = () => {
    switch (cardConfig.category) {
      case '매출':
        return (
          <RevenueDetailView
            cardConfig={cardConfig}
            paymentsData={paymentsData}
            value={value}
            change={change}
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            statusFilter={statusFilter}
          />
        );
      case '회원':
        return (
          <MemberDetailView
            cardConfig={cardConfig}
            membersData={membersData}
            value={value}
            change={change}
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            kpiData={kpiData}
          />
        );
      case '운영':
        return (
          <OperationDetailView
            cardConfig={cardConfig}
            membersData={membersData}
            lockersData={lockersData}
            value={value}
            change={change}
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            kpiData={kpiData}
          />
        );
      case '성과':
        return (
          <PerformanceDetailView
            cardConfig={cardConfig}
            membersData={membersData}
            value={value}
            change={change}
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            kpiData={kpiData}
          />
        );
      case '직원':
        return (
          <StaffDetailView
            cardConfig={cardConfig}
            staffData={staffData}
            membersData={membersData}
            paymentsData={paymentsData}
            value={value}
            change={change}
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            statusFilter={statusFilter}
            kpiData={kpiData}
          />
        );
      default:
        return renderDefaultDetailView();
    }
  };

  // 기본 상세보기 뷰 (fallback)
  const renderDefaultDetailView = () => {
    // 상세 차트 데이터 생성
    const getDetailedChartData = () => {
      return chartData.map((item, index) => ({
        ...item,
        label: `${index + 1}일`,
        trend: Math.random() > 0.5 ? '상승' : '하락'
      }));
    };

    const detailedChartData = getDetailedChartData();

    // 카드별 추가 정보 생성
    const getAdditionalInfo = () => {
      return {
        subtitle: '상세 분석',
        insights: [
          `현재 값: ${value}`,
          `변화율: ${change ? formatPercent(change) : '변화 없음'}`,
          `기간: ${startDate} ~ ${endDate}`,
          `필터: ${statusFilter}`
        ]
      };
    };

    const additionalInfo = getAdditionalInfo();

    return (
      <div className="space-y-8">
        {/* 주요 지표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">현재 값</h4>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">변화율</h4>
            <div className={`flex items-center text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={18} className="mr-1" /> : <TrendingDown size={18} className="mr-1" />}
              {change ? formatPercent(Math.abs(change)) : '0%'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">분석 기간</h4>
            <div className="flex items-center text-sm text-gray-700">
              <Calendar size={16} className="mr-1" />
              {startDate} ~ {endDate}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">필터</h4>
            <p className="text-sm text-gray-700">{statusFilter} | {viewType}</p>
          </div>
        </div>

        {/* 상세 차트 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">추세 분석</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detailedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (cardConfig.id.includes('Revenue') || cardConfig.id.includes('Payment')) {
                      return formatCurrency(value);
                    }
                    return formatNumber(value);
                  }}
                />
                <Tooltip 
                  formatter={(value: any) => {
                    if (cardConfig.id.includes('Revenue') || cardConfig.id.includes('Payment')) {
                      return [formatCurrency(value), cardConfig.title];
                    }
                    return [formatNumber(value), cardConfig.title];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={cardConfig.title}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 인사이트 및 추가 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 핵심 인사이트 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">핵심 인사이트</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {additionalInfo.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 추천 액션 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">추천 액션</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">
                    {isPositive ? '현재 긍정적 추세를 유지하세요' : '개선 방안을 검토해보세요'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">더 자세한 분석을 위해 기간을 조정해보세요</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">다른 KPI와 비교 분석해보세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${cardConfig.color}`}>
              {cardConfig.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{cardConfig.title}</h2>
              <p className="text-gray-600">{cardConfig.description}</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {cardConfig.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="데이터 내보내기"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          {renderDetailContent()}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            닫기
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
          >
            리포트 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIDetailModal; 