import { StaffPosition, StaffStatus } from '../types/staff';

// 필터 옵션 설정
export const FILTER_OPTIONS = {
  STATUS: [
    { value: 'all', label: '전체 상태' },
    { value: StaffStatus.ACTIVE, label: '재직 중' },
    { value: StaffStatus.INACTIVE, label: '퇴사' },
  ],
  POSITION: [
    { value: 'all', label: '전체 직책' },
    { value: StaffPosition.MANAGER, label: '관리자' },
    { value: StaffPosition.FRONT_DESK, label: '프론트 데스크' },
    { value: StaffPosition.TRAINER, label: '트레이너' },
    { value: StaffPosition.GENERAL, label: '일반 직원' },
    { value: StaffPosition.PART_TIME, label: '아르바이트' },
    { value: StaffPosition.INTERN, label: '인턴' },
  ],
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
export const EXCEL_CONFIG = {
  FILE_NAME: 'staff_list.xlsx',
  SHEET_NAME: '직원목록',
  SUPPORTED_FORMATS: '.xlsx,.xls,.csv',
  SAMPLE_HEADERS: ['이름', '직책', '전화번호', '이메일', '입사일', '상태'],
  SAMPLE_DATA: {
    name: '김직원',
    position: '일반 직원',
    phone: '010-1234-5678',
    email: 'staff@example.com',
    hireDate: '2023-01-01',
    status: '재직 중',
  },
};

// 액션 버튼 설정 (회원관리와 동일한 컴팩트 스타일)
export const ACTION_BUTTON_CONFIG = {
  ADD_STAFF: {
    text: '직원 추가',
    className: 'bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors',
    iconSize: 12,
  },
  EXCEL_BUTTONS: {
    container: 'flex items-center border border-gray-300 rounded-md overflow-hidden',
    button: 'p-1 hover:bg-gray-100 transition-colors',
    infoButton: 'p-1 hover:bg-gray-100 transition-colors border-l border-gray-300',
    iconSize: 10,
    infoIconSize: 10,
  },
};

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  PAGE_SIZE_OPTIONS: [5, 10, 15, 20],
  MAX_VISIBLE_PAGES: 5,
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
};

// 컴팩트 레이아웃 설정 (회원/결제 관리와 일관된 구조)
export const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: 'p-3',
    headerPadding: 'p-2',
    contentPadding: 'p-2',
  },
  HEADER: {
    icon: 14,
    title: 'text-sm font-medium text-gray-800',
    badge: 'text-xs',
  },
  INPUT_FIELD: {
    labelSize: 'text-xs',
    labelMargin: 'mb-0.5',
    padding: 'py-1',
    textSize: 'text-xs',
    height: 'h-7',
  },
};

// 테이블 컴팩트 설정 - 회원관리와 동일한 스타일로 변경
export const TABLE_COMPACT_CONFIG = {
  HEADER: {
    containerPadding: 'py-2',
    iconSize: 16,
    badgeTextSize: 'text-xs',
    cellPadding: 'px-4 py-2',
  },
  CELL: {
    padding: 'px-4 py-2',
    textSize: 'text-sm',
    avatarSize: 'h-7 w-7',
    avatarTextSize: 'text-xs',
  },
  LOADING: {
    containerPadding: 'p-8',
    spinnerSize: 'h-6 w-6',
  },
  EMPTY_STATE: {
    containerPadding: 'p-8',
    iconSize: 40,
  },
  PAGINATION: {
    containerPadding: 'py-2',
    buttonPadding: 'p-1.5',
    numberButtonPadding: 'px-2.5 py-1',
    iconSize: 14,
  },
};

// 직원 테이블 설정
export const TABLE_CONFIG = {
  MAX_HEIGHT: '600px',
  MIN_WIDTH: '800px',
  STICKY_HEADER_Z_INDEX: 10,
};

// 통계 컴팩트 설정 - 회원관리와 동일한 스타일로 변경
export const STATISTICS_COMPACT_CONFIG = {
  CONTAINER: {
    margin: 'mb-4',
    padding: 'p-3',
    gridGap: 'gap-3',
  },
  CARD: {
    padding: 'p-3',
    labelSize: 'text-xs',
    valueSize: 'text-xl',
    percentageSize: 'text-xs',
    marginTop: 'mt-1',
  },
  SKELETON: {
    height: 'h-3',
    valueHeight: 'h-6',
    margin: 'mb-2',
  },
}; 