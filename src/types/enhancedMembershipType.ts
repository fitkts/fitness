import { z } from 'zod';

// 이용권 카테고리 enum
export enum MembershipCategory {
  MONTHLY = 'monthly',  // 월간 회원권
  PT = 'pt'            // PT 회원권
}

// PT 유형 enum  
export enum PTType {
  SESSION_BASED = 'session_based', // 횟수제 (예: PT 10회권)
  TERM_BASED = 'term_based'        // 기간제 (예: PT 1개월 무제한)
}

// 향상된 이용권 스키마
export const enhancedMembershipTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이용권 이름은 필수입니다' }),
  price: z.number().min(0, { message: '가격은 0 이상이어야 합니다' }),
  membershipCategory: z.nativeEnum(MembershipCategory, { 
    errorMap: () => ({ message: '이용권 카테고리를 선택해주세요' }) 
  }),
  
  // PT 관련 필드
  ptType: z.nativeEnum(PTType, { 
    errorMap: () => ({ message: 'PT 유형을 선택해주세요' }) 
  }).optional().nullable(),
  
  // 기간 (월간 회원권과 기간제 PT에 필요)
  durationMonths: z.number().min(1, { 
    message: '기간은 최소 1개월 이상이어야 합니다' 
  }).optional(),
  
  // 횟수 (횟수제 PT에 필요)
  maxUses: z.number().min(1, { 
    message: 'PT 세션 수는 1회 이상이어야 합니다' 
  }).optional().nullable(),
  
  // 기존 필드들
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  availableFacilities: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).refine((data) => {
  // 월간 회원권은 기간이 필수
  if (data.membershipCategory === MembershipCategory.MONTHLY) {
    return data.durationMonths && data.durationMonths >= 1;
  }
  return true;
}, {
  message: '월간 회원권은 기간이 필수입니다',
  path: ['durationMonths']
}).refine((data) => {
  // PT 회원권은 ptType이 필수
  if (data.membershipCategory === MembershipCategory.PT) {
    return data.ptType !== null && data.ptType !== undefined;
  }
  return true;
}, {
  message: 'PT 회원권은 PT 유형이 필수입니다',
  path: ['ptType']
}).refine((data) => {
  // 횟수제 PT는 maxUses가 필수
  if (data.membershipCategory === MembershipCategory.PT && data.ptType === PTType.SESSION_BASED) {
    return data.maxUses && data.maxUses >= 1;
  }
  return true;
}, {
  message: '횟수제 PT는 세션 수가 필수입니다',
  path: ['maxUses']
}).refine((data) => {
  // 기간제 PT는 durationMonths가 필수
  if (data.membershipCategory === MembershipCategory.PT && data.ptType === PTType.TERM_BASED) {
    return data.durationMonths && data.durationMonths >= 1;
  }
  return true;
}, {
  message: '기간제 PT는 기간이 필수입니다',
  path: ['durationMonths']
}).refine((data) => {
  // 기간제 PT는 maxUses가 null이어야 함
  if (data.membershipCategory === MembershipCategory.PT && data.ptType === PTType.TERM_BASED) {
    return data.maxUses === null || data.maxUses === undefined;
  }
  return true;
}, {
  message: '기간제 PT는 무제한 사용입니다',
  path: ['maxUses']
});

// TypeScript 타입 정의
export type EnhancedMembershipType = z.infer<typeof enhancedMembershipTypeSchema>;

// 폼 데이터 타입 (UI에서 사용)
export interface MembershipTypeFormData {
  name: string;
  price: number;
  membershipCategory: MembershipCategory;
  ptType?: PTType | null;
  durationMonths?: number;
  maxUses?: number | null;
  description?: string;
  isActive: boolean;
}

// 기존 MembershipType과의 호환성을 위한 변환 함수들
export const convertToEnhanced = (legacy: any): EnhancedMembershipType => {
  // 기존 데이터에서 카테고리 추론
  const membershipCategory = legacy.maxUses && legacy.maxUses > 0 
    ? MembershipCategory.PT 
    : MembershipCategory.MONTHLY;
  
  // PT 유형 추론 (횟수가 있으면 횟수제, 없으면 기간제)
  const ptType = membershipCategory === MembershipCategory.PT
    ? (legacy.maxUses ? PTType.SESSION_BASED : PTType.TERM_BASED)
    : null;

  return {
    ...legacy,
    membershipCategory,
    ptType,
    durationMonths: legacy.durationMonths || 1,
    maxUses: membershipCategory === MembershipCategory.PT && ptType === PTType.SESSION_BASED 
      ? legacy.maxUses 
      : null
  };
};

export const convertToLegacy = (enhanced: EnhancedMembershipType): any => {
  return {
    id: enhanced.id,
    name: enhanced.name,
    price: enhanced.price,
    durationMonths: enhanced.durationMonths || 1,
    description: enhanced.description,
    isActive: enhanced.isActive,
    maxUses: enhanced.membershipCategory === MembershipCategory.PT && enhanced.ptType === PTType.SESSION_BASED
      ? enhanced.maxUses
      : null,
    availableFacilities: enhanced.availableFacilities,
    createdAt: enhanced.createdAt,
    updatedAt: enhanced.updatedAt
  };
};

// 이용권 템플릿 (UI에서 빠른 생성용)
export const MEMBERSHIP_TEMPLATES = {
  monthly: [
    { name: '헬스 1개월', price: 60000, durationMonths: 1 },
    { name: '헬스 3개월', price: 150000, durationMonths: 3 },
    { name: '헬스 6개월', price: 280000, durationMonths: 6 },
    { name: '헬스 12개월', price: 500000, durationMonths: 12 }
  ],
  ptSessionBased: [
    { name: 'PT 5회권', price: 250000, maxUses: 5 },
    { name: 'PT 10회권', price: 450000, maxUses: 10 },
    { name: 'PT 20회권', price: 800000, maxUses: 20 },
    { name: 'PT 30회권', price: 1100000, maxUses: 30 }
  ],
  ptTermBased: [
    { name: 'PT 1개월 무제한', price: 800000, durationMonths: 1 },
    { name: 'PT 3개월 무제한', price: 2200000, durationMonths: 3 },
    { name: 'PT 6개월 무제한', price: 4000000, durationMonths: 6 }
  ]
}; 