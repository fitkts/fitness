import { z } from 'zod';

// 락커 번호 검증 함수를 여기로 이동 (circular import 방지)
const validateLockerNumber = (number: string): boolean => {
  // 앞의 0을 제거하고 숫자만 허용하는 정규식
  const normalizedNumber = number.replace(/^0+/, '');
  const numberRegex = /^\d+$/;

  if (!numberRegex.test(normalizedNumber)) {
    return false;
  }
  
  const num = parseInt(normalizedNumber, 10);
  return num >= 1 && num <= 9999; // 범위를 더 넓게 조정
};

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
  staffId: z.number().optional(),
  staffName: z.string().optional(),
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
  staffId: z.number().optional(),
  staffName: z.string().optional(),
  createdAt: z.string().optional(),
});

// 이용권(MembershipType) 스키마
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

// StaffStatus enum 정의 추가
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// StaffPosition enum 정의 추가
export enum StaffPosition {
  MANAGER = '관리자',
  FRONT_DESK = '프론트 데스크',
  TRAINER = '트레이너',
  PART_TIME = '아르바이트',
  GENERAL = '일반 직원',
  INTERN = '인턴',
}

// StaffPermissions 타입 정의 추가
export type StaffPermissions = {
  dashboard: boolean;
  members: boolean;
  attendance: boolean;
  payment: boolean;
  lockers: boolean;
  staff: boolean;
  excel: boolean;
  backup: boolean;
  settings: boolean;
};

// 스태프 스키마
export const staffSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: '이름은 필수입니다' }),
  position: z.string().min(1, { message: '직책은 필수입니다' }),
  phone: z.string().optional(),
  email: z
    .string()
    .email({ message: '유효한 이메일을 입력하세요' })
    .optional()
    .or(z.literal('')),
  hireDate: z.string().min(1, { message: '입사일은 필수입니다' }),
  status: z.nativeEnum(StaffStatus, {
    errorMap: () => ({ message: '유효한 상태를 선택해주세요' }),
  }),
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

// 락커 크기 Enum (새로 추가)
export enum LockerSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

// 락커 요금 옵션 스키마 (새로 추가)
export const lockerFeeOptionSchema = z.object({
  durationDays: z.number().positive({ message: '기간(일)은 양수여야 합니다.' }),
  price: z.number().nonnegative({ message: '가격은 0 이상이어야 합니다.' }),
  // id: z.string().optional(), // 필요시 각 요금 옵션 고유 ID
});
export type LockerFeeOption = z.infer<typeof lockerFeeOptionSchema>;

// 락커 스키마
export const lockerSchema = z.object({
  id: z.number().optional(),
  number: z.string().min(1, { message: '락커 번호는 필수입니다' })
            .refine(validateLockerNumber, { message: '유효한 락커 번호를 입력해주세요. (1-9999 숫자)' }),
  size: z.nativeEnum(LockerSize, { errorMap: () => ({ message: '유효한 락커 크기를 선택해주세요.' })}).optional(),
  location: z.string().max(100, '위치는 100자 이내로 입력해주세요.').optional(),
  status: z.enum(['available', 'occupied', 'maintenance'], { errorMap: () => ({ message: '유효한 락커 상태를 선택해주세요.' })}),
  feeOptions: z.array(lockerFeeOptionSchema).optional().default([]),
  memberId: z.number().optional(),
  memberName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().max(500, '비고는 500자 이내로 입력해주세요.').optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).refine((data) => {
  // 사용 중인 락커는 회원 정보가 필요
  if (data.status === 'occupied') {
    return data.memberId && data.startDate && data.endDate;
  }
  return true;
}, {
  message: '사용 중인 락커는 회원 정보와 사용 기간이 필요합니다.',
  path: ['status']
});

// TypeScript 타입 정의
export type Member = z.infer<typeof memberSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type MembershipType = z.infer<typeof membershipTypeSchema>;
export type Staff = z.infer<typeof staffSchema>;
export type Locker = z.infer<typeof lockerSchema>;

// 회원 필터링을 위한 타입
export type MemberFilter = {
  search?: string;
  status?: 'active' | 'expired' | 'all';
  membershipType?: string;
  sortKey?: string;
  sortDirection?: 'ascending' | 'descending' | null;
};

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
