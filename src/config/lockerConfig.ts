// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 50,
  MAX_VISIBLE_PAGES: 5
};

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'number_asc', label: '번호 오름차순 (1, 2, 3...)' },
  { value: 'number_desc', label: '번호 내림차순 (999, 998, 997...)' },
  { value: 'status', label: '상태별 (사용가능 → 사용중 → 점검중)' },
  { value: 'member_name', label: '사용자명 순' },
  { value: 'expiry_date', label: '만료일 임박순' },
] as const;

// 레이아웃 방향 옵션
export const LAYOUT_OPTIONS = [
  { value: 'row', label: '행 우선 (좌→우, 위→아래)' },
  { value: 'column', label: '열 우선 (위→아래, 좌→우)' },
] as const;

// 필터 옵션
export const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '사용 가능' },
  { value: 'occupied', label: '사용 중' },
  { value: 'maintenance', label: '점검 중' }
] as const;

// 락커 상태별 스타일
export const LOCKER_STATUS_STYLES = {
  available: {
    container: 'bg-green-50 border-green-200',
    text: 'text-green-600',
    label: '사용 가능'
  },
  occupied: {
    container: 'bg-blue-50 border-blue-200', 
    text: 'text-blue-600',
    label: '사용 중'
  },
  maintenance: {
    container: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-600', 
    label: '점검 중'
  }
} as const;

// 월 사용료 설정
export const MONTHLY_FEE_CONFIG = {
  DEFAULT: 50000,
  MIN: 10000,
  MAX: 200000,
  STEP: 5000,
  CURRENCY: '원'
} as const;

// 락커 크기별 추천 요금
export const RECOMMENDED_FEES_BY_SIZE = {
  small: 45000,
  medium: 50000,
  large: 60000
} as const;

// 락커 요금 옵션 설정
export const FEE_PRESET_OPTIONS = [
  { label: '기본 요금 (소형)', value: 45000 },
  { label: '기본 요금 (중형)', value: 50000 },
  { label: '기본 요금 (대형)', value: 60000 },
  { label: '프리미엄 요금', value: 80000 },
  { label: '할인 요금', value: 35000 }
] as const;

// 버튼 액션 타입
export type LockerAction = 'view' | 'edit' | 'delete';

// 검색 설정
export const SEARCH_CONFIG = {
  PLACEHOLDER: '락커 번호 또는 회원명으로 검색...',
  MIN_SEARCH_LENGTH: 1,
  DEBOUNCE_MS: 300
};

// 액션 버튼 설정
export const ACTION_BUTTON_CONFIG = {
  base: 'inline-flex items-center text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  primary: 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 py-1 px-2',
  secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 py-1 px-2',
};

// 컴팩트 레이아웃 설정 (회원관리와 동일)
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
    responsive: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  HEADER: {
    title: 'text-xs font-medium text-gray-900',
    subtitle: 'text-xs text-gray-600',
    badge: 'text-xs',
    icon: 14,
  },
} as const;

// 테이블 컴팩트 설정 (회원관리와 동일)
export const TABLE_COMPACT_CONFIG = {
  CONTAINER: {
    margin: 'mt-3',
    border: 'border border-gray-200 rounded-lg overflow-hidden',
  },
  HEADER: {
    background: 'bg-gray-50',
    padding: 'px-3 py-2',
    textSize: 'text-xs font-medium text-gray-500 uppercase tracking-wider',
  },
  ROW: {
    padding: 'px-3 py-2',
    textSize: 'text-sm text-gray-900',
    hover: 'hover:bg-gray-50',
    border: 'border-t border-gray-200',
  },
} as const;

// 통계 컴팩트 설정 (회원관리와 동일)
export const STATISTICS_COMPACT_CONFIG = {
  CONTAINER: {
    padding: 'p-3',
    margin: 'mb-3',
    border: 'bg-white rounded-lg shadow-sm border border-gray-200',
  },
  GRID: {
    layout: 'grid grid-cols-2 md:grid-cols-4 gap-3',
  },
  ITEM: {
    padding: 'p-2',
    textAlign: 'text-center',
    border: 'rounded-md',
    background: 'bg-gray-50',
  },
  TITLE: {
    textSize: 'text-xs font-medium text-gray-500 uppercase tracking-wider',
    margin: 'mb-1',
  },
  VALUE: {
    textSize: 'text-lg font-semibold text-gray-900',
  },
} as const;

// 락커 카드 컴팩트 레이아웃 설정
export const LOCKER_CARD_COMPACT_CONFIG = {
  CONTAINER: {
    padding: 'p-1.5',
    border: 'rounded-md shadow-sm border',
  },
  HEADER: {
    spacing: 'flex items-start justify-between',
    titleSize: 'text-xs font-semibold text-gray-900',
    statusSize: 'text-xs font-medium',
    gap: 'gap-0.5 ml-1.5',
  },
  ACTION_BUTTONS: {
    iconSize: 10,
    padding: 'p-0.5',
    hover: 'hover:bg-gray-100 rounded',
  },
  CONTENT: {
    marginTop: 'mt-1',
    paddingTop: 'pt-1',
    border: 'border-t border-gray-200',
    textSize: 'text-xs',
    spacing: 'mt-0.5',
  },
  EXPIRY_INFO: {
    iconSize: 8,
    spacing: 'flex items-center mt-0.5',
    marginRight: 'mr-0.5',
  },
} as const;

// 그리드 컴팩트 레이아웃 설정
export const GRID_COMPACT_CONFIG = {
  CONTAINER: {
    gap: 'gap-2',
    responsive: {
      base: 'grid',
      sm: 'grid-cols-2',
      md: 'grid-cols-4',
      lg: 'grid-cols-6',
      xl: 'grid-cols-8',
      '2xl': 'grid-cols-10'
    },
  },
  EMPTY_STATE: {
    padding: 'py-8',
    iconSize: 10,
    containerSize: 'w-20 h-20',
    titleSize: 'text-base',
    subtitleSize: 'text-sm',
    spacing: 'mb-3',
  },
} as const;

// 페이지네이션 컴팩트 레이아웃 설정
export const PAGINATION_COMPACT_CONFIG = {
  CONTAINER: {
    padding: 'py-2',
    textSize: 'text-xs',
  },
  BUTTONS: {
    padding: 'p-1.5',
    numberPadding: 'px-2.5 py-1',
    iconSize: 14,
    textSize: 'text-sm',
  },
  INFO: {
    textSize: 'text-xs text-gray-500',
  },
} as const; 