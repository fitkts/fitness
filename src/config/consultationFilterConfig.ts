// 상담 일지 필터 및 레이아웃 설정
export const CONSULTATION_FILTER_OPTIONS = {
  STATUS: [
    { value: 'all', label: '전체 상태' },
    { value: 'pending', label: '대기 중' },
    { value: 'in_progress', label: '진행 중' },
    { value: 'completed', label: '완료' },
    { value: 'follow_up', label: '추가 상담 필요' }
  ],
  GENDER: [
    { value: 'all', label: '전체 성별' },
    { value: '남성', label: '남성' },
    { value: '여성', label: '여성' },
    { value: '기타', label: '기타' }
  ]
};

// 필터 그리드 설정 (회원/결제 관리와 동일)
export const FILTER_GRID_CONFIG = {
  baseGrid: 'grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1',
  columns: {
    search: 'col-span-2 lg:col-span-2 xl:col-span-3',
    default: 'col-span-1',
    wide: 'col-span-2 lg:col-span-1 xl:col-span-2'
  },
  styles: {
    input: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    label: 'block text-xs font-medium text-gray-700 mb-0.5',
    select: 'w-full py-1 h-7 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
  }
};

// 엑셀 관련 설정
export const CONSULTATION_EXCEL_CONFIG = {
  FILE_NAME: '상담회원목록.xlsx',
  SHEET_NAME: '상담회원',
  SUPPORTED_FORMATS: '.xlsx, .xls',
  SAMPLE_HEADERS: [
    '이름',
    '전화번호',
    '성별',
    '생년월일',
    '상담상태',
    '담당자',
    '최초방문일',
    '비고'
  ]
};

// 액션 버튼 설정 (회원관리와 동일한 컴팩트 스타일)
export const CONSULTATION_ACTION_BUTTON_CONFIG = {
  ADD_MEMBER: {
    text: '상담회원 추가',
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  RESET_BUTTON: {
    className: 'flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors',
    iconSize: 10,
  },
  EXCEL_BUTTONS: {
    container: 'flex items-center border border-gray-300 rounded-md overflow-hidden',
    button: 'p-1 hover:bg-gray-100 transition-colors',
    infoButton: 'p-1 hover:bg-gray-100 transition-colors border-l border-gray-300',
    iconSize: 10,
    infoIconSize: 10,
  },
};

// 컴팩트 레이아웃 설정 (회원/결제 관리와 일관된 구조)
export const CONSULTATION_COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    wrapper: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4 z-20',
    padding: 'p-3',
    headerPadding: 'p-2',
    headerBackground: 'bg-gray-50 border-b border-gray-200',
    contentPadding: 'p-2'
  },
  HEADER: {
    icon: 14,
    title: 'text-sm font-medium text-gray-800',
    badge: 'text-xs',
    container: 'flex items-center justify-between',
    leftSection: 'flex items-center gap-1.5',
    rightSection: 'flex items-center gap-1.5'
  },
  INPUT_FIELD: {
    labelSize: 'text-xs',
    labelMargin: 'mb-0.5',
    padding: 'py-1',
    textSize: 'text-xs',
    inputStyles: 'w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    searchInputStyles: 'w-full pl-7 pr-2 py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
    searchIconWrapper: 'relative',
    searchIcon: 'absolute left-2 top-1/2 -translate-y-1/2 text-gray-400'
  },
  BADGE: {
    active: 'bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full'
  }
};

// 통계 설정
export const CONSULTATION_STATISTICS_CONFIG = {
  CONTAINER: {
    margin: 'mb-4',
    padding: 'p-3',
    gridGap: 'gap-3'
  },
  CARD: {
    padding: 'p-3',
    labelSize: 'text-xs',
    valueSize: 'text-xl',
    percentageSize: 'text-xs',
    marginTop: 'mt-1'
  }
};

// 테이블 컴팩트 레이아웃 설정 (회원관리와 동일)
export const CONSULTATION_TABLE_COMPACT_CONFIG = {
  HEADER: {
    containerPadding: 'py-2',
    cellPadding: 'px-4 py-2',
    iconSize: 16,
    badgeTextSize: 'text-xs',
  },
  CELL: {
    padding: 'px-4 py-2',
    textSize: 'text-sm',
    avatarSize: 'h-7 w-7',
    avatarTextSize: 'text-xs',
  },
  PAGINATION: {
    containerPadding: 'py-2',
    buttonPadding: 'p-1.5',
    numberButtonPadding: 'px-2.5 py-1',
    iconSize: 14,
  },
  LOADING: {
    containerPadding: 'p-8',
    spinnerSize: 'h-6 w-6',
  },
  EMPTY_STATE: {
    containerPadding: 'p-8',
    iconSize: 40,
  },
} as const;

// 테이블 설정
export const CONSULTATION_TABLE_CONFIG = {
  MAX_HEIGHT: 'calc(100vh - 350px)',
  MIN_WIDTH: 600,
  STICKY_HEADER_Z_INDEX: 10
};

// 페이지네이션 설정
export const CONSULTATION_PAGINATION_CONFIG = {
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50],
  DEFAULT_PAGE_SIZE: 30,
  MAX_VISIBLE_PAGES: 5
}; 