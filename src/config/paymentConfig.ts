import { PaymentDateRange, PaymentAmountRange } from '../types/payment';

// 결제 상태 옵션
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: '완료', label: '완료' },
  { value: '취소', label: '취소' },
  { value: '환불', label: '환불' },
  { value: '대기', label: '대기' },
] as const;

// 결제 방법 옵션
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'all', label: '전체 결제 방법' },
  { value: '현금', label: '현금' },
  { value: '카드', label: '카드' },
  { value: '계좌이체', label: '계좌이체' },
  { value: '기타', label: '기타' },
] as const;

// 미리 정의된 날짜 범위
export const PREDEFINED_DATE_RANGES: PaymentDateRange[] = [
  {
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '최근 7일',
  },
  {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '최근 30일',
  },
  {
    startDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '최근 3개월',
  },
  {
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '올해',
  },
];

// 미리 정의된 금액 범위
export const PREDEFINED_AMOUNT_RANGES: PaymentAmountRange[] = [
  { min: 0, max: 50000, label: '5만원 이하' },
  { min: 50000, max: 100000, label: '5만원 - 10만원' },
  { min: 100000, max: 200000, label: '10만원 - 20만원' },
  { min: 200000, max: 500000, label: '20만원 - 50만원' },
  { min: 500000, max: Infinity, label: '50만원 이상' },
];

// 검색 필터 설정
export const FILTER_CONFIG = {
  SEARCH_PLACEHOLDER: '회원명 또는 영수증 번호로 검색...',
  MIN_SEARCH_LENGTH: 1,
  DEBOUNCE_DELAY: 300,
} as const;

// 통계 설정
export const STATISTICS_CONFIG = {
  TOP_MEMBERSHIP_TYPES_LIMIT: 5,
  MONTHLY_TREND_MONTHS: 12,
  CHART_COLORS: [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
  ],
} as const;

// 테이블 설정
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_HEIGHT: '600px',
  STICKY_HEADER_Z_INDEX: 10,
} as const;

// 날짜 포맷 설정
export const DATE_FORMAT = {
  DISPLAY: 'ko-KR',
  INPUT: 'YYYY-MM-DD',
} as const; 