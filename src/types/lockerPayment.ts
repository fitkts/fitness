// 락커 결제 관련 타입 정의
import { Locker } from '../models/types';

// 결제 방법 타입
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

// 락커 결제 폼 데이터
export interface LockerPaymentFormData {
  months: number;
  paymentMethod: PaymentMethod;
  startDate: string;
  notes?: string;
}

// 락커 결제 계산 결과
export interface LockerPaymentCalculation {
  originalAmount: number;      // 원래 금액
  discountRate: number;        // 할인율 (%)
  discountAmount: number;      // 할인 금액
  finalAmount: number;         // 최종 결제 금액
  startDate: string;           // 시작일
  endDate: string;             // 종료일
}

// 결제 데이터 (백엔드 전송용)
export interface LockerPaymentData {
  lockerId: string;
  memberId: string;
  memberName: string;
  lockerNumber: string;
  months: number;
  startDate: string;
  endDate: string;
  amount: number;
  originalAmount: number;
  discountRate: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// 락커 결제 폼 컴포넌트 Props
export interface LockerPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: LockerPaymentData) => Promise<boolean>;
  locker: Locker & { 
    monthlyFee: number;
    memberId?: string;
    memberName?: string;
    endDate?: string;
  };
  isExtension?: boolean;
}

// 결제 유효성 검증 결과
export interface PaymentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 결제 유효성 검증 데이터
export interface PaymentValidationData {
  months: number;
  paymentMethod: PaymentMethod;
  startDate: string;
  amount: number;
} 