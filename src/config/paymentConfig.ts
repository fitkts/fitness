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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '오늘',
  },
  {
    startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '이번 주',
  },
  {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '이번 달',
  },
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
];

// 미리 정의된 금액 범위
export const PREDEFINED_AMOUNT_RANGES: PaymentAmountRange[] = [
  { min: 0, max: 500000, label: '~50만원' },
  { min: 500000, max: 1000000, label: '50~100만원' },
  { min: 1000000, max: Infinity, label: '100만원~' },
  { min: 0, max: 50000, label: '5만원 이하' },
  { min: 50000, max: 100000, label: '5만원 - 10만원' },
  { min: 100000, max: 200000, label: '10만원 - 20만원' },
  { min: 200000, max: 500000, label: '20만원 - 50만원' },
];

// 검색 필터 설정
export const FILTER_CONFIG = {
  SEARCH_PLACEHOLDER: '회원명 또는 영수증 번호로 검색...',
  MIN_SEARCH_LENGTH: 1,
  DEBOUNCE_DELAY: 300,
  MAX_SEARCH_RESULTS: 50,
} as const;

// 정렬 설정
export const SORT_CONFIG = {
  DEFAULT_DIRECTION: 'descending' as const,
  SORTABLE_FIELDS: ['paymentDate', 'amount', 'memberName'] as const,
} as const;

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  MAX_VISIBLE_PAGES: 5,
} as const;

// 날짜 형식 설정
export const DATE_CONFIG = {
  DISPLAY: 'ko-KR',
  INPUT: 'YYYY-MM-DD',
} as const;

// 액션 버튼 설정
export const ACTION_BUTTON_CONFIG = {
  ADD_PAYMENT: {
    text: '결제 등록',
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  ADD_MEMBERSHIP_TYPE: {
    text: '이용권 등록',
    className: 'bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  EXCEL_BUTTONS: {
    container: 'flex gap-0.5 items-center',
    button: 'bg-gray-100 border-none rounded p-1.5 cursor-pointer hover:bg-gray-200',
    infoButton: 'bg-transparent border-none p-0.5 cursor-pointer',
    iconSize: 14,
    infoIconSize: 13,
  },
  ACTION_GROUP: {
    container: 'flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300',
    buttonGroup: 'flex items-center gap-1.5',
  },
} as const;

// 컴팩트 레이아웃 설정
export const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: '',
    headerPadding: 'px-3 py-1.5',
    contentPadding: 'p-2.5',
  },
  INPUT_FIELD: {
    padding: 'py-1',
    textSize: 'text-xs',
    labelSize: 'text-xs',
    labelMargin: 'mb-0.5',
  },
  GRID: {
    gap: 'gap-2',
    responsive: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    rangeSection: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  },
  HEADER: {
    title: 'text-xs font-medium text-gray-900',
    badge: 'text-xs',
    icon: 14,
  },
  RANGE_SECTION: {
    title: 'text-xs font-medium text-gray-700',
    iconSize: 14,
    gridGap: 'gap-2',
    presetContainer: 'flex flex-wrap gap-1',
    presetButton: 'px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors',
  },
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

// 테이블 컴팩트 레이아웃 설정 (회원관리와 동일)
export const TABLE_COMPACT_CONFIG = {
  HEADER: {
    containerPadding: 'py-2', // 기존 py-3에서 줄임
    cellPadding: 'px-4 py-2', // 기존 py-3에서 줄임
    iconSize: 16, // 기존 18에서 줄임
    badgeTextSize: 'text-xs',
  },
  CELL: {
    padding: 'px-4 py-2', // 기존 py-3에서 줄임
    textSize: 'text-sm',
    avatarSize: 'h-7 w-7', // 기존 h-8 w-8에서 줄임
    avatarTextSize: 'text-xs', // 기존 text-sm에서 줄임
  },
  PAGINATION: {
    containerPadding: 'py-2', // 기존 py-3에서 줄임
    buttonPadding: 'p-1.5', // 기존 p-2에서 줄임
    numberButtonPadding: 'px-2.5 py-1', // 기존 px-3 py-1에서 줄임
    iconSize: 14, // 기존 16에서 줄임
  },
  LOADING: {
    containerPadding: 'p-8', // 기존 p-12에서 줄임
    spinnerSize: 'h-6 w-6', // 기존 h-8 w-8에서 줄임
  },
  EMPTY_STATE: {
    containerPadding: 'p-8', // 기존 p-12에서 줄임
    iconSize: 40, // 기존 48에서 줄임
  },
} as const;

// 결제 테이블 특화 설정
export const PAYMENT_TABLE_CONFIG = {
  ...TABLE_COMPACT_CONFIG,
  COLUMNS: {
    memberName: { minWidth: '120px', label: '회원명' },
    paymentDate: { minWidth: '100px', label: '결제일' },
    membershipType: { minWidth: '120px', label: '이용권' },
    paymentMethod: { minWidth: '100px', label: '결제 방법' },
    amount: { minWidth: '100px', label: '금액', align: 'right' },
    status: { minWidth: '80px', label: '상태' },
    staffName: { minWidth: '100px', label: '담당 직원' },
    actions: { minWidth: '100px', label: '작업', align: 'center' },
  }
} as const;

// 이용권 테이블 특화 설정
export const MEMBERSHIP_TYPE_TABLE_CONFIG = {
  ...TABLE_COMPACT_CONFIG,
  COLUMNS: {
    name: { minWidth: '150px', label: '이용권 이름' },
    price: { minWidth: '100px', label: '가격(원)', align: 'right' },
    durationMonths: { minWidth: '100px', label: '기간(개월)', align: 'center' },
    maxUses: { minWidth: '100px', label: '최대횟수', align: 'center' },
    isActive: { minWidth: '80px', label: '활성상태', align: 'center' },
    actions: { minWidth: '100px', label: '작업', align: 'center' },
  }
} as const; 