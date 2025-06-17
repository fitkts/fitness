import { MembershipTypeFilter, PaymentStatistics } from '../types/payment';
import { Payment as PaymentModel, MembershipType } from '../models/types';
import { STATISTICS_CONFIG } from '../config/paymentConfig';

// PaymentFilter 인터페이스를 여기서 다시 정의 (실제 Payment 모델에 맞춰서)
export interface PaymentFilter {
  search?: string;
  status?: 'all' | '완료' | '취소' | '환불' | '대기';
  membershipType?: string;
  paymentMethod?: 'all' | '현금' | '카드' | '계좌이체' | '기타';
  staffName?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// 결제 데이터 필터링 함수
export const filterPayments = (payments: PaymentModel[], filter: PaymentFilter): PaymentModel[] => {
  return payments.filter(payment => {
    // 회원명으로 검색
    if (filter.search && filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase();
      const memberName = (payment.memberName || '').toLowerCase();
      const receiptNumber = (payment.receiptNumber || '').toLowerCase();
      if (!memberName.includes(searchTerm) && !receiptNumber.includes(searchTerm)) {
        return false;
      }
    }

    // 결제 상태 필터
    if (filter.status && filter.status !== 'all' && payment.status !== filter.status) {
      return false;
    }

    // 이용권 종류 필터
    if (filter.membershipType && filter.membershipType !== 'all' && payment.membershipType !== filter.membershipType) {
      return false;
    }

    // 결제 방법 필터
    if (filter.paymentMethod && filter.paymentMethod !== 'all' && payment.paymentMethod !== filter.paymentMethod) {
      return false;
    }

    // 날짜 범위 필터
    if (filter.startDate) {
      const paymentDate = new Date(payment.paymentDate);
      const startDate = new Date(filter.startDate);
      if (paymentDate < startDate) {
        return false;
      }
    }

    if (filter.endDate) {
      const paymentDate = new Date(payment.paymentDate);
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝까지 포함
      if (paymentDate > endDate) {
        return false;
      }
    }

    // 금액 범위 필터
    if (filter.minAmount !== undefined && payment.amount < filter.minAmount) {
      return false;
    }

    if (filter.maxAmount !== undefined && payment.amount > filter.maxAmount) {
      return false;
    }

    return true;
  });
};

// 이용권 종류 데이터 필터링 함수
export const filterMembershipTypes = (types: MembershipType[], filter: MembershipTypeFilter): MembershipType[] => {
  return types.filter(type => {
    // 이용권명으로 검색
    if (filter.search && filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase();
      const name = (type.name || '').toLowerCase();
      const description = (type.description || '').toLowerCase();
      if (!name.includes(searchTerm) && !description.includes(searchTerm)) {
        return false;
      }
    }

    // 가격 범위 필터
    if (filter.minPrice !== undefined && type.price < filter.minPrice) {
      return false;
    }

    if (filter.maxPrice !== undefined && type.price > filter.maxPrice) {
      return false;
    }

    // 기간 범위 필터
    if (filter.minDuration !== undefined && type.durationMonths < filter.minDuration) {
      return false;
    }

    if (filter.maxDuration !== undefined && type.durationMonths > filter.maxDuration) {
      return false;
    }

    return true;
  });
};

// 결제 통계 계산 함수
export const calculatePaymentStatistics = (payments: PaymentModel[]): PaymentStatistics => {
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // 상태별 집계
  const completedPayments = payments.filter(p => p.status === '완료');
  const completedAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const canceledPayments = payments.filter(p => p.status === '취소');
  const canceledAmount = canceledPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const refundedPayments = payments.filter(p => p.status === '환불');
  const refundedAmount = refundedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // 평균 결제 금액
  const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

  // 인기 이용권 종류 집계
  const membershipTypeCounts: Record<string, { count: number; amount: number }> = {};
  payments.forEach(payment => {
    if (!membershipTypeCounts[payment.membershipType]) {
      membershipTypeCounts[payment.membershipType] = { count: 0, amount: 0 };
    }
    membershipTypeCounts[payment.membershipType].count++;
    membershipTypeCounts[payment.membershipType].amount += payment.amount;
  });

  const topMembershipTypes = Object.entries(membershipTypeCounts)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, STATISTICS_CONFIG.TOP_MEMBERSHIP_TYPES_LIMIT);

  // 월별 결제 추이 계산
  const monthlyData: Record<string, { count: number; amount: number }> = {};
  payments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, amount: 0 };
    }
    monthlyData[monthKey].count++;
    monthlyData[monthKey].amount += payment.amount;
  });

  const monthlyTrend = Object.entries(monthlyData)
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-STATISTICS_CONFIG.MONTHLY_TREND_MONTHS);

  return {
    totalPayments,
    totalAmount,
    completedPayments: completedPayments.length,
    completedAmount,
    canceledPayments: canceledPayments.length,
    canceledAmount,
    refundedPayments: refundedPayments.length,
    refundedAmount,
    averageAmount,
    topMembershipTypes,
    monthlyTrend,
  };
};

// 날짜 포맷팅 함수
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '유효하지 않은 날짜';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return '날짜 변환 오류';
  }
};

// 통화 포맷팅 함수
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0원';
  return new Intl.NumberFormat('ko-KR', { 
    style: 'currency', 
    currency: 'KRW' 
  }).format(value);
};

// 숫자 포맷팅 함수 (콤마 추가)
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('ko-KR').format(value);
};

// 월 이름 포맷팅 함수
export const formatMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${year}년 ${month}월`;
};

// 결제 상태 뱃지 색상 함수
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case '완료':
      return 'bg-green-100 text-green-800';
    case '취소':
      return 'bg-red-100 text-red-800';
    case '환불':
      return 'bg-yellow-100 text-yellow-800';
    case '대기':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 결제 방법 아이콘 함수
export const getPaymentMethodIcon = (method: string): string => {
  switch (method) {
    case '카드':
      return '💳';
    case '현금':
      return '💵';
    case '계좌이체':
      return '🏦';
    default:
      return '💰';
  }
}; 