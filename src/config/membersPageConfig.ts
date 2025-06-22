// Members 페이지 전용 설정 파일

// 페이지 스타일 설정
export const MEMBERS_PAGE_STYLES = {
  container: 'page-container space-y-6',
  header: {
    wrapper: 'page-header flex items-center justify-between',
    title: 'page-title text-3xl font-bold text-gray-800'
  }
} as const;

// 메시지 설정
export const MEMBERS_MESSAGES = {
  pageTitle: '회원 관리',
  success: {
    memberAdded: '새 회원이 추가되었습니다.',
    memberUpdated: '회원 정보가 수정되었습니다.',
    memberDeleted: '회원이 삭제되었습니다.'
  },
  error: {
    saveFailed: '회원 정보 저장에 실패했습니다.',
    deleteFailed: '회원 삭제에 실패했습니다.',
    loadFailed: '회원 데이터 로딩에 실패했습니다.'
  },
  confirm: {
    deleteConfirm: '정말로 이 회원을 삭제하시겠습니까?'
  }
} as const;

// 필터 초기값 설정
export const MEMBERS_FILTER_DEFAULTS = {
  search: '',
  status: 'all' as const,
  staffName: 'all' as const,
  gender: 'all' as const,
  membershipType: 'all' as const
} as const;

// 모달 상태 초기값
export const MEMBERS_MODAL_DEFAULTS = {
  isOpen: false,
  isViewMode: false,
  selectedMember: null
} as const;

// 테스트 데이터 식별자
export const MEMBERS_TEST_IDS = {
  pageContainer: 'members-page-container',
  pageHeader: 'members-page-header',
  addButton: 'add-member-button',
  resetButton: 'reset-filters-button',
  pageHeaderComponent: 'page-header-component',
  pageContainerComponent: 'page-container-component'
} as const; 