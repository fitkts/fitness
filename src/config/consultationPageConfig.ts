// Consultation 페이지 전용 설정 파일

// 메시지 설정
export const CONSULTATION_MESSAGES = {
  pageTitle: '상담일지 관리',
  pageDescription: '회원들의 상담 현황을 관리하고 새로운 회원을 등록할 수 있습니다.',
  success: {
    itemAdded: '새 상담 기록이 추가되었습니다.',
    itemUpdated: '상담 기록이 수정되었습니다.',
    itemDeleted: '상담 기록이 삭제되었습니다.',
    memberAdded: '새 회원이 추가되었습니다.',
    memberUpdated: '회원 정보가 수정되었습니다.',
    memberPromoted: '회원이 등록되었습니다.',
    importSuccess: '회원 데이터가 성공적으로 가져왔습니다.'
  },
  error: {
    saveFailed: '상담 기록 저장에 실패했습니다.',
    deleteFailed: '상담 기록 삭제에 실패했습니다.',
    loadFailed: '상담 데이터 로딩에 실패했습니다.',
    promotionFailed: '회원 등록에 실패했습니다.',
    importFailed: '회원 데이터 가져오기에 실패했습니다.'
  },
  confirm: {
    deleteConfirm: '정말로 이 상담 기록을 삭제하시겠습니까?',
    promotionConfirm: '이 상담 회원을 정식 회원으로 등록하시겠습니까?'
  }
} as const;

// 필터 초기값 설정
export const CONSULTATION_FILTER_DEFAULTS = {
  search: '',
  status: 'all' as const,
  staffName: 'all' as const,
  gender: 'all' as const,
  consultationType: 'all' as const,
  dateRange: 'all' as const
} as const;

// 테스트 데이터 식별자
export const CONSULTATION_TEST_IDS = {
  pageContainer: 'consultation-dashboard-container',
  pageHeader: 'consultation-dashboard-header',
  addButton: 'add-consultation-button',
  resetButton: 'reset-filters-button'
} as const; 