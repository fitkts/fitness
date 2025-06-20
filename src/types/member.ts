// models/types.ts에서 타입을 가져와서 재사용
export { 
  Member, 
  Staff, 
  MemberFilter,
  Payment,
  Attendance,
  MembershipType,
  Locker 
} from '../models/types';

// 회원 관련 추가 타입 정의
export interface MemberStatistics {
  total: number;
  active: number;
  expired: number;
  expiringIn30Days: number;
  topMembershipTypes: [string, number][];
}

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending' | null;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  showAll: boolean;
}

export type MemberStatus = 'active' | 'expired';

// MemberSearchFilter 액션 버튼 관련 타입 추가
import type { Member } from '../models/types';

export interface MemberSearchFilterActions {
  onAddMember?: () => void;
  onImportSuccess?: () => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  members?: Member[];
  showActionButtons?: boolean;
} 