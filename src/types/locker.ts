// 락커 관련 추가 타입 정의
import { Locker } from '../models/types';

// 락커 월 사용료 설정 타입
export interface LockerMonthlyFee {
  lockerId: number;
  monthlyFee: number;
  validFrom: string; // 적용 시작일
  validTo?: string; // 적용 종료일 (선택사항)
}

// 회원 락커 정보 타입 (간단 표시용)
export interface MemberLockerInfo {
  id: number;
  number: string;
  location?: string;
  size?: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  status: 'active' | 'expired' | 'expiring_soon' | 'available';
  daysRemaining: number;
}

// 락커 월 사용료 유효성 검증 타입
export interface LockerFeeValidation {
  isValid: boolean;
  error?: string;
  min: number;
  max: number;
}

// 락커 사용료 계산 결과 타입
export interface LockerFeeCalculation {
  monthlyFee: number;
  totalMonths: number;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
}

// 락커 정보 확장 타입 (월 사용료 포함)
export interface LockerWithFee extends Locker {
  monthlyFee: number;
}

// 락커 상태 확인 결과 타입
export interface LockerStatusInfo {
  status: 'active' | 'expired' | 'expiring_soon' | 'available';
  message: string;
  daysRemaining?: number;
  isActionRequired: boolean;
} 