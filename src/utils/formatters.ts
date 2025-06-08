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

// 날짜 문자열 포맷팅 (로컬 시간대 기준으로 YYYY-MM-DD 형식 생성)
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 