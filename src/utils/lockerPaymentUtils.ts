import { LockerPaymentCalculation, PaymentValidationResult, PaymentValidationData } from '../types/lockerPayment';
import { DISCOUNT_POLICY, VALIDATION_MESSAGES } from '../config/lockerPaymentConfig';

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 날짜에 개월 수를 더하는 함수
 */
export const addMonthsToDate = (dateStr: string, months: number): string => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  
  // 월 말일 처리 (예: 1월 31일 + 1개월 = 2월 28일)
  const targetMonth = (new Date(dateStr).getMonth() + months) % 12;
  if (date.getMonth() !== targetMonth && targetMonth !== 0) {
    date.setDate(0); // 이전 월의 마지막 날로 설정
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * 두 날짜 사이의 월 차이 계산
 */
export const calculateMonthsDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return (end.getFullYear() - start.getFullYear()) * 12 + 
         (end.getMonth() - start.getMonth());
};

/**
 * 월 수에 따른 할인율 계산
 */
export const calculateDiscount = (months: number): number => {
  if (months >= DISCOUNT_POLICY.TWELVE_MONTHS.minMonths) {
    return DISCOUNT_POLICY.TWELVE_MONTHS.rate;
  } else if (months >= DISCOUNT_POLICY.SIX_MONTHS.minMonths) {
    return DISCOUNT_POLICY.SIX_MONTHS.rate;
  } else if (months >= DISCOUNT_POLICY.THREE_MONTHS.minMonths) {
    return DISCOUNT_POLICY.THREE_MONTHS.rate;
  }
  return 0;
};

/**
 * 할인 설명 가져오기
 */
export const getDiscountDescription = (months: number): string | null => {
  const discountRate = calculateDiscount(months);
  if (discountRate === 0) return null;
  
  return `${months}개월 이상 사용 시 ${discountRate}% 할인 혜택!`;
};

/**
 * 완전한 결제 계산 (시작일, 종료일, 할인 포함)
 */
export const calculateFullPayment = (
  months: number,
  monthlyFee: number,
  startDate: string,
  isExtension: boolean = false,
  currentEndDate?: string
): LockerPaymentCalculation => {
  const originalAmount = months * monthlyFee;
  const discountRate = calculateDiscount(months);
  const discountAmount = Math.floor(originalAmount * (discountRate / 100));
  const finalAmount = originalAmount - discountAmount;
  
  let actualStartDate = startDate;
  if (isExtension && currentEndDate) {
    actualStartDate = currentEndDate; // 연장의 경우 기존 종료일부터 시작
  }
  
  const endDate = addMonthsToDate(actualStartDate, months);

  return {
    originalAmount,
    discountRate,
    discountAmount,
    finalAmount,
    startDate: actualStartDate,
    endDate,
  };
};

/**
 * 금액을 한국 원화 형식으로 포맷팅
 */
export const formatCurrency = (amount: number): string => {
  return `${formatNumber(Math.round(amount))}원`;
};

/**
 * 숫자에 천 단위 구분자 추가
 */
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDateKorean = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * 결제 데이터 유효성 검증
 */
export const validatePaymentData = (data: PaymentValidationData): PaymentValidationResult => {
  const errors: Record<string, string> = {};

  // 월 수 검증
  if (!data.months || data.months < 1) {
    errors.months = VALIDATION_MESSAGES.MONTHS_MIN;
  } else if (data.months > 12) {
    errors.months = VALIDATION_MESSAGES.MONTHS_MAX;
  }

  // 결제 방법 검증
  if (!data.paymentMethod) {
    errors.paymentMethod = VALIDATION_MESSAGES.PAYMENT_METHOD_REQUIRED;
  }

  // 시작일 검증
  if (!data.startDate) {
    errors.startDate = VALIDATION_MESSAGES.START_DATE_REQUIRED;
  } else {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘 날짜는 허용, 과거 날짜만 오류
    if (startDate < today) {
      errors.startDate = VALIDATION_MESSAGES.START_DATE_FUTURE;
    }
  }

  // 금액 검증
  if (!data.amount || data.amount <= 0) {
    errors.amount = VALIDATION_MESSAGES.AMOUNT_MIN;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 락커 결제 히스토리 메모 생성
 */
export const generatePaymentHistoryNote = (
  lockerNumber: string,
  months: number,
  startDate: string,
  endDate: string
): string => {
  return `락커 ${lockerNumber} ${months}개월 사용 (${formatDateKorean(startDate)} ~ ${formatDateKorean(endDate)})`;
};