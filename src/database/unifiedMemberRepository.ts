// 통합 회원 Repository
// 정식 회원과 상담 회원을 통합하여 관리하는 데이터베이스 레이어

import { getDatabase } from './setup';
import { 
  UnifiedMember, 
  Member, 
  ConsultationMember, 
  UnifiedMemberFilter,
  UnifiedMemberStats,
  MemberConversionData 
} from '../types/unifiedMember';
import { MemberConversionService } from '../services/memberConversionService';
import * as electronLog from 'electron-log';

// 기존 Repository 임포트
import * as memberRepository from './memberRepository';
import * as consultationRepository from './consultationRepository';
import * as paymentRepository from './paymentRepository';
import { 
  timestampToDateString, 
  dateStringToTimestamp, 
  getCurrentDateString,
  getCurrentTimestamp 
} from '../utils/dateConverters';

export class UnifiedMemberRepository {
  
  /**
   * 모든 회원 조회 (정식 회원 + 상담 회원)
   */
  static async getAllMembers(filter?: UnifiedMemberFilter): Promise<UnifiedMember[]> {
    try {
      const members: UnifiedMember[] = [];

      // 정식 회원 조회
      if (!filter?.memberType || filter.memberType === 'all' || filter.memberType === 'regular') {
        const regularMembers = await memberRepository.getAllMembers();
        const convertedMembers = regularMembers.map(member => 
          MemberConversionService.convertLegacyMemberToUnified(member)
        );
        members.push(...convertedMembers);
      }

      // 상담 회원 조회
      if (!filter?.memberType || filter.memberType === 'all' || filter.memberType === 'consultation') {
        const consultationMembers = consultationRepository.getAllConsultationMembers();
        const convertedMembers = consultationMembers.map(member => {
          // ConsultationMemberData를 ConsultationMember로 변환
          const legacyMember = {
            ...member,
            phone: member.phone || '',
            join_date: member.created_at || getCurrentTimestamp(),
            fitness_goals: typeof member.fitness_goals === 'string' 
              ? JSON.parse(member.fitness_goals || '[]') 
              : (member.fitness_goals || []),
            is_promoted: Boolean(member.is_promoted)
          };
          return MemberConversionService.convertLegacyConsultationMemberToUnified(legacyMember);
        });
        members.push(...convertedMembers);
      }

      // 필터 적용
      return this.applyFilters(members, filter);
    } catch (error) {
      electronLog.error('통합 회원 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * ID로 회원 조회 (타입 자동 감지)
   */
  static async getMemberById(id: number, memberType?: 'regular' | 'consultation'): Promise<UnifiedMember | null> {
    try {
      // 타입이 지정된 경우
      if (memberType === 'regular') {
        const member = await memberRepository.getMemberById(id);
        return member ? MemberConversionService.convertLegacyMemberToUnified(member) : null;
      }
      
      if (memberType === 'consultation') {
        const member = consultationRepository.getConsultationMemberById(id);
        if (member) {
          // ConsultationMemberData를 ConsultationMember로 변환
          const legacyMember = {
            ...member,
            phone: member.phone || '',
            join_date: member.created_at || getCurrentTimestamp(),
            fitness_goals: typeof member.fitness_goals === 'string' 
              ? JSON.parse(member.fitness_goals || '[]') 
              : (member.fitness_goals || []),
            is_promoted: Boolean(member.is_promoted)
          };
          return MemberConversionService.convertLegacyConsultationMemberToUnified(legacyMember);
        }
        return null;
      }

      // 타입이 지정되지 않은 경우 둘 다 시도
      const regularMember = await memberRepository.getMemberById(id);
      if (regularMember) {
        return MemberConversionService.convertLegacyMemberToUnified(regularMember);
      }

      const consultationMember = consultationRepository.getConsultationMemberById(id);
      if (consultationMember) {
        // ConsultationMemberData를 ConsultationMember로 변환
        const legacyMember = {
          ...consultationMember,
          phone: consultationMember.phone || '',
          join_date: consultationMember.created_at || getCurrentTimestamp(),
          fitness_goals: typeof consultationMember.fitness_goals === 'string' 
            ? JSON.parse(consultationMember.fitness_goals || '[]') 
            : (consultationMember.fitness_goals || []),
          is_promoted: Boolean(consultationMember.is_promoted)
        };
        return MemberConversionService.convertLegacyConsultationMemberToUnified(legacyMember);
      }

      return null;
    } catch (error) {
      electronLog.error('통합 회원 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 상담회원을 정식회원으로 승격
   */
  static async promoteConsultationMember(
    consultationMemberId: number,
    conversionData: MemberConversionData
  ): Promise<{ success: boolean; newMemberId?: number; error?: string }> {
    let newMemberId: number | null = null;
    let paymentId: number | null = null;

    try {
      // 1. 상담회원 정보 조회
      const consultationMemberData = consultationRepository.getConsultationMemberById(consultationMemberId);
      if (!consultationMemberData) {
        throw new Error('상담회원을 찾을 수 없습니다.');
      }

      // 2. 승격 가능 여부 확인
      if (consultationMemberData.consultation_status !== 'completed') {
        throw new Error('상담이 완료된 회원만 승격 가능합니다.');
      }

      if (consultationMemberData.is_promoted) {
        throw new Error('이미 승격된 회원입니다.');
      }

      // 3. ConsultationMemberData를 ConsultationMember로 변환
      const consultationMember = {
        ...consultationMemberData,
        phone: consultationMemberData.phone || '',
        join_date: consultationMemberData.created_at || getCurrentTimestamp(),
        fitness_goals: typeof consultationMemberData.fitness_goals === 'string' 
          ? JSON.parse(consultationMemberData.fitness_goals || '[]') 
          : (consultationMemberData.fitness_goals || []),
        is_promoted: Boolean(consultationMemberData.is_promoted)
      };

      // 4. 통합 타입으로 변환
      const unifiedConsultationMember = MemberConversionService
        .convertLegacyConsultationMemberToUnified(consultationMember);

      // 5. 정식회원으로 변환
      const newRegularMember = MemberConversionService
        .promoteConsultationMemberToRegular(unifiedConsultationMember, conversionData);

      // 6. 기존 Member 타입으로 변환하여 저장
      const legacyMemberData = this.convertUnifiedToLegacyMember(newRegularMember);
      
      try {
        // 7. 정식회원 생성
        newMemberId = await memberRepository.addMember(legacyMemberData);

        // 8. 결제 기록 생성 (결제 정보가 있는 경우)
        if (conversionData.paymentAmount && conversionData.paymentMethod) {
          const paymentResult = await paymentRepository.addPayment({
            memberId: newMemberId,
            membershipTypeId: conversionData.membershipTypeId || null,
            amount: conversionData.paymentAmount,
            paymentDate: getCurrentDateString(),
            paymentMethod: conversionData.paymentMethod,
            paymentType: '카드',
            membershipType: conversionData.membershipType || '',
            startDate: conversionData.membershipStart,
            endDate: conversionData.membershipEnd,
            status: '완료',
            notes: '상담회원 승격 결제',
            description: `상담회원 승격: ${unifiedConsultationMember.name}`,
            staffId: conversionData.staffId
          });
          paymentId = paymentResult;
        }

        // 9. 상담회원 승격 완료 처리
        consultationRepository.updateConsultationMember(consultationMemberId, {
          is_promoted: 1,
          promoted_at: getCurrentTimestamp(),
          promoted_member_id: newMemberId
        });

        electronLog.info(`상담회원 승격 완료: ${consultationMemberId} → ${newMemberId}`);
        return { success: true, newMemberId };

      } catch (detailError) {
        // 롤백 처리
        if (newMemberId) {
          try {
            await memberRepository.deleteMember(newMemberId);
            electronLog.info(`롤백: 생성된 회원 삭제 완료 (ID: ${newMemberId})`);
          } catch (rollbackError) {
            electronLog.error('롤백 실패 - 회원 삭제:', rollbackError);
          }
        }

        if (paymentId) {
          try {
            await paymentRepository.deletePayment(paymentId);
            electronLog.info(`롤백: 생성된 결제 삭제 완료 (ID: ${paymentId})`);
          } catch (rollbackError) {
            electronLog.error('롤백 실패 - 결제 삭제:', rollbackError);
          }
        }

        throw detailError;
      }
    } catch (error) {
      electronLog.error('상담회원 승격 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '승격 처리 중 오류가 발생했습니다.' 
      };
    }
  }

  /**
   * 정식회원을 상담회원으로 강등 (특수한 경우)
   */
  static async demoteRegularMember(
    memberId: number,
    reason: string
  ): Promise<{ success: boolean; newConsultationMemberId?: number; error?: string }> {
    try {
      const db = getDatabase();
      
      return db.transaction(async () => {
        // 1. 정식회원 정보 조회
        const regularMember = await memberRepository.getMemberById(memberId);
        if (!regularMember) {
          throw new Error('정식회원을 찾을 수 없습니다.');
        }

        // 2. 통합 타입으로 변환
        const unifiedRegularMember = MemberConversionService
          .convertLegacyMemberToUnified(regularMember);

        // 3. 상담회원으로 변환
        const newConsultationMember = MemberConversionService
          .demoteRegularMemberToConsultation(unifiedRegularMember, reason);

        // 4. 기존 ConsultationMemberData 타입으로 변환하여 저장
        const legacyConsultationData = this.convertUnifiedToLegacyConsultationMember(newConsultationMember);
        
        // consultationRepository.createConsultationMember는 동기 함수
        const createResult = consultationRepository.createConsultationMember(legacyConsultationData);
        const newConsultationMemberId = createResult.id || 0;

        // 5. 정식회원 비활성화 (삭제하지 않고 상태만 변경)
        await memberRepository.updateMember(memberId, {
          notes: (regularMember.notes || '') + `\n[${getCurrentDateString()}] 상담회원으로 강등: ${reason}`
        });

        electronLog.info(`정식회원 강등 완료: ${memberId} → ${newConsultationMemberId}`);
        return { success: true, newConsultationMemberId };
      })();
    } catch (error) {
      electronLog.error('정식회원 강등 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '강등 처리 중 오류가 발생했습니다.' 
      };
    }
  }

  /**
   * 통합 회원 통계 조회
   */
  static async getUnifiedMemberStats(): Promise<UnifiedMemberStats> {
    try {
      // 정식 회원 조회
      const regularMembers = await memberRepository.getAllMembers();
      const convertedRegularMembers = regularMembers.map(member => 
        MemberConversionService.convertLegacyMemberToUnified(member)
      );

      // 상담 회원 조회
      const consultationMembersData = consultationRepository.getAllConsultationMembers();
      const convertedConsultationMembers = consultationMembersData.map(member => {
        const legacyMember = {
          ...member,
          phone: member.phone || '',
          join_date: member.created_at || getCurrentTimestamp(),
          fitness_goals: typeof member.fitness_goals === 'string' 
            ? JSON.parse(member.fitness_goals || '[]') 
            : (member.fitness_goals || []),
          is_promoted: Boolean(member.is_promoted)
        };
        return MemberConversionService.convertLegacyConsultationMemberToUnified(legacyMember);
      });

      // 통계 계산
      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const regularStats = {
        total: convertedRegularMembers.length,
        active: convertedRegularMembers.filter(m => {
          if (!m.membershipEnd) return true;
          return new Date(m.membershipEnd) > now;
        }).length,
        expired: convertedRegularMembers.filter(m => {
          if (!m.membershipEnd) return false;
          return new Date(m.membershipEnd) <= now;
        }).length,
        expiringSoon: convertedRegularMembers.filter(m => {
          if (!m.membershipEnd) return false;
          const endDate = new Date(m.membershipEnd);
          return endDate > now && endDate <= oneWeekLater;
        }).length,
      };

      const consultationStats = {
        total: convertedConsultationMembers.length,
        pending: convertedConsultationMembers.filter(m => m.consultationStatus === 'pending').length,
        inProgress: convertedConsultationMembers.filter(m => m.consultationStatus === 'in_progress').length,
        completed: convertedConsultationMembers.filter(m => m.consultationStatus === 'completed').length,
        readyForPromotion: convertedConsultationMembers.filter(m => 
          m.consultationStatus === 'completed' && !m.isPromoted
        ).length,
      };

      return {
        total: regularStats.total + consultationStats.total,
        regular: regularStats,
        consultation: consultationStats,
        recentActivities: {
          newMembers: 0, // TODO: 최근 7일간 신규 회원 수
          newConsultations: 0, // TODO: 최근 7일간 신규 상담 수
          promotions: 0, // TODO: 최근 7일간 승격 수
        },
      };
    } catch (error) {
      electronLog.error('통합 회원 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 필터 적용
   */
  private static applyFilters(members: UnifiedMember[], filter?: UnifiedMemberFilter): UnifiedMember[] {
    if (!filter) return members;

    return members.filter(member => {
      // 검색어 필터
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(searchTerm);
        const matchesPhone = member.phone?.toLowerCase().includes(searchTerm) || false;
        const matchesEmail = member.email?.toLowerCase().includes(searchTerm) || false;
        
        if (!matchesName && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      // 회원 타입 필터 (이미 getAllMembers에서 처리됨)
      if (filter.memberType && filter.memberType !== 'all') {
        if (filter.memberType !== member.memberType) {
          return false;
        }
      }

      // 회원권 타입 필터 (정식 회원만)
      if (filter.membershipType && member.memberType === 'regular') {
        const regularMember = member as Member;
        if (regularMember.membershipType !== filter.membershipType) {
          return false;
        }
      }

      // 상담 상태 필터 (상담 회원만)
      if (filter.consultationStatus && member.memberType === 'consultation') {
        const consultationMember = member as ConsultationMember;
        if (consultationMember.consultationStatus !== filter.consultationStatus) {
          return false;
        }
      }

      // 담당자 필터
      if (filter.staffId && member.staffId !== filter.staffId) {
        return false;
      }

      // 날짜 범위 필터
      if (filter.startDate && member.joinDate < filter.startDate) {
        return false;
      }

      if (filter.endDate && member.joinDate > filter.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * 통합 Member를 레거시 Member 타입으로 변환
   */
  private static convertUnifiedToLegacyMember(unifiedMember: Member): Parameters<typeof memberRepository.addMember>[0] {
    return {
      name: unifiedMember.name,
      phone: unifiedMember.phone,
      email: unifiedMember.email,
      gender: unifiedMember.gender === '남' ? '남성' : 
               unifiedMember.gender === '여' ? '여성' : '기타',
      birthDate: unifiedMember.birthDate,
      joinDate: unifiedMember.joinDate,
      membershipType: unifiedMember.membershipType,
      membershipStart: unifiedMember.membershipStart,
      membershipEnd: unifiedMember.membershipEnd,
      lastVisit: unifiedMember.lastVisit,
      notes: unifiedMember.notes,
      staffId: unifiedMember.staffId,
      staffName: unifiedMember.staffName,
    };
  }

  /**
   * 통합 ConsultationMember를 레거시 ConsultationMemberData 타입으로 변환
   */
  private static convertUnifiedToLegacyConsultationMember(
    unifiedMember: ConsultationMember
  ): Parameters<typeof consultationRepository.createConsultationMember>[0] {
    return {
      name: unifiedMember.name,
      phone: unifiedMember.phone,
      email: unifiedMember.email,
      gender: unifiedMember.gender === '기타' ? undefined : unifiedMember.gender, // '기타'는 지원하지 않음
      birth_date: unifiedMember.birthDate ? dateStringToTimestamp(unifiedMember.birthDate) : undefined,
      first_visit: unifiedMember.firstVisit ? dateStringToTimestamp(unifiedMember.firstVisit) : undefined,
      health_conditions: unifiedMember.healthConditions,
      fitness_goals: JSON.stringify(unifiedMember.fitnessGoals || []),
      staff_id: unifiedMember.staffId,
      staff_name: unifiedMember.staffName,
      consultation_status: unifiedMember.consultationStatus,
      notes: unifiedMember.notes,
    };
  }
} 