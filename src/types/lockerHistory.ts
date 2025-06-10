/**
 * 락커 히스토리 타입 정의
 * 락커 상태 변경, 사용 이력 추적을 위한 타입들
 */

export interface LockerHistory {
  id?: number;
  lockerId: number;
  lockerNumber: string;
  memberId?: number;
  memberName?: string;
  action: LockerHistoryAction;
  previousStatus: LockerStatus;
  newStatus: LockerStatus;
  startDate?: string; // ISO 날짜 문자열 (YYYY-MM-DD)
  endDate?: string;   // ISO 날짜 문자열 (YYYY-MM-DD)
  amount?: number;    // 결제 금액 (해당하는 경우)
  notes?: string;
  staffId?: number;
  staffName?: string;
  createdAt?: string; // ISO 날짜 문자열
  updatedAt?: string; // ISO 날짜 문자열
}

export type LockerHistoryAction = 
  | 'assign'      // 락커 배정
  | 'release'     // 락커 해제
  | 'extend'      // 기간 연장
  | 'transfer'    // 다른 회원으로 이전
  | 'maintenance' // 정비 상태로 변경
  | 'repair'      // 수리 완료
  | 'payment'     // 결제 처리
  | 'expire';     // 만료 처리

export type LockerStatus = 'available' | 'occupied' | 'maintenance';

export interface LockerStatistics {
  totalLockers: number;
  availableLockers: number;
  occupiedLockers: number;
  maintenanceLockers: number;
  occupancyRate: number;
  availabilityRate: number;
  monthlyRevenue: number;
  averageUsageDuration: number;
  renewalRate: number;
  popularSizes: { size: string; count: number }[];
  expiringWithin7Days: LockerExpiringInfo[];
}

export interface LockerExpiringInfo {
  id: number;
  number: string;
  memberName: string;
  endDate: string;
  daysRemaining: number;
}

export interface LockerUsagePattern {
  memberId: number;
  memberName: string;
  lockerHistory: {
    lockerNumber: string;
    startDate: string;
    endDate: string;
    duration: number; // 사용 일수
    status: 'active' | 'completed' | 'expired';
  }[];
  totalUsageDays: number;
  averageUsageDuration: number;
  renewalCount: number;
}

export interface LockerRevenue {
  lockerId: number;
  lockerNumber: string;
  payments: {
    amount: number;
    paymentDate: string;
    memberName: string;
    period: string; // "2025-01 ~ 2025-02"
  }[];
  totalRevenue: number;
  monthlyAverage: number;
}

export interface LockerHistoryFilter {
  lockerId?: number;
  memberId?: number;
  action?: LockerHistoryAction;
  status?: LockerStatus;
  startDate?: string; // 조회 시작일
  endDate?: string;   // 조회 종료일
  page?: number;
  pageSize?: number;
}

export interface LockerDashboardData {
  statistics: LockerStatistics;
  recentActivities: LockerHistory[];
  expiringLockers: LockerExpiringInfo[];
  revenueChart: {
    month: string;
    revenue: number;
    lockerCount: number;
  }[];
  usagePatterns: {
    hourly: { hour: number; count: number }[];
    daily: { day: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
} 