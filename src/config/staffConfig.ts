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

// 액션 버튼 설정 - 회원관리와 동일한 스타일로 변경
export const ACTION_BUTTON_CONFIG = {
  ADD_STAFF: {
    text: '직원 추가',
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
};

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  PAGE_SIZE_OPTIONS: [5, 10, 15, 20],
  MAX_VISIBLE_PAGES: 5,
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
};

// 컴팩트 레이아웃 설정 - 회원관리와 동일한 스타일로 변경
export const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: '', // 실제 컨테이너 패딩은 컴포넌트에서 직접 관리
    headerPadding: 'px-3 py-1.5', // 회원관리와 동일
    contentPadding: 'p-2.5', // 회원관리와 동일
  },
  HEADER: {
    icon: 14, // 회원관리와 동일
    title: 'text-xs font-medium text-gray-900', // 회원관리와 동일
    badge: 'text-xs', // 회원관리와 동일
  },
  GRID: {
    responsive: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', // 직원관리는 5컬럼으로 조정
    gap: 'gap-2', // 회원관리와 동일
  },
  INPUT_FIELD: {
    labelSize: 'text-xs', // 회원관리와 동일
    labelMargin: 'mb-0.5', // 회원관리와 동일
    padding: 'py-1', // 회원관리와 동일
    textSize: 'text-xs', // 회원관리와 동일
  },
};

// 테이블 컴팩트 설정 - 회원관리와 동일한 스타일로 변경
export const TABLE_COMPACT_CONFIG = {
  HEADER: {
    containerPadding: 'py-2', // 회원관리와 동일하게 변경
    iconSize: 16,
    badgeTextSize: 'text-xs',
    cellPadding: 'px-4 py-2', // 회원관리와 동일하게 변경
  },
  CELL: {
    padding: 'px-4 py-2', // 회원관리와 동일하게 변경
    textSize: 'text-sm',
    avatarSize: 'h-7 w-7', // 회원관리와 동일하게 변경
    avatarTextSize: 'text-xs', // 회원관리와 동일하게 변경
  },
  LOADING: {
    containerPadding: 'p-8', // 회원관리와 동일하게 변경
    spinnerSize: 'h-6 w-6', // 회원관리와 동일하게 변경
  },
  EMPTY_STATE: {
    containerPadding: 'p-8', // 회원관리와 동일하게 변경
    iconSize: 40, // 회원관리와 동일하게 변경
  },
  PAGINATION: {
    containerPadding: 'py-2', // 회원관리와 동일하게 변경
    buttonPadding: 'p-1.5', // 회원관리와 동일하게 변경
    numberButtonPadding: 'px-2.5 py-1', // 회원관리와 동일하게 변경
    iconSize: 14, // 회원관리와 동일하게 변경
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
    margin: 'mb-4', // 회원관리와 동일하게 변경
    padding: 'p-3', // 회원관리와 동일하게 변경
    gridGap: 'gap-3', // 회원관리와 동일하게 변경
  },
  CARD: {
    padding: 'p-3', // 회원관리와 동일하게 변경
    labelSize: 'text-xs', // 회원관리와 동일하게 변경
    valueSize: 'text-xl', // 회원관리와 동일하게 변경
    percentageSize: 'text-xs', // 회원관리와 동일하게 변경
    marginTop: 'mt-1',
  },
  SKELETON: {
    height: 'h-3', // 회원관리와 동일하게 변경
    valueHeight: 'h-6', // 회원관리와 동일하게 변경
    margin: 'mb-2',
  },
}; 