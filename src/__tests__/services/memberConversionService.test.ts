// 회원 데이터 변환 서비스 테스트
// TDD 방식으로 회원 승격/강등 로직 검증

import { MemberConversionService } from '../../services/memberConversionService';
import { Member, ConsultationMember } from '../../types/unifiedMember';
import { Member as LegacyMember } from '../../models/types';
import { ConsultationMember as LegacyConsultationMember } from '../../types/consultation';
import { getCurrentDateString } from '../../utils/dateConverters';

describe('MemberConversionService', () => {
  // 테스트용 데이터 생성
  const createLegacyMember = (): LegacyMember => ({
    id: 1,
    name: '김철수',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남성',
    birthDate: '1990-01-01',
    joinDate: '2024-01-01',
    membershipType: '3개월권',
    membershipStart: '2024-01-01',
    membershipEnd: '2024-04-01',
    lastVisit: '2024-01-15',
    notes: '기존 회원 노트',
    staffId: 1,
    staffName: '담당자1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  });

  const createLegacyConsultationMember = (): LegacyConsultationMember => ({
    id: 2,
    name: '이영희',
    phone: '010-9876-5432',
    email: 'consultation@example.com',
    gender: '여',
    birth_date: Math.floor(new Date('1992-05-15').getTime() / 1000),
    join_date: Math.floor(new Date('2024-01-10').getTime() / 1000),
    first_visit: Math.floor(new Date('2024-01-10').getTime() / 1000),
    consultation_status: 'completed',
    health_conditions: '무릎 약함',
    fitness_goals: ['체중감량', '근력증진'],
    notes: '상담 노트',
    staff_id: 2,
    staff_name: '상담사1',
    is_promoted: false,
    created_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
    updated_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
  });

  describe('convertLegacyMemberToUnified', () => {
    it('기존 Member 타입을 새로운 통합 Member 타입으로 변환해야 한다', () => {
      // Given
      const legacyMember = createLegacyMember();

      // When
      const result = MemberConversionService.convertLegacyMemberToUnified(legacyMember);

      // Then
      expect(result.memberType).toBe('regular');
      expect(result.name).toBe(legacyMember.name);
      expect(result.phone).toBe(legacyMember.phone);
      expect(result.email).toBe(legacyMember.email);
      expect(result.gender).toBe('남'); // 정규화된 성별
      expect(result.membershipType).toBe(legacyMember.membershipType);
    });

    it('성별을 올바르게 정규화해야 한다', () => {
      // Given
      const legacyMember = { ...createLegacyMember(), gender: '여성' as const };

      // When
      const result = MemberConversionService.convertLegacyMemberToUnified(legacyMember);

      // Then
      expect(result.gender).toBe('여');
    });
  });

  describe('convertLegacyConsultationMemberToUnified', () => {
    it('기존 ConsultationMember 타입을 새로운 통합 ConsultationMember 타입으로 변환해야 한다', () => {
      // Given
      const legacyConsultationMember = createLegacyConsultationMember();

      // When
      const result = MemberConversionService.convertLegacyConsultationMemberToUnified(legacyConsultationMember);

      // Then
      expect(result.memberType).toBe('consultation');
      expect(result.name).toBe(legacyConsultationMember.name);
      expect(result.phone).toBe(legacyConsultationMember.phone);
      expect(result.consultationStatus).toBe('completed');
      expect(result.healthConditions).toBe('무릎 약함');
      expect(result.fitnessGoals).toEqual(['체중감량', '근력증진']);
    });

    it('Unix timestamp를 ISO 날짜 문자열로 변환해야 한다', () => {
      // Given
      const legacyConsultationMember = createLegacyConsultationMember();

      // When
      const result = MemberConversionService.convertLegacyConsultationMemberToUnified(legacyConsultationMember);

      // Then
      expect(result.birthDate).toBe('1992-05-15');
      expect(result.joinDate).toBe('2024-01-10');
      expect(result.firstVisit).toBe('2024-01-10');
    });
  });

  describe('promoteConsultationMemberToRegular', () => {
    it('상담회원을 정식회원으로 승격해야 한다', () => {
      // Given
      const consultationMember: ConsultationMember = {
        memberType: 'consultation',
        id: 1,
        name: '홍길동',
        phone: '010-1111-2222',
        email: 'hong@example.com',
        gender: '남',
        birthDate: '1985-03-20',
        joinDate: '2024-01-01',
        consultationStatus: 'completed',
        healthConditions: '건강함',
        fitnessGoals: ['근력증진'],
        notes: '상담 완료',
        staffId: 1,
        staffName: '트레이너1',
      };

      const conversionData = {
        membershipType: '6개월권',
        membershipStart: '2024-02-01',
        membershipEnd: '2024-08-01',
        paymentAmount: 300000,
        paymentMethod: 'card' as const,
        notes: '승격 완료',
      };

      // When
      const result = MemberConversionService.promoteConsultationMemberToRegular(
        consultationMember, 
        conversionData
      );

      // Then
      expect(result.memberType).toBe('regular');
      expect(result.name).toBe(consultationMember.name);
      expect(result.membershipType).toBe('6개월권');
      expect(result.membershipStart).toBe('2024-02-01');
      expect(result.membershipEnd).toBe('2024-08-01');
      expect(result.notes).toContain('상담회원에서 정식회원으로 승격');
      expect(result.notes).toContain('건강함');
      expect(result.notes).toContain('근력증진');
    });
  });

  describe('demoteRegularMemberToConsultation', () => {
    it('정식회원을 상담회원으로 강등해야 한다', () => {
      // Given
      const regularMember: Member = {
        memberType: 'regular',
        id: 1,
        name: '박민수',
        phone: '010-3333-4444',
        email: 'park@example.com',
        gender: '남',
        birthDate: '1988-07-12',
        joinDate: '2023-06-01',
        membershipType: '12개월권',
        membershipStart: '2023-06-01',
        membershipEnd: '2024-06-01',
        notes: '기존 회원',
        staffId: 2,
        staffName: '매니저1',
      };

      const reason = '회원권 만료 후 재상담 희망';

      // When
      const result = MemberConversionService.demoteRegularMemberToConsultation(
        regularMember, 
        reason
      );

      // Then
      expect(result.memberType).toBe('consultation');
      expect(result.name).toBe(regularMember.name);
      expect(result.consultationStatus).toBe('follow_up');
      expect(result.isPromoted).toBe(false);
      expect(result.notes).toContain('정식회원에서 상담회원으로 변경');
      expect(result.notes).toContain(reason);
      expect(result.notes).toContain('12개월권');
    });
  });

  describe('getMemberStatusInfo', () => {
    it('상담회원의 상태 정보를 올바르게 반환해야 한다', () => {
      // Given
      const consultationMember: ConsultationMember = {
        memberType: 'consultation',
        name: '테스트',
        phone: '010-0000-0000',
        joinDate: '2024-01-01',
        consultationStatus: 'completed',
        isPromoted: false,
      };

      // When
      const result = MemberConversionService.getMemberStatusInfo(consultationMember);

      // Then
      expect(result.status).toBe('consultation');
      expect(result.canBePromoted).toBe(true);
      expect(result.canBeDowngraded).toBe(false);
    });

    it('정식회원의 만료 상태를 올바르게 판단해야 한다', () => {
      // Given
      const expiredMember: Member = {
        memberType: 'regular',
        name: '만료회원',
        phone: '010-0000-0000',
        joinDate: '2023-01-01',
        membershipEnd: '2023-12-31', // 이미 만료됨
      };

      // When
      const result = MemberConversionService.getMemberStatusInfo(expiredMember);

      // Then
      expect(result.status).toBe('expired');
      expect(result.canBePromoted).toBe(false);
      expect(result.canBeDowngraded).toBe(true);
    });
  });

  describe('validateMemberData', () => {
    it('유효한 회원 데이터는 검증을 통과해야 한다', () => {
      // Given
      const validMember: Partial<Member> = {
        memberType: 'regular',
        name: '유효한회원',
        phone: '010-1234-5678',
        email: 'valid@example.com',
        membershipType: '3개월권',
      };

      // When
      const result = MemberConversionService.validateMemberData(validMember);

      // Then
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('필수 필드가 없으면 검증에 실패해야 한다', () => {
      // Given
      const invalidMember: Partial<Member> = {
        memberType: 'regular',
        // name과 phone이 없음
      };

      // When
      const result = MemberConversionService.validateMemberData(invalidMember);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('이름은 필수입니다.');
      expect(result.errors.phone).toBe('전화번호는 필수입니다.');
    });

    it('잘못된 이메일 형식은 검증에 실패해야 한다', () => {
      // Given
      const memberWithInvalidEmail: Partial<Member> = {
        memberType: 'regular',
        name: '테스트',
        phone: '010-1234-5678',
        email: 'invalid-email', // 잘못된 형식
      };

      // When
      const result = MemberConversionService.validateMemberData(memberWithInvalidEmail);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('올바른 이메일 형식을 입력해주세요.');
    });
  });
}); 