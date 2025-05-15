import { z } from 'zod';

// 직원 상태 enum
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// 권한 타입
export interface StaffPermissions {
  dashboard: boolean;
  members: boolean;
  attendance: boolean;
  payment: boolean;
  lockers: boolean;
  staff: boolean;
  excel: boolean;
  backup: boolean;
  settings: boolean;
}

// 직원 스키마
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

// TypeScript 타입 정의
export type Staff = z.infer<typeof staffSchema>;

// 포지션 enum
export enum StaffPosition {
  MANAGER = '관리자',
  FRONT_DESK = '프론트 데스크',
  TRAINER = '트레이너',
  PART_TIME = '아르바이트',
  GENERAL = '일반 직원',
  INTERN = '인턴',
}

// 직원 옵션 타입 (UI에서 사용)
export interface StaffOption {
  id: number;
  name: string;
  position: string;
}

// 직원 필터 타입
export interface StaffFilter {
  search?: string;
  status?: StaffStatus | 'all';
  position?: string;
  sortKey?: keyof Staff;
  sortDirection?: 'ascending' | 'descending' | null;
}
