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
import { TrendingUp, TrendingDown, Target, Users, Calendar, AlertCircle, Award, Activity } from 'lucide-react';
import { Member } from '../../models/types';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { KPICardConfig, ViewType } from '../../types/statistics';

interface PerformanceDetailViewProps {
  cardConfig: KPICardConfig;
  membersData: Member[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  kpiData: any;
}

const PerformanceDetailView: React.FC<PerformanceDetailViewProps> = ({
  cardConfig,
  membersData,
  value,
  change,
  startDate,
  endDate,
  viewType,
  kpiData
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  // 성과 데이터 분석
  const performanceAnalysis = useMemo(() => {
    const now = new Date();

    // 회원권 갱신 분석
    const renewalAnalysis = (() => {
      const totalMembers = membersData.length;
      const activeMembers = membersData.filter(member => 
        member.membershipEnd && new Date(member.membershipEnd) > now
      ).length;

      // 시뮬레이션 데이터로 갱신 분석
      const renewalData = {
        totalRenewals: Math.floor(totalMembers * 0.75), // 75% 갱신률
        onTimeRenewals: Math.floor(totalMembers * 0.65), // 정시 갱신
        lateRenewals: Math.floor(totalMembers * 0.10), // 늦은 갱신
        nonRenewals: Math.floor(totalMembers * 0.25), // 미갱신
      };

      // 월별 갱신률 추세
      const monthlyRenewalTrend = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const baseRenewalRate = Math.random() * 20 + 70; // 70-90% 범위
        
        monthlyRenewalTrend.push({
          month: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
          rate: Math.round(baseRenewalRate),
          count: Math.floor((baseRenewalRate / 100) * (totalMembers / 12)),
          date: targetDate
        });
      }

      // 회원권 타입별 갱신률
      const membershipTypeRenewal = membersData.reduce((acc, member) => {
        const type = member.membershipType || '기타';
        if (!acc[type]) {
          acc[type] = { total: 0, renewed: 0 };
        }
        acc[type].total += 1;
        // 시뮬레이션: 80% 갱신 확률
        if (Math.random() > 0.2) {
          acc[type].renewed += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; renewed: number }>);

      const renewalByTypeChart = Object.entries(membershipTypeRenewal).map(([type, data]) => ({
        name: type,
        total: data.total,
        renewed: data.renewed,
        rate: data.total > 0 ? ((data.renewed / data.total) * 100).toFixed(1) : '0'
      }));

      return {
        renewalData,
        monthlyRenewalTrend,
        renewalByTypeChart,
        overallRenewalRate: renewalData.totalRenewals / Math.max(totalMembers, 1) * 100
      };
    })();

    // PT 이용 분석
    const ptAnalysis = (() => {
      const totalMembers = membersData.length;
      const ptMembers = Math.floor(totalMembers * 0.3); // 30%가 PT 이용
      const ptUtilizationRate = (ptMembers / Math.max(totalMembers, 1)) * 100;

      // PT 이용 패턴 (시간대별)
      const ptHourlyPattern = [];
      for (let hour = 6; hour <= 22; hour++) {
        const baseCount = hour >= 18 && hour <= 21 ? 
          Math.floor(Math.random() * 15 + 10) : // 피크 시간대
          Math.floor(Math.random() * 8 + 2);   // 일반 시간대
        
        ptHourlyPattern.push({
          hour: `${hour}:00`,
          count: baseCount,
          label: `${hour}시`
        });
      }

      // 월별 PT 이용 추세
      const monthlyPTTrend = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const basePTCount = Math.floor(Math.random() * 200 + 150);
        
        monthlyPTTrend.push({
          month: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
          sessions: basePTCount,
          members: Math.floor(basePTCount / 8), // 월 8회 평균
          date: targetDate
        });
      }

      // PT 트레이너별 만족도 (시뮬레이션)
      const trainerSatisfaction = [
        { name: '김트레이너', satisfaction: Math.floor(Math.random() * 20 + 80), sessions: Math.floor(Math.random() * 50 + 30) },
        { name: '이트레이너', satisfaction: Math.floor(Math.random() * 20 + 80), sessions: Math.floor(Math.random() * 50 + 30) },
        { name: '박트레이너', satisfaction: Math.floor(Math.random() * 20 + 80), sessions: Math.floor(Math.random() * 50 + 30) },
        { name: '최트레이너', satisfaction: Math.floor(Math.random() * 20 + 80), sessions: Math.floor(Math.random() * 50 + 30) }
      ];

      return {
        ptMembers,
        ptUtilizationRate,
        ptHourlyPattern,
        monthlyPTTrend,
        trainerSatisfaction,
        avgSessionsPerMonth: monthlyPTTrend.reduce((sum, month) => sum + month.sessions, 0) / monthlyPTTrend.length
      };
    })();

    return {
      renewalAnalysis,
      ptAnalysis
    };
  }, [membersData]);

  // 색상 팔레트
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 카드별 맞춤 인사이트
  const getCardSpecificInsights = () => {
    switch (cardConfig.id) {
      case 'renewalRate':
        return [
          `전체 갱신률: ${value}`,
          `정시 갱신 비율: ${formatPercent((performanceAnalysis.renewalAnalysis.renewalData.onTimeRenewals / Math.max(membersData.length, 1)) * 100)}`,
          `늦은 갱신 비율: ${formatPercent((performanceAnalysis.renewalAnalysis.renewalData.lateRenewals / Math.max(membersData.length, 1)) * 100)}`,
          `주요 갱신 회원권: ${performanceAnalysis.renewalAnalysis.renewalByTypeChart[0]?.name || 'N/A'}`,
          `갱신률 변화: ${change ? formatPercent(change) : '변화 없음'}`
        ];
      
      case 'ptUtilization':
        return [
          `PT 이용률: ${value}`,
          `PT 이용 회원 수: ${formatNumber(performanceAnalysis.ptAnalysis.ptMembers)}명`,
          `월평균 PT 세션: ${formatNumber(performanceAnalysis.ptAnalysis.avgSessionsPerMonth)}회`,
          `평균 트레이너 만족도: ${formatNumber(performanceAnalysis.ptAnalysis.trainerSatisfaction.reduce((sum, t) => sum + t.satisfaction, 0) / performanceAnalysis.ptAnalysis.trainerSatisfaction.length)}점`,
          `이용률 변화: ${change ? formatPercent(change) : '변화 없음'}`
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
              <p className="text-sm font-medium text-blue-700">갱신률</p>
              <p className="text-2xl font-bold text-blue-900">{formatPercent(performanceAnalysis.renewalAnalysis.overallRenewalRate)}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">PT 이용률</p>
              <p className="text-2xl font-bold text-green-900">{formatPercent(performanceAnalysis.ptAnalysis.ptUtilizationRate)}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">종합 만족도</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatNumber((performanceAnalysis.renewalAnalysis.overallRenewalRate + performanceAnalysis.ptAnalysis.trainerSatisfaction.reduce((sum, t) => sum + t.satisfaction, 0) / performanceAnalysis.ptAnalysis.trainerSatisfaction.length) / 2)}점
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
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

      {/* 갱신률 관련 차트들 */}
      {cardConfig.id === 'renewalRate' && (
        <>
          {/* 월별 갱신률 추세 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">월별 갱신률 추세</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceAnalysis.renewalAnalysis.monthlyRenewalTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'rate') return [`${value}%`, '갱신률'];
                      if (name === 'count') return [formatNumber(value), '갱신 건수'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `기간: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="갱신률 (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 회원권 타입별 갱신률 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">회원권 타입별 갱신률</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceAnalysis.renewalAnalysis.renewalByTypeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'renewed') return [formatNumber(value), '갱신 완료'];
                      if (name === 'total') return [formatNumber(value), '전체'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="renewed" fill="#10B981" name="갱신 완료" />
                  <Bar dataKey="total" fill="#94A3B8" name="전체" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 갱신 상태 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">갱신 상태 분포</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '정시 갱신', value: performanceAnalysis.renewalAnalysis.renewalData.onTimeRenewals },
                      { name: '늦은 갱신', value: performanceAnalysis.renewalAnalysis.renewalData.lateRenewals },
                      { name: '미갱신', value: performanceAnalysis.renewalAnalysis.renewalData.nonRenewals }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(value), '회원 수']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* PT 이용률 관련 차트들 */}
      {cardConfig.id === 'ptUtilization' && (
        <>
          {/* 시간대별 PT 이용 패턴 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">시간대별 PT 이용 패턴</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceAnalysis.ptAnalysis.ptHourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [formatNumber(value), 'PT 세션']} />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 월별 PT 이용 추세 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">월별 PT 이용 추세</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceAnalysis.ptAnalysis.monthlyPTTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'sessions') return [formatNumber(value), 'PT 세션'];
                      if (name === 'members') return [formatNumber(value), 'PT 회원'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `기간: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="월별 PT 세션"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="members" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="PT 이용 회원"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 트레이너별 만족도 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">트레이너별 만족도</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceAnalysis.ptAnalysis.trainerSatisfaction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'satisfaction') return [`${value}점`, '만족도'];
                      if (name === 'sessions') return [formatNumber(value), '세션 수'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="satisfaction" fill="#06B6D4" name="만족도" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* 성과 알림 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="w-5 h-5 text-green-600 mr-2" />
          성과 현황
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Target className="w-4 h-4 text-blue-500 mr-2" />
              갱신률 목표 달성
            </h4>
            <p className="text-lg font-bold text-blue-600 mb-1">
              {performanceAnalysis.renewalAnalysis.overallRenewalRate > 75 ? '달성' : '미달성'}
            </p>
            <p className="text-sm text-gray-600">목표: 75% / 현재: {formatPercent(performanceAnalysis.renewalAnalysis.overallRenewalRate)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Activity className="w-4 h-4 text-purple-500 mr-2" />
              PT 이용률 상태
            </h4>
            <p className="text-lg font-bold text-purple-600 mb-1">
              {performanceAnalysis.ptAnalysis.ptUtilizationRate > 25 ? '양호' : '개선 필요'}
            </p>
            <p className="text-sm text-gray-600">현재: {formatPercent(performanceAnalysis.ptAnalysis.ptUtilizationRate)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Users className="w-4 h-4 text-green-500 mr-2" />
              고객 만족도
            </h4>
            <p className="text-lg font-bold text-green-600 mb-1">
              {formatNumber(performanceAnalysis.ptAnalysis.trainerSatisfaction.reduce((sum, t) => sum + t.satisfaction, 0) / performanceAnalysis.ptAnalysis.trainerSatisfaction.length)}점
            </p>
            <p className="text-sm text-gray-600">100점 만점 기준</p>
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
                <span className="text-gray-700">만료 임박 회원에게 갱신 혜택을 제공하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">PT 체험 프로그램을 통해 이용률을 높이세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">
                  {isPositive ? '현재 성과를 유지하기 위한 정책을 지속하세요' : '성과 개선을 위한 새로운 전략을 수립하세요'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDetailView; 