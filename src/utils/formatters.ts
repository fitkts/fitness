// 통화 포맷팅
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', { 
    style: 'currency', 
    currency: 'KRW' 
  }).format(value);
};

// 퍼센트 포맷팅
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// 숫자 포맷팅 (천 단위 구분)
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

// 날짜 문자열 포맷팅
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
}; 