import { ViewType, PaymentStatusFilter } from '../types/statistics';

/**
 * 통계 필터 패널 설정
 * 회원/결제 관리 페이지와 일관된 레이아웃을 위한 설정값들
 */

// 필터 그리드 설정 (회원/결제 관리와 동일)
export const FILTER_GRID_CONFIG = {
  baseGrid: 'grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1',
  columns: {
    search: 'col-span-2 lg:col-span-2 xl:col-span-3',
    default: 'col-span-1',
    wide: 'col-span-2 lg:col-span-1 xl:col-span-2',
    dateRange: 'col-span-2 lg:col-span-2 xl:col-span-4', // 날짜 범위는 더 넓게
  },
  styles: {
    input: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    label: 'block text-xs font-medium text-gray-700 mb-0.5',
    select: 'w-full py-1 h-7 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
  }
};

// 액션 버튼 설정 (회원관리와 동일한 컴팩트 스타일)
export const ACTION_BUTTON_CONFIG = {
  RESET_BUTTON: {
    className: 'flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors',
    iconSize: 10,
  },
  CARD_EDIT_BUTTON: {
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  REFRESH_BUTTON: {
    className: 'bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
};

// 레이아웃 설정 (회원/결제 관리와 일관된 구조)
export const FILTER_LAYOUT_CONFIG = {
  CONTAINER: {
    className: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4 z-20',
    padding: 'p-3',
  },
  HEADER: {
    className: 'p-2 bg-gray-50 border-b border-gray-200',
    title: 'text-sm font-medium text-gray-800',
    icon: 14,
    badge: 'text-xs',
  },
  CONTENT: {
    className: 'p-2',
  },
} as const;

// 입력 필드 설정 (회원/결제 관리와 동일)
export const INPUT_FIELD_CONFIG = {
  LABEL: {
    className: 'block text-xs font-medium text-gray-700 mb-0.5',
  },
  INPUT: {
    className: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
  },
  SELECT: {
    className: 'w-full py-1 h-7 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500',
  },
  HELP_TEXT: {
    className: 'text-xs text-gray-500 mt-0.5',
  },
} as const;

// 빠른 날짜 선택 설정 (더 컴팩트하게)
export const QUICK_DATE_CONFIG = {
  CONTAINER: {
    className: 'flex flex-wrap gap-0.5',
  },
  BUTTON_GROUP: {
    className: 'flex items-center bg-gray-50 rounded-md p-0.5 border border-gray-200',
  },
  NAV_BUTTON: {
    className: 'p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors',
    iconSize: 12,
  },
  MAIN_BUTTON: {
    className: 'flex-1 px-1.5 py-0.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-center',
  },
} as const;

// 기간 선택 설정
export const DATE_RANGE_CONFIG = {
  CONTAINER: {
    className: 'col-span-2 lg:col-span-2 xl:col-span-4',
  },
  DATE_INPUTS: {
    container: 'grid grid-cols-2 gap-1',
    input: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
  },
} as const;

// 액션 버튼 섹션 설정
export const ACTION_SECTION_CONFIG = {
  CONTAINER: {
    className: 'flex items-center gap-1.5 justify-end',
  },
  BUTTON_GROUP: {
    className: 'flex items-center gap-1',
  },
} as const;

// 차트 표시 단위 옵션
export const VIEW_TYPE_OPTIONS: Array<{ value: ViewType; label: string }> = [
  { value: 'daily', label: '일간' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
] as const;

// 결제 상태 필터 옵션
export const STATUS_FILTER_OPTIONS: Array<{ value: PaymentStatusFilter; label: string }> = [
  { value: '전체', label: '전체' },
  { value: '완료', label: '완료' },
  { value: '취소', label: '취소' },
  { value: '환불', label: '환불' },
] as const;

// 필터 라벨 및 도움말 텍스트
export const FILTER_LABELS = {
  DATE_RANGE: {
    label: '기간 선택',
    startLabel: '시작일',
    endLabel: '종료일',
    help: '조회할 기간을 선택하세요',
  },
  VIEW_TYPE: {
    label: '차트 표시 단위',
    help: '차트에 표시할 데이터 단위를 선택하세요',
  },
  STATUS_FILTER: {
    label: '결제 상태',
    help: '필터링할 결제 상태를 선택하세요',
  },
  QUICK_DATE: {
    help: '빠른 날짜 선택 및 이전/다음 버튼을 사용하세요',
  },
} as const;

// 컴팩트 레이아웃 설정
export const COMPACT_CONFIG = {
  ENABLED: true,
  PADDING_REDUCTION: true,
  RESPONSIVE_GRID: true,
} as const; 