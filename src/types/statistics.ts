import React from 'react';

// 기본 타입 정의
export type ViewType = 'daily' | 'weekly' | 'monthly';

// KPI 데이터 인터페이스
export interface KPIData {
  totalRevenue: number;
  revenueGrowth: number;
  totalMembers: number;
  memberGrowth: number;
  activeMembers: number;
  attendanceToday: number;
  averagePayment: number;
  averagePaymentGrowth: number;
  totalPayments: number;
  totalPaymentsGrowth: number;
  lockerUtilization: number;
  memberRetention: number;
  monthlyRecurring: number;
  newMembersThisMonth: number;
  monthlyVisitsAverage: number;
  renewalRate: number;
  ptUtilizationRate: number;
  // 직원 관련 KPI 데이터
  staffRevenue: any; // 직원별 매출 데이터
  staffMemberRegistration: any; // 직원별 회원 등록 데이터
  staffConsultation: any; // 직원별 상담 건수 데이터
  staffPerformanceScore: any; // 직원별 성과 점수 데이터
}

// KPI 카드 설정 인터페이스
export interface KPICardConfig {
  id: string;
  title: string;
  description: string;
  category: '매출' | '회원' | '운영' | '성과' | '직원';
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
}

// 미니 차트 데이터 인터페이스
export interface MiniChartData {
  name: string;
  value: number;
}

// KPI 카드 프롭스 인터페이스
export interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  chartData?: MiniChartData[];
  chartType?: 'line' | 'bar' | 'pie';
  onDetailClick: () => void;
}

// 필터 관련 타입
export type PaymentStatusFilter = '전체' | '완료' | '취소' | '환불';

// 날짜 범위 인터페이스
export interface DateRange {
  start: string;
  end: string;
}

// 빠른 날짜 범위 설정 인터페이스
export interface QuickDateRange {
  label: string;
  type: string;
  getRange: () => DateRange;
  getPrevRange: () => DateRange;
  getNextRange: () => DateRange;
} 