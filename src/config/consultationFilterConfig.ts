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

// 액션 버튼 설정 (회원관리와 동일)
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
    container: 'flex gap-0.5 items-center',
    button: 'bg-gray-100 border-none rounded p-1.5 cursor-pointer hover:bg-gray-200',
    infoButton: 'bg-transparent border-none p-0.5 cursor-pointer',
    iconSize: 14,
    infoIconSize: 13,
  },
};

// 컴팩트 레이아웃 설정 (회원관리와 일관된 구조)
export const CONSULTATION_COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    wrapper: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4 z-20',
    padding: '', // 실제 컨테이너 패딩은 컴포넌트에서 직접 관리
    headerPadding: 'px-3 py-1.5', // 회원관리와 동일
    headerBackground: 'bg-gray-50 border-b border-gray-200',
    contentPadding: 'p-2.5' // 회원관리와 동일
  },
  HEADER: {
    icon: 14, // 회원관리와 동일
    title: 'text-xs font-medium text-gray-900', // 회원관리와 동일
    badge: 'text-xs', // 회원관리와 동일
    container: 'flex items-center justify-between', // 간소화
    leftSection: 'flex items-center gap-1.5', // 회원관리와 동일
    rightSection: 'flex items-center gap-1.5' // 회원관리와 동일
  },
  GRID: {
    responsive: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6', // 회원관리와 동일
    gap: 'gap-2' // 회원관리와 동일
  },
  INPUT_FIELD: {
    labelSize: 'text-xs', // 회원관리와 동일
    labelMargin: 'mb-0.5', // 회원관리와 동일
    padding: 'py-1', // 회원관리와 동일
    textSize: 'text-xs', // 회원관리와 동일
    inputStyles: 'w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', // 회원관리와 동일
    searchInputStyles: 'w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', // 회원관리와 동일
    searchIconWrapper: 'relative',
    searchIcon: 'absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400' // 회원관리와 동일
  },
  BADGE: {
    active: 'bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full' // 회원관리와 동일
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
    containerPadding: 'py-2', // 회원관리와 동일
    cellPadding: 'px-4 py-2', // 회원관리와 동일
    iconSize: 16, // 회원관리와 동일
    badgeTextSize: 'text-xs',
  },
  CELL: {
    padding: 'px-4 py-2', // 회원관리와 동일
    textSize: 'text-sm',
    avatarSize: 'h-7 w-7', // 회원관리와 동일
    avatarTextSize: 'text-xs', // 회원관리와 동일
  },
  PAGINATION: {
    containerPadding: 'py-2', // 회원관리와 동일
    buttonPadding: 'p-1.5', // 회원관리와 동일
    numberButtonPadding: 'px-2.5 py-1', // 회원관리와 동일
    iconSize: 14, // 회원관리와 동일
  },
  LOADING: {
    containerPadding: 'p-8', // 회원관리와 동일
    spinnerSize: 'h-6 w-6', // 회원관리와 동일
  },
  EMPTY_STATE: {
    containerPadding: 'p-8', // 회원관리와 동일
    iconSize: 40, // 회원관리와 동일
  },
} as const;

// 테이블 설정
export const CONSULTATION_TABLE_CONFIG = {
  MAX_HEIGHT: 'calc(100vh - 350px)', // 회원관리와 동일
  MIN_WIDTH: 600, // 회원관리와 동일
  STICKY_HEADER_Z_INDEX: 10
};

// 페이지네이션 설정
export const CONSULTATION_PAGINATION_CONFIG = {
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50], // 회원관리와 동일
  DEFAULT_PAGE_SIZE: 30, // 회원관리와 동일
  MAX_VISIBLE_PAGES: 5 // 회원관리와 동일
}; 