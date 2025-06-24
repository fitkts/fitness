import { format, parseISO, formatDistanceToNow, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  DashboardStats, 
  KPICard, 
  ChartData, 
  MemberEngagement,
  LockerStats,
  RevenueStats,
  UpcomingExpiry 
} from '../types/dashboard';
import { CHART_COLORS, ENGAGEMENT_THRESHOLDS } from '../config/dashboardConfig';

// 숫자 포맷팅 함수들
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)}원`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${Math.round(num / 100000) / 10}M`;
  } else if (num >= 1000) {
    return `${Math.round(num / 100) / 10}K`;
  }
  return formatNumber(num);
};

// 날짜 포맷팅 함수들
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  } catch (e) {
    return '날짜 정보 없음';
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  } catch (e) {
    return '시간 정보 없음';
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    return '--:--';
  }
};

// KPI 계산 함수들
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateEngagementScore = (
  totalMembers: number,
  highEngagement: number,
  mediumEngagement: number,
  lowEngagement: number
): number => {
  if (totalMembers === 0) return 0;
  
  const weightedScore = (highEngagement * 3 + mediumEngagement * 2 + lowEngagement * 1);
  const maxScore = totalMembers * 3;
  
  return (weightedScore / maxScore) * 100;
};

export const calculateRetentionRate = (
  activeMembers: number,
  totalMembers: number
): number => {
  if (totalMembers === 0) return 0;
  return (activeMembers / totalMembers) * 100;
};

export const calculateAverageRevenue = (
  totalRevenue: number,
  memberCount: number
): number => {
  if (memberCount === 0) return 0;
  return totalRevenue / memberCount;
};

// KPI 카드 데이터 생성 함수
export const generateKPICards = (stats: DashboardStats): KPICard[] => {
  const cards: KPICard[] = [
    {
      id: 'total-members',
      title: '총 회원 수',
      value: formatNumber(stats.totalMembers),
      subtitle: '전체 등록 회원',
      icon: 'Users',
      color: 'blue',
      trend: {
        value: stats.newMembersThisMonth,
        isPositive: stats.newMembersThisMonth > 0,
        period: '이번 달 신규'
      }
    },
    {
      id: 'active-members',
      title: '활성 회원',
      value: formatNumber(stats.activeMembers),
      subtitle: formatPercentage(stats.activeMembers, stats.totalMembers),
      icon: 'UserCheck',
      color: 'green',
    },
    {
      id: 'consultation-members',
      title: '상담 회원',
      value: formatNumber(stats.consultationMembers),
      subtitle: '승격 대기 중',
      icon: 'MessageCircle',
      color: 'yellow',
    },
    {
      id: 'attendance-today',
      title: '오늘 출석',
      value: formatNumber(stats.attendanceToday),
      subtitle: '현재까지 출석',
      icon: 'Calendar',
      color: 'purple',
    },
    {
      id: 'locker-occupancy',
      title: '락커 점유율',
      value: `${stats.lockerStats.occupancyRate}%`,
      subtitle: `${stats.lockerStats.occupiedLockers}/${stats.lockerStats.totalLockers}개 사용`,
      icon: 'Key',
      color: 'indigo',
    },
    {
      id: 'todays-revenue',
      title: '오늘 매출',
      value: formatCurrency(stats.revenueStats.todaysRevenue),
      subtitle: '신규 결제 포함',
      icon: 'CreditCard',
      color: 'green',
    },
    {
      id: 'monthly-revenue',
      title: '이번 달 매출',
      value: formatCurrency(stats.revenueStats.monthlyRevenue),
      subtitle: `회원당 평균 ${formatCurrency(stats.revenueStats.averagePerMember)}`,
      icon: 'TrendingUp',
      color: 'blue',
    },
    {
      id: 'expiring-soon',
      title: '만료 예정',
      value: formatNumber(stats.upcomingExpiry.thisWeek),
      subtitle: '이번 주 만료',
      icon: 'AlertCircle',
      color: 'red',
    },
  ];

  return cards;
};

// 차트 데이터 생성 함수들
export const generateAttendanceChartData = (monthlyAttendance: any[]): ChartData => {
  return {
    labels: monthlyAttendance.map(item => item.month),
    datasets: [
      {
        label: '월별 방문',
        data: monthlyAttendance.map(item => item.count),
        borderColor: CHART_COLORS.primary[0],
        backgroundColor: CHART_COLORS.backgrounds[0],
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };
};

export const generateMembershipDistributionChartData = (distribution: any[]): ChartData => {
  return {
    labels: distribution.map(item => item.type),
    datasets: [
      {
        label: '회원권 분포',
        data: distribution.map(item => item.count),
        backgroundColor: CHART_COLORS.primary.slice(0, distribution.length),
        borderWidth: 2,
      },
    ],
  };
};

export const generateEngagementChartData = (engagement: MemberEngagement): ChartData => {
  return {
    labels: ['높은 참여도', '보통 참여도', '낮은 참여도'],
    datasets: [
      {
        label: '회원 참여도',
        data: [engagement.highEngagement, engagement.mediumEngagement, engagement.lowEngagement],
        backgroundColor: [CHART_COLORS.primary[1], CHART_COLORS.primary[2], CHART_COLORS.primary[3]],
        borderWidth: 2,
      },
    ],
  };
};

export const generateRevenueChartData = (monthlyData: any[]): ChartData => {
  return {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: '월별 매출',
        data: monthlyData.map((item, index) => (index + 1) * 10000000 + Math.random() * 5000000),
        backgroundColor: CHART_COLORS.gradients[0],
        borderColor: CHART_COLORS.primary[0],
        borderWidth: 2,
      },
    ],
  };
};

// 상태 평가 함수들
export const getEngagementStatus = (engagement: MemberEngagement): {
  status: 'excellent' | 'good' | 'fair' | 'needs-improvement';
  message: string;
} => {
  const total = engagement.highEngagement + engagement.mediumEngagement + engagement.lowEngagement;
  const highPercentage = (engagement.highEngagement / total) * 100;
  
  if (highPercentage >= 60) {
    return { status: 'excellent', message: '회원 참여도가 매우 높습니다' };
  } else if (highPercentage >= 40) {
    return { status: 'good', message: '회원 참여도가 양호합니다' };
  } else if (highPercentage >= 25) {
    return { status: 'fair', message: '회원 참여도 개선이 필요합니다' };
  } else {
    return { status: 'needs-improvement', message: '회원 참여도 향상 프로그램이 필요합니다' };
  }
};

export const getLockerUtilizationStatus = (lockerStats: LockerStats): {
  status: 'high' | 'optimal' | 'low';
  message: string;
} => {
  const rate = lockerStats.occupancyRate;
  
  if (rate >= 90) {
    return { status: 'high', message: '락커 추가 설치를 고려해보세요' };
  } else if (rate >= 70) {
    return { status: 'optimal', message: '락커 이용률이 적정합니다' };
  } else {
    return { status: 'low', message: '락커 이용률이 낮습니다' };
  }
};

export const getRevenueGrowthStatus = (revenueStats: RevenueStats): {
  status: 'growing' | 'stable' | 'declining';
  message: string;
} => {
  if (!revenueStats.growth) {
    return { status: 'stable', message: '매출 추이를 분석 중입니다' };
  }
  
  const monthlyGrowth = revenueStats.growth.monthly;
  
  if (monthlyGrowth > 10) {
    return { status: 'growing', message: '매출이 크게 증가하고 있습니다' };
  } else if (monthlyGrowth > 0) {
    return { status: 'growing', message: '매출이 꾸준히 증가하고 있습니다' };
  } else if (monthlyGrowth > -5) {
    return { status: 'stable', message: '매출이 안정적입니다' };
  } else {
    return { status: 'declining', message: '매출 감소 원인 분석이 필요합니다' };
  }
};

// 알림 생성 함수들
export const generateExpiryAlerts = (upcomingExpiry: UpcomingExpiry) => {
  const alerts = [];
  
  if (upcomingExpiry.thisWeek > 0) {
    alerts.push({
      id: 'expiry-this-week',
      type: 'warning' as const,
      title: '회원권 만료 예정',
      message: `이번 주 ${upcomingExpiry.thisWeek}명의 회원권이 만료됩니다.`,
      timestamp: new Date().toISOString(),
      actionUrl: '/members?filter=expiring-this-week',
      actionText: '확인하기'
    });
  }
  
  if (upcomingExpiry.thisMonth > 10) {
    alerts.push({
      id: 'expiry-this-month',
      type: 'info' as const,
      title: '이번 달 만료 예정',
      message: `이번 달 ${upcomingExpiry.thisMonth}명의 회원권이 만료 예정입니다.`,
      timestamp: new Date().toISOString(),
      actionUrl: '/members?filter=expiring-this-month',
      actionText: '목록 보기'
    });
  }
  
  return alerts;
};

export const generateEngagementAlerts = (engagement: MemberEngagement) => {
  const alerts = [];
  const total = engagement.highEngagement + engagement.mediumEngagement + engagement.lowEngagement;
  
  if (engagement.lowEngagement > total * 0.3) {
    alerts.push({
      id: 'low-engagement',
      type: 'warning' as const,
      title: '회원 참여도 주의',
      message: `${engagement.lowEngagement}명의 회원이 낮은 참여도를 보이고 있습니다.`,
      timestamp: new Date().toISOString(),
      actionUrl: '/members?filter=low-engagement',
      actionText: '대상자 확인'
    });
  }
  
  return alerts;
};

// 검색 및 필터링 함수들
export const filterStatsByDateRange = (
  stats: DashboardStats,
  startDate: string,
  endDate: string
): Partial<DashboardStats> => {
  // 실제 구현에서는 서버에서 필터된 데이터를 가져와야 함
  // 여기서는 클라이언트 측 필터링 예시
  return {
    ...stats,
    // 날짜 범위에 따른 필터링 로직 구현
  };
};

export const searchMembers = (members: any[], searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return members.filter(member => 
    member.name.toLowerCase().includes(term) ||
    member.phone.includes(term) ||
    (member.email && member.email.toLowerCase().includes(term))
  );
};

// 데이터 검증 함수들
export const validateDashboardStats = (stats: any): stats is DashboardStats => {
  return (
    typeof stats === 'object' &&
    typeof stats.totalMembers === 'number' &&
    typeof stats.activeMembers === 'number' &&
    typeof stats.consultationMembers === 'number' &&
    typeof stats.attendanceToday === 'number' &&
    Array.isArray(stats.membershipDistribution) &&
    Array.isArray(stats.monthlyAttendance) &&
    typeof stats.recentActivities === 'object' &&
    typeof stats.lockerStats === 'object' &&
    typeof stats.revenueStats === 'object' &&
    typeof stats.memberEngagement === 'object' &&
    typeof stats.upcomingExpiry === 'object'
  );
};

// 성능 최적화 함수들
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 로컬 스토리지 유틸리티
export const saveUserPreferences = (preferences: any) => {
  try {
    localStorage.setItem('dashboard-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save user preferences:', error);
  }
};

export const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('dashboard-preferences');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load user preferences:', error);
    return null;
  }
}; 