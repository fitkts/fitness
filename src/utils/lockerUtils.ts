import { Locker } from '../models/types';
import { PAGINATION_CONFIG } from '../config/lockerConfig';
import { MONTHLY_FEE_CONFIG, RECOMMENDED_FEES_BY_SIZE } from '../config/lockerConfig';
import { LockerFeeValidation, LockerFeeCalculation, MemberLockerInfo, LockerStatusInfo } from '../types/locker';
import { LockerSize } from '../models/types';

/**
 * 락커 목록을 필터링합니다
 */
export const filterLockers = (
  lockers: Locker[],
  searchTerm: string,
  statusFilter: string
): Locker[] => {
  return lockers.filter(locker => {
    // 상태 필터링
    const statusMatch = statusFilter === 'all' || locker.status === statusFilter;
    
    // 검색어 필터링
    const searchMatch = !searchTerm || 
      locker.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locker.memberName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });
};

/**
 * 페이지네이션을 위한 데이터를 계산합니다
 */
export const calculatePagination = (totalItems: number, currentPage: number) => {
  const totalPages = Math.ceil(totalItems / PAGINATION_CONFIG.ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PAGINATION_CONFIG.ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + PAGINATION_CONFIG.ITEMS_PER_PAGE, totalItems);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * 페이지네이션 버튼 범위를 계산합니다
 */
export const getVisiblePageNumbers = (currentPage: number, totalPages: number): number[] => {
  const maxVisible = PAGINATION_CONFIG.MAX_VISIBLE_PAGES;
  const pages: number[] = [];
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  // 끝에서부터 계산했을 때 시작 페이지 조정
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
};

/**
 * 락커의 만료일까지 남은 일수를 계산합니다
 */
export const calculateDaysUntilExpiry = (endDate?: string): number | null => {
  if (!endDate) return null;
  
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 락커 번호를 정렬 가능한 형태로 변환합니다
 */
export const normalizeLockerNumber = (number: string): string => {
  // 숫자만 추출하여 정렬용 문자열 생성
  const numericPart = number.replace(/\D/g, '');
  const alphabeticPart = number.replace(/\d/g, '');
  
  // 숫자 부분을 0으로 패딩하여 정렬 가능하게 만듦
  const paddedNumeric = numericPart.padStart(10, '0');
  
  return `${alphabeticPart}${paddedNumeric}`;
};

/**
 * 락커 목록을 정렬합니다
 */
export const sortLockers = (lockers: Locker[], sortBy: 'number' | 'status' | 'memberName' = 'number'): Locker[] => {
  return [...lockers].sort((a, b) => {
    switch (sortBy) {
      case 'number':
        const normalizedA = normalizeLockerNumber(a.number || '');
        const normalizedB = normalizeLockerNumber(b.number || '');
        return normalizedA.localeCompare(normalizedB);
      
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      
      case 'memberName':
        return (a.memberName || '').localeCompare(b.memberName || '');
      
      default:
        return 0;
    }
  });
};

/**
 * 락커 목록을 다양한 방식으로 정렬합니다 (새로운 함수)
 */
export const sortLockersAdvanced = (lockers: Locker[], sortBy: string): Locker[] => {
  return [...lockers].sort((a, b) => {
    switch (sortBy) {
      case 'number_asc':
        const normalizedA = normalizeLockerNumber(a.number || '');
        const normalizedB = normalizeLockerNumber(b.number || '');
        return normalizedA.localeCompare(normalizedB);
      
      case 'number_desc':
        const normalizedA_desc = normalizeLockerNumber(a.number || '');
        const normalizedB_desc = normalizeLockerNumber(b.number || '');
        return normalizedB_desc.localeCompare(normalizedA_desc);
      
      case 'status':
        // 상태별 우선순위: available -> occupied -> maintenance
        const statusOrder = { 'available': 1, 'occupied': 2, 'maintenance': 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 99;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // 같은 상태일 경우 번호순으로 정렬
        return normalizeLockerNumber(a.number || '').localeCompare(normalizeLockerNumber(b.number || ''));
      
      case 'member_name':
        const nameA = a.memberName || '';
        const nameB = b.memberName || '';
        if (nameA !== nameB) return nameA.localeCompare(nameB);
        // 같은 이름일 경우 번호순으로 정렬
        return normalizeLockerNumber(a.number || '').localeCompare(normalizeLockerNumber(b.number || ''));
      
      case 'expiry_date':
        const expiryA = calculateDaysUntilExpiry(a.endDate);
        const expiryB = calculateDaysUntilExpiry(b.endDate);
        
        // 둘 다 만료일이 없는 경우
        if (expiryA === null && expiryB === null) {
          return normalizeLockerNumber(a.number || '').localeCompare(normalizeLockerNumber(b.number || ''));
        }
        // 하나만 만료일이 없는 경우 (만료일 있는 것을 앞으로)
        if (expiryA === null) return 1;
        if (expiryB === null) return -1;
        
        // 둘 다 만료일이 있는 경우 (임박한 순서대로)
        if (expiryA !== expiryB) return expiryA - expiryB;
        // 만료일이 같으면 번호순
        return normalizeLockerNumber(a.number || '').localeCompare(normalizeLockerNumber(b.number || ''));
      
      default:
        return normalizeLockerNumber(a.number || '').localeCompare(normalizeLockerNumber(b.number || ''));
    }
  });
};

/**
 * 월 사용료 유효성 검증
 */
export const validateMonthlyFee = (fee: number): LockerFeeValidation => {
  const { MIN, MAX } = MONTHLY_FEE_CONFIG;
  
  if (fee < MIN) {
    return {
      isValid: false,
      error: `월 사용료는 ${MIN.toLocaleString()}원 이상이어야 합니다`,
      min: MIN,
      max: MAX
    };
  }
  
  if (fee > MAX) {
    return {
      isValid: false,
      error: `월 사용료는 ${MAX.toLocaleString()}원 이하이어야 합니다`,
      min: MIN,
      max: MAX
    };
  }
  
  return {
    isValid: true,
    min: MIN,
    max: MAX
  };
};

/**
 * 락커 크기에 따른 추천 요금 반환
 */
export const getRecommendedFeeBySize = (size: LockerSize): number => {
  return RECOMMENDED_FEES_BY_SIZE[size] || MONTHLY_FEE_CONFIG.DEFAULT;
};

/**
 * 락커 사용료 계산 (할인 적용)
 */
export const calculateLockerFee = (
  monthlyFee: number,
  months: number,
  discountRate: number = 0
): LockerFeeCalculation => {
  const baseAmount = monthlyFee * months;
  const discountAmount = Math.floor(baseAmount * (discountRate / 100));
  const finalAmount = baseAmount - discountAmount;
  
  return {
    monthlyFee,
    totalMonths: months,
    baseAmount,
    discountAmount,
    finalAmount
  };
};

/**
 * 숫자를 원화 형식으로 포맷팅
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()}원`;
};

/**
 * 문자열을 숫자로 변환 (숫자가 아닌 문자 제거)
 */
export const parseNumberFromString = (value: string): number => {
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue, 10) || 0;
};

/**
 * 락커 상태 확인 (만료일 기준)
 */
export const getLockerStatus = (endDate: string): LockerStatusInfo => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) {
    return {
      status: 'expired',
      message: '사용 기간 만료',
      daysRemaining: 0,
      isActionRequired: true
    };
  }
  
  if (daysRemaining <= 7) {
    return {
      status: 'expiring_soon',
      message: `${daysRemaining}일 후 만료`,
      daysRemaining,
      isActionRequired: true
    };
  }
  
  return {
    status: 'active',
    message: `${daysRemaining}일 남음`,
    daysRemaining,
    isActionRequired: false
  };
};

/**
 * 회원 락커 정보 변환 (간단 표시용)
 */
export const convertToMemberLockerInfo = (locker: any): MemberLockerInfo | null => {
  if (!locker) return null;
  
  const statusInfo = getLockerStatus(locker.endDate);
  
  return {
    id: locker.id,
    number: locker.number,
    location: locker.location,
    size: locker.size,
    startDate: locker.startDate,
    endDate: locker.endDate,
    monthlyFee: locker.monthlyFee || MONTHLY_FEE_CONFIG.DEFAULT,
    status: statusInfo.status,
    daysRemaining: statusInfo.daysRemaining
  };
};

/**
 * 날짜 형식 변환 (YYYY-MM-DD → YYYY년 MM월 DD일)
 */
export const formatDateToKorean = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}; 