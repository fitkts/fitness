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
    { value: '남', label: '남' },
    { value: '여', label: '여' },
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
  남: 1,
  여: 2,
  '': 3
} as const; 