// 통합 회원 관리 시스템 설정
// 프론트엔드와 백엔드에서 공통으로 사용되는 설정값들

import { UnifiedMemberFilter } from '../types/unifiedMember';

// 회원 타입 옵션
export const MEMBER_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'regular', label: '정식 회원' },
  { value: 'consultation', label: '상담 회원' }
] as const;

// 상담 상태 옵션
export const CONSULTATION_STATUS_OPTIONS = [
  { value: 'pending', label: '대기중' },
  { value: 'in_progress', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'follow_up', label: '후속 상담' }
] as const;

// 회원 상태 옵션
export const MEMBER_STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'expired', label: '만료' },
  { value: 'pending', label: '대기' },
  { value: 'consultation', label: '상담중' }
] as const;

// 성별 옵션
export const GENDER_OPTIONS = [
  { value: '남', label: '남성' },
  { value: '여', label: '여성' },
  { value: '기타', label: '기타' }
] as const;

// 결제 방법 옵션
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: '카드' },
  { value: 'cash', label: '현금' },
  { value: 'transfer', label: '계좌이체' }
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'name', label: '이름' },
  { value: 'joinDate', label: '가입일' },
  { value: 'lastVisit', label: '최근 방문' },
  { value: 'membershipEnd', label: '회원권 만료일' }
] as const;

// 정렬 방향 옵션
export const SORT_DIRECTION_OPTIONS = [
  { value: 'ascending', label: '오름차순' },
  { value: 'descending', label: '내림차순' }
] as const;

// 기본 필터 설정
export const DEFAULT_MEMBER_FILTER: UnifiedMemberFilter = {
  memberType: 'all',
  status: 'all',
  sortKey: 'name',
  sortDirection: 'ascending'
};

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPagesVisible: 5
} as const;

// 테이블 컬럼 설정
export const TABLE_COLUMNS = {
  regular: [
    { key: 'name', label: '이름', sortable: true },
    { key: 'phone', label: '연락처', sortable: false },
    { key: 'membershipType', label: '회원권', sortable: true },
    { key: 'membershipEnd', label: '만료일', sortable: true },
    { key: 'lastVisit', label: '최근 방문', sortable: true },
    { key: 'staffName', label: '담당자', sortable: true },
    { key: 'actions', label: '작업', sortable: false }
  ],
  consultation: [
    { key: 'name', label: '이름', sortable: true },
    { key: 'phone', label: '연락처', sortable: false },
    { key: 'consultationStatus', label: '상담 상태', sortable: true },
    { key: 'firstVisit', label: '첫 방문', sortable: true },
    { key: 'staffName', label: '담당자', sortable: true },
    { key: 'isPromoted', label: '승격 여부', sortable: true },
    { key: 'actions', label: '작업', sortable: false }
  ],
  unified: [
    { key: 'memberType', label: '타입', sortable: true },
    { key: 'name', label: '이름', sortable: true },
    { key: 'phone', label: '연락처', sortable: false },
    { key: 'status', label: '상태', sortable: true },
    { key: 'joinDate', label: '가입일', sortable: true },
    { key: 'staffName', label: '담당자', sortable: true },
    { key: 'actions', label: '작업', sortable: false }
  ]
} as const;

// 승격 관련 설정
export const PROMOTION_CONFIG = {
  requiredConsultationStatus: 'completed',
  defaultMembershipTypes: [
    { id: 1, name: '1개월권', duration: 1, price: 100000 },
    { id: 2, name: '3개월권', duration: 3, price: 270000 },
    { id: 3, name: '6개월권', duration: 6, price: 500000 },
    { id: 4, name: '12개월권', duration: 12, price: 900000 }
  ],
  promotionNoteTe: '상담회원에서 정식회원으로 승격되었습니다.'
} as const;

// 알림 메시지
export const NOTIFICATION_MESSAGES = {
  memberCreated: '회원이 성공적으로 생성되었습니다.',
  memberUpdated: '회원 정보가 성공적으로 수정되었습니다.',
  memberDeleted: '회원이 성공적으로 삭제되었습니다.',
  promotionSuccess: '상담회원이 정식회원으로 승격되었습니다.',
  promotionFailed: '승격 처리 중 오류가 발생했습니다.',
  demotionSuccess: '정식회원이 상담회원으로 변경되었습니다.',
  demotionFailed: '강등 처리 중 오류가 발생했습니다.',
  dataLoadError: '데이터를 불러오는 중 오류가 발생했습니다.',
  validationError: '입력 정보를 확인해주세요.',
  networkError: '네트워크 오류가 발생했습니다.'
} as const;

// 폼 검증 규칙
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    required: true,
    pattern: /^010-\d{4}-\d{4}$/,
    message: '올바른 휴대폰 번호를 입력하세요 (010-0000-0000)'
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 주소를 입력하세요'
  },
  birthDate: {
    required: false,
    message: '올바른 생년월일을 입력하세요 (YYYY-MM-DD)'
  },
  membershipType: {
    required: true,
    message: '회원권 종류를 선택하세요'
  },
  paymentAmount: {
    required: true,
    min: 0,
    message: '결제 금액을 입력하세요'
  }
} as const;

// UI 색상 설정
export const STATUS_COLORS = {
  active: '#10B981', // green-500
  expired: '#EF4444', // red-500
  pending: '#F59E0B', // yellow-500
  consultation: '#3B82F6', // blue-500
  expiringSoon: '#F97316' // orange-500
} as const;

// 아이콘 설정
export const STATUS_ICONS = {
  regular: '👤',
  consultation: '💬',
  active: '✅',
  expired: '❌',
  pending: '⏳',
  expiringSoon: '⚠️'
} as const; 