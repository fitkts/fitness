import { Payment, Member, Locker } from '../models/types';
import { ViewType, PaymentStatusFilter, MiniChartData } from '../types/statistics';

// 매출 차트 데이터 생성
export const generateRevenueChartData = (
  payments: Payment[],
  startDate: string,
  endDate: string,
  viewType: ViewType,
  statusFilter: PaymentStatusFilter
): MiniChartData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const isInRange = paymentDate >= start && paymentDate <= end;
    
    if (statusFilter === '전체') return isInRange;
    return isInRange && payment.status === statusFilter;
  });

  // 기간에 따른 데이터 그룹화
  const groupedData = new Map<string, number>();
  
  filteredPayments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groupedData.set(key, (groupedData.get(key) || 0) + payment.amount);
  });

  // 최근 7개 항목만 반환
  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, value]) => ({ name, value }));
};

// 결제 건수 차트 데이터 생성
export const generatePaymentCountChartData = (
  payments: Payment[],
  startDate: string,
  endDate: string,
  viewType: ViewType,
  statusFilter: PaymentStatusFilter
): MiniChartData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const isInRange = paymentDate >= start && paymentDate <= end;
    
    if (statusFilter === '전체') return isInRange;
    return isInRange && payment.status === statusFilter;
  });

  const groupedData = new Map<string, number>();
  
  filteredPayments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groupedData.set(key, (groupedData.get(key) || 0) + 1);
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, value]) => ({ name, value }));
};

// 평균 결제 금액 차트 데이터 생성
export const generateAveragePaymentChartData = (
  payments: Payment[],
  startDate: string,
  endDate: string,
  viewType: ViewType,
  statusFilter: PaymentStatusFilter
): MiniChartData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const isInRange = paymentDate >= start && paymentDate <= end;
    
    if (statusFilter === '전체') return isInRange;
    return isInRange && payment.status === statusFilter;
  });

  const groupedData = new Map<string, { total: number; count: number }>();
  
  filteredPayments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    const current = groupedData.get(key) || { total: 0, count: 0 };
    groupedData.set(key, {
      total: current.total + payment.amount,
      count: current.count + 1
    });
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, data]) => ({ 
    name, 
    value: data.count > 0 ? Math.round(data.total / data.count) : 0 
  }));
};

// 회원 수 차트 데이터 생성
export const generateMemberCountChartData = (
  members: Member[],
  viewType: ViewType
): MiniChartData[] => {
  const sortedMembers = [...members].sort((a, b) => 
    new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
  );

  const groupedData = new Map<string, number>();
  let cumulativeCount = 0;
  
  sortedMembers.forEach(member => {
    const date = new Date(member.joinDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    cumulativeCount++;
    groupedData.set(key, cumulativeCount);
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, value]) => ({ name, value }));
};

// 활성 회원 차트 데이터 생성
export const generateActiveMemberChartData = (
  members: Member[],
  viewType: ViewType
): MiniChartData[] => {
  const now = new Date();
  const activeMembers = members.filter(member => {
    const membershipEnd = new Date(member.membershipEnd);
    return membershipEnd >= now;
  });

  const groupedData = new Map<string, number>();
  
  activeMembers.forEach(member => {
    const date = new Date(member.joinDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groupedData.set(key, (groupedData.get(key) || 0) + 1);
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, value]) => ({ name, value }));
};

// 신규 회원 차트 데이터 생성
export const generateNewMemberChartData = (
  members: Member[],
  startDate: string,
  endDate: string,
  viewType: ViewType
): MiniChartData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const newMembers = members.filter(member => {
    const joinDate = new Date(member.joinDate);
    return joinDate >= start && joinDate <= end;
  });

  const groupedData = new Map<string, number>();
  
  newMembers.forEach(member => {
    const date = new Date(member.joinDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groupedData.set(key, (groupedData.get(key) || 0) + 1);
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, value]) => ({ name, value }));
};

// 회원 유지율 차트 데이터 생성
export const generateMemberRetentionChartData = (
  members: Member[],
  viewType: ViewType
): MiniChartData[] => {
  const now = new Date();
  const groupedData = new Map<string, { total: number; active: number }>();
  
  members.forEach(member => {
    const date = new Date(member.joinDate);
    let key = '';
    
    if (viewType === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    const current = groupedData.get(key) || { total: 0, active: 0 };
    const isActive = new Date(member.membershipEnd) >= now;
    
    groupedData.set(key, {
      total: current.total + 1,
      active: current.active + (isActive ? 1 : 0)
    });
  });

  const sortedEntries = Array.from(groupedData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return sortedEntries.map(([name, data]) => ({ 
    name, 
    value: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0 
  }));
};

// 플레이스홀더 차트 데이터 생성 함수들
export const generateAttendanceChartData = (): MiniChartData[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 50) + 20
  }));
};

export const generateLockerUtilizationChartData = (): MiniChartData[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 30) + 50
  }));
};

export const generateMonthlyVisitsChartData = (): MiniChartData[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    name: `Month ${i + 1}`,
    value: Math.floor(Math.random() * 5) + 10
  }));
};

export const generateRenewalRateChartData = (): MiniChartData[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    name: `Month ${i + 1}`,
    value: Math.floor(Math.random() * 20) + 70
  }));
};

export const generatePTUtilizationChartData = (): MiniChartData[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 40) + 30
  }));
}; 