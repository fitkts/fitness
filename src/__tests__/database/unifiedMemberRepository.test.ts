// 통합 회원 Repository 테스트
// TDD 방식으로 데이터베이스 통합 레이어 검증

import { UnifiedMemberRepository } from '../../database/unifiedMemberRepository';
import { 
  UnifiedMember, 
  Member, 
  ConsultationMember,
  UnifiedMemberFilter,
  MemberConversionData 
} from '../../types/unifiedMember';

// Mock 데이터베이스 모듈들
jest.mock('../../database/memberRepository');
jest.mock('../../database/consultationRepository');
jest.mock('../../database/paymentRepository');
jest.mock('../../database/setup');

import * as memberRepository from '../../database/memberRepository';
import * as consultationRepository from '../../database/consultationRepository';
import * as paymentRepository from '../../database/paymentRepository';

describe('UnifiedMemberRepository', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 테스트용 데이터 생성
  const createMockRegularMember = () => ({
    id: 1,
    name: '김정식',
    phone: '010-1111-1111',
    email: 'regular@test.com',
    gender: '남성' as const,
    birthDate: '1990-01-01',
    joinDate: '2024-01-01',
    membershipType: '3개월권',
    membershipStart: '2024-01-01',
    membershipEnd: '2024-04-01',
    lastVisit: '2024-01-15',
    notes: '정식 회원',
    staffId: 1,
    staffName: '트레이너1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  });

  const createMockConsultationMember = () => ({
    id: 2,
    name: '이상담',
    phone: '010-2222-2222',
    email: 'consultation@test.com',
    gender: '여' as const,
    birth_date: Math.floor(new Date('1992-05-15').getTime() / 1000),
    join_date: Math.floor(new Date('2024-01-10').getTime() / 1000),
    first_visit: Math.floor(new Date('2024-01-10').getTime() / 1000),
    consultation_status: 'completed' as const,
    health_conditions: '건강함',
    fitness_goals: ['체중감량', '근력증진'],
    notes: '상담 완료',
    staff_id: 2,
    staff_name: '상담사1',
    is_promoted: false,
    created_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
    updated_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
  });

  describe('getAllMembers', () => {
    it('모든 회원(정식 + 상담)을 통합하여 조회해야 한다', async () => {
      // Given
      const mockRegularMembers = [createMockRegularMember()];
      const mockConsultationMembers = [createMockConsultationMember()];
      
      (memberRepository.getAllMembers as jest.Mock).mockResolvedValue(mockRegularMembers);
      (consultationRepository.getAllConsultationMembers as jest.Mock).mockReturnValue(mockConsultationMembers);

      // When
      const result = await UnifiedMemberRepository.getAllMembers();

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].memberType).toBe('regular');
      expect(result[1].memberType).toBe('consultation');
      expect(result[0].name).toBe('김정식');
      expect(result[1].name).toBe('이상담');
    });

    it('회원 타입 필터가 적용되어야 한다', async () => {
      // Given
      const mockRegularMembers = [createMockRegularMember()];
      const mockConsultationMembers = [createMockConsultationMember()];
      
      (memberRepository.getAllMembers as jest.Mock).mockResolvedValue(mockRegularMembers);
      (consultationRepository.getAllConsultationMembers as jest.Mock).mockReturnValue(mockConsultationMembers);

      const filter: UnifiedMemberFilter = { memberType: 'regular' };

      // When
      const result = await UnifiedMemberRepository.getAllMembers(filter);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].memberType).toBe('regular');
      expect(consultationRepository.getAllConsultationMembers).not.toHaveBeenCalled();
    });

    it('검색 필터가 올바르게 적용되어야 한다', async () => {
      // Given
      const mockRegularMembers = [
        createMockRegularMember(),
        { ...createMockRegularMember(), id: 3, name: '박다른' }
      ];
      
      (memberRepository.getAllMembers as jest.Mock).mockResolvedValue(mockRegularMembers);
      (consultationRepository.getAllConsultationMembers as jest.Mock).mockReturnValue([]);

      const filter: UnifiedMemberFilter = { search: '김정식' };

      // When
      const result = await UnifiedMemberRepository.getAllMembers(filter);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('김정식');
    });
  });

  describe('getMemberById', () => {
    it('정식 회원을 ID로 조회해야 한다', async () => {
      // Given
      const mockMember = createMockRegularMember();
      (memberRepository.getMemberById as jest.Mock).mockResolvedValue(mockMember);

      // When
      const result = await UnifiedMemberRepository.getMemberById(1, 'regular');

      // Then
      expect(result).not.toBeNull();
      expect(result?.memberType).toBe('regular');
      expect(result?.name).toBe('김정식');
      expect(memberRepository.getMemberById).toHaveBeenCalledWith(1);
    });

    it('상담 회원을 ID로 조회해야 한다', async () => {
      // Given
      const mockMember = createMockConsultationMember();
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(mockMember);

      // When
      const result = await UnifiedMemberRepository.getMemberById(2, 'consultation');

      // Then
      expect(result).not.toBeNull();
      expect(result?.memberType).toBe('consultation');
      expect(result?.name).toBe('이상담');
      expect(consultationRepository.getConsultationMemberById).toHaveBeenCalledWith(2);
    });

    it('타입 미지정 시 두 테이블 모두 검색해야 한다', async () => {
      // Given
      (memberRepository.getMemberById as jest.Mock).mockResolvedValue(null);
      const mockConsultationMember = createMockConsultationMember();
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(mockConsultationMember);

      // When
      const result = await UnifiedMemberRepository.getMemberById(2);

      // Then
      expect(result).not.toBeNull();
      expect(result?.memberType).toBe('consultation');
      expect(memberRepository.getMemberById).toHaveBeenCalledWith(2);
      expect(consultationRepository.getConsultationMemberById).toHaveBeenCalledWith(2);
    });

    it('존재하지 않는 회원은 null을 반환해야 한다', async () => {
      // Given
      (memberRepository.getMemberById as jest.Mock).mockResolvedValue(null);
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(null);

      // When
      const result = await UnifiedMemberRepository.getMemberById(999);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('promoteConsultationMember', () => {
    const mockTransaction = jest.fn();
    
    beforeEach(() => {
      const mockDb = { transaction: mockTransaction };
      require('../../database/setup').getDatabase = jest.fn().mockReturnValue(mockDb);
    });

    it('상담회원을 정식회원으로 승격해야 한다', async () => {
      // Given
      const consultationMember = createMockConsultationMember();
      const conversionData: MemberConversionData = {
        membershipType: '6개월권',
        membershipStart: '2024-02-01',
        membershipEnd: '2024-08-01',
        paymentAmount: 300000,
        paymentMethod: 'card',
        staffId: 1,
        staffName: '트레이너1'
      };

      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(consultationMember);
      (memberRepository.addMember as jest.Mock).mockResolvedValue(100);
      (paymentRepository.addPayment as jest.Mock).mockResolvedValue(200);
      (consultationRepository.updateConsultationMember as jest.Mock).mockReturnValue(true);

      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => callback());

      // When
      const result = await UnifiedMemberRepository.promoteConsultationMember(2, conversionData);

      // Then
      expect(result.success).toBe(true);
      expect(result.newMemberId).toBe(100);
      expect(memberRepository.addMember).toHaveBeenCalled();
      expect(paymentRepository.addPayment).toHaveBeenCalled();
      expect(consultationRepository.updateConsultationMember).toHaveBeenCalledWith(2, {
        is_promoted: 1,
        promoted_at: expect.any(Number),
        promoted_member_id: 100
      });
    });

    it('완료되지 않은 상담은 승격을 거부해야 한다', async () => {
      // Given
      const consultationMember = { 
        ...createMockConsultationMember(), 
        consultation_status: 'pending' as const 
      };
      
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(consultationMember);
      
      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => {
        try {
          return callback();
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      const conversionData: MemberConversionData = {
        membershipType: '6개월권',
        membershipStart: '2024-02-01',
        membershipEnd: '2024-08-01'
      };

      // When
      const result = await UnifiedMemberRepository.promoteConsultationMember(2, conversionData);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toContain('상담이 완료된 회원만 승격 가능합니다');
    });

    it('이미 승격된 회원은 재승격을 거부해야 한다', async () => {
      // Given
      const consultationMember = { 
        ...createMockConsultationMember(), 
        is_promoted: true 
      };
      
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(consultationMember);
      
      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => {
        try {
          return callback();
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      const conversionData: MemberConversionData = {
        membershipType: '6개월권'
      };

      // When
      const result = await UnifiedMemberRepository.promoteConsultationMember(2, conversionData);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toContain('이미 승격된 회원입니다');
    });

    it('존재하지 않는 상담회원은 오류를 반환해야 한다', async () => {
      // Given
      (consultationRepository.getConsultationMemberById as jest.Mock).mockReturnValue(null);
      
      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => {
        try {
          return callback();
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      const conversionData: MemberConversionData = {
        membershipType: '6개월권'
      };

      // When
      const result = await UnifiedMemberRepository.promoteConsultationMember(999, conversionData);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toContain('상담회원을 찾을 수 없습니다');
    });
  });

  describe('getUnifiedMemberStats', () => {
    it('통합 회원 통계를 올바르게 계산해야 한다', async () => {
      // Given
      const mockRegularMembers = [
        { ...createMockRegularMember(), membershipEnd: '2024-12-31' }, // active
        { ...createMockRegularMember(), id: 3, membershipEnd: '2023-12-31' }, // expired
      ];
      const mockConsultationMembers = [
        createMockConsultationMember(), // completed
        { ...createMockConsultationMember(), id: 4, consultation_status: 'pending' }, // pending
      ];

      (memberRepository.getAllMembers as jest.Mock).mockResolvedValue(mockRegularMembers);
      (consultationRepository.getAllConsultationMembers as jest.Mock).mockReturnValue(mockConsultationMembers);

      // When
      const result = await UnifiedMemberRepository.getUnifiedMemberStats();

      // Then
      expect(result.total).toBe(4);
      expect(result.regular.total).toBe(2);
      expect(result.consultation.total).toBe(2);
      expect(result.consultation.completed).toBe(1);
      expect(result.consultation.pending).toBe(1);
    });
  });

  describe('demoteRegularMember', () => {
    const mockTransaction = jest.fn();
    
    beforeEach(() => {
      const mockDb = { transaction: mockTransaction };
      require('../../database/setup').getDatabase = jest.fn().mockReturnValue(mockDb);
    });

    it('정식회원을 상담회원으로 강등해야 한다', async () => {
      // Given
      const regularMember = createMockRegularMember();
      const reason = '회원권 만료 후 재상담 희망';

      (memberRepository.getMemberById as jest.Mock).mockResolvedValue(regularMember);
      (consultationRepository.createConsultationMember as jest.Mock).mockReturnValue(300);
      (memberRepository.updateMember as jest.Mock).mockResolvedValue(true);

      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => callback());

      // When
      const result = await UnifiedMemberRepository.demoteRegularMember(1, reason);

      // Then
      expect(result.success).toBe(true);
      expect(result.newConsultationMemberId).toBe(300);
      expect(consultationRepository.createConsultationMember).toHaveBeenCalled();
    });

    it('존재하지 않는 정식회원은 오류를 반환해야 한다', async () => {
      // Given
      (memberRepository.getMemberById as jest.Mock).mockResolvedValue(null);
      
      // Mock transaction to execute callback immediately
      mockTransaction.mockImplementation((callback: Function) => {
        try {
          return callback();
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      // When
      const result = await UnifiedMemberRepository.demoteRegularMember(999, '테스트');

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toContain('정식회원을 찾을 수 없습니다');
    });
  });
}); 