import { Staff, StaffStatisticsData, StaffStatus, StaffFilter } from '../types/staff';

// 날짜 포맷팅 함수
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\.$/, '');
  } catch {
    return '-';
  }
};

// 직원 상태 계산
export const getStaffStatus = (status: StaffStatus): 'active' | 'inactive' => {
  return status === StaffStatus.ACTIVE ? 'active' : 'inactive';
};

// 직원 통계 계산
export const calculateStaffStatistics = (staff: Staff[]): StaffStatisticsData => {
  const total = staff.length;
  const active = staff.filter(s => s.status === StaffStatus.ACTIVE).length;
  const inactive = staff.filter(s => s.status === StaffStatus.INACTIVE).length;
  
  const byPosition: Record<string, number> = {};
  staff.forEach(s => {
    byPosition[s.position] = (byPosition[s.position] || 0) + 1;
  });
  
  return {
    total,
    active,
    inactive,
    byPosition,
  };
};

// 직원 필터링
export const filterStaff = (staff: Staff[], filter: StaffFilter): Staff[] => {
  return staff.filter(s => {
    // 검색어 필터
    if (filter.search && filter.search.trim() !== '') {
      const searchTerm = filter.search.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(searchTerm);
      const matchesPhone = s.phone?.toLowerCase().includes(searchTerm) || false;
      const matchesEmail = s.email?.toLowerCase().includes(searchTerm) || false;
      
      if (!matchesName && !matchesPhone && !matchesEmail) {
        return false;
      }
    }
    
    // 상태 필터
    if (filter.status && filter.status !== 'all') {
      if (s.status !== filter.status) {
        return false;
      }
    }
    
    // 직책 필터
    if (filter.position && filter.position !== 'all') {
      if (s.position !== filter.position) {
        return false;
      }
    }
    
    return true;
  });
};

// 직원 정렬
export const sortStaff = (staff: Staff[], sortKey: string, direction: 'ascending' | 'descending' | 'none'): Staff[] => {
  if (direction === 'none') return staff;
  
  return [...staff].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Staff];
    let bValue: any = b[sortKey as keyof Staff];
    
    // null/undefined 처리
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';
    
    // 문자열 비교
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ko');
      return direction === 'ascending' ? comparison : -comparison;
    }
    
    // 숫자 비교
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    
    // 날짜 비교
    if (sortKey === 'hireDate' || sortKey === 'birthDate' || sortKey === 'createdAt' || sortKey === 'updatedAt') {
      const aTime = new Date(aValue).getTime();
      const bTime = new Date(bValue).getTime();
      return direction === 'ascending' ? aTime - bTime : bTime - aTime;
    }
    
    return 0;
  });
};

// 페이지네이션 계산
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number,
  maxVisiblePages: number = 5
) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // 시작 페이지와 끝 페이지 계산
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 끝 페이지 기준으로 시작 페이지 재조정
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startPage,
    endPage,
    pageNumbers,
  };
};

// 전화번호 포맷팅
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7)
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 근무 기간 계산 (년/월)
export const calculateWorkPeriod = (hireDate: string): string => {
  if (!hireDate) return '-';
  
  try {
    const hire = new Date(hireDate);
    const now = new Date();
    
    let years = now.getFullYear() - hire.getFullYear();
    let months = now.getMonth() - hire.getMonth();
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    if (years > 0) {
      return months > 0 ? `${years}년 ${months}개월` : `${years}년`;
    } else {
      return months > 0 ? `${months}개월` : '신입';
    }
  } catch {
    return '-';
  }
};

// 나이 계산
export const calculateAge = (birthDate: string | undefined | null): string => {
  if (!birthDate) return '-';
  
  try {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age}세`;
  } catch {
    return '-';
  }
}; 