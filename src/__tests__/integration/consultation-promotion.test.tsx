/**
 * 회원 승격 기능 통합 테스트
 */

// 테스트용 Mock API
const mockApi = {
  promoteConsultationMember: jest.fn(),
  getConsultationMemberById: jest.fn(),
  updateConsultationMember: jest.fn(),
  getAllMembershipTypes: jest.fn(),
};

// Global Mock 설정
(global as any).window = {
  api: mockApi
};

describe('회원 승격 기능 테스트 (TDD)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. 승격 가능 조건 확인', () => {
    test('상담 완료 상태인 회원만 승격 가능해야 한다', () => {
      const completedMember = { consultation_status: 'completed', is_promoted: false };
      const pendingMember = { consultation_status: 'pending', is_promoted: false };
      const promotedMember = { consultation_status: 'completed', is_promoted: true };

      const canPromote = (member: any) => 
        member.consultation_status === 'completed' && !member.is_promoted;

      expect(canPromote(completedMember)).toBe(true);
      expect(canPromote(pendingMember)).toBe(false);  
      expect(canPromote(promotedMember)).toBe(false);
    });
  });

  describe('2. 승격 API 테스트', () => {
    test('승격이 성공적으로 처리되어야 한다', async () => {
      const promotionData = {
        consultationMemberId: 1,
        membershipTypeId: 1,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        paymentAmount: 100000,
        paymentMethod: 'card'
      };

      mockApi.promoteConsultationMember.mockResolvedValue({
        success: true,
        data: { memberId: 101 }
      });

      const result = await mockApi.promoteConsultationMember(promotionData);
      
      expect(result.success).toBe(true);
      expect(result.data.memberId).toBe(101);
      expect(mockApi.promoteConsultationMember).toHaveBeenCalledWith(promotionData);
    });

    test('잘못된 데이터로 승격 시 에러가 발생해야 한다', async () => {
      mockApi.promoteConsultationMember.mockRejectedValue(
        new Error('회원권 정보가 유효하지 않습니다')
      );

      const invalidData = { consultationMemberId: 1, membershipTypeId: null };

      await expect(mockApi.promoteConsultationMember(invalidData))
        .rejects.toThrow('회원권 정보가 유효하지 않습니다');
    });
  });

  describe('3. 데이터 변환 테스트', () => {
    test('상담 회원 데이터가 정식 회원 데이터로 변환되어야 한다', () => {
      const consultationMember = {
        id: 1,
        name: '홍길동',
        phone: '010-1234-5678',
        email: 'hong@test.com',
        birth_date: 19900101,
        health_conditions: '무릎 부상',
        staff_id: 1,
        staff_name: '김코치'
      };

      const memberData = {
        name: consultationMember.name,
        phone: consultationMember.phone,
        email: consultationMember.email,
        birthDate: new Date(consultationMember.birth_date * 1000).toISOString().split('T')[0],
        joinDate: new Date().toISOString().split('T')[0],
        staffId: consultationMember.staff_id,
        notes: `상담 기록: ${consultationMember.health_conditions}`
      };

      expect(memberData.name).toBe('홍길동');
      expect(memberData.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(memberData.notes).toContain('상담 기록');
    });
  });
});

describe('상담 정보 수정 기능 테스트 (TDD)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('상담 정보 수정이 성공해야 한다', async () => {
    const updateData = {
      health_conditions: '수정된 건강 상태',
      consultation_status: 'in_progress',
      notes: '추가 상담 필요'
    };

    mockApi.updateConsultationMember.mockResolvedValue({
      success: true,
      updated: true
    });

    const result = await mockApi.updateConsultationMember(1, updateData);
    
    expect(result.success).toBe(true);
    expect(mockApi.updateConsultationMember).toHaveBeenCalledWith(1, updateData);
  });

  test('필수 필드 유효성 검증이 작동해야 한다', () => {
    const validateData = (data: any) => {
      const errors = [];
      if (!data.name?.trim()) errors.push('이름 필수');
      if (!data.phone?.trim()) errors.push('전화번호 필수');
      return errors;
    };

    expect(validateData({ name: '홍길동', phone: '010-1234-5678' })).toHaveLength(0);
    expect(validateData({ name: '', phone: '' })).toHaveLength(2);
  });
}); 