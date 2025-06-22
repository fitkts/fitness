// Staff 페이지 전용 설정 파일

// 메시지 설정
export const STAFF_MESSAGES = {
  pageTitle: '직원 관리',
  success: {
    itemAdded: '새 직원이 추가되었습니다.',
    itemUpdated: '직원 정보가 수정되었습니다.',
    itemDeleted: '직원이 삭제되었습니다.'
  },
  error: {
    saveFailed: '직원 정보 저장에 실패했습니다.',
    deleteFailed: '직원 삭제에 실패했습니다.',
    loadFailed: '직원 데이터 로딩에 실패했습니다.'
  },
  confirm: {
    deleteConfirm: '정말로 이 직원을 삭제하시겠습니까?'
  }
} as const;

// 필터 초기값 설정
export const STAFF_FILTER_DEFAULTS = {
  search: '',
  role: 'all' as const,
  status: 'all' as const,
  department: 'all' as const
} as const;

// 테스트 데이터 식별자
export const STAFF_TEST_IDS = {
  pageContainer: 'staff-page-container',
  pageHeader: 'staff-page-header',
  addButton: 'add-staff-button',
  resetButton: 'reset-filters-button'
} as const; 