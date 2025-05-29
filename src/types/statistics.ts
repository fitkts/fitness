import React from 'react';

// 뷰 타입 정의
export type ViewType = 'daily' | 'weekly' | 'monthly';

// 결제 상태 필터 타입 (기존 코드 호환성)
export type PaymentStatusFilter = '전체' | '완료' | '취소' | '환불';

// 필터 상태 타입
export type StatusFilterType = '전체' | '완료' | '취소' | '환불';

// KPI 데이터 타입
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
}

// KPI 카드 설정 타입
export interface KPICardConfig {
  id: string;
  title: string;
  description: string;
  category: '매출' | '회원' | '운영' | '성과';
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
}

// 미니 차트 데이터 타입
export interface MiniChartData {
  name: string;
  value: number;
}

// KPI 카드 컴포넌트 Props 타입
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

// 빠른 날짜 범위 설정 타입
export interface QuickDateRange {
  label: string;
  type: string;
  getRange: () => { start: string; end: string };
  getPrevRange: () => { start: string; end: string };
  getNextRange: () => { start: string; end: string };
} 