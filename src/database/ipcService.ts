// safeIpcRenderer 관련 로직 제거

import { Member } from '../models/types';
// import * as electronLog from 'electron-log'; // electronLog는 렌더러에서 직접 사용하지 않음
import {
  Payment,
  MembershipType,
  Staff,
  Locker,
  MemberFilter,
} from '../models/types';

// TypeScript에서 window 객체에 api 속성을 알 수 있도록 인터페이스 확장 (선택적이지만 권장)
declare global {
  interface Window {
    api?: any; // preload.ts에서 노출한 모든 함수를 포함하는 타입으로 정의하는 것이 이상적
  }
}

// 렌더러 프로세스에서 사용할 IPC 서비스
export class IpcMemberService {
  /**
   * 모든 회원 조회
   */
  static async getAll(): Promise<Member[]> {
    try {
      // @ts-ignore
      if (!window.api || typeof window.api.getAllMembers !== 'function') {
        throw new Error('API for getAllMembers is not available.');
      }
      // @ts-ignore
      const response = await window.api.getAllMembers();
      if (response.success) {
        return response.data || [];
      } else {
        let errorMessage = '회원 데이터를 불러오는데 실패했습니다.'; // 기본 메시지
        if (response.error && typeof response.error === 'string' && response.error.trim() !== '') {
          errorMessage = response.error;
        }
        console.error('회원 데이터 조회 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      let errorMessage = '알 수 없는 오류가 발생했습니다.'; // 기본 메시지
      if (error instanceof Error && error.message && typeof error.message === 'string' && error.message.trim() !== '') {
        errorMessage = error.message;
      }
      console.error('IPC 통신 오류 (getAllMembers):', errorMessage);
      throw new Error(`회원 목록 조회 중 오류 발생: ${errorMessage}`);
    }
  }

  /**
   * 새 회원 추가
   */
  static async add(member: Member): Promise<number> {
    try {
      // @ts-ignore
      if (!window.api || typeof window.api.addMember !== 'function') {
        throw new Error('API for addMember is not available.');
      }
      if (!member.name) {
        throw new Error('회원 이름은 필수 입력 항목입니다.');
      }
      // @ts-ignore
      const response = await window.api.addMember(member);
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
      // @ts-ignore
      if (!window.api || typeof window.api.updateMember !== 'function') {
        throw new Error('API for updateMember is not available.');
      }
      if (!member.id) {
        throw new Error('회원 ID가 필요합니다.');
      }
      if (!member.name) {
        throw new Error('회원 이름은 필수 입력 항목입니다.');
      }
      // @ts-ignore
      const response = await window.api.updateMember(member);
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
      // @ts-ignore
      if (!window.api || typeof window.api.deleteMember !== 'function') {
        throw new Error('API for deleteMember is not available.');
      }
      if (!id) {
        throw new Error('삭제할 회원 ID가 필요합니다.');
      }
      // @ts-ignore
      const response = await window.api.deleteMember(id);
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
      // @ts-ignore
      if (!window.api || typeof window.api.deleteAllMembers !== 'function') {
        throw new Error('API for deleteAllMembers is not available.');
      }
      // @ts-ignore
      const response = await window.api.deleteAllMembers();
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

export async function selectExcelFile(): Promise<string | null> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.selectExcelFile !== 'function') {
      throw new Error('API for selectExcelFile is not available.');
    }
    // @ts-ignore
    return await window.api.selectExcelFile();
  } catch (error) {
    console.error('엑셀 파일 선택 IPC 오류:', error);
    return null;
  }
}

export async function createManualBackup(): Promise<{ success: boolean; path?: string; error?: string; }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.manualBackup !== 'function') {
      throw new Error('API for manualBackup is not available.');
    }
    // @ts-ignore
    return await window.api.manualBackup();
  } catch (error) {
    console.error('수동 백업 IPC 오류:', error);
    return { success: false, error: '백업 생성 중 오류가 발생했습니다.' };
  }
}

export async function generateDummyMembers(count: number = 50): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.generateDummyMembers !== 'function') {
      throw new Error('API for generateDummyMembers is not available.');
    }
    // @ts-ignore
    return await window.api.generateDummyMembers(count);
  } catch (error) {
    console.error('더미 회원 데이터 생성 IPC 오류:', error);
    return { success: false, error: '더미 데이터 생성 중 오류가 발생했습니다.' };
  }
}

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
    // @ts-ignore
    if (!window.api || typeof window.api.getDashboardStats !== 'function') {
      console.error('API for getDashboardStats is not available.');
      return {
        totalMembers: 0,
        activeMembers: 0,
        newMembersThisMonth: 0,
        attendanceToday: 0,
        membershipDistribution: [],
        monthlyAttendance: [],
        recentActivities: {
          recentMembers: [],
          recentAttendance: [],
        },
      };
    }
    // @ts-ignore
    const response = await window.api.getDashboardStats();
    if (response && typeof response.success === 'boolean') {
      if (response.success) {
        return response.data || {
          totalMembers: 0,
          activeMembers: 0,
          newMembersThisMonth: 0,
          attendanceToday: 0,
          membershipDistribution: [],
          monthlyAttendance: [],
          recentActivities: {
            recentMembers: [],
            recentAttendance: [],
          },
        };
      } else {
        console.error('대시보드 통계 조회 실패:', response.error || '알 수 없는 오류');
      }
    } else {
      console.error('잘못된 API 응답 수신 (getDashboardStats):', response);
    }
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembersThisMonth: 0,
      attendanceToday: 0,
      membershipDistribution: [],
      monthlyAttendance: [],
      recentActivities: {
        recentMembers: [],
        recentAttendance: [],
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 IPC 오류';
    console.error('대시보드 통계 IPC 통신 중 오류 발생:', errorMessage);
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembersThisMonth: 0,
      attendanceToday: 0,
      membershipDistribution: [],
      monthlyAttendance: [],
      recentActivities: {
        recentMembers: [],
        recentAttendance: [],
      },
    };
  }
}

export async function getAllPayments(): Promise<{ success: boolean; data?: Payment[]; error?: string; }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAllPayments !== 'function') {
      throw new Error('API for getAllPayments is not available.');
    }
    // @ts-ignore
    return await window.api.getAllPayments();
  } catch (error) {
    console.error('결제 목록 조회 IPC 오류:', error);
    return { success: false, error: '결제 목록 조회 중 오류 발생' };
  }
}

// Omit 타입과 유사하게, Payment에서 id, createdAt, memberName, membershipType을 제외하고 membershipTypeId를 추가한 타입
// paymentRepository.ts의 PaymentCreationData와 일치하도록 정의
interface AddPaymentData {
  memberId: number;
  membershipTypeId: number | null; // 이용권 ID (null 가능성 고려)
  membershipType: string | null; // 이용권 이름 (null 가능성 고려)
  paymentDate: string; // YYYY-MM-DD 형식
  amount: number;
  paymentType: '현금' | '카드' | '계좌이체' | '기타'; // 한글 paymentType
  paymentMethod: 'card' | 'cash' | 'transfer'; // UI용 영문 paymentMethod
  status: '완료' | '취소' | '환불'; // 한글 status
  staffId?: number | null;
  receiptNumber?: string | null;
  notes?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  // description?: string | null; // Payment 타입에 따라 추가
}

export const addPayment = async (payment: AddPaymentData) => {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.addPayment !== 'function') {
      throw new Error('API for addPayment is not available.');
    }
    // @ts-ignore
    return await window.api.addPayment(payment);
  } catch (error) {
    console.error('addPayment 오류:', error);
    return { success: false, error: (error as Error).message };
  }
};

// updatePayment의 두 번째 인자 타입을 AddPaymentData와 유사하게 정의하되, id는 필수가 아님
// 또한 모든 필드가 Partial일 수 있도록 Partial 적용
interface UpdatePaymentData extends Partial<Omit<AddPaymentData, 'memberId' | 'membershipTypeId'> & { id: number }> {}

export const updatePayment = async (id: number, paymentData: UpdatePaymentData) => {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.updatePayment !== 'function') {
      throw new Error('API for updatePayment is not available.');
    }
    // @ts-ignore
    return await window.api.updatePayment(id, paymentData);
  } catch (error) {
    console.error('updatePayment 오류:', error);
    return { success: false, error: (error as Error).message };
  }
};

export async function deletePayment(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.deletePayment !== 'function') {
      throw new Error('API for deletePayment is not available.');
    }
    // @ts-ignore
    return await window.api.deletePayment(id);
  } catch (error) {
    console.error('결제 삭제 IPC 오류:', error);
    return { success: false, error: '결제 삭제 중 오류 발생' };
  }
}

export async function getAllMembershipTypes(): Promise<{ success: boolean; data?: MembershipType[]; error?: string; }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAllMembershipTypes !== 'function') {
      throw new Error('API for getAllMembershipTypes is not available.');
    }
    // @ts-ignore
    return await window.api.getAllMembershipTypes();
  } catch (error) {
    console.error('이용권 종류 목록 조회 IPC 오류:', error);
    return { success: false, error: '이용권 종류 목록 조회 중 오류 발생' };
  }
}

export async function addMembershipType(typeData: Omit<MembershipType, 'id'>): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.addMembershipType !== 'function') {
      throw new Error('API for addMembershipType is not available.');
    }
    // @ts-ignore
    return await window.api.addMembershipType(typeData);
  } catch (error) {
    console.error('이용권 종류 추가 IPC 오류:', error);
    return { success: false, error: '이용권 종류 추가 중 오류 발생' };
  }
}

export async function updateMembershipType(typeData: MembershipType): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.updateMembershipType !== 'function') {
      throw new Error('API for updateMembershipType is not available.');
    }
    // @ts-ignore
    return await window.api.updateMembershipType(typeData);
  } catch (error) {
    console.error('이용권 종류 업데이트 IPC 오류:', error);
    return { success: false, error: '이용권 종류 업데이트 중 오류 발생' };
  }
}

export async function deleteMembershipType(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.deleteMembershipType !== 'function') {
      throw new Error('API for deleteMembershipType is not available.');
    }
    // @ts-ignore
    return await window.api.deleteMembershipType(id);
  } catch (error) {
    console.error('이용권 종류 삭제 IPC 오류:', error);
    return { success: false, error: '이용권 종류 삭제 중 오류 발생' };
  }
}

export class IpcPaymentService { /* ... 내용 동일하게 유지 ... */ } // 이 클래스도 window.api 사용하도록 수정 필요

export async function getAllStaff(): Promise<{ success: boolean; data?: Staff[]; error?: string; }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAllStaff !== 'function') {
      throw new Error('API for getAllStaff is not available.');
    }
    // @ts-ignore
    return await window.api.getAllStaff();
  } catch (error) {
    console.error('스태프 목록 조회 IPC 오류:', error);
    return { success: false, error: '스태프 목록 조회 중 오류 발생' };
  }
}

export async function getStaffById(id: number): Promise<{ success: boolean; data?: Staff; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getStaffById !== 'function') {
      throw new Error('API for getStaffById is not available.');
    }
    // @ts-ignore
    return await window.api.getStaffById(id);
  } catch (error) {
    console.error('스태프 조회 IPC 오류:', error);
    return { success: false, error: '스태프 조회 중 오류 발생' };
  }
}

export async function addStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: number; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.addStaff !== 'function') {
      throw new Error('API for addStaff is not available.');
    }
    // @ts-ignore
    return await window.api.addStaff(staff);
  } catch (error) {
    console.error('스태프 추가 IPC 오류:', error);
    return { success: false, error: '스태프 추가 중 오류 발생' };
  }
}

export async function updateStaff(id: number, staff: Partial<Staff>): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.updateStaff !== 'function') {
      throw new Error('API for updateStaff is not available.');
    }
    // @ts-ignore
    return await window.api.updateStaff(id, staff);
  } catch (error) {
    console.error('스태프 업데이트 IPC 오류:', error);
    return { success: false, error: '스태프 업데이트 중 오류 발생' };
  }
}

export async function deleteStaff(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.deleteStaff !== 'function') {
      throw new Error('API for deleteStaff is not available.');
    }
    // @ts-ignore
    return await window.api.deleteStaff(id);
  } catch (error) {
    console.error('스태프 삭제 IPC 오류:', error);
    return { success: false, error: '스태프 삭제 중 오류 발생' };
  }
}

export const getAllLockers = async (
  page: number,
  pageSize: number,
  searchTerm: string,
  status: 'all' | 'available' | 'occupied' | 'maintenance'
): Promise<{ success: boolean; data: { data: Locker[]; total: number } }> => {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAllLockers !== 'function') {
      throw new Error('API for getAllLockers is not available.');
    }
    // @ts-ignore
    return await window.api.getAllLockers(page, pageSize, searchTerm, status);
  } catch (error) {
    console.error('락커 목록 조회 IPC 오류:', error);
    return { success: false, data: { data: [], total: 0 } };
  }
};

export async function getLockerById(id: number): Promise<{ success: boolean; data?: Locker; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getLockerById !== 'function') {
      throw new Error('API for getLockerById is not available.');
    }
    // @ts-ignore
    return await window.api.getLockerById(id);
  } catch (error) {
    console.error('락커 조회 IPC 오류:', error);
    return { success: false, error: '락커 조회 중 오류 발생' };
  }
}

export async function addLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: number; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.addLocker !== 'function') {
      throw new Error('API for addLocker is not available.');
    }
    // @ts-ignore
    return await window.api.addLocker(locker);
  } catch (error) {
    console.error('락커 추가 IPC 오류:', error);
    return { success: false, error: '락커 추가 중 오류 발생' };
  }
}

export async function updateLocker(id: number, locker: Partial<Locker>): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.updateLocker !== 'function') {
      throw new Error('API for updateLocker is not available.');
    }
    // @ts-ignore
    return await window.api.updateLocker(id, locker);
  } catch (error) {
    console.error('락커 업데이트 IPC 오류:', error);
    return { success: false, error: '락커 업데이트 중 오류 발생' };
  }
}

export async function deleteLocker(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.deleteLocker !== 'function') {
      throw new Error('API for deleteLocker is not available.');
    }
    // @ts-ignore
    return await window.api.deleteLocker(id);
  } catch (error) {
    console.error('락커 삭제 IPC 오류:', error);
    return { success: false, error: '락커 삭제 중 오류 발생' };
  }
}

interface ApiResponse<T> { success: boolean; data?: T; error?: string; }

export const importMembersFromExcel = async (data: any[]): Promise<ApiResponse<{ successCount: number; failedCount: number; errors: string[]; }>> => {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.importMembersFromExcel !== 'function') {
      throw new Error('API for importMembersFromExcel is not available.');
    }
    // @ts-ignore
    const result = await window.api.importMembersFromExcel(data);
    // main.ts에서 반환하는 객체는 이미 { success: true, data: { successCount, failedCount, errors } } 형태이므로
    // 여기서는 result를 바로 반환하거나, result.data를 반환해야 함.
    // preload에서 invoke 결과를 그대로 반환하므로, result는 main.ts의 반환값과 동일함.
    return result; // main.ts의 반환 구조에 맞춰야 함 (즉, result는 success, data를 포함)
  } catch (error) {
    console.error('Excel 가져오기 오류:', error);
    return { success: false, error: '회원 정보 가져오기 중 오류가 발생했습니다.' };
  }
};

export async function getAllMembers() {
  // @ts-ignore
  if (!window.api || typeof window.api.getAllMembers !== 'function') {
    throw new Error('API for getAllMembers is not available.');
  }
  // @ts-ignore
  return await window.api.getAllMembers();
}

export async function getMembersForAttendance() {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAllMembers !== 'function') { // getAllMembers 재사용
      throw new Error('API for getMembersForAttendance (getAllMembers) is not available.');
    }
    // @ts-ignore
    return await window.api.getAllMembers();
  } catch (error) {
    return { success: false, error: '출석용 회원 목록 불러오기 실패' };
  }
}

export async function getAttendanceByDate(date: string) {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getAttendanceByDate !== 'function') {
      throw new Error('API for getAttendanceByDate is not available.');
    }
    // @ts-ignore
    return await window.api.getAttendanceByDate(date);
  } catch (error) {
    console.error('출석 기록 조회 IPC 오류:', error);
    return { success: false, error: '출석 기록 불러오기 실패', data: [] };
  }
}

export async function getMembersWithPagination(page: number, pageSize: number, options?: MemberFilter): Promise<{ success: boolean; data?: { members: Member[]; total: number }; error?: string; }> {
  try {
    // @ts-ignore
    if (!window.api || typeof window.api.getMembersWithPagination !== 'function') {
      throw new Error('API for getMembersWithPagination is not available.');
    }
    // @ts-ignore
    return await window.api.getMembersWithPagination(page, pageSize, options);
  } catch (error) {
    console.error('페이지네이션 회원 목록 조회 IPC 오류:', error);
    return { success: false, error: '회원 목록 페이지네이션 조회 중 오류 발생', data: { members: [], total: 0 } };
  }
}

// IpcPaymentService 클래스 내부의 메소드들도 window.api를 사용하도록 수정해야 합니다.
// 예시:
// static async getAll(): Promise<Member[]> {
//   try {
//     if (!window.api || typeof window.api.getAllMembers !== 'function') { ... }
//     const response = await window.api.getAllMembers();
//     ...
//   } ...
// }
// 모든 클래스 메소드에 대해 동일한 패턴 적용
