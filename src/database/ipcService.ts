// 안전하게 ipcRenderer를 가져오는 코드 (브라우저 환경에서도 에러 안나게)
let safeIpcRenderer: typeof import('electron').ipcRenderer | undefined = undefined;

try {
  // electron 환경에서만 require 사용
  // @ts-ignore
  safeIpcRenderer = window.require ? window.require('electron').ipcRenderer : undefined;
} catch (e) {
  safeIpcRenderer = undefined;
}

import { Member } from '../models/types';
import * as electronLog from 'electron-log';
import { Payment, MembershipType, Staff, Locker, MemberFilter } from '../models/types';

// 렌더러 프로세스에서 사용할 IPC 서비스
export class IpcMemberService {
  /**
   * 모든 회원 조회
   */
  static async getAll(): Promise<Member[]> {
    try {
      const response = await safeIpcRenderer?.invoke('get-all-members');
      if (response.success) {
        return response.data || [];
      } else {
        const errorMessage = response.error || '회원 데이터를 불러오는데 실패했습니다.';
        console.error('회원 데이터 조회 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('IPC 통신 오류:', errorMessage);
      throw new Error(`회원 목록 조회 중 오류 발생: ${errorMessage}`);
    }
  }
  
  /**
   * 새 회원 추가
   */
  static async add(member: Member): Promise<number> {
    try {
      if (!member.name) {
        throw new Error('회원 이름은 필수 입력 항목입니다.');
      }

      const response = await safeIpcRenderer?.invoke('add-member', member);
      if (response.success) {
        return response.id as number;
      } else {
        const errorMessage = response.error || '회원 추가에 실패했습니다.';
        console.error('회원 추가 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('회원 추가 IPC 오류:', errorMessage);
      throw new Error(`회원 추가 중 오류 발생: ${errorMessage}`);
    }
  }
  
  /**
   * 회원 정보 업데이트
   */
  static async update(member: Member): Promise<boolean> {
    try {
      if (!member.id) {
        throw new Error('회원 ID가 필요합니다.');
      }
      if (!member.name) {
        throw new Error('회원 이름은 필수 입력 항목입니다.');
      }

      const response = await safeIpcRenderer?.invoke('update-member', member);
      if (response.success) {
        return response.updated as boolean;
      } else {
        const errorMessage = response.error || '회원 정보 업데이트에 실패했습니다.';
        console.error('회원 업데이트 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('회원 수정 IPC 오류:', errorMessage);
      throw new Error(`회원 정보 업데이트 중 오류 발생: ${errorMessage}`);
    }
  }
  
  /**
   * 회원 삭제
   */
  static async delete(id: number): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('삭제할 회원 ID가 필요합니다.');
      }

      const response = await safeIpcRenderer?.invoke('delete-member', id);
      if (response.success) {
        return response.deleted as boolean;
      } else {
        const errorMessage = response.error || '회원 삭제에 실패했습니다.';
        console.error('회원 삭제 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('회원 삭제 IPC 오류:', errorMessage);
      throw new Error(`회원 삭제 중 오류 발생: ${errorMessage}`);
    }
  }

  /**
   * 모든 회원 삭제
   */
  static async deleteAll(): Promise<boolean> {
    try {
      const response = await safeIpcRenderer?.invoke('delete-all-members');
      if (response.success) {
        console.log('IPC: 모든 회원 삭제 완료');
        return true;
      } else {
        const errorMessage = response.error || '모든 회원 삭제에 실패했습니다.';
        console.error('모든 회원 삭제 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('모든 회원 삭제 IPC 오류:', errorMessage);
      throw new Error(`모든 회원 삭제 중 오류 발생: ${errorMessage}`);
    }
  }
}

// 엑셀 파일 선택
export async function selectExcelFile(): Promise<string | null> {
  try {
    return await safeIpcRenderer?.invoke('select-excel-file');
  } catch (error) {
    console.error('엑셀 파일 선택 IPC 오류:', error);
    return null;
  }
}

// 수동 백업 실행
export async function createManualBackup(): Promise<{ success: boolean, path?: string, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('manual-backup');
  } catch (error) {
    console.error('수동 백업 IPC 오류:', error);
    return { success: false, error: '백업 생성 중 오류가 발생했습니다.' };
  }
}

// 더미 회원 데이터 생성
export async function generateDummyMembers(count: number = 50): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('generate-dummy-members', count);
  } catch (error) {
    console.error('더미 회원 데이터 생성 IPC 오류:', error);
    return { success: false, error: '더미 데이터 생성 중 오류가 발생했습니다.' };
  }
}

// 대시보드 통계 데이터 요청
export async function getDashboardStats(): Promise<{
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
}> {
  try {
    const response = await safeIpcRenderer?.invoke('get-dashboard-stats');
    if (response.success) {
      return response.data;
    } else {
      console.error('대시보드 통계 조회 실패:', response.error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        newMembersThisMonth: 0,
        attendanceToday: 0,
        membershipDistribution: [],
        monthlyAttendance: [],
        recentActivities: {
          recentMembers: [],
          recentAttendance: []
        }
      };
    }
  } catch (error) {
    console.error('대시보드 통계 IPC 오류:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembersThisMonth: 0,
      attendanceToday: 0,
      membershipDistribution: [],
      monthlyAttendance: [],
      recentActivities: {
        recentMembers: [],
        recentAttendance: []
      }
    };
  }
}

// --- 결제 관련 함수 ---

export async function getAllPayments(): Promise<{ success: boolean, data?: Payment[], error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-all-payments');
  } catch (error) {
    console.error('결제 목록 조회 IPC 오류:', error);
    return { success: false, error: '결제 목록 조회 중 오류 발생' };
  }
}

// Omit<Payment, 'id'> 대신 Omit<Payment, 'id' | 'memberName'> 전달
export const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
  try {
    const response = await safeIpcRenderer?.invoke('add-payment', payment);
    return response;
  } catch (error) {
    console.error('addPayment 오류:', error);
    return { success: false, error: error.message };
  }
};

// Payment 대신 id와 Partial<Omit<Payment, 'id' | 'memberName'>> 를 받는 형태로 변경하거나,
// main.ts에서 처리한 것처럼 Payment를 그대로 받고 main에서 분리
export const updatePayment = async (payment: Payment) => {
  try {
    // id와 createdAt을 제외한 나머지 필드만 업데이트
    const { id, createdAt, ...updateData } = payment;
    const response = await safeIpcRenderer?.invoke('update-payment', id, updateData);
    return response;
  } catch (error) {
    console.error('updatePayment 오류:', error);
    return { success: false, error: error.message };
  }
};

export async function deletePayment(id: number): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('delete-payment', id);
  } catch (error) {
    console.error('결제 삭제 IPC 오류:', error);
    return { success: false, error: '결제 삭제 중 오류 발생' };
  }
}

// --- 이용권 종류 관련 함수 ---

export async function getAllMembershipTypes(): Promise<{ success: boolean, data?: MembershipType[], error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-all-membership-types');
  } catch (error) {
    console.error('이용권 종류 목록 조회 IPC 오류:', error);
    return { success: false, error: '이용권 종류 목록 조회 중 오류 발생' };
  }
}

export async function addMembershipType(typeData: Omit<MembershipType, 'id'>): Promise<{ success: boolean, id?: number, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('add-membership-type', typeData);
  } catch (error) {
    console.error('이용권 종류 추가 IPC 오류:', error);
    return { success: false, error: '이용권 종류 추가 중 오류 발생' };
  }
}

export async function updateMembershipType(typeData: MembershipType): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('update-membership-type', typeData);
  } catch (error) {
    console.error('이용권 종류 업데이트 IPC 오류:', error);
    return { success: false, error: '이용권 종류 업데이트 중 오류 발생' };
  }
}

export async function deleteMembershipType(id: number): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('delete-membership-type', id);
  } catch (error) {
    console.error('이용권 종류 삭제 IPC 오류:', error);
    return { success: false, error: '이용권 종류 삭제 중 오류 발생' };
  }
}

// --- 기존 회원 관련 함수 등 ---
// export async function getAllMembers(): Promise... // 이미 있을 가능성 높음

// 렌더러 프로세스에서 사용할 IPC 서비스
export class IpcPaymentService {
  /**
   * 모든 회원 조회
   */
  static async getAll(): Promise<Member[]> {
    try {
      const response = await safeIpcRenderer?.invoke('get-all-members');
      if (response.success) {
        return response.data || [];
      } else {
        console.error('회원 데이터 조회 실패:', response.error);
        return [];
      }
    } catch (error) {
      console.error('IPC 통신 오류:', error);
      return [];
    }
  }
  
  /**
   * 새 회원 추가
   */
  static async add(member: Member): Promise<number> {
    try {
      const response = await safeIpcRenderer?.invoke('add-member', member);
      if (response.success) {
        return response.id as number;
      } else {
        throw new Error(response.error || '회원 추가 실패');
      }
    } catch (error) {
      console.error('회원 추가 IPC 오류:', error);
      throw new Error('회원 추가 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 회원 정보 업데이트
   */
  static async update(member: Member): Promise<boolean> {
    try {
      const response = await safeIpcRenderer?.invoke('update-member', member);
      if (response.success) {
        return response.updated as boolean;
      } else {
        throw new Error(response.error || '회원 업데이트 실패');
      }
    } catch (error) {
      console.error('회원 수정 IPC 오류:', error);
      throw new Error('회원 정보 업데이트 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 회원 삭제
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const response = await safeIpcRenderer?.invoke('delete-member', id);
      if (response.success) {
        return response.deleted as boolean;
      } else {
        throw new Error(response.error || '회원 삭제 실패');
      }
    } catch (error) {
      console.error('회원 삭제 IPC 오류:', error);
      throw new Error('회원 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 모든 회원 삭제
   * @returns {Promise<boolean>} 성공 여부
   */
  static async deleteAll(): Promise<boolean> {
    try {
      // 메인 프로세스에 'delete-all-members' 라는 이름으로 요청을 보냅니다.
      const response = await safeIpcRenderer?.invoke('delete-all-members'); 
      if (response.success) {
        console.log('IPC: 모든 회원 삭제 완료');
        return true;
      } else {
        throw new Error(response.error || '모든 회원 삭제 실패');
      }
    } catch (error) {
      console.error('모든 회원 삭제 IPC 오류:', error);
      throw new Error('모든 회원을 삭제하는 중 오류가 발생했습니다.');
    }
  }
} 

// 다른 내보내기와 함께 이 함수도 추가
export const getAllMembers = async () => {
  try {
    const response = await safeIpcRenderer?.invoke('get-all-members');
    return response;
  } catch (error) {
    console.error('getAllMembers 오류:', error);
    return { success: false, error: error.message };
  }
}; 

// --- 스태프 관련 함수 ---

export async function getAllStaff(): Promise<{ success: boolean, data?: Staff[], error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-all-staff');
  } catch (error) {
    console.error('스태프 목록 조회 IPC 오류:', error);
    return { success: false, error: '스태프 목록 조회 중 오류 발생' };
  }
}

export async function getStaffById(id: number): Promise<{ success: boolean, data?: Staff, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-staff-by-id', id);
  } catch (error) {
    console.error('스태프 조회 IPC 오류:', error);
    return { success: false, error: '스태프 조회 중 오류 발생' };
  }
}

export async function addStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean, data?: number, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('add-staff', staff);
  } catch (error) {
    console.error('스태프 추가 IPC 오류:', error);
    return { success: false, error: '스태프 추가 중 오류 발생' };
  }
}

export async function updateStaff(id: number, staff: Partial<Staff>): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('update-staff', id, staff);
  } catch (error) {
    console.error('스태프 업데이트 IPC 오류:', error);
    return { success: false, error: '스태프 업데이트 중 오류 발생' };
  }
}

export async function deleteStaff(id: number): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('delete-staff', id);
  } catch (error) {
    console.error('스태프 삭제 IPC 오류:', error);
    return { success: false, error: '스태프 삭제 중 오류 발생' };
  }
} 

// --- 락커 관련 함수 ---

export async function getAllLockers(): Promise<{ success: boolean, data?: Locker[], error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-all-lockers');
  } catch (error) {
    console.error('락커 목록 조회 IPC 오류:', error);
    return { success: false, error: '락커 목록 조회 중 오류 발생' };
  }
}

export async function getLockerById(id: number): Promise<{ success: boolean, data?: Locker, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('get-locker-by-id', id);
  } catch (error) {
    console.error('락커 조회 IPC 오류:', error);
    return { success: false, error: '락커 조회 중 오류 발생' };
  }
}

export async function addLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean, data?: number, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('add-locker', locker);
  } catch (error) {
    console.error('락커 추가 IPC 오류:', error);
    return { success: false, error: '락커 추가 중 오류 발생' };
  }
}

export async function updateLocker(id: number, locker: Partial<Locker>): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('update-locker', id, locker);
  } catch (error) {
    console.error('락커 업데이트 IPC 오류:', error);
    return { success: false, error: '락커 업데이트 중 오류 발생' };
  }
}

export async function deleteLocker(id: number): Promise<{ success: boolean, error?: string }> {
  try {
    return await safeIpcRenderer?.invoke('delete-locker', id);
  } catch (error) {
    console.error('락커 삭제 IPC 오류:', error);
    return { success: false, error: '락커 삭제 중 오류 발생' };
  }
} 

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const importMembersFromExcel = async (data: any[]): Promise<ApiResponse<{
  successCount: number;
  failedCount: number;
  errors: string[];
}>> => {
  try {
    if (!safeIpcRenderer) throw new Error('이 기능은 Electron 환경에서만 동작합니다.');
    const result = await safeIpcRenderer.invoke('import-members-excel', data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Excel 가져오기 오류:', error);
    return {
      success: false,
      error: '회원 정보 가져오기 중 오류가 발생했습니다.'
    };
  }
}; 

export async function getMembersForAttendance() {
  try {
    // 모든 회원을 불러오는 IPC 호출 (get-all-members 채널 사용)
    const response = await safeIpcRenderer?.invoke('get-all-members');
    return response;
  } catch (error) {
    return { success: false, error: '출석용 회원 목록 불러오기 실패' };
  }
} 

// 특정 날짜의 출석 기록 조회
export async function getAttendanceByDate(date: string) {
  try {
    // 해당 날짜의 출석 기록을 불러오는 IPC 호출 
    const response = await safeIpcRenderer?.invoke('get-attendance-by-date', date);
    return response;
  } catch (error) {
    console.error('출석 기록 조회 IPC 오류:', error);
    return { 
      success: false, 
      error: '출석 기록 불러오기 실패',
      data: [] // 기본 빈 배열 반환
    };
  }
} 

// 페이지네이션된 회원 목록 조회
export async function getMembersWithPagination(
  page: number,
  pageSize: number,
  options?: MemberFilter
): Promise<{ success: boolean, data?: { members: Member[]; total: number }, error?: string }> {
  try {
    const response = await safeIpcRenderer?.invoke('get-members-pagination', page, pageSize, options);
    return response;
  } catch (error) {
    console.error('페이지네이션 회원 목록 조회 IPC 오류:', error);
    return { 
      success: false, 
      error: '회원 목록 페이지네이션 조회 중 오류 발생',
      data: { members: [], total: 0 }
    };
  }
} 