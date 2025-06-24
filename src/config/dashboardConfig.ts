import { KPICard, QuickAction, ChartData, DashboardConfig } from '../types/dashboard';

// 대시보드 기본 설정
export const DASHBOARD_CONFIG: DashboardConfig = {
  refreshInterval: 300000, // 5분 (밀리초)
  defaultDateRange: 30, // 30일
  maxAlerts: 5,
  showAnimations: true,
  autoRefresh: true,
  compactMode: false,
};

// KPI 카드 설정
export const KPI_CARD_CONFIGS: KPICard[] = [
  {
    id: 'total-members',
    title: '총 회원 수',
    value: 0,
    subtitle: '전체 등록 회원',
    icon: 'Users',
    color: 'blue',
    actionUrl: '/members',
  },
  {
    id: 'active-members',
    title: '활성 회원',
    value: 0,
    subtitle: '최근 30일 활동',
    icon: 'UserCheck',
    color: 'green',
    actionUrl: '/members?filter=active',
  },
  {
    id: 'consultation-members',
    title: '상담 회원',
    value: 0,
    subtitle: '승격 대기 중',
    icon: 'MessageCircle',
    color: 'yellow',
    actionUrl: '/consultation',
  },
  {
    id: 'attendance-today',
    title: '오늘 출석',
    value: 0,
    subtitle: '현재까지 출석',
    icon: 'Calendar',
    color: 'purple',
    actionUrl: '/attendance',
  },
  {
    id: 'locker-occupancy',
    title: '락커 점유율',
    value: 0,
    subtitle: '사용 중 락커',
    icon: 'Key',
    color: 'indigo',
    actionUrl: '/lockers',
  },
  {
    id: 'todays-revenue',
    title: '오늘 매출',
    value: 0,
    subtitle: '신규 결제 포함',
    icon: 'CreditCard',
    color: 'green',
    actionUrl: '/payments',
  },
  {
    id: 'monthly-revenue',
    title: '이번 달 매출',
    value: 0,
    subtitle: '목표 대비 진행률',
    icon: 'TrendingUp',
    color: 'blue',
    actionUrl: '/payments?period=month',
  },
  {
    id: 'expiring-soon',
    title: '만료 예정',
    value: 0,
    subtitle: '이번 주 만료',
    icon: 'AlertCircle',
    color: 'red',
    actionUrl: '/members?filter=expiring',
  },
];

// 퀵 액션 설정
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'add-member',
    title: '회원 등록',
    description: '새로운 회원을 등록합니다',
    icon: 'UserPlus',
    color: 'blue',
    actionUrl: '/members/new',
  },
  {
    id: 'add-consultation',
    title: '상담 등록',
    description: '새로운 상담을 등록합니다',
    icon: 'MessageSquare',
    color: 'green',
    actionUrl: '/consultation/new',
  },
  {
    id: 'process-payment',
    title: '결제 처리',
    description: '회원권 결제를 처리합니다',
    icon: 'CreditCard',
    color: 'purple',
    actionUrl: '/payments/new',
  },
  {
    id: 'manage-lockers',
    title: '락커 관리',
    description: '락커 배정 및 관리',
    icon: 'Key',
    color: 'indigo',
    actionUrl: '/lockers',
  },
  {
    id: 'check-attendance',
    title: '출석 체크',
    description: '회원 출석을 체크합니다',
    icon: 'CheckCircle',
    color: 'yellow',
    actionUrl: '/attendance/check',
  },
  {
    id: 'view-statistics',
    title: '통계 보기',
    description: '상세 통계를 확인합니다',
    icon: 'BarChart',
    color: 'red',
    actionUrl: '/statistics',
  },
];

// 차트 색상 팔레트 (피트니스 테마)
export const CHART_COLORS = {
  primary: [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
  ],
  gradients: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(132, 204, 22, 0.8)',
    'rgba(249, 115, 22, 0.8)',
  ],
  backgrounds: [
    'rgba(59, 130, 246, 0.1)',
    'rgba(16, 185, 129, 0.1)',
    'rgba(245, 158, 11, 0.1)',
    'rgba(239, 68, 68, 0.1)',
    'rgba(139, 92, 246, 0.1)',
    'rgba(6, 182, 212, 0.1)',
    'rgba(132, 204, 22, 0.1)',
    'rgba(249, 115, 22, 0.1)',
  ],
};

// 차트 공통 옵션
export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

// 대시보드 레이아웃 설정
export const DASHBOARD_LAYOUT = {
  // 모바일 레이아웃
  mobile: {
    kpiCards: {
      columns: 1,
      gap: 4,
    },
    charts: {
      columns: 1,
      height: 300,
    },
  },
  // 태블릿 레이아웃
  tablet: {
    kpiCards: {
      columns: 2,
      gap: 4,
    },
    charts: {
      columns: 2,
      height: 350,
    },
  },
  // 데스크탑 레이아웃
  desktop: {
    kpiCards: {
      columns: 4,
      gap: 6,
    },
    charts: {
      columns: 2,
      height: 400,
    },
  },
};

// 피트니스 센터 운영 시간
export const OPERATING_HOURS = {
  weekdays: {
    open: '06:00',
    close: '23:00',
  },
  weekends: {
    open: '08:00',
    close: '21:00',
  },
  holidays: {
    open: '09:00',
    close: '18:00',
  },
};

// 회원권 카테고리 설정
export const MEMBERSHIP_CATEGORIES = {
  monthly: {
    name: '월간 회원권',
    color: '#3B82F6',
    types: ['1개월', '3개월', '6개월', '12개월'],
  },
  pt: {
    name: 'PT 회원권',
    color: '#10B981',
    types: ['PT 10회', 'PT 20회', 'PT 30회', 'PT 무제한'],
  },
  combo: {
    name: '복합 회원권',
    color: '#F59E0B',
    types: ['헬스+PT', '헬스+수영', '올인원'],
  },
};

// 회원 참여도 임계값
export const ENGAGEMENT_THRESHOLDS = {
  high: 3, // 주 3회 이상
  medium: 1, // 주 1-2회
  low: 0, // 주 1회 미만
  inactive: 14, // 14일 이상 미출석
};

// 대시보드 새로고침 간격 옵션
export const REFRESH_INTERVALS = [
  { label: '실시간', value: 30000 }, // 30초
  { label: '1분', value: 60000 },
  { label: '3분', value: 180000 },
  { label: '5분', value: 300000 },
  { label: '10분', value: 600000 },
  { label: '수동', value: 0 },
];

// 날짜 범위 옵션
export const DATE_RANGE_OPTIONS = [
  { label: '오늘', value: 1 },
  { label: '어제', value: 2 },
  { label: '이번 주', value: 7 },
  { label: '지난 주', value: 14 },
  { label: '이번 달', value: 30 },
  { label: '지난 달', value: 60 },
  { label: '3개월', value: 90 },
  { label: '6개월', value: 180 },
  { label: '1년', value: 365 },
];

// 알림 설정
export const ALERT_SETTINGS = {
  types: {
    membershipExpiry: {
      enabled: true,
      threshold: 7, // 7일 전 알림
      priority: 'high',
    },
    lowAttendance: {
      enabled: true,
      threshold: 14, // 14일 미출석 시 알림
      priority: 'medium',
    },
    paymentDue: {
      enabled: true,
      threshold: 3, // 3일 전 알림
      priority: 'high',
    },
    lockerExpiry: {
      enabled: true,
      threshold: 7, // 7일 전 알림
      priority: 'medium',
    },
    systemMaintenance: {
      enabled: true,
      priority: 'low',
    },
  },
  display: {
    maxVisible: 5,
    autoHide: true,
    autoHideDelay: 5000, // 5초 후 자동 숨김
  },
};

// 대시보드 권한 설정
export const DASHBOARD_PERMISSIONS = {
  admin: {
    viewAll: true,
    editSettings: true,
    manageUsers: true,
    viewFinancials: true,
    exportData: true,
  },
  manager: {
    viewAll: true,
    editSettings: false,
    manageUsers: true,
    viewFinancials: true,
    exportData: true,
  },
  staff: {
    viewAll: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
    exportData: false,
  },
  trainer: {
    viewAll: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
    exportData: false,
  },
}; 