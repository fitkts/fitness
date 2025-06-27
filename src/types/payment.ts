import { z } from 'zod';

// 결제 방법 enum
export enum PaymentMethod {
  CARD = '카드',
  CASH = '현금',
  BANK_TRANSFER = '계좌이체',
  OTHER = '기타',
}

// 결제 상태 enum
export enum PaymentStatus {
  COMPLETED = '완료',
  PENDING = '대기',
  CANCELLED = '취소',
  REFUNDED = '환불',
}

// 회원권 유형 enum
export enum MembershipTypeEnum {
  MONTH_1 = '1개월권',
  MONTH_3 = '3개월권',
  MONTH_6 = '6개월권',
  MONTH_12 = '12개월권',
  PT_10 = 'PT 10회',
  PT_20 = 'PT 20회',
  CUSTOM = '커스텀',
}

// 결제 스키마
export const paymentSchema = z.object({
  id: z.number().optional(),
  memberId: z.number().min(1, { message: '회원 ID는 필수입니다' }),
  memberName: z.string().min(1, { message: '회원 이름은 필수입니다' }),
  amount: z.number().min(0, { message: '금액은 0 이상이어야 합니다' }),
  paymentDate: z.string().min(1, { message: '결제일은 필수입니다' }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: '유효한 결제 방법을 선택해주세요' }),
  }),
  membershipType: z.string().min(1, { message: '이용권 종류는 필수입니다' }),
  receiptNumber: z.string().optional(),
  startDate: z.string().min(1, { message: '시작일은 필수입니다' }),
  endDate: z.string().optional(),
  status: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: '유효한 상태를 선택해주세요' }),
  }),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 타입스크립트 타입 정의
export type Payment = z.infer<typeof paymentSchema>;

// 멤버십 타입 스키마
export const membershipTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이용권 이름은 필수입니다' }),
  durationMonths: z
    .number()
    .min(1, { message: '기간(개월)은 1 이상이어야 합니다' }),
  price: z.number().min(0, { message: '가격은 0 이상이어야 합니다' }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  maxUses: z.number().optional(),
  availableFacilities: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MembershipType = z.infer<typeof membershipTypeSchema>;

// 결제 요약 정보 타입
export interface PaymentSummary {
  totalAmount: number;
  totalCount: number;
  byMethod: Record<PaymentMethod, number>;
  byStatus: Record<PaymentStatus, number>;
  byMembershipType: Record<string, number>;
}

// 결제 필터 타입
export interface PaymentFilter {
  search?: string;
  status?: 'all' | '완료' | '취소' | '환불' | '대기';
  membershipType?: string;
  paymentMethod?: 'all' | '현금' | '카드' | '계좌이체' | '기타';
  staffName?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// 간소화된 결제 옵션 타입 (UI에서 사용)
export interface PaymentOption {
  id: number;
  name: string;
}

// 이용권 옵션 타입 (UI에서 사용)
export interface MembershipTypeOption {
  name: string;
  price: number;
  durationMonths: number;
}

export interface MembershipTypeFilter {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
}

export interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  canceledPayments: number;
  canceledAmount: number;
  refundedPayments: number;
  refundedAmount: number;
  averageAmount: number;
  topMembershipTypes: Array<{
    name: string;
    count: number;
    amount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

export interface PaymentDateRange {
  startDate: string;
  endDate: string;
  label: string;
  type?: 'today' | 'week' | 'month' | 'year' | 'days';
  days?: number; // days 타입일 때 사용
}

export interface PaymentAmountRange {
  min: number;
  max: number;
  label: string;
}
