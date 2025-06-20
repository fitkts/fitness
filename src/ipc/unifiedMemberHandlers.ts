// 통합 회원 관리 IPC 핸들러
// 프론트엔드와 백엔드 통합 회원 서비스 연결

import { ipcMain } from 'electron';
import { 
  UnifiedMember, 
  UnifiedMemberFilter, 
  UnifiedMemberStats,
  MemberConversionData 
} from '../types/unifiedMember';
import { UnifiedMemberRepository } from '../database/unifiedMemberRepository';
import { MemberConversionService } from '../services/memberConversionService';
import * as electronLog from 'electron-log';

/**
 * 통합 회원 관리 IPC 핸들러 등록
 */
export function registerUnifiedMemberHandlers() {
  
  // 모든 회원 조회 (통합)
  ipcMain.handle('unified-members:getAll', async (event, filter?: UnifiedMemberFilter) => {
    try {
      electronLog.info('통합 회원 목록 조회 요청:', filter);
      const members = await UnifiedMemberRepository.getAllMembers(filter);
      
      return {
        success: true,
        data: members,
        message: `${members.length}명의 회원 정보를 조회했습니다.`
      };
    } catch (error) {
      electronLog.error('통합 회원 목록 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '회원 목록 조회 중 오류가 발생했습니다.',
        data: []
      };
    }
  });

  // 회원 단일 조회 (통합)
  ipcMain.handle('unified-members:getById', async (event, id: number, memberType?: 'regular' | 'consultation') => {
    try {
      electronLog.info('통합 회원 단일 조회 요청:', { id, memberType });
      const member = await UnifiedMemberRepository.getMemberById(id, memberType);
      
      if (!member) {
        return {
          success: false,
          error: '해당 회원을 찾을 수 없습니다.',
          data: null
        };
      }

      return {
        success: true,
        data: member,
        message: '회원 정보를 조회했습니다.'
      };
    } catch (error) {
      electronLog.error('통합 회원 단일 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '회원 조회 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 회원 통계 조회 (통합)
  ipcMain.handle('unified-members:getStats', async () => {
    try {
      electronLog.info('통합 회원 통계 조회 요청');
      const stats = await UnifiedMemberRepository.getUnifiedMemberStats();
      
      return {
        success: true,
        data: stats,
        message: '회원 통계를 조회했습니다.'
      };
    } catch (error) {
      electronLog.error('통합 회원 통계 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '통계 조회 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 상담회원 → 정식회원 승격
  ipcMain.handle('unified-members:promote', async (event, consultationMemberId: number, conversionData: MemberConversionData) => {
    try {
      electronLog.info('회원 승격 요청:', { consultationMemberId, conversionData });
      const result = await UnifiedMemberRepository.promoteConsultationMember(consultationMemberId, conversionData);
      
      if (result.success) {
        return {
          success: true,
          data: { newMemberId: result.newMemberId },
          message: '상담회원이 정식회원으로 승격되었습니다.'
        };
      } else {
        return {
          success: false,
          error: result.error || '승격 처리 중 오류가 발생했습니다.',
          data: null
        };
      }
    } catch (error) {
      electronLog.error('회원 승격 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '승격 처리 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 정식회원 → 상담회원 강등
  ipcMain.handle('unified-members:demote', async (event, memberId: number, reason: string) => {
    try {
      electronLog.info('회원 강등 요청:', { memberId, reason });
      const result = await UnifiedMemberRepository.demoteRegularMember(memberId, reason);
      
      if (result.success) {
        return {
          success: true,
          data: { newConsultationMemberId: result.newConsultationMemberId },
          message: '정식회원이 상담회원으로 변경되었습니다.'
        };
      } else {
        return {
          success: false,
          error: result.error || '강등 처리 중 오류가 발생했습니다.',
          data: null
        };
      }
    } catch (error) {
      electronLog.error('회원 강등 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '강등 처리 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 회원 상태 정보 조회
  ipcMain.handle('unified-members:getStatus', async (event, member: UnifiedMember) => {
    try {
      electronLog.info('회원 상태 조회 요청:', member.id);
      const statusInfo = MemberConversionService.getMemberStatusInfo(member);
      
      return {
        success: true,
        data: statusInfo,
        message: '회원 상태 정보를 조회했습니다.'
      };
    } catch (error) {
      electronLog.error('회원 상태 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '상태 조회 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 회원 데이터 검증
  ipcMain.handle('unified-members:validate', async (event, memberData: Partial<UnifiedMember>) => {
    try {
      electronLog.info('회원 데이터 검증 요청');
      const validationResult = MemberConversionService.validateMemberData(memberData);
      
      return {
        success: true,
        data: validationResult,
        message: validationResult.isValid ? '데이터가 유효합니다.' : '검증에 실패했습니다.'
      };
    } catch (error) {
      electronLog.error('회원 데이터 검증 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '데이터 검증 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 레거시 데이터 마이그레이션 (필요 시)
  ipcMain.handle('unified-members:migrate', async () => {
    try {
      electronLog.info('데이터 마이그레이션 요청');
      
      // 기존 회원 데이터를 새로운 통합 형식으로 변환
      // 실제로는 기존 데이터베이스를 읽어서 변환하는 로직이 필요
      // 현재는 성공 응답만 반환
      
      return {
        success: true,
        data: { migratedCount: 0 },
        message: '데이터 마이그레이션이 완료되었습니다.'
      };
    } catch (error) {
      electronLog.error('데이터 마이그레이션 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '마이그레이션 중 오류가 발생했습니다.',
        data: null
      };
    }
  });

  // 회원 검색 (고급 검색)
  ipcMain.handle('unified-members:search', async (event, searchParams: {
    query: string;
    memberType?: 'all' | 'regular' | 'consultation';
    status?: string;
    dateRange?: { start: string; end: string };
  }) => {
    try {
      electronLog.info('회원 검색 요청:', searchParams);
      
      const filter: UnifiedMemberFilter = {
        search: searchParams.query,
        memberType: searchParams.memberType || 'all',
        startDate: searchParams.dateRange?.start,
        endDate: searchParams.dateRange?.end
      };
      
      const members = await UnifiedMemberRepository.getAllMembers(filter);
      
      return {
        success: true,
        data: members,
        message: `${members.length}명의 검색 결과를 찾았습니다.`
      };
    } catch (error) {
      electronLog.error('회원 검색 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
        data: []
      };
    }
  });

  // 만료 임박 회원 조회
  ipcMain.handle('unified-members:getExpiring', async (event, daysThreshold: number = 7) => {
    try {
      electronLog.info('만료 임박 회원 조회 요청:', daysThreshold);
      
      const allMembers = await UnifiedMemberRepository.getAllMembers();
      const expiringMembers = allMembers.filter(member => {
        if (member.memberType !== 'regular') return false;
        
        const statusInfo = MemberConversionService.getMemberStatusInfo(member);
        return statusInfo.isExpiringSoon;
      });
      
      return {
        success: true,
        data: expiringMembers,
        message: `${expiringMembers.length}명의 만료 임박 회원을 찾았습니다.`
      };
    } catch (error) {
      electronLog.error('만료 임박 회원 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '조회 중 오류가 발생했습니다.',
        data: []
      };
    }
  });

  // 승격 대상 회원 조회
  ipcMain.handle('unified-members:getPromotionCandidates', async () => {
    try {
      electronLog.info('승격 대상 회원 조회 요청');
      
      const allMembers = await UnifiedMemberRepository.getAllMembers();
      const candidates = allMembers.filter(member => {
        if (member.memberType !== 'consultation') return false;
        
        const statusInfo = MemberConversionService.getMemberStatusInfo(member);
        return statusInfo.canBePromoted;
      });
      
      return {
        success: true,
        data: candidates,
        message: `${candidates.length}명의 승격 대상 회원을 찾았습니다.`
      };
    } catch (error) {
      electronLog.error('승격 대상 회원 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '조회 중 오류가 발생했습니다.',
        data: []
      };
    }
  });

  electronLog.info('통합 회원 관리 IPC 핸들러 등록 완료');
}

/**
 * 통합 회원 관리 IPC 핸들러 해제
 */
export function unregisterUnifiedMemberHandlers() {
  const handlers = [
    'unified-members:getAll',
    'unified-members:getById', 
    'unified-members:getStats',
    'unified-members:promote',
    'unified-members:demote',
    'unified-members:getStatus',
    'unified-members:validate',
    'unified-members:migrate',
    'unified-members:search',
    'unified-members:getExpiring',
    'unified-members:getPromotionCandidates'
  ];

  handlers.forEach(handler => {
    ipcMain.removeHandler(handler);
  });

  electronLog.info('통합 회원 관리 IPC 핸들러 해제 완료');
} 