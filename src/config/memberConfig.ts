// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 30,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50],
  MAX_VISIBLE_PAGES: 5,
} as const;

// 필터 옵션
export const FILTER_OPTIONS = {
  STATUS: [
    { value: 'all', label: '전체 상태' },
    { value: 'active', label: '활성' },
    { value: 'expired', label: '만료' },
  ],
  GENDER: [
    { value: 'all', label: '전체 성별' },
    { value: '남성', label: '남성' },
    { value: '여성', label: '여성' },
  ],
} as const;

// 테이블 설정
export const TABLE_CONFIG = {
  MAX_HEIGHT: 'calc(100vh - 350px)',
  MIN_WIDTH: 600,
  STICKY_HEADER_Z_INDEX: 10,
} as const;

// 엑셀 관련 설정
export const EXCEL_CONFIG = {
  FILE_NAME: '회원목록.xlsx',
  SHEET_NAME: '회원목록',
  SUPPORTED_FORMATS: '.xlsx, .xls',
  SAMPLE_HEADERS: [
    '이름',
    '전화번호', 
    '이메일',
    '생년월일',
    '회원권종류',
    '시작일',
    '종료일',
    '비고'
  ],
  SAMPLE_DATA: {
    이름: '홍길동',
    전화번호: '010-1234-5678',
    이메일: 'hong@example.com',
    생년월일: '1990-01-01',
    회원권종류: '3개월',
    시작일: '2024-06-01',
    종료일: '2024-08-31',
    비고: '특이사항'
  }
} as const;

// 통계 관련 설정
export const STATISTICS_CONFIG = {
  EXPIRING_DAYS_THRESHOLD: 30,
  TOP_MEMBERSHIP_TYPES_COUNT: 3,
} as const;

// 성별 정렬 순서
export const GENDER_SORT_ORDER = {
  남성: 1,
  여성: 2,
  '': 3
} as const;

// 액션 버튼 설정
export const ACTION_BUTTON_CONFIG = {
  ADD_MEMBER: {
    text: '회원 추가',
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  EXCEL_BUTTONS: {
    container: 'flex gap-0.5 items-center',
    button: 'bg-gray-100 border-none rounded p-1.5 cursor-pointer hover:bg-gray-200',
    infoButton: 'bg-transparent border-none p-0.5 cursor-pointer',
    iconSize: 14,
    infoIconSize: 13,
  },
} as const;

// 컴팩트 레이아웃 설정 - 결제 페이지 스타일로 업데이트
export const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: 'p-3', // 결제 페이지와 동일
    headerPadding: 'p-2', // 결제 페이지와 동일
    contentPadding: 'p-2', // 결제 페이지와 동일
  },
  INPUT_FIELD: {
    padding: 'py-1', // 결제 페이지와 동일
    textSize: 'text-xs', // 결제 페이지와 동일
    labelSize: 'text-xs', // 결제 페이지와 동일
    labelMargin: 'mb-0.5', // 결제 페이지와 동일
    height: 'h-7', // 결제 페이지와 동일한 높이
  },
  GRID: {
    gap: 'gap-1', // 결제 페이지와 동일한 좁은 간격
    responsive: 'grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12', // 결제 페이지와 동일한 그리드
  },
  HEADER: {
    title: 'text-sm font-medium text-gray-800', // 결제 페이지와 동일
    badge: 'text-xs', // 결제 페이지와 동일
    icon: 14, // 결제 페이지와 동일
  },
  // 컬럼 스팬 설정 추가
  COLUMN_SPANS: {
    SEARCH: 'col-span-2 lg:col-span-2 xl:col-span-3', // 검색 필드
    FILTER_FIELD: 'col-span-1', // 기본 필터 필드
    WIDE_FIELD: 'col-span-2 lg:col-span-1 xl:col-span-2', // 이용권 등 긴 텍스트용
    EXTRA_SPACE: 'col-span-4 lg:col-span-4 xl:col-span-4', // 나머지 공간
  },
} as const;

// 통계 카드 컴팩트 레이아웃 설정
export const STATISTICS_COMPACT_CONFIG = {
  CONTAINER: {
    margin: 'mb-4', // 기존 mb-6에서 줄임
    padding: 'p-3', // 기존 p-5에서 줄임
    gridGap: 'gap-3', // 기존 gap-4에서 줄임
  },
  CARD: {
    padding: 'p-3', // 기존 p-4에서 줄임
    labelSize: 'text-xs', // 기존 text-sm에서 줄임
    valueSize: 'text-xl', // 기존 text-2xl에서 줄임
    percentageSize: 'text-xs', // 기존 text-sm에서 줄임
    marginTop: 'mt-1', // 라벨과 값 사이 간격
  },
  SKELETON: {
    height: 'h-3', // 기존 h-4에서 줄임
    margin: 'mb-2',
    valueHeight: 'h-6', // 기존 h-8에서 줄임
  },
} as const;

// 테이블 컴팩트 레이아웃 설정
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

// 반응형 레이아웃 설정
export const RESPONSIVE_CONFIG = {
  MOBILE: {
    filterPadding: 'p-2', // 모바일에서 더 작은 패딩
    gridGap: 'gap-2', // 모바일에서 더 작은 간격
    textSize: 'text-xs', // 모바일에서 더 작은 텍스트
    hideColumns: ['gender', 'membershipType'], // 모바일에서 숨길 컬럼들
  },
  TABLET: {
    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', // 태블릿 그리드 조정
  },
  BREAKPOINTS: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;