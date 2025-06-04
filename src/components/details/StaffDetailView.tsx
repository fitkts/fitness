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
import { Users, Briefcase, BarChart3, Award, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
import { Staff, Member, Payment } from '../../models/types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { KPICardConfig, ViewType, PaymentStatusFilter } from '../../types/statistics';

interface StaffDetailViewProps {
  cardConfig: KPICardConfig;
  staffData: Staff[];
  membersData: Member[];
  paymentsData: Payment[];
  value: string;
  change?: number;
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
  kpiData: any;
}

const StaffDetailView: React.FC<StaffDetailViewProps> = ({
  cardConfig,
  staffData,
  membersData,
  paymentsData,
  value,
  change,
  startDate,
  endDate,
  viewType,
  statusFilter,
  kpiData
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  // 직원 성과 분석
  const staffAnalysis = useMemo(() => {
    const selectedStartDate = new Date(startDate);
    const selectedEndDate = new Date(endDate);

    // 활성 직원만 필터링
    const activeStaff = staffData.filter(staff => staff.status === 'active');

    // 직원별 종합 성과 데이터
    const staffPerformanceData = activeStaff.map(staff => {
      // 담당 회원들
      const staffMembers = membersData.filter(m => m.staffId === staff.id);
      const staffMemberIds = staffMembers.map(m => m.id);

      // 기간 내 결제 데이터
      const staffPayments = paymentsData.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return staffMemberIds.includes(p.memberId) &&
               paymentDate >= selectedStartDate &&
               paymentDate <= selectedEndDate &&
               (statusFilter === '전체' || p.status === statusFilter);
      });

      // 기간 내 신규 가입 회원
      const newMembers = staffMembers.filter(m => {
        const joinDate = new Date(m.joinDate);
        return joinDate >= selectedStartDate && joinDate <= selectedEndDate;
      });

      // 매출 계산
      const revenue = staffPayments.reduce((sum, p) => sum + p.amount, 0);

      // 상담 건수 (신규 가입 + 결제 건수 * 0.3으로 추정)
      const consultations = newMembers.length + Math.floor(staffPayments.length * 0.3);

      // 성과 점수 계산
      const revenueScore = Math.min(revenue / 10000, 40);
      const registrationScore = Math.min(newMembers.length * 10, 30);
      const consultationScore = Math.min(consultations * 2, 30);
      const totalScore = Math.round(revenueScore + registrationScore + consultationScore);

      return {
        id: staff.id,
        name: staff.name,
        position: staff.position,
        revenue,
        newMembers: newMembers.length,
        totalMembers: staffMembers.length,
        consultations,
        paymentCount: staffPayments.length,
        totalScore,
        revenueScore: Math.round(revenueScore),
        registrationScore: Math.round(registrationScore),
        consultationScore: Math.round(consultationScore)
      };
    });

    // 직책별 성과 분석
    const positionAnalysis = staffPerformanceData.reduce((acc, staff) => {
      if (!acc[staff.position]) {
        acc[staff.position] = {
          position: staff.position,
          count: 0,
          totalRevenue: 0,
          totalNewMembers: 0,
          totalConsultations: 0,
          avgScore: 0
        };
      }
      
      acc[staff.position].count += 1;
      acc[staff.position].totalRevenue += staff.revenue;
      acc[staff.position].totalNewMembers += staff.newMembers;
      acc[staff.position].totalConsultations += staff.consultations;
      acc[staff.position].avgScore += staff.totalScore;
      
      return acc;
    }, {} as Record<string, any>);

    // 평균 점수 계산
    Object.values(positionAnalysis).forEach((pos: any) => {
      pos.avgScore = Math.round(pos.avgScore / pos.count);
    });

    const positionChart = Object.values(positionAnalysis).map((pos: any) => ({
      name: pos.position,
      revenue: pos.totalRevenue,
      members: pos.totalNewMembers,
      score: pos.avgScore,
      count: pos.count
    }));

    // 월별 직원 성과 추이 (시뮬레이션)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      
      const baseScore = 70 + Math.random() * 20;
      monthlyTrend.push({
        month: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        avgScore: Math.round(baseScore),
        topPerformer: staffPerformanceData[0]?.name || 'N/A'
      });
    }

    return {
      staffPerformanceData: staffPerformanceData.sort((a, b) => b.totalScore - a.totalScore),
      positionChart,
      monthlyTrend,
      totalActiveStaff: activeStaff.length,
      avgPerformanceScore: Math.round(staffPerformanceData.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(staffPerformanceData.length, 1))
    };
  }, [staffData, membersData, paymentsData, startDate, endDate, statusFilter]);

  // 색상 팔레트
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 카드별 맞춤 인사이트
  const getCardSpecificInsights = () => {
    const topPerformer = staffAnalysis.staffPerformanceData[0];
    if (!topPerformer) return ['직원 데이터가 없습니다.'];

    switch (cardConfig.id) {
      case 'staffRevenue':
        return [
          `최고 매출 직원: ${topPerformer.name} (${formatCurrency(topPerformer.revenue)})`,
          `직원별 평균 매출: ${formatCurrency(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.revenue, 0) / Math.max(staffAnalysis.staffPerformanceData.length, 1))}`,
          `매출 상위 직원 직책: ${topPerformer.position}`,
          `전체 활성 직원: ${staffAnalysis.totalActiveStaff}명`,
          `매출 기여도 최대: ${formatPercent((topPerformer.revenue / Math.max(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.revenue, 0), 1)) * 100)}`
        ];
      case 'staffMemberRegistration':
        return [
          `최다 등록 직원: ${topPerformer.name} (${topPerformer.newMembers}명)`,
          `직원별 평균 등록: ${formatNumber(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.newMembers, 0) / Math.max(staffAnalysis.staffPerformanceData.length, 1))}명`,
          `신규 등록 총합: ${formatNumber(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.newMembers, 0))}명`,
          `등록률 상위 직책: ${topPerformer.position}`,
          `평균 담당 회원: ${formatNumber(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.totalMembers, 0) / Math.max(staffAnalysis.staffPerformanceData.length, 1))}명`
        ];
      case 'staffConsultation':
        return [
          `최다 상담 직원: ${topPerformer.name} (${topPerformer.consultations}건)`,
          `직원별 평균 상담: ${formatNumber(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.consultations, 0) / Math.max(staffAnalysis.staffPerformanceData.length, 1))}건`,
          `총 상담 건수: ${formatNumber(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.consultations, 0))}건`,
          `상담 대비 등록률: ${formatPercent((staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.newMembers, 0) / Math.max(staffAnalysis.staffPerformanceData.reduce((sum, s) => sum + s.consultations, 0), 1)) * 100)}`,
          `상담 효율성 최고: ${topPerformer.name}`
        ];
      case 'staffPerformanceScore':
        return [
          `최고 성과 직원: ${topPerformer.name} (${topPerformer.totalScore}점)`,
          `평균 성과 점수: ${staffAnalysis.avgPerformanceScore}점`,
          `성과 상위 직책: ${topPerformer.position}`,
          `매출 기여도: ${topPerformer.revenueScore}점 / 회원등록: ${topPerformer.registrationScore}점 / 상담: ${topPerformer.consultationScore}점`,
          `80점 이상 직원: ${staffAnalysis.staffPerformanceData.filter(s => s.totalScore >= 80).length}명`
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
              <p className="text-sm font-medium text-blue-700">활성 직원</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(staffAnalysis.totalActiveStaff)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">평균 성과</p>
              <p className="text-2xl font-bold text-green-900">{staffAnalysis.avgPerformanceScore}점</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">최고 성과</p>
              <p className="text-2xl font-bold text-purple-900">
                {staffAnalysis.staffPerformanceData[0]?.totalScore || 0}점
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">우수 직원</p>
              <p className="text-2xl font-bold text-orange-900">
                {staffAnalysis.staffPerformanceData.filter(s => s.totalScore >= 80).length}명
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* 직원별 성과 순위 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">직원별 성과 순위</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffAnalysis.staffPerformanceData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'totalScore') return [`${value}점`, '종합 점수'];
                  if (name === 'revenue') return [formatCurrency(value), '매출'];
                  if (name === 'newMembers') return [`${value}명`, '신규 등록'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="totalScore" fill="#3B82F6" name="종합 점수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 직책별 성과 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">직책별 평균 매출</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffAnalysis.positionChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">직책별 평균 성과 점수</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffAnalysis.positionChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value}점`, '평균 점수']} />
                <Bar dataKey="score" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 월별 성과 추이 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">월별 평균 성과 추이</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={staffAnalysis.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any) => [`${value}점`, '평균 성과']}
                labelFormatter={(label) => `기간: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="평균 성과 점수"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 성과 분석 및 추천 */}
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
            <h4 className="font-medium text-gray-800">관리 방안</h4>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">성과 우수 직원에게 인센티브를 제공하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">성과가 낮은 직원에게 추가 교육을 실시하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">직책별 역할 분담을 최적화하세요</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">월별 성과 목표를 설정하고 추적하세요</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailView; 