// 통합 회원 타입 정의
// 정식 회원과 상담 회원을 모두 아우르는 통합 타입

import { 
  BaseEntity, 
  PersonalInfo, 
  StaffInfo, 
  MembershipInfo, 
  ConsultationStatus, 
  PromotionInfo,
  DateString 
} from './common';

// 기본 회원 인터페이스 (공통 필드)
export interface BaseMember extends BaseEntity, PersonalInfo, StaffInfo {
  joinDate: DateString; // 가입일 또는 최초 상담일
  lastVisit?: DateString;
  notes?: string;
}

// 정식 회원 (기존 Member 타입)
export interface Member extends BaseMember, MembershipInfo {
  memberType: 'regular'; // 회원 구분자
}

// 상담 회원 (기존 ConsultationMember 타입)
export interface ConsultationMember extends BaseMember, PromotionInfo {
  memberType: 'consultation'; // 회원 구분자
  firstVisit?: DateString;
  consultationStatus?: ConsultationStatus;
  healthConditions?: string;
  fitnessGoals?: string[];
}

// 통합 회원 타입 (Union Type)
export type UnifiedMember = Member | ConsultationMember;

// 회원 상태 정보
export interface MemberStatusInfo {
  status: 'active' | 'expired' | 'pending' | 'consultation';
  isExpiringSoon?: boolean;
  daysUntilExpiry?: number;
  canBePromoted?: boolean;
  canBeDowngraded?: boolean;
}

// 회원 변환 데이터 타입
export interface MemberConversionData {
  // 상담회원 → 정식회원 승격용
  membershipTypeId?: number;
  membershipType?: string;
  membershipStart?: DateString;
  membershipEnd?: DateString;
  paymentAmount?: number;
  paymentMethod?: 'card' | 'cash' | 'transfer';
  
  // 공통 업데이트 필드
  staffId?: number;
  staffName?: string;
  notes?: string;
}

// 데이터 검증 결과
export interface MemberValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// 회원 검색 필터 (통합)
export interface UnifiedMemberFilter {
  search?: string;
  memberType?: 'all' | 'regular' | 'consultation';
  status?: 'all' | 'active' | 'expired' | 'pending' | 'consultation';
  membershipType?: string;
  consultationStatus?: ConsultationStatus;
  staffId?: number;
  startDate?: DateString;
  endDate?: DateString;
  sortKey?: keyof UnifiedMember;
  sortDirection?: 'ascending' | 'descending';
}

// 회원 통계 정보
export interface UnifiedMemberStats {
  total: number;
  regular: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
  };
  consultation: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    readyForPromotion: number;
  };
  recentActivities: {
    newMembers: number;
    newConsultations: number;
    promotions: number;
  };
} 