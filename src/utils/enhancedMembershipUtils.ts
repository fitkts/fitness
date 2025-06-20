import { MembershipCategory, PTType, MembershipType, MembershipTypeFormData } from '../models/types';
import { VALIDATION_MESSAGES } from '../config/enhancedMembershipConfig';

// 이용권 카테고리 확인 함수들
export const isMonthlymembership = (category: MembershipCategory): boolean => {
  return category === MembershipCategory.MONTHLY;
};

export const isPTMembership = (category: MembershipCategory): boolean => {
  return category === MembershipCategory.PT;
};

export const isSessionBasedPT = (category: MembershipCategory, ptType: PTType | null): boolean => {
  return category === MembershipCategory.PT && ptType === PTType.SESSION_BASED;
};

export const isTermBasedPT = (category: MembershipCategory, ptType: PTType | null): boolean => {
  return category === MembershipCategory.PT && ptType === PTType.TERM_BASED;
};

// 이용권 이름 생성 함수
export const generateMembershipName = (
  category: MembershipCategory,
  ptType: PTType | null,
  duration?: number,
  sessions?: number
): string => {
  if (category === MembershipCategory.MONTHLY && duration) {
    return `헬스 ${duration}개월`;
  }
  
  if (category === MembershipCategory.PT) {
    if (ptType === PTType.SESSION_BASED && sessions) {
      return `PT ${sessions}회권`;
    }
    if (ptType === PTType.TERM_BASED && duration) {
      return `PT ${duration}개월 무제한`;
    }
  }
  
  return '';
};

// 가격 포맷팅 함수
export const formatMembershipPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0
  }).format(price);
};

// 이용권 설명 생성 함수
export const generateMembershipDescription = (
  category: MembershipCategory,
  ptType: PTType | null,
  duration?: number,
  sessions?: number
): string => {
  if (category === MembershipCategory.MONTHLY && duration) {
    if (duration === 1) return '기본 월간 헬스장 이용권';
    if (duration === 3) return '3개월 할인 혜택 포함';
    if (duration === 6) return '6개월 할인 혜택 포함';
    if (duration >= 12) return '연간 최대 할인 혜택';
    return `${duration}개월 헬스장 이용권`;
  }
  
  if (category === MembershipCategory.PT) {
    if (ptType === PTType.SESSION_BASED && sessions) {
      if (sessions <= 5) return '초보자 추천 패키지';
      if (sessions <= 10) return '가장 인기있는 패키지';
      if (sessions <= 20) return '집중 관리 패키지';
      return '장기 관리 패키지';
    }
    if (ptType === PTType.TERM_BASED && duration) {
      if (duration === 1) return '단기 집중 관리';
      if (duration === 3) return '체형 변화 프로그램';
      return '장기 체질 개선 프로그램';
    }
  }
  
  return '';
};

// 폼 데이터 유효성 검사
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateMembershipForm = (data: MembershipTypeFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // 이용권 이름 검사
  if (!data.name || data.name.trim().length === 0) {
    errors.name = '이용권 이름을 입력해주세요.';
  }
  
  // 가격 검사
  if (data.price === null || data.price === undefined || data.price < 0) {
    errors.price = '가격을 입력해주세요.';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 폼 데이터를 데이터베이스 형식으로 변환
export const convertFormDataToMembershipType = (formData: MembershipTypeFormData): Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'> => {
  const base = {
    name: formData.name.trim(),
    price: formData.price,
    membershipCategory: formData.membershipCategory,
    description: formData.description || '',
    isActive: formData.isActive
  };

  if (formData.membershipCategory === MembershipCategory.MONTHLY) {
    return {
      ...base,
      durationMonths: formData.durationMonths || 1,
      ptType: null,
      maxUses: null,
      availableFacilities: []
    };
  }

  if (formData.membershipCategory === MembershipCategory.PT) {
    const ptBase = {
      ...base,
      ptType: formData.ptType || null,
      availableFacilities: []
    };

    if (formData.ptType === PTType.SESSION_BASED) {
      return {
        ...ptBase,
        durationMonths: 1, // 기본값
        maxUses: formData.maxUses || null
      };
    }

    if (formData.ptType === PTType.TERM_BASED) {
      return {
        ...ptBase,
        durationMonths: formData.durationMonths || 1,
        maxUses: null
      };
    }
  }

  // 기본 반환 (오류 방지)
  return {
    ...base,
    durationMonths: 1,
    ptType: null,
    maxUses: null,
    availableFacilities: []
  };
};

// 기존 이용권 데이터를 폼 데이터로 변환
export const convertMembershipTypeToFormData = (membershipType: MembershipType): MembershipTypeFormData => {
  return {
    name: membershipType.name,
    price: membershipType.price,
    membershipCategory: membershipType.membershipCategory || MembershipCategory.MONTHLY,
    ptType: membershipType.ptType || null,
    durationMonths: membershipType.durationMonths,
    maxUses: membershipType.maxUses,
    description: membershipType.description || '',
    isActive: membershipType.isActive !== false
  };
};

// 이용권 디스플레이 정보 생성
export interface MembershipDisplayInfo {
  categoryLabel: string;
  typeLabel: string;
  durationText: string;
  priceText: string;
  description: string;
  badgeColor: 'blue' | 'violet' | 'green' | 'gray';
}

export const getMembershipDisplayInfo = (membershipType: MembershipType): MembershipDisplayInfo => {
  const categoryLabel = membershipType.membershipCategory === MembershipCategory.MONTHLY ? '월간 회원권' : 'PT 회원권';
  
  let typeLabel = '';
  let durationText = '';
  let badgeColor: 'blue' | 'violet' | 'green' | 'gray' = 'gray';
  
  if (membershipType.membershipCategory === MembershipCategory.MONTHLY) {
    typeLabel = '기간제';
    durationText = `${membershipType.durationMonths}개월`;
    badgeColor = 'blue';
  } else if (membershipType.membershipCategory === MembershipCategory.PT) {
    badgeColor = 'violet';
    if (membershipType.ptType === PTType.SESSION_BASED) {
      typeLabel = '횟수제';
      durationText = `${membershipType.maxUses}회`;
    } else if (membershipType.ptType === PTType.TERM_BASED) {
      typeLabel = '기간제';
      durationText = `${membershipType.durationMonths}개월 무제한`;
    }
  }
  
  const priceText = formatMembershipPrice(membershipType.price);
  const description = membershipType.description || generateMembershipDescription(
    membershipType.membershipCategory || MembershipCategory.MONTHLY,
    membershipType.ptType || null,
    membershipType.durationMonths,
    membershipType.maxUses || undefined
  );
  
  return {
    categoryLabel,
    typeLabel,
    durationText,
    priceText,
    description,
    badgeColor
  };
};

// 이용권 통계를 위한 계산 함수
export const calculateMembershipStats = (membershipTypes: MembershipType[]) => {
  const totalCount = membershipTypes.length;
  const monthlyCount = membershipTypes.filter(m => m.membershipCategory === MembershipCategory.MONTHLY).length;
  const ptCount = membershipTypes.filter(m => m.membershipCategory === MembershipCategory.PT).length;
  const sessionBasedCount = membershipTypes.filter(m => 
    m.membershipCategory === MembershipCategory.PT && m.ptType === PTType.SESSION_BASED
  ).length;
  const termBasedCount = membershipTypes.filter(m => 
    m.membershipCategory === MembershipCategory.PT && m.ptType === PTType.TERM_BASED
  ).length;
  const activeCount = membershipTypes.filter(m => m.isActive).length;
  
  const averagePrice = totalCount > 0 
    ? membershipTypes.reduce((sum, m) => sum + m.price, 0) / totalCount 
    : 0;
  
  return {
    totalCount,
    monthlyCount,
    ptCount,
    sessionBasedCount,
    termBasedCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    averagePrice
  };
}; 