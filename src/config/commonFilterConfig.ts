/**
 * 모든 페이지 필터에서 공통으로 사용하는 설정
 * 필터 디자인의 일관성을 보장하기 위한 기본 설정들
 * 
 * 현재 적용된 필터 컴포넌트들:
 * - MemberSearchFilter: 12컬럼 그리드 시스템 적용
 * - PaymentSearchFilter: 12컬럼 그리드 시스템 + 빠른 날짜 기능
 * - LockerSearchAndFilter: FILTER_GRID_CONFIG 사용
 * - ConsultationSearchFilter: 기존 COMPACT_LAYOUT_CONFIG 사용 (업데이트 필요)
 */

// 공통 그리드 시스템 설정 (회원/결제/락커 관리에서 사용 중)
export const COMMON_FILTER_GRID_CONFIG = {
  // 12컬럼 반응형 그리드 시스템
  baseGrid: 'grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1',
  
  // 컬럼 스팬 설정
  columns: {
    search: 'col-span-2 lg:col-span-2 xl:col-span-3',    // 검색 필드 (3컬럼)
    default: 'col-span-1',                                // 기본 드롭다운 (1컬럼)
    wide: 'col-span-2 lg:col-span-1 xl:col-span-2',     // 넓은 드롭다운 (2컬럼)
    date: 'col-span-1',                                   // 날짜 입력 (1컬럼)
    extra: 'col-span-4 lg:col-span-4 xl:col-span-4',    // 나머지 공간
  },
  
  // 공통 스타일 클래스
  styles: {
    // 컴팩트 입력 필드 (높이 28px)
    input: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    select: 'w-full py-1 h-7 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500',
    label: 'block text-xs font-medium text-gray-700 mb-0.5',
    
    // 검색 필드 특별 스타일
    searchInput: 'w-full pl-4 pr-1 py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    searchIcon: 'absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400',
  }
} as const;

// 공통 액션 버튼 설정 (컴팩트 버전으로 업데이트)
export const COMMON_ACTION_BUTTON_CONFIG = {
  // 초기화 버튼 (컴팩트)
  RESET_BUTTON: {
    className: 'flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors',
    iconSize: 10,
  },
  
  // 주요 액션 버튼들 (컴팩트)
  PRIMARY_BUTTON: {
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  SECONDARY_BUTTON: {
    className: 'bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  
  // 엑셀 버튼 그룹 (컴팩트)
  EXCEL_BUTTONS: {
    container: 'flex items-center border border-gray-300 rounded-md overflow-hidden',
    button: 'p-1 hover:bg-gray-100 transition-colors',
    infoButton: 'p-1 hover:bg-gray-100 transition-colors border-l border-gray-300',
    iconSize: 10,
    infoIconSize: 10,
  },
} as const;

// 공통 레이아웃 설정 (컴팩트 버전으로 업데이트)
export const COMMON_FILTER_LAYOUT = {
  // 필터 컨테이너
  CONTAINER: {
    className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-3 overflow-hidden sticky top-4 z-20',
  },
  
  // 헤더 섹션 (컴팩트)
  HEADER: {
    wrapper: 'p-2 bg-gray-50 border-b border-gray-200',
    container: 'flex items-center justify-between',
    leftSection: 'flex items-center gap-1.5',
    rightSection: 'flex items-center gap-1.5',
    title: 'text-sm font-medium text-gray-800',
    titleIcon: 14,
    badge: 'bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full',
  },
  
  // 컨텐츠 섹션 (컴팩트)
  CONTENT: {
    wrapper: 'p-2',
    spacing: 'space-y-2',
  },
} as const;

// 필터별 특화 설정을 위한 팩토리 함수 (업데이트됨)
export const createFilterConfig = (options: {
  useGridSystem?: boolean; // 12컬럼 그리드 시스템 사용 여부
  actionButtons?: {
    add?: { text: string; className?: string };
    excel?: { import?: boolean; export?: boolean; info?: boolean };
    custom?: Array<{ text: string; type: keyof typeof COMMON_ACTION_BUTTON_CONFIG; className?: string }>;
  };
}) => {
  const { useGridSystem = true, actionButtons } = options;
  
  return {
    // 그리드 시스템 설정
    GRID: useGridSystem ? COMMON_FILTER_GRID_CONFIG : null,
    
    // 레이아웃 설정
    CONTAINER: COMMON_FILTER_LAYOUT.CONTAINER,
    HEADER: COMMON_FILTER_LAYOUT.HEADER,
    CONTENT: COMMON_FILTER_LAYOUT.CONTENT,
    
    // 액션 버튼 설정
    ACTION_BUTTONS: {
      ...COMMON_ACTION_BUTTON_CONFIG,
      // 페이지별 커스터마이징
      ...(actionButtons?.add && {
        ADD_BUTTON: {
          ...COMMON_ACTION_BUTTON_CONFIG.PRIMARY_BUTTON,
          text: actionButtons.add.text,
          ...(actionButtons.add.className && { className: actionButtons.add.className }),
        }
      }),
    },
  };
};

// 공통 필터 유틸리티 함수들
export const getActiveFilterCount = (filter: Record<string, any>, excludeFields: string[] = []) => {
  return Object.entries(filter).filter(([key, value]) => {
    if (excludeFields.includes(key)) return false;
    if (value === '' || value === 'all' || value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  }).length;
};

// 공통 필터 초기화 함수 (타입 오류 해결)
export const resetFilterValues = (filter: Record<string, any>): Record<string, any> => {
  const resetFilter = { ...filter };
  
  Object.keys(resetFilter).forEach(key => {
    const value = resetFilter[key];
    if (typeof value === 'string') {
      resetFilter[key] = value.includes('all') ? 'all' : '';
    } else if (typeof value === 'number') {
      resetFilter[key] = undefined;
    }
  });
  
  return resetFilter;
};

// 페이지별 필터 설정 프리셋
export const FILTER_PRESETS = {
  // 회원 관리 필터 설정
  MEMBER: createFilterConfig({
    useGridSystem: true,
    actionButtons: {
      add: { text: '회원 추가' },
      excel: { import: true, export: true, info: true }
    }
  }),
  
  // 결제 관리 필터 설정
  PAYMENT: createFilterConfig({
    useGridSystem: true,
    actionButtons: {
      add: { text: '결제 추가' },
      excel: { import: true, export: true, info: true }
    }
  }),
  
  // 락커 관리 필터 설정
  LOCKER: createFilterConfig({
    useGridSystem: true,
    actionButtons: {
      add: { text: '락커 추가' }
    }
  }),
  
  // 상담 관리 필터 설정 (업데이트 필요)
  CONSULTATION: createFilterConfig({
    useGridSystem: true,
    actionButtons: {
      add: { text: '상담회원 추가' },
      excel: { import: true, export: true, info: true }
    }
  }),
} as const;
