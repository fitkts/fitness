import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Payment } from '../../models/types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { KPICardConfig, ViewType, PaymentStatusFilter } from '../../types/statistics';

interface RevenueDetailViewProps {
  cardConfig: KPICardConfig;
  paymentsData: Payment[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
}

const RevenueDetailView: React.FC<RevenueDetailViewProps> = ({
  cardConfig,
  paymentsData,
  value,
  change,
  startDate,
  endDate,
  viewType,
  statusFilter
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  // 매출 데이터 분석
  const revenueAnalysis = useMemo(() => {
    const filteredPayments = paymentsData.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let statusMatch = true;
      if (statusFilter !== '전체') {
        statusMatch = payment.status === statusFilter;
      }
      
      return paymentDate >= start && paymentDate <= end && statusMatch;
    });

    // 일별 매출 데이터
    const dailyRevenue = filteredPayments.reduce((acc, payment) => {
      const date = new Date(payment.paymentDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // 결제 방법별 매출
    const paymentMethodRevenue = filteredPayments.reduce((acc, payment) => {
      const method = payment.paymentMethod || '기타';
      acc[method] = (acc[method] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // 회원권 타입별 매출
    const membershipTypeRevenue = filteredPayments.reduce((acc, payment) => {
      const type = payment.membershipType || '기타';
      acc[type] = (acc[type] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // 기본 통계
    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = filteredPayments.length;
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;
    const maxPayment = filteredPayments.length > 0 ? Math.max(...filteredPayments.map(p => p.amount)) : 0;
    const minPayment = filteredPayments.length > 0 ? Math.min(...filteredPayments.map(p => p.amount)) : 0;

    return {
      dailyRevenue,
      paymentMethodRevenue,
      membershipTypeRevenue,
      totalRevenue,
      totalPayments,
      averagePayment,
      maxPayment,
      minPayment,
      filteredPayments
    };
  }, [paymentsData, startDate, endDate, statusFilter]);

  // 차트 데이터 준비
  const dailyRevenueChart = Object.entries(revenueAnalysis.dailyRevenue)
    .map(([date, amount]) => ({
      date,
      amount,
      label: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const paymentMethodChart = Object.entries(revenueAnalysis.paymentMethodRevenue)
    .map(([method, amount]) => ({
      name: method,
      value: amount,
      percentage: (amount / revenueAnalysis.totalRevenue * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  const membershipTypeChart = Object.entries(revenueAnalysis.membershipTypeRevenue)
    .map(([type, amount]) => ({
      name: type,
      value: amount,
      percentage: (amount / revenueAnalysis.totalRevenue * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  // 색상 팔레트
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 카드별 맞춤 인사이트
  const getCardSpecificInsights = () => {
    switch (cardConfig.id) {
      case 'totalRevenue':
        return [
          `선택 기간 총 매출: ${formatCurrency(revenueAnalysis.totalRevenue)}`,
          `일평균 매출: ${formatCurrency(revenueAnalysis.totalRevenue / Math.max(dailyRevenueChart.length, 1))}`,
          `최고 일매출: ${formatCurrency(Math.max(...dailyRevenueChart.map(d => d.amount)))}`,
          `최저 일매출: ${formatCurrency(Math.min(...dailyRevenueChart.map(d => d.amount)))}`,
          `총 결제 건수: ${formatNumber(revenueAnalysis.totalPayments)}건`
        ];
      case 'averagePayment':
        return [
          `평균 결제 금액: ${formatCurrency(revenueAnalysis.averagePayment)}`,
          `최고 결제 금액: ${formatCurrency(revenueAnalysis.maxPayment)}`,
          `최저 결제 금액: ${formatCurrency(revenueAnalysis.minPayment)}`,
          `결제 금액 편차: ${formatCurrency(revenueAnalysis.maxPayment - revenueAnalysis.minPayment)}`,
          `평균 대비 변화율: ${change ? formatPercent(change) : '변화 없음'}`
        ];
      case 'totalPayments':
        return [
          `총 결제 건수: ${formatNumber(revenueAnalysis.totalPayments)}건`,
          `일평균 결제: ${formatNumber(revenueAnalysis.totalPayments / Math.max(dailyRevenueChart.length, 1))}건`,
          `평균 결제 금액: ${formatCurrency(revenueAnalysis.averagePayment)}`,
          `주요 결제 방법: ${paymentMethodChart[0]?.name || 'N/A'}`,
          `건당 매출 증가율: ${change ? formatPercent(change) : '변화 없음'}`
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* 주요 지표 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">총 매출</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(revenueAnalysis.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">평균 결제</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(revenueAnalysis.averagePayment)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">결제 건수</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(revenueAnalysis.totalPayments)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">변화율</p>
              <div className={`flex items-center text-xl font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                {isPositive ? <TrendingUp size={18} className="mr-1" /> : <TrendingDown size={18} className="mr-1" />}
                {change ? formatPercent(Math.abs(change)) : '0%'}
              </div>
            </div>
            {isPositive ? <TrendingUp className="w-8 h-8 text-green-600" /> : <TrendingDown className="w-8 h-8 text-red-600" />}
          </div>
        </div>
      </div>

      {/* 일별 매출 추세 차트 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">일별 매출 추세</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), '매출']}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="일별 매출"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 결제 방법별 & 회원권 타입별 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 결제 방법별 매출 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">결제 방법별 매출</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 회원권 타입별 매출 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">회원권 타입별 매출</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membershipTypeChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 핵심 인사이트 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
          핵심 인사이트
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2">
            {getCardSpecificInsights().map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">추천 액션</h4>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">
                  {isPositive ? '현재 상승 추세를 유지하기 위한 전략을 강화하세요' : '매출 개선을 위한 마케팅 전략을 검토하세요'}
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">주요 결제 방법의 수수료 및 편의성을 최적화하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">인기 회원권 타입을 중심으로 프로모션을 계획하세요</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDetailView; 