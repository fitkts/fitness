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
import { Users, UserPlus, UserCheck, Target, Calendar, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Member } from '../../models/types';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { KPICardConfig, ViewType } from '../../types/statistics';

interface MemberDetailViewProps {
  cardConfig: KPICardConfig;
  membersData: Member[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  kpiData: any;
}

const MemberDetailView: React.FC<MemberDetailViewProps> = ({
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

  // 회원 데이터 분석
  const memberAnalysis = useMemo(() => {
    const now = new Date();
    const startPeriod = new Date(startDate);
    const endPeriod = new Date(endDate);

    // 전체 회원 분류
    const totalMembers = membersData.length;
    const activeMembers = membersData.filter(member => 
      member.membershipEnd && new Date(member.membershipEnd) > now
    ).length;
    
    // 선택 기간 내 신규 가입 회원
    const newMembers = membersData.filter(member => {
      const joinDate = new Date(member.joinDate);
      return joinDate >= startPeriod && joinDate <= endPeriod;
    }).length;

    // 회원권 만료 임박 회원 (30일 이내)
    const expiringMembers = membersData.filter(member => {
      if (!member.membershipEnd) return false;
      const endDate = new Date(member.membershipEnd);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return endDate > now && endDate <= thirtyDaysFromNow;
    }).length;

    // 회원권 타입별 분포
    const membershipTypeDistribution = membersData.reduce((acc, member) => {
      const type = member.membershipType || '기타';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 연령대별 분포 
    const ageGroupDistribution = membersData.reduce((acc, member) => {
      if (!member.birthDate) {
        acc['미상'] = (acc['미상'] || 0) + 1;
        return acc;
      }
      
      const birthYear = new Date(member.birthDate).getFullYear();
      const age = now.getFullYear() - birthYear;
      
      let ageGroup = '기타';
      if (age < 20) ageGroup = '10대';
      else if (age < 30) ageGroup = '20대';
      else if (age < 40) ageGroup = '30대';
      else if (age < 50) ageGroup = '40대';
      else if (age < 60) ageGroup = '50대';
      else ageGroup = '60대+';
      
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 성별 분포
    const genderDistribution = membersData.reduce((acc, member) => {
      const gender = member.gender || '미상';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 월별 가입 추세 (최근 12개월)
    const monthlyJoinTrend = [];
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const joinCount = membersData.filter(member => {
        const joinDate = new Date(member.joinDate);
        return joinDate >= targetDate && joinDate < nextMonth;
      }).length;

      monthlyJoinTrend.push({
        month: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        count: joinCount,
        date: targetDate
      });
    }

    // 회원 유지율 계산
    const memberRetentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

    return {
      totalMembers,
      activeMembers,
      newMembers,
      expiringMembers,
      membershipTypeDistribution,
      ageGroupDistribution,
      genderDistribution,
      monthlyJoinTrend,
      memberRetentionRate
    };
  }, [membersData, startDate, endDate]);

  // 차트 데이터 준비
  const membershipTypeChart = Object.entries(memberAnalysis.membershipTypeDistribution)
    .map(([type, count]) => ({
      name: type,
      value: count,
      percentage: (count / memberAnalysis.totalMembers * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  const ageGroupChart = Object.entries(memberAnalysis.ageGroupDistribution)
    .map(([ageGroup, count]) => ({
      name: ageGroup,
      value: count,
      percentage: (count / memberAnalysis.totalMembers * 100).toFixed(1)
    }))
    .sort((a, b) => {
      const ageOrder = ['10대', '20대', '30대', '40대', '50대', '60대+', '미상', '기타'];
      return ageOrder.indexOf(a.name) - ageOrder.indexOf(b.name);
    });

  const genderChart = Object.entries(memberAnalysis.genderDistribution)
    .map(([gender, count]) => ({
      name: gender === 'M' ? '남성' : gender === 'F' ? '여성' : '미상',
      value: count,
      percentage: (count / memberAnalysis.totalMembers * 100).toFixed(1)
    }));

  // 색상 팔레트
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 카드별 맞춤 인사이트
  const getCardSpecificInsights = () => {
    switch (cardConfig.id) {
      case 'totalMembers':
        return [
          `전체 등록 회원: ${formatNumber(memberAnalysis.totalMembers)}명`,
          `활성 회원: ${formatNumber(memberAnalysis.activeMembers)}명`,
          `회원 유지율: ${formatPercent(memberAnalysis.memberRetentionRate)}`,
          `이번 달 신규 가입: ${formatNumber(memberAnalysis.newMembers)}명`,
          `만료 임박 회원: ${formatNumber(memberAnalysis.expiringMembers)}명`
        ];
      case 'activeMembers':
        return [
          `현재 활성 회원: ${formatNumber(memberAnalysis.activeMembers)}명`,
          `전체 대비 활성률: ${formatPercent(memberAnalysis.memberRetentionRate)}`,
          `만료 임박 회원: ${formatNumber(memberAnalysis.expiringMembers)}명`,
          `주요 회원권 타입: ${membershipTypeChart[0]?.name || 'N/A'}`,
          `활성 회원 변화율: ${change ? formatPercent(change) : '변화 없음'}`
        ];
      case 'newMembers':
        return [
          `선택 기간 신규 가입: ${formatNumber(memberAnalysis.newMembers)}명`,
          `일평균 신규 가입: ${formatNumber(memberAnalysis.newMembers / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))))}명`,
          `주요 가입 연령대: ${ageGroupChart[0]?.name || 'N/A'}`,
          `최근 가입 추세: ${isPositive ? '상승' : '하락'}`,
          `신규 가입 증가율: ${change ? formatPercent(change) : '변화 없음'}`
        ];
      case 'memberRetention':
        return [
          `전체 회원 유지율: ${formatPercent(memberAnalysis.memberRetentionRate)}`,
          `활성 회원: ${formatNumber(memberAnalysis.activeMembers)}명`,
          `전체 회원: ${formatNumber(memberAnalysis.totalMembers)}명`,
          `만료 임박 회원: ${formatNumber(memberAnalysis.expiringMembers)}명`,
          `유지율 변화: ${change ? formatPercent(change) : '변화 없음'}`
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
              <p className="text-sm font-medium text-blue-700">전체 회원</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(memberAnalysis.totalMembers)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">활성 회원</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(memberAnalysis.activeMembers)}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">신규 가입</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(memberAnalysis.newMembers)}</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">유지율</p>
              <p className="text-2xl font-bold text-orange-900">{formatPercent(memberAnalysis.memberRetentionRate)}</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* 월별 가입 추세 차트 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">월별 신규 가입 추세</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memberAnalysis.monthlyJoinTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [formatNumber(value), '신규 가입']}
                labelFormatter={(label) => `기간: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="#3B82F6"
                fillOpacity={0.3}
                name="월별 신규 가입"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 회원 분포 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 회원권 타입별 분포 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">회원권 타입별 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipTypeChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {membershipTypeChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatNumber(value), '회원 수']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 연령대별 분포 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">연령대별 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroupChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [formatNumber(value), '회원 수']} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 성별 분포 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">성별 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatNumber(value), '회원 수']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 회원 관리 알림 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
          회원 관리 알림
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              만료 임박 회원
            </h4>
            <p className="text-2xl font-bold text-red-600 mb-1">{formatNumber(memberAnalysis.expiringMembers)}명</p>
            <p className="text-sm text-gray-600">30일 이내 회원권 만료 예정</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <UserPlus className="w-4 h-4 text-green-500 mr-2" />
              이번 달 신규 가입
            </h4>
            <p className="text-2xl font-bold text-green-600 mb-1">{formatNumber(memberAnalysis.newMembers)}명</p>
            <p className="text-sm text-gray-600">전월 대비 {change ? formatPercent(change) : '변화 없음'}</p>
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
                <span className="text-gray-700">만료 임박 회원에게 갱신 안내를 발송하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">주요 연령대를 타겟으로 한 마케팅을 강화하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">
                  {isPositive ? '현재 증가 추세를 유지하기 위한 추천 프로그램을 운영하세요' : '신규 회원 유치를 위한 프로모션을 검토하세요'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailView; 