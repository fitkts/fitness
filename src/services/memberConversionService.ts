// 회원 데이터 변환 서비스
// 상담회원 ↔ 정식회원 간 데이터 변환 및 이동 로직

import { 
  Member, 
  ConsultationMember, 
  UnifiedMember, 
  MemberConversionData,
  MemberValidationResult,
  MemberStatusInfo 
} from '../types/unifiedMember';
import { 
  timestampToDateString, 
  dateStringToTimestamp, 
  getCurrentDateString,
  normalizeDateToString,
  normalizeDateToTimestamp 
} from '../utils/dateConverters';
import { Gender } from '../types/common';

// 기존 타입에서 새로운 통합 타입으로 변환
import { Member as LegacyMember } from '../models/types';
import { ConsultationMember as LegacyConsultationMember } from '../types/consultation';

export class MemberConversionService {
  
  /**
   * 기존 Member 타입을 새로운 통합 Member 타입으로 변환
   */
  static convertLegacyMemberToUnified(legacyMember: LegacyMember): Member {
    return {
      memberType: 'regular',
      id: legacyMember.id,
      name: legacyMember.name,
      phone: legacyMember.phone,
      email: legacyMember.email,
      gender: this.normalizeGender(legacyMember.gender),
      birthDate: legacyMember.birthDate,
      joinDate: legacyMember.joinDate,
      membershipType: legacyMember.membershipType,
      membershipStart: legacyMember.membershipStart,
      membershipEnd: legacyMember.membershipEnd,
      lastVisit: legacyMember.lastVisit,
      notes: legacyMember.notes,
      staffId: legacyMember.staffId,
      staffName: legacyMember.staffName,
      createdAt: legacyMember.createdAt,
      updatedAt: legacyMember.updatedAt,
    };
  }

  /**
   * 기존 ConsultationMember 타입을 새로운 통합 ConsultationMember 타입으로 변환
   */
  static convertLegacyConsultationMemberToUnified(
    legacyConsultationMember: LegacyConsultationMember
  ): ConsultationMember {
    return {
      memberType: 'consultation',
      id: legacyConsultationMember.id,
      name: legacyConsultationMember.name,
      phone: legacyConsultationMember.phone,
      email: legacyConsultationMember.email,
      gender: legacyConsultationMember.gender,
      birthDate: timestampToDateString(legacyConsultationMember.birth_date),
      joinDate: timestampToDateString(legacyConsultationMember.join_date) || getCurrentDateString(),
      firstVisit: timestampToDateString(legacyConsultationMember.first_visit),
      lastVisit: timestampToDateString(legacyConsultationMember.last_visit),
      notes: legacyConsultationMember.notes,
      staffId: legacyConsultationMember.staff_id,
      staffName: legacyConsultationMember.staff_name,
      consultationStatus: legacyConsultationMember.consultation_status,
      healthConditions: legacyConsultationMember.health_conditions,
      fitnessGoals: typeof legacyConsultationMember.fitness_goals === 'string' 
        ? JSON.parse(legacyConsultationMember.fitness_goals || '[]')
        : legacyConsultationMember.fitness_goals || [],
      isPromoted: legacyConsultationMember.is_promoted,
      promotedAt: timestampToDateString(legacyConsultationMember.promoted_at),
      promotedMemberId: legacyConsultationMember.promoted_member_id,
      createdAt: timestampToDateString(legacyConsultationMember.created_at),
      updatedAt: timestampToDateString(legacyConsultationMember.updated_at),
    };
  }

  /**
   * 상담회원을 정식회원으로 변환 (승격)
   */
  static promoteConsultationMemberToRegular(
    consultationMember: ConsultationMember,
    conversionData: MemberConversionData
  ): Member {
    const promotedMember: Member = {
      memberType: 'regular',
      // 기본 정보 유지
      name: consultationMember.name,
      phone: consultationMember.phone,
      email: consultationMember.email,
      gender: consultationMember.gender,
      birthDate: consultationMember.birthDate,
      joinDate: getCurrentDateString(), // 정식 가입일은 승격일로
      lastVisit: consultationMember.lastVisit,
      
      // 회원권 정보 추가
      membershipType: conversionData.membershipType,
      membershipStart: conversionData.membershipStart,
      membershipEnd: conversionData.membershipEnd,
      
      // 담당자 정보
      staffId: conversionData.staffId || consultationMember.staffId,
      staffName: conversionData.staffName || consultationMember.staffName,
      
      // 노트에 승격 히스토리 추가
      notes: this.generatePromotionNote(consultationMember, conversionData),
      
      // 시간 정보
      createdAt: getCurrentDateString(),
      updatedAt: getCurrentDateString(),
    };

    return promotedMember;
  }

  /**
   * 정식회원을 상담회원으로 변환 (강등 - 특수한 경우)
   */
  static demoteRegularMemberToConsultation(
    regularMember: Member,
    reason?: string
  ): ConsultationMember {
    const demotedMember: ConsultationMember = {
      memberType: 'consultation',
      // 기본 정보 유지
      name: regularMember.name,
      phone: regularMember.phone,
      email: regularMember.email,
      gender: regularMember.gender,
      birthDate: regularMember.birthDate,
      joinDate: regularMember.joinDate, // 원래 가입일 유지
      lastVisit: regularMember.lastVisit,
      firstVisit: regularMember.joinDate, // 최초 방문일을 가입일로
      
      // 상담 정보
      consultationStatus: 'follow_up', // 후속 상담 필요
      healthConditions: '',
      fitnessGoals: [],
      
      // 담당자 정보 유지
      staffId: regularMember.staffId,
      staffName: regularMember.staffName,
      
      // 노트에 강등 히스토리 추가
      notes: this.generateDemotionNote(regularMember, reason),
      
      // 승격 정보는 초기화
      isPromoted: false,
      
      // 시간 정보
      createdAt: regularMember.createdAt,
      updatedAt: getCurrentDateString(),
    };

    return demotedMember;
  }

  /**
   * 회원 상태 정보 조회
   */
  static getMemberStatusInfo(member: UnifiedMember): MemberStatusInfo {
    if (member.memberType === 'consultation') {
      return {
        status: 'consultation',
        canBePromoted: member.consultationStatus === 'completed' && !member.isPromoted,
        canBeDowngraded: false,
      };
    }

    // 정식 회원의 경우
    const now = new Date();
    
    let status: 'active' | 'expired' | 'pending' = 'active';
    let isExpiringSoon = false;
    let daysUntilExpiry = 0;

    if (member.membershipEnd) {
      const endDate = new Date(member.membershipEnd);
      const timeDiff = endDate.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 7) {
        isExpiringSoon = true;
      }
    }

    return {
      status,
      isExpiringSoon,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : undefined,
      canBePromoted: false,
      canBeDowngraded: status === 'expired',
    };
  }

  /**
   * 데이터 유효성 검증
   */
  static validateMemberData(member: Partial<UnifiedMember>): MemberValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // 필수 필드 검증
    if (!member.name?.trim()) {
      errors.name = '이름은 필수입니다.';
    }

    if (!member.phone?.trim()) {
      errors.phone = '전화번호는 필수입니다.';
    }

    // 이메일 형식 검증
    if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 정식 회원의 경우 회원권 정보 검증 (승격 프로세스에서는 선택사항)
    if (member.memberType === 'regular') {
      const regularMember = member as Partial<Member>;
      
      // 회원권 정보는 선택사항으로 변경 (승격 후 별도 설정 가능)
      // if (!regularMember.membershipType) {
      //   errors.membershipType = '회원권 종류는 필수입니다.';
      // }
      
      if (regularMember.membershipStart && regularMember.membershipEnd) {
        if (regularMember.membershipStart >= regularMember.membershipEnd) {
          errors.membershipPeriod = '회원권 종료일은 시작일보다 늦어야 합니다.';
        }
      }
    }

    // 상담 회원의 경우 상담 상태 검증
    if (member.memberType === 'consultation') {
      const consultationMember = member as Partial<ConsultationMember>;
      if (!consultationMember.consultationStatus) {
        warnings.consultationStatus = '상담 상태를 설정하는 것을 권장합니다.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings: Object.keys(warnings).length > 0 ? warnings : undefined,
    };
  }

  // 헬퍼 메서드들
  private static normalizeGender(gender?: string): Gender | undefined {
    if (!gender) return undefined;
    
    switch (gender.toLowerCase()) {
      case '남성':
      case '남':
      case 'male':
      case 'm':
        return '남';
      case '여성':
      case '여':
      case 'female':
      case 'f':
        return '여';
      default:
        return '기타';
    }
  }

  private static generatePromotionNote(
    consultationMember: ConsultationMember,
    conversionData: MemberConversionData
  ): string {
    const notes = [];
    
    notes.push(`[${getCurrentDateString()}] 상담회원에서 정식회원으로 승격`);
    
    if (consultationMember.consultationStatus) {
      notes.push(`- 상담 상태: ${consultationMember.consultationStatus}`);
    }
    
    if (consultationMember.healthConditions) {
      notes.push(`- 건강 상태: ${consultationMember.healthConditions}`);
    }
    
    if (consultationMember.fitnessGoals?.length) {
      notes.push(`- 운동 목표: ${consultationMember.fitnessGoals.join(', ')}`);
    }
    
    if (conversionData.notes) {
      notes.push(`- 승격 메모: ${conversionData.notes}`);
    }
    
    if (consultationMember.notes) {
      notes.push('');
      notes.push('[기존 노트]');
      notes.push(consultationMember.notes);
    }
    
    return notes.join('\n');
  }

  private static generateDemotionNote(
    regularMember: Member,
    reason?: string
  ): string {
    const notes = [];
    
    notes.push(`[${getCurrentDateString()}] 정식회원에서 상담회원으로 변경`);
    
    if (reason) {
      notes.push(`- 사유: ${reason}`);
    }
    
    if (regularMember.membershipType) {
      notes.push(`- 이전 회원권: ${regularMember.membershipType}`);
    }
    
    if (regularMember.notes) {
      notes.push('');
      notes.push('[기존 노트]');
      notes.push(regularMember.notes);
    }
    
    return notes.join('\n');
  }
} 