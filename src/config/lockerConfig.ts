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