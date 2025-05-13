import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Users, Calendar, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../database/ipcService';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast, ToastType } from '../contexts/ToastContext';

// 차트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// 차트 색상 팔레트
const colorPalette = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(14, 165, 233, 0.7)',
  'rgba(6, 182, 212, 0.7)',
  'rgba(20, 184, 166, 0.7)',
  'rgba(45, 212, 191, 0.7)',
  'rgba(34, 197, 94, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(236, 72, 153, 0.7)'
];

const Dashboard: React.FC = () => {
  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    attendanceToday: 0,
    membershipDistribution: [] as { type: string; count: number }[],
    monthlyAttendance: [] as { month: string; count: number }[],
    recentActivities: {
      recentMembers: [] as { id: number; name: string; joinDate: string }[],
      recentAttendance: [] as { id: number; name: string; visitDate: string }[]
    }
  });

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        const dashboardStats = await getDashboardStats();
        if (dashboardStats && typeof dashboardStats.totalMembers !== 'undefined') {
          setStats(dashboardStats);
        } else {
          showToast('error', '대시보드 통계 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('대시보드 데이터 로드 오류:', err);
        showToast('error', '대시보드 통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showToast]);

  // 방문 차트 데이터
  const attendanceData = {
    labels: stats.monthlyAttendance.map(item => item.month),
    datasets: [
      {
        label: '월별 방문',
        data: stats.monthlyAttendance.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // 회원권 차트 데이터
  const membershipData = {
    labels: stats.membershipDistribution.map(item => item.type),
    datasets: [
      {
        label: '회원권 종류',
        data: stats.membershipDistribution.map(item => item.count),
        backgroundColor: colorPalette.slice(0, stats.membershipDistribution.length),
        borderWidth: 1,
      },
    ],
  };

  // 시간 경과 계산 함수
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (e) {
      return '날짜 정보 없음';
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'yyyy년 MM월 dd일', { locale: ko });
    } catch (e) {
      return '날짜 정보 없음';
    }
  };

  // 카드 렌더링 함수
  const renderStatCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    colorClass: string
  ) => (
    <div className="bg-white rounded-lg shadow p-4 w-full min-w-0">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClass} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );

  // 최근 활동 항목 렌더링
  const renderRecentActivity = () => {
    const { recentMembers, recentAttendance } = stats.recentActivities;
    
    if (recentMembers.length === 0 && recentAttendance.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <p>최근 활동 내역이 없습니다</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {recentMembers.map((member, index) => (
          <div key={`member-${member.id}-${index}`} className="flex items-center p-3 border-b">
            <div className="bg-blue-100 text-blue-500 p-2 rounded-full mr-4">
              <Users size={16} />
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{member.name}</span> 회원이 등록되었습니다.
              </p>
              <p className="text-xs text-gray-500">{formatTimeAgo(member.joinDate)}</p>
            </div>
          </div>
        ))}
        
        {recentAttendance.map((attendance, index) => (
          <div key={`attendance-${attendance.id}-${index}`} className="flex items-center p-3 border-b">
            <div className="bg-green-100 text-green-500 p-2 rounded-full mr-4">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{attendance.name}</span> 회원이 체크인했습니다.
              </p>
              <p className="text-xs text-gray-500">{formatTimeAgo(attendance.visitDate)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-2 md:p-4 lg:p-8 max-w-4xl mx-auto transition-all duration-300 ease-in-out">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">대시보드</h1>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6 w-full min-w-0 overflow-x-auto">
            {renderStatCard(
              '총 회원 수',
              stats.totalMembers,
              <Users size={20} />, 
              'bg-blue-500'
            )}
            {renderStatCard(
              '오늘 출석',
              stats.attendanceToday,
              <Calendar size={20} />, 
              'bg-green-500'
            )}
            {renderStatCard(
              '이번 달 신규 회원',
              stats.newMembersThisMonth,
              <TrendingUp size={20} />, 
              'bg-purple-500'
            )}
            {renderStatCard(
              '활성 회원',
              stats.activeMembers,
              <Users size={20} />, 
              'bg-yellow-500'
            )}
          </div>

          {/* 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6 w-full min-w-0 overflow-x-auto">
            <div className="bg-white rounded-lg shadow p-2 md:p-4 w-full min-w-0">
              <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4">월별 방문 현황</h2>
              {stats.monthlyAttendance.length > 0 ? (
                <div className="aspect-[2/1] min-h-[180px] md:min-h-[250px]">
                  <Line data={attendanceData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500">
                  <p>방문 데이터가 없습니다</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-2 md:p-4 w-full min-w-0">
              <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4">회원권 분포</h2>
              {stats.membershipDistribution.length > 0 ? (
                <div className="aspect-square min-h-[180px] md:min-h-[250px]">
                  <Doughnut data={membershipData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500">
                  <p>회원권 데이터가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-lg shadow p-2 md:p-4 w-full min-w-0">
            <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4">최근 활동</h2>
            {renderRecentActivity()}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 