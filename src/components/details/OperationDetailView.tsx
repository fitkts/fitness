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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Activity, MapPin, Clock, Users, Calendar, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Member, Locker } from '../../models/types';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { KPICardConfig, ViewType } from '../../types/statistics';

interface OperationDetailViewProps {
  cardConfig: KPICardConfig;
  membersData: Member[];
  lockersData: Locker[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  kpiData: any;
}

const OperationDetailView: React.FC<OperationDetailViewProps> = ({
  cardConfig,
  membersData,
  lockersData,
  value,
  change,
  startDate,
  endDate,
  viewType,
  kpiData
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  // 운영 데이터 분석
  const operationAnalysis = useMemo(() => {
    const now = new Date();

    // 출석 관련 분석 (시뮬레이션 데이터)
    const hourlyAttendance = [];
    for (let hour = 6; hour <= 23; hour++) {
      const baseAttendance = hour >= 18 && hour <= 21 ? 
        Math.floor(Math.random() * 40 + 30) : // 피크 시간대
        Math.floor(Math.random() * 20 + 5);   // 일반 시간대
      
      hourlyAttendance.push({
        hour: `${hour}:00`,
        count: baseAttendance,
        label: `${hour}시`
      });
    }

    // 주간 출석 패턴
    const weeklyAttendance = [
      { day: '월', count: Math.floor(Math.random() * 100 + 80), label: '월요일' },
      { day: '화', count: Math.floor(Math.random() * 120 + 90), label: '화요일' },
      { day: '수', count: Math.floor(Math.random() * 110 + 85), label: '수요일' },
      { day: '목', count: Math.floor(Math.random() * 125 + 95), label: '목요일' },
      { day: '금', count: Math.floor(Math.random() * 140 + 100), label: '금요일' },
      { day: '토', count: Math.floor(Math.random() * 90 + 70), label: '토요일' },
      { day: '일', count: Math.floor(Math.random() * 70 + 50), label: '일요일' }
    ];

    // 락커 분석
    const totalLockers = lockersData.length || 150;
    const occupiedLockers = lockersData.filter(locker => locker.status === 'occupied').length || Math.floor(totalLockers * 0.7);
    const lockerUtilizationRate = totalLockers > 0 ? (occupiedLockers / totalLockers) * 100 : 0;

    // 락커 타입별 이용률
    const lockerTypeUtilization = lockersData.reduce((acc, locker) => {
      const type = locker.size || 'medium';
      if (!acc[type]) {
        acc[type] = { total: 0, occupied: 0 };
      }
      acc[type].total += 1;
      if (locker.status === 'occupied') {
        acc[type].occupied += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; occupied: number }>);

    const lockerTypeChart = Object.entries(lockerTypeUtilization).map(([type, data]) => ({
      name: type,
      total: data.total,
      occupied: data.occupied,
      utilization: data.total > 0 ? (data.occupied / data.total * 100).toFixed(1) : '0'
    }));

    // 월별 방문 추세 (시뮬레이션)
    const monthlyVisitTrend = [];
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const baseVisits = Math.floor(Math.random() * 500 + 800);
      
      monthlyVisitTrend.push({
        month: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        visits: baseVisits,
        avgDaily: Math.floor(baseVisits / 30),
        date: targetDate
      });
    }

    // 평균 방문 횟수 계산
    const avgMonthlyVisits = monthlyVisitTrend.reduce((sum, month) => sum + month.visits, 0) / monthlyVisitTrend.length;
    const avgDailyVisits = Math.floor(avgMonthlyVisits / 30);

    return {
      hourlyAttendance,
      weeklyAttendance,
      totalLockers,
      occupiedLockers,
      lockerUtilizationRate,
      lockerTypeChart,
      monthlyVisitTrend,
      avgMonthlyVisits,
      avgDailyVisits
    };
  }, [membersData, lockersData]);

  // 색상 팔레트
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 카드별 맞춤 인사이트
  const getCardSpecificInsights = () => {
    switch (cardConfig.id) {
      case 'attendanceToday':
        const peakHour = operationAnalysis.hourlyAttendance.reduce((max, hour) => 
          hour.count > max.count ? hour : max, operationAnalysis.hourlyAttendance[0]);
        
        return [
          `오늘 총 출석: ${value}`,
          `시간당 평균 출석: ${formatNumber(operationAnalysis.hourlyAttendance.reduce((sum, h) => sum + h.count, 0) / operationAnalysis.hourlyAttendance.length)}명`,
          `피크 시간대: ${peakHour.label} (${peakHour.count}명)`,
          `주간 대비 출석률: ${isPositive ? '+' : ''}${change ? formatPercent(change) : '0%'}`,
          `활성 회원 대비 출석률: ${formatPercent((parseInt(value.replace(/,/g, '')) / Math.max(kpiData.activeMembers || 1, 1)) * 100)}`
        ];
      
      case 'lockerUtilization':
        return [
          `현재 락커 이용률: ${value}`,
          `총 락커 수: ${formatNumber(operationAnalysis.totalLockers)}개`,
          `사용 중인 락커: ${formatNumber(operationAnalysis.occupiedLockers)}개`,
          `이용 가능한 락커: ${formatNumber(operationAnalysis.totalLockers - operationAnalysis.occupiedLockers)}개`,
          `주요 락커 타입: ${operationAnalysis.lockerTypeChart[0]?.name || 'N/A'}`
        ];
      
      case 'monthlyVisits':
        return [
          `월평균 방문 횟수: ${value}`,
          `일평균 방문 횟수: ${formatNumber(operationAnalysis.avgDailyVisits)}회`,
          `최고 방문 월: ${operationAnalysis.monthlyVisitTrend.reduce((max, month) => month.visits > max.visits ? month : max, operationAnalysis.monthlyVisitTrend[0]).month}`,
          `방문 증가율: ${change ? formatPercent(change) : '변화 없음'}`,
          `회원당 평균 방문: ${formatNumber(operationAnalysis.avgMonthlyVisits / Math.max(kpiData.totalMembers || 1, 1))}회`
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
              <p className="text-sm font-medium text-blue-700">오늘 출석</p>
              <p className="text-2xl font-bold text-blue-900">{cardConfig.id === 'attendanceToday' ? value : formatNumber(operationAnalysis.hourlyAttendance.reduce((sum, h) => sum + h.count, 0))}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">락커 이용률</p>
              <p className="text-2xl font-bold text-green-900">{formatPercent(operationAnalysis.lockerUtilizationRate)}</p>
            </div>
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">월평균 방문</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(operationAnalysis.avgMonthlyVisits)}회</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
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

      {/* 운영 관련 차트들 */}
      {cardConfig.id === 'attendanceToday' && (
        <>
          {/* 시간대별 출석 현황 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">시간대별 출석 현황</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationAnalysis.hourlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [formatNumber(value), '출석 인원']}
                    labelFormatter={(label) => `시간: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="시간별 출석"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 요일별 출석 패턴 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">요일별 출석 패턴</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationAnalysis.weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [formatNumber(value), '평균 출석']} />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {cardConfig.id === 'lockerUtilization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 락커 상태 현황 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">락커 상태 현황</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '사용 중', value: operationAnalysis.occupiedLockers, color: '#EF4444' },
                      { name: '이용 가능', value: operationAnalysis.totalLockers - operationAnalysis.occupiedLockers, color: '#10B981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}개`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#EF4444" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(value), '락커 수']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 락커 타입별 이용률 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">타입별 이용률</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationAnalysis.lockerTypeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'occupied') return [formatNumber(value), '사용 중'];
                      if (name === 'total') return [formatNumber(value), '전체'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="occupied" fill="#EF4444" name="사용 중" />
                  <Bar dataKey="total" fill="#94A3B8" name="전체" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {cardConfig.id === 'monthlyVisits' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">월별 방문 추세</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationAnalysis.monthlyVisitTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [formatNumber(value), '총 방문']}
                  labelFormatter={(label) => `기간: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="월별 방문 수"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 운영 알림 및 주의사항 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          운영 현황 알림
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Activity className="w-4 h-4 text-blue-500 mr-2" />
              피크 시간대
            </h4>
            <p className="text-lg font-bold text-blue-600 mb-1">
              {operationAnalysis.hourlyAttendance.reduce((max, hour) => hour.count > max.count ? hour : max, operationAnalysis.hourlyAttendance[0]).label}
            </p>
            <p className="text-sm text-gray-600">시설 운영 최적화 필요</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <MapPin className="w-4 h-4 text-green-500 mr-2" />
              락커 이용률
            </h4>
            <p className="text-lg font-bold text-green-600 mb-1">{formatPercent(operationAnalysis.lockerUtilizationRate)}</p>
            <p className="text-sm text-gray-600">
              {operationAnalysis.lockerUtilizationRate > 90 ? '포화 상태' : operationAnalysis.lockerUtilizationRate > 70 ? '양호' : '여유 있음'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Users className="w-4 h-4 text-purple-500 mr-2" />
              평균 이용률
            </h4>
            <p className="text-lg font-bold text-purple-600 mb-1">
              {formatPercent((operationAnalysis.avgDailyVisits / Math.max(kpiData.activeMembers || 1, 1)) * 100)}
            </p>
            <p className="text-sm text-gray-600">활성 회원 기준</p>
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
                <span className="text-gray-700">피크 시간대 직원 배치를 강화하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">락커 이용률이 높으면 추가 설치를 검토하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">방문 패턴을 분석하여 프로그램 시간을 조정하세요</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationDetailView; 