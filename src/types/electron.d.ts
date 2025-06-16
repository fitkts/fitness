import { SettingsData, AttendanceRecord, Member, DashboardStats } from './index'; // Member, DashboardStats 임포트 추가
import { LockerPaymentData } from './lockerPayment';

declare global {
  interface Window {
    api?: {
      // 백업 관련 API
      manualBackup: () => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      getBackupList: () => Promise<string[]>;
      restoreBackup: (path: string) => Promise<boolean>;
      deleteBackup: (path: string) => Promise<boolean>;
      // 설정 관련 API
      loadSettings: () => Promise<SettingsData>;
      saveSettings: (
        settings: SettingsData,
      ) => Promise<{ success: boolean; error?: string }>;
      // 애플리케이션 재시작 API
      relaunchApp: () => void;
      // 출석 기록 관련 API
      addAttendanceRecord: (record: {
        memberId: number;
        visitDate: string;
        memberName?: string;
      }) => Promise<{
        success: boolean;
        data?: AttendanceRecord;
        error?: string;
        message?: string;
      }>;
      deleteAttendanceRecord: (
        recordId: number,
      ) => Promise<{ success: boolean; error?: string }>;
      // 회원 검색 API
      searchMembers: (
        searchTerm: string,
      ) => Promise<{ success: boolean; data?: Member[]; error?: string }>;
      // 대시보드 통계 API
      getDashboardStats: () => Promise<DashboardStats>; 
      
      // 락커 결제 관련 API
      processLockerPayment: (paymentData: LockerPaymentData) => Promise<{
        success: boolean;
        data?: {
          paymentId: string;
          lockerId: string;
          amount: number;
          newEndDate?: string;
        };
        error?: string;
      }>;
      getLockerPaymentHistory: (lockerId: string) => Promise<{
        success: boolean;
        data?: Array<{
          id: string;
          lockerId: string;
          amount: number;
          paymentDate: string;
          months: number;
          paymentMethod: string;
        }>;
        error?: string;
      }>;
      updateLockerUsagePeriod: (data: {
        lockerId: string;
        newEndDate: string;
        isExtension: boolean;
      }) => Promise<{
        success: boolean;
        data?: {
          lockerId: string;
          endDate: string;
        };
        error?: string;
      }>;
      cancelLockerPayment: (paymentId: string, reason: string) => Promise<{
        success: boolean;
        data?: {
          paymentId: string;
          refundAmount: number;
          cancelDate: string;
        };
        error?: string;
      }>;
      // 여기에 다른 IPC API들도 추가할 수 있습니다.
    };
  }
}

// 이 파일은 타입 선언만을 포함하므로 export {} 등을 추가하여 모듈로 만들 필요가 없습니다.
// TypeScript가 자동으로 d.ts 파일을 전역 타입으로 인식합니다.
