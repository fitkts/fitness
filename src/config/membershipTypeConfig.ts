// 가격 범위 타입
export interface MembershipTypePriceRange {
  min: number;
  max?: number;
  label: string;
}

// 기간 범위 타입
export interface MembershipTypeDurationRange {
  min: number;
  max?: number;
  label: string;
}

// 미리 정의된 가격 범위
export const PREDEFINED_PRICE_RANGES: MembershipTypePriceRange[] = [
  {
    min: 0,
    max: 100000,
    label: '10만원 이하',
  },
  {
    min: 100000,
    max: 300000,
    label: '10-30만원',
  },
  {
    min: 300000,
    max: 500000,
    label: '30-50만원',
  },
  {
    min: 500000,
    label: '50만원 이상',
  },
];

// 미리 정의된 기간 범위
export const PREDEFINED_DURATION_RANGES: MembershipTypeDurationRange[] = [
  {
    min: 1,
    max: 1,
    label: '1개월',
  },
  {
    min: 3,
    max: 3,
    label: '3개월',
  },
  {
    min: 6,
    max: 6,
    label: '6개월',
  },
  {
    min: 12,
    max: 12,
    label: '12개월',
  },
  {
    min: 12,
    label: '장기권',
  },
];

// 필터 설정
export const FILTER_CONFIG = {
  SEARCH_PLACEHOLDER: '이용권 이름 또는 설명으로 검색...',
  PRICE_PLACEHOLDER: {
    MIN: '0',
    MAX: '무제한',
  },
  DURATION_PLACEHOLDER: {
    MIN: '1',
    MAX: '무제한',
  },
};

// 컴팩트 레이아웃 설정
export const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: 'p-0',
    headerPadding: 'px-4 py-3',
    contentPadding: 'p-4',
    classes: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4 z-20',
  },
  HEADER: {
    title: 'text-sm font-medium text-gray-900',
    badge: 'text-xs',
    icon: 18,
  },
  INPUT_FIELD: {
    textSize: 'text-sm',
    padding: 'py-2',
    labelSize: 'text-xs',
    labelMargin: 'mb-1',
  },
  GRID: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-4',
  },
  RANGE_SECTION: {
    title: 'text-sm font-medium text-gray-700',
    iconSize: 16,
    gridGap: 'gap-2',
    presetContainer: 'flex flex-wrap gap-1',
    presetButton: 'px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors',
  },
};

// 액션 버튼 설정
export const ACTION_BUTTON_CONFIG = {
  ACTION_GROUP: {
    container: 'flex items-center gap-2',
    buttonGroup: 'flex items-center gap-2',
  },
  ADD_MEMBERSHIP_TYPE: {
    text: '새 이용권 추가',
    className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3 rounded-md font-medium transition-colors',
    iconSize: 14,
  },
  EXCEL_BUTTONS: {
    container: 'flex items-center gap-1',
    button: 'p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors',
    infoButton: 'p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors',
    iconSize: 14,
    infoIconSize: 12,
  },
}; 