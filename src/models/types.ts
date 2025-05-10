import { z } from 'zod';

// 회원 스키마
export const memberSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이름은 필수입니다' }),
  phone: z.string().optional(),
  email: z.string().optional(),
  gender: z.enum(['남성', '여성', '기타']).optional(),
  birthDate: z.string().optional(),
  joinDate: z.string(),
  membershipType: z.string().optional(),
  membershipStart: z.string().optional(),
  membershipEnd: z.string().optional().or(z.literal('')),
  lastVisit: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 출석 스키마
export const attendanceSchema = z.object({
  id: z.number().optional(),
  memberId: z.number(),
  visitDate: z.string(),
  createdAt: z.string().optional(),
});

// 결제 스키마
export const paymentSchema = z.object({
  id: z.number().optional(),
  memberId: z.number(),
  memberName: z.string(),
  amount: z.number().positive({ message: '금액은 양수여야 합니다' }),
  paymentDate: z.string(),
  paymentType: z.enum(['현금', '카드', '계좌이체', '기타']),
  paymentMethod: z.string(),
  membershipType: z.string(),
  receiptNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['완료', '취소', '환불']),
  notes: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
});

// 이용권(MembershipType) 스키마
export const membershipTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이용권 이름은 필수입니다' }),
  durationMonths: z.number().min(1, { message: '기간(개월)은 1 이상이어야 합니다' }),
  price: z.number().min(0, { message: '가격은 0 이상이어야 합니다' }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  maxUses: z.number().optional(),
  availableFacilities: z.array(z.string()).optional(),
});

// 스태프 스키마
export const staffSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이름은 필수입니다' }),
  position: z.string().min(1, { message: '직책은 필수입니다' }),
  phone: z.string().optional(),
  email: z.string().optional(),
  hireDate: z.string(),
  status: z.enum(['active', 'inactive']),
  permissions: z.object({
    dashboard: z.boolean(),
    members: z.boolean(),
    attendance: z.boolean(),
    payment: z.boolean(),
    lockers: z.boolean(),
    staff: z.boolean(),
    excel: z.boolean(),
    backup: z.boolean(),
    settings: z.boolean(),
  }),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 락커 스키마
export const lockerSchema = z.object({
  id: z.number().optional(),
  number: z.string().min(1, { message: '락커 번호는 필수입니다' }),
  status: z.enum(['available', 'occupied', 'maintenance']),
  memberId: z.number().optional(),
  memberName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// TypeScript 타입 정의
export type Member = z.infer<typeof memberSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type MembershipType = z.infer<typeof membershipTypeSchema>;
export type Staff = z.infer<typeof staffSchema>;
export type Locker = z.infer<typeof lockerSchema>;

// 회원 필터링을 위한 타입
export interface MemberFilter {
  search: string;
  membershipType?: string;
  status?: 'active' | 'expired' | 'all';
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    tension?: number;
  }[];
}

// 엑셀 가져오기 옵션
export interface ImportOptions {
  hasHeaders: boolean;
  sheet: string | number;
  mapping: {
    [key: string]: keyof Member;
  };
} 