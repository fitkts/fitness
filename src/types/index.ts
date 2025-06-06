import type { Locker as LockerFromModel } from '../models/types';

export interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  backupCount: number;
  notificationsEnabled: boolean;
  notificationsBeforeMembershipEnd: number;
  autoDeleteBackup: boolean;
  developerMode: boolean;
}

export interface AttendanceRecord {
  id: number;
  memberId: number;
  memberName: string; // 메인 프로세스에서 조인해서 가져오는 경우 필요, 또는 memberId만 관리
  visitDate: string; // YYYY-MM-DD 형식
}

export interface Member {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성' | '기타';
  birthDate?: string;
  joinDate: string;
  membershipType?: string;
  membershipStart?: string;
  membershipEnd?: string | null; // 스키마에서 .or(z.literal('')) 부분을 null 허용으로 해석 (또는 string만 유지)
  lastVisit?: string;
  notes?: string;
  staffId?: number;
  staffName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 기존 Locker 인터페이스 정의는 삭제되고, 아래에서 새로운 타입으로 정의됩니다.
export type Locker = LockerFromModel;

// 대시보드 통계 데이터 타입
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  attendanceToday: number;
  membershipDistribution: { type: string; count: number }[];
  monthlyAttendance: { month: string; count: number }[];
  recentActivities: {
    recentMembers: { id: number; name: string; joinDate: string }[];
    recentAttendance: { id: number; name: string; visitDate: string }[];
  };
}

// 다른 공통 타입들도 여기에 추가할 수 있습니다.
