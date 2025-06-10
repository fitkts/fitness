/**
 * 날짜 포맷팅 함수
 * Unix timestamp 또는 ISO 문자열을 한국어 날짜 형식으로 변환
 */
export const formatDate = (timestamp: string | number): string => {
  try {
    let date: Date;
    
    if (typeof timestamp === 'string') {
      // ISO 문자열인 경우
      date = new Date(timestamp);
    } else {
      // Unix timestamp인 경우 (초 단위를 밀리초로 변환)
      date = new Date(timestamp * 1000);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return '날짜 없음';
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '날짜 없음';
  }
};

/**
 * 통화 포맷팅 함수
 * 숫자를 한국 원화 형식으로 변환
 */
export const formatCurrency = (amount: number): string => {
  try {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0원';
    }
    
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  } catch (error) {
    console.error('통화 포맷팅 오류:', error);
    return '0원';
  }
};

/**
 * 숫자 포맷팅 함수
 * 천 단위 구분자를 추가
 */
export const formatNumber = (num: number): string => {
  try {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }
    
    return new Intl.NumberFormat('ko-KR').format(num);
  } catch (error) {
    console.error('숫자 포맷팅 오류:', error);
    return '0';
  }
};

/**
 * 퍼센트 포맷팅 함수
 * 소수를 퍼센트로 변환 (0.75 → 75%)
 */
export const formatPercent = (ratio: number, decimals: number = 1): string => {
  try {
    if (typeof ratio !== 'number' || isNaN(ratio)) {
      return '0%';
    }
    
    return `${(ratio * 100).toFixed(decimals)}%`;
  } catch (error) {
    console.error('퍼센트 포맷팅 오류:', error);
    return '0%';
  }
};

/**
 * 날짜 범위 검증 함수
 * 시작일이 종료일보다 이른지 확인
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  try {
    if (!startDate || !endDate) {
      return true; // 빈 값은 유효한 것으로 간주
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start <= end;
  } catch (error) {
    console.error('날짜 범위 검증 오류:', error);
    return false;
  }
};

/**
 * 페이지네이션 정보 계산 함수
 */
export const calculatePagination = (totalCount: number, pageSize: number, currentPage: number) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * 검색 키워드 하이라이트 함수
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) {
    return text;
  }
  
  try {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  } catch (error) {
    console.error('검색어 하이라이트 오류:', error);
    return text;
  }
};

/**
 * 사용 기간 계산 함수
 * 시작일과 종료일 사이의 일수 계산
 */
export const calculateUsageDuration = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('사용 기간 계산 오류:', error);
    return 0;
  }
}; 