import { MembershipCategory, PTType } from '../models/types';

// 이용권 카테고리 옵션
export const MEMBERSHIP_CATEGORY_OPTIONS = [
  {
    value: MembershipCategory.MONTHLY,
    label: '월간 회원권',
    description: '정기적인 헬스장 이용을 위한 기간제 회원권',
    icon: '📅'
  },
  {
    value: MembershipCategory.PT,
    label: 'PT 회원권',
    description: '개인 트레이닝을 위한 전문 회원권',
    icon: '💪'
  }
] as const;

// PT 유형 옵션
export const PT_TYPE_OPTIONS = [
  {
    value: PTType.SESSION_BASED,
    label: '횟수제',
    description: '정해진 횟수만큼 PT 세션 이용',
    example: 'PT 10회권, PT 20회권 등'
  },
  {
    value: PTType.TERM_BASED,
    label: '기간제',
    description: '정해진 기간 동안 PT 무제한 이용',
    example: 'PT 1개월 무제한, PT 3개월 무제한 등'
  }
] as const;

// 이용권 템플릿 (빠른 생성용)
export const MEMBERSHIP_TEMPLATES = {
  [MembershipCategory.MONTHLY]: [
    { name: '헬스 1개월', price: 60000, durationMonths: 1, description: '기본 헬스장 이용권' },
    { name: '헬스 3개월', price: 150000, durationMonths: 3, description: '3개월 할인 혜택' },
    { name: '헬스 6개월', price: 280000, durationMonths: 6, description: '6개월 할인 혜택' },
    { name: '헬스 12개월', price: 500000, durationMonths: 12, description: '연간 최대 할인' }
  ],
  [PTType.SESSION_BASED]: [
    { name: 'PT 5회권', price: 250000, maxUses: 5, description: '초보자 추천' },
    { name: 'PT 10회권', price: 450000, maxUses: 10, description: '가장 인기있는 패키지' },
    { name: 'PT 20회권', price: 800000, maxUses: 20, description: '집중 관리 패키지' },
    { name: 'PT 30회권', price: 1100000, maxUses: 30, description: '장기 관리 패키지' }
  ],
  [PTType.TERM_BASED]: [
    { name: 'PT 1개월 무제한', price: 800000, durationMonths: 1, description: '단기 집중 관리' },
    { name: 'PT 3개월 무제한', price: 2200000, durationMonths: 3, description: '체형 변화 프로그램' },
    { name: 'PT 6개월 무제한', price: 4000000, durationMonths: 6, description: '장기 체질 개선' }
  ]
} as const;

// 유효성 검사 메시지
export const VALIDATION_MESSAGES = {
  name: {
    required: '이용권 이름을 입력해주세요.',
    minLength: '이용권 이름은 최소 2글자 이상이어야 합니다.',
    maxLength: '이용권 이름은 50글자를 초과할 수 없습니다.'
  },
  price: {
    required: '가격을 입력해주세요.',
    positive: '가격은 0원 이상이어야 합니다.',
    max: '가격은 10,000,000원을 초과할 수 없습니다.'
  },
  category: {
    required: '이용권 카테고리를 선택해주세요.'
  },
  ptType: {
    required: 'PT 유형을 선택해주세요.'
  },
  duration: {
    required: '기간을 입력해주세요.',
    min: '기간은 최소 1개월 이상이어야 합니다.',
    max: '기간은 최대 24개월까지 가능합니다.'
  },
  sessions: {
    required: 'PT 세션 수를 입력해주세요.',
    min: 'PT 세션 수는 최소 1회 이상이어야 합니다.',
    max: 'PT 세션 수는 최대 100회까지 가능합니다.'
  }
} as const;

// 폼 기본값
export const DEFAULT_FORM_VALUES = {
  name: '',
  price: 0,
  membershipCategory: MembershipCategory.MONTHLY,
  ptType: null,
  durationMonths: 1,
  maxUses: null,
  description: '',
  isActive: true
} as const;

// UI 설정
export const UI_CONFIG = {
  form: {
    maxNameLength: 50,
    maxDescriptionLength: 500,
    priceStep: 1000, // 가격 입력 단위
    durationStep: 1,  // 기간 입력 단위
    sessionStep: 1    // 세션 수 입력 단위
  },
  animation: {
    duration: 200, // 폼 변경 애니메이션 시간 (ms)
    easing: 'ease-in-out'
  }
} as const;

// 색상 테마
export const THEME_COLORS = {
  monthly: {
    primary: '#3B82F6',   // blue-500
    light: '#EFF6FF',     // blue-50
    text: '#1E40AF'       // blue-800
  },
  pt: {
    primary: '#8B5CF6',   // violet-500
    light: '#F5F3FF',     // violet-50
    text: '#5B21B6'       // violet-800
  }
} as const; 