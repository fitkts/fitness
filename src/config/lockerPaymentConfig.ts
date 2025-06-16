// 락커 결제 관련 설정
import { PaymentMethod } from '../types/lockerPayment';

// 월 옵션 설정
export const MONTH_OPTIONS = [
  { value: 1, label: '1개월', popular: false },
  { value: 3, label: '3개월', popular: true },
  { value: 6, label: '6개월', popular: true },
  { value: 12, label: '12개월', popular: false },
] as const;

// 결제 방법 옵션
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash' as PaymentMethod, label: '현금', icon: '💵' },
  { value: 'card' as PaymentMethod, label: '카드', icon: '💳' },
  { value: 'transfer' as PaymentMethod, label: '계좌이체', icon: '🏦' },
  { value: 'other' as PaymentMethod, label: '기타', icon: '📋' },
] as const;

// 폼 관련 설정
export const PAYMENT_FORM_CONFIG = {
  TITLE: '락커 결제',
  EXTENSION_TITLE: '락커 연장',
  MONTHS_LABEL: '사용 기간',
  START_DATE_LABEL: '시작일',
  PAYMENT_METHOD_LABEL: '결제 방법',
  NOTES_LABEL: '비고',
  SUBMIT_BUTTON: '결제 완료',
  CANCEL_BUTTON: '취소',
  LOADING_TEXT: '결제 처리 중...',
} as const;

// 유효성 검증 메시지
export const VALIDATION_MESSAGES = {
  MONTHS_REQUIRED: '사용 기간을 선택해주세요',
  MONTHS_MIN: '최소 1개월 이상 선택해주세요',
  MONTHS_MAX: '최대 12개월까지 선택 가능합니다',
  START_DATE_REQUIRED: '시작일을 선택해주세요',
  START_DATE_FUTURE: '시작일은 오늘 이후여야 합니다',
  PAYMENT_METHOD_REQUIRED: '결제 방법을 선택해주세요',
  AMOUNT_REQUIRED: '결제 금액이 필요합니다',
  AMOUNT_MIN: '결제 금액은 0원보다 커야 합니다',
} as const;

// 사용자 메시지
export const MESSAGES = {
  PAYMENT_SUCCESS: '결제가 성공적으로 완료되었습니다',
  EXTENSION_SUCCESS: '락커 연장이 성공적으로 완료되었습니다',
  PAYMENT_ERROR: '결제 처리 중 오류가 발생했습니다',
  VALIDATION_ERROR: '입력 정보를 확인해주세요',
} as const;

// 스타일 클래스
export const STYLE_CLASSES = {
  AMOUNT_HIGHLIGHT: 'text-xl font-bold text-blue-600',
  DISCOUNT_AMOUNT: 'text-red-500 font-medium',
  ORIGINAL_AMOUNT: 'line-through text-gray-500',
  POPULAR_BADGE: 'text-xs bg-orange-500 text-white px-1 py-0.5 rounded',
} as const;

// 할인 정책 설정
export const DISCOUNT_POLICY = {
  THREE_MONTHS: { rate: 5, minMonths: 3 },   // 3개월 이상 5% 할인
  SIX_MONTHS: { rate: 10, minMonths: 6 },    // 6개월 이상 10% 할인
  TWELVE_MONTHS: { rate: 15, minMonths: 12 }, // 12개월 이상 15% 할인
} as const;

// 기본 락커 월 사용료 (설정 가능)
export const DEFAULT_MONTHLY_FEE = 50000; 