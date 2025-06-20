// 공통 기본 타입 정의
// 모든 엔티티에서 공통으로 사용되는 타입들

// 날짜 타입 (ISO 문자열 또는 Unix timestamp)
export type DateString = string; // YYYY-MM-DD 형식
export type TimestampNumber = number; // Unix timestamp (초 단위)
export type DateTime = DateString | TimestampNumber;

// 성별 타입 (표준화)
export type Gender = '남' | '여' | '기타';

// 상태 관련 공통 타입
export type ActiveStatus = 'active' | 'inactive';
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'suspended';

// 기본 엔티티 인터페이스
export interface BaseEntity {
  id?: number;
  createdAt?: DateString;
  updatedAt?: DateString;
}

// 개인정보 기본 인터페이스
export interface PersonalInfo {
  name: string;
  phone?: string;
  email?: string;
  gender?: Gender;
  birthDate?: DateString;
}

// 담당자 정보 인터페이스
export interface StaffInfo {
  staffId?: number;
  staffName?: string;
}

// 회원권 관련 정보 인터페이스
export interface MembershipInfo {
  membershipType?: string;
  membershipStart?: DateString;
  membershipEnd?: DateString;
}

// 상담 상태 타입
export type ConsultationStatus = 'pending' | 'in_progress' | 'completed' | 'follow_up';

// 승격 관련 정보 인터페이스
export interface PromotionInfo {
  isPromoted?: boolean;
  promotedAt?: DateString;
  promotedMemberId?: number;
} 