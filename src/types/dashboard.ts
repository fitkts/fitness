// 대시보드 전용 타입 정의

export interface DashboardStats {
  // 기본 회원 통계
  totalMembers: number;
  activeMembers: number;
  consultationMembers: number;
  newMembersThisMonth: number;
  attendanceToday: number;
  
  // 회원권 분포
  membershipDistribution: MembershipDistribution[];
  
  // 출석 통계
  monthlyAttendance: MonthlyAttendance[];
  
  // 최근 활동
  recentActivities: RecentActivities;
  
  // 락커 통계
  lockerStats: LockerStats;
  
  // 매출 통계
  revenueStats: RevenueStats;
  
  // 회원 참여도
  memberEngagement: MemberEngagement;
  
  // 회원권 만료 예정
  upcomingExpiry: UpcomingExpiry;
}

export interface MembershipDistribution {
  type: string;
  count: number;
  percentage?: number;
  color?: string;
}

export interface MonthlyAttendance {
  month: string;
  count: number;
  growth?: number;
}

export interface RecentActivities {
  recentMembers: RecentMember[];
  recentAttendance: RecentAttendance[];
  recentConsultations?: RecentConsultation[];
}

export interface RecentMember {
  id: number;
  name: string;
  joinDate: string;
  membershipType?: string;
  isConsultation?: boolean;
}

export interface RecentAttendance {
  id: number;
  name: string;
  visitDate: string;
  membershipType?: string;
}

export interface RecentConsultation {
  id: number;
  name: string;
  consultationDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  staffName?: string;
}

export interface LockerStats {
  totalLockers: number;
  occupiedLockers: number;
  availableLockers: number;
  occupancyRate: number;
  maintenanceLockers?: number;
}

export interface RevenueStats {
  todaysRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue?: number;
  averagePerMember: number;
  growth?: {
    daily: number;
    monthly: number;
    yearly?: number;
  };
}

export interface MemberEngagement {
  highEngagement: number; // 주 3회 이상
  mediumEngagement: number; // 주 1-2회
  lowEngagement: number; // 주 1회 미만
  inactive?: number; // 2주 이상 미출석
}

export interface UpcomingExpiry {
  thisWeek: number;
  thisMonth: number;
  nextMonth: number;
  total?: number;
}

// KPI 카드 타입
export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  actionUrl?: string;
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  tension?: number;
}

// 알림 타입
export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

// 퀵 액션 타입
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  actionUrl: string;
  count?: number;
}

// 대시보드 위젯 타입
export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'list' | 'alert' | 'quickAction';
  title: string;
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  data: any;
  config?: {
    refreshInterval?: number;
    showHeader?: boolean;
    showFooter?: boolean;
  };
}

// 대시보드 레이아웃 타입
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 대시보드 필터 타입
export interface DashboardFilter {
  dateRange: {
    start: string;
    end: string;
  };
  membershipTypes?: string[];
  staffMembers?: number[];
  locations?: string[];
}

// 대시보드 상태 타입
export interface DashboardState {
  stats: DashboardStats | null;
  alerts: DashboardAlert[];
  quickActions: QuickAction[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  filter: DashboardFilter;
}

// 대시보드 액션 타입
export type DashboardAction = 
  | { type: 'FETCH_STATS_START' }
  | { type: 'FETCH_STATS_SUCCESS'; payload: DashboardStats }
  | { type: 'FETCH_STATS_ERROR'; payload: string }
  | { type: 'ADD_ALERT'; payload: DashboardAlert }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<DashboardFilter> }
  | { type: 'REFRESH_DATA' };

// 대시보드 설정 타입
export interface DashboardConfig {
  refreshInterval: number;
  defaultDateRange: number; // days
  maxAlerts: number;
  showAnimations: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
}

// 대시보드 메트릭 타입
export interface DashboardMetrics {
  conversionRate: number; // 상담 회원 -> 정식 회원 전환율
  retentionRate: number; // 회원 유지율
  averageSessionTime: number; // 평균 운동 시간
  popularTimeSlots: TimeSlot[];
  memberSatisfaction: number; // 회원 만족도 (1-5)
}

export interface TimeSlot {
  time: string;
  usage: number;
  capacity: number;
  utilizationRate: number;
}

// 대시보드 컴포넌트 props 타입
export interface DashboardProps {
  className?: string;
  refreshInterval?: number;
  compactMode?: boolean;
  showHeader?: boolean;
}

export interface KPICardProps {
  card: KPICard;
  onClick?: () => void;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ChartWidgetProps {
  title: string;
  data: ChartData;
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface AlertWidgetProps {
  alerts: DashboardAlert[];
  maxVisible?: number;
  onAlertClick?: (alert: DashboardAlert) => void;
  onAlertDismiss?: (alertId: string) => void;
}

export interface QuickActionGridProps {
  actions: QuickAction[];
  columns?: number;
  onActionClick?: (action: QuickAction) => void;
} 