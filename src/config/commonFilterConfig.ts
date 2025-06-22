/**
 * 모든 페이지 필터에서 공통으로 사용하는 설정
 * 필터 디자인의 일관성을 보장하기 위한 기본 설정들
 */

// 공통 액션 버튼 설정 (모든 필터에서 동일하게 사용)
export const COMMON_ACTION_BUTTON_CONFIG = {
  RESET_BUTTON: {
    className: 'bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
  PRIMARY_BUTTON: {
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
  SECONDARY_BUTTON: {
    className: 'bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
  EXCEL_IMPORT_BUTTON: {
    className: 'bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
  EXCEL_EXPORT_BUTTON: {
    className: 'bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
  INFO_BUTTON: {
    className: 'bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors',
    iconSize: 14,
  },
} as const;

// 공통 레이아웃 설정
export const COMMON_FILTER_LAYOUT = {
  // 필터 컨테이너 (모든 필터에서 동일)
  CONTAINER: {
    // 하드코딩된 클래스 - 모든 필터에서 동일하게 사용
    className: 'mb-4 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4 z-20',
  },
  
  // 헤더 섹션
  HEADER: {
    wrapper: 'px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between',
    leftSection: 'flex items-center gap-2',
    rightSection: 'flex items-center gap-2',
    title: 'text-sm font-medium text-gray-800 flex items-center gap-2',
    titleIcon: 'w-4 h-4 text-gray-600',
    badge: 'bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium',
  },
  
  // 컨텐츠 섹션
  CONTENT: {
    wrapper: 'p-3',
    grid: 'grid gap-3', // 기본 그리드, 각 페이지에서 컬럼 수 추가
    gridCols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4', // 4컬럼 (직원, 락커, 상담, 통계)
    gridCols6: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-6', // 6컬럼 (회원)
  },
  
  // 입력 필드 공통 스타일
  INPUT_FIELD: {
    wrapper: 'space-y-1',
    label: 'block text-xs font-medium text-gray-700',
    input: 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    select: 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white',
  },
} as const;

// 필터별 특화 설정을 위한 팩토리 함수
export const createFilterConfig = (options: {
  gridColumns: 4 | 6;
  actionButtons?: {
    add?: { text: string; icon?: string };
    excel?: { import?: boolean; export?: boolean; info?: boolean };
    custom?: Array<{ text: string; type: keyof typeof COMMON_ACTION_BUTTON_CONFIG; icon?: string }>;
  };
}) => {
  const { gridColumns, actionButtons } = options;
  
  return {
    CONTAINER: COMMON_FILTER_LAYOUT.CONTAINER,
    HEADER: COMMON_FILTER_LAYOUT.HEADER,
    CONTENT: {
      ...COMMON_FILTER_LAYOUT.CONTENT,
      gridColumns: gridColumns === 6 
        ? COMMON_FILTER_LAYOUT.CONTENT.gridCols6 
        : COMMON_FILTER_LAYOUT.CONTENT.gridCols4,
    },
    INPUT_FIELD: COMMON_FILTER_LAYOUT.INPUT_FIELD,
    ACTION_BUTTONS: {
      ...COMMON_ACTION_BUTTON_CONFIG,
      // 페이지별 커스터마이징 가능
      ...(actionButtons?.add && {
        ADD_BUTTON: {
          ...COMMON_ACTION_BUTTON_CONFIG.PRIMARY_BUTTON,
          text: actionButtons.add.text,
        }
      }),
    },
  };
};

// 공통 필터 유틸리티 함수
export const getActiveFilterCount = (filter: Record<string, any>, excludeFields: string[] = ['search']) => {
  return Object.entries(filter).filter(([key, value]) => {
    if (excludeFields.includes(key)) return false;
    if (value === '' || value === 'all' || value === null || value === undefined) return false;
    return true;
  }).length;
};

// 공통 필터 초기화 함수
export const createResetFilter = <T extends Record<string, any>>(initialFilter: T): T => {
  const resetFilter = { ...initialFilter };
  Object.keys(resetFilter).forEach(key => {
    const value = resetFilter[key];
    if (typeof value === 'string') {
      resetFilter[key] = value.includes('all') ? 'all' : '' as any;
    }
  });
  return resetFilter;
};
