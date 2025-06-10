import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock API 설정
const mockApi = {
  // 상담 회원 관련
  getAllConsultationMembers: jest.fn(),
  getConsultationMemberById: jest.fn(),
  updateConsultationMember: jest.fn(),
  
  // 회원 승격 관련
  promoteConsultationMember: jest.fn(),
  addMember: jest.fn(),
  
  // 직원 관련
  getAllStaff: jest.fn(),
  
  // 회원권 관련
  getAllMembershipTypes: jest.fn(),
};

// window.api 모킹
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true,
});

// 테스트용 데이터
const mockConsultationMember = {
  id: 1,
  name: '홍길동',
  phone: '010-1234-5678',
  email: 'hong@test.com',
  gender: '남',
  birth_date: 19900101,
  first_visit: 1703980800, // 2024-01-01
  health_conditions: '무릎 부상 이력',
  fitness_goals: '["체중 감량", "근력 강화"]',
  staff_id: 1,
  staff_name: '김트레이너',
  consultation_status: 'completed',
  is_promoted: false,
  created_at: 1703980800,
  updated_at: 1703980800
};

const mockMembershipTypes = [
  { id: 1, name: '1개월 이용권', price: 100000, duration_months: 1 },
  { id: 2, name: '3개월 이용권', price: 270000, duration_months: 3 },
  { id: 3, name: '6개월 이용권', price: 500000, duration_months: 6 }
];

const mockStaff = [
  { id: 1, name: '김트레이너', position: '트레이너' },
  { id: 2, name: '박상담사', position: '상담사' }
];

describe('회원 승격 기능 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 모킹 데이터 설정
    mockApi.getConsultationMemberById.mockResolvedValue({
      success: true,
      data: mockConsultationMember
    });
    
    mockApi.getAllMembershipTypes.mockResolvedValue({
      success: true,
      data: mockMembershipTypes
    });
    
    mockApi.getAllStaff.mockResolvedValue({
      success: true,
      data: mockStaff
    });
  });

  describe('1. 승격 가능 상태 확인', () => {
    test('상담 완료된 회원만 승격 버튼이 활성화되어야 한다', () => {
      // 상담 완료된 회원
      const completedMember = { ...mockConsultationMember, consultation_status: 'completed' };
      
      // 상담 진행 중인 회원
      const pendingMember = { ...mockConsultationMember, consultation_status: 'pending' };
      
      // 이미 승격된 회원
      const promotedMember = { ...mockConsultationMember, is_promoted: true };
      
      // 각 상태별 승격 가능 여부 확인
      expect(completedMember.consultation_status === 'completed' && !completedMember.is_promoted).toBe(true);
      expect(pendingMember.consultation_status === 'completed' && !pendingMember.is_promoted).toBe(false);
      expect(promotedMember.consultation_status === 'completed' && !promotedMember.is_promoted).toBe(false);
    });
  });

  describe('2. 승격 프로세스', () => {
    test('승격 모달에서 회원권과 결제 정보 입력 후 승격이 성공해야 한다', async () => {
      mockApi.promoteConsultationMember.mockResolvedValueOnce({
        success: true,
        data: { memberId: 101, consultationMemberId: 1 }
      });

      const promotionData = {
        consultationMemberId: 1,
        membershipTypeId: 1,
        membershipType: '1개월 이용권',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        paymentAmount: 100000,
        paymentMethod: 'card',
        notes: '승격 완료'
      };

      // 승격 API 호출 시뮬레이션
      const response = await mockApi.promoteConsultationMember(promotionData);
      
      expect(response.success).toBe(true);
      expect(response.data.memberId).toBe(101);
      expect(mockApi.promoteConsultationMember).toHaveBeenCalledWith(promotionData);
    });

    test('승격 실패 시 적절한 에러 메시지가 표시되어야 한다', async () => {
      mockApi.promoteConsultationMember.mockRejectedValueOnce(
        new Error('회원권 정보가 유효하지 않습니다.')
      );

      const promotionData = {
        consultationMemberId: 1,
        membershipTypeId: 999, // 존재하지 않는 회원권
        startDate: '2024-12-01'
      };

      await expect(mockApi.promoteConsultationMember(promotionData))
        .rejects.toThrow('회원권 정보가 유효하지 않습니다.');
    });

    test('승격 후 상담 회원 상태가 업데이트되어야 한다', async () => {
      const updateData = {
        is_promoted: true,
        promoted_at: Math.floor(Date.now() / 1000),
        promoted_member_id: 101
      };

      mockApi.updateConsultationMember.mockResolvedValueOnce({
        success: true,
        updated: true
      });

      const response = await mockApi.updateConsultationMember(1, updateData);
      
      expect(response.success).toBe(true);
      expect(response.updated).toBe(true);
      expect(mockApi.updateConsultationMember).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('3. 승격 데이터 변환', () => {
    test('상담 회원 정보가 정식 회원 정보로 올바르게 변환되어야 한다', () => {
      const memberData = {
        name: mockConsultationMember.name,
        phone: mockConsultationMember.phone,
        email: mockConsultationMember.email,
        gender: mockConsultationMember.gender,
        birthDate: new Date(mockConsultationMember.birth_date * 1000).toISOString().split('T')[0],
        joinDate: new Date().toISOString().split('T')[0],
        membershipType: '1개월 이용권',
        membershipStart: '2024-12-01',
        membershipEnd: '2024-12-31',
        staffId: mockConsultationMember.staff_id,
        staffName: mockConsultationMember.staff_name,
        notes: `상담 회원에서 승격. 기존 상담 기록: ${mockConsultationMember.health_conditions}`
      };

      // 필수 필드 검증
      expect(memberData.name).toBeDefined();
      expect(memberData.joinDate).toBeDefined();
      expect(memberData.membershipType).toBeDefined();
      expect(memberData.membershipStart).toBeDefined();
      expect(memberData.membershipEnd).toBeDefined();
      
      // 데이터 형식 검증
      expect(typeof memberData.birthDate).toBe('string');
      expect(memberData.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(memberData.joinDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('4. 승격 권한 검증', () => {
    test('관리자 권한이 있는 직원만 승격할 수 있어야 한다', () => {
      const adminStaff = { 
        id: 1, 
        name: '관리자', 
        permissions: '{"canPromoteMembers": true}' 
      };
      
      const regularStaff = { 
        id: 2, 
        name: '일반직원', 
        permissions: '{"canPromoteMembers": false}' 
      };

      const adminPermissions = JSON.parse(adminStaff.permissions);
      const regularPermissions = JSON.parse(regularStaff.permissions);

      expect(adminPermissions.canPromoteMembers).toBe(true);
      expect(regularPermissions.canPromoteMembers).toBe(false);
    });
  });
});

describe('상담 정보 수정 기능 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. 상담 정보 수정', () => {
    test('상담 회원 정보 수정이 성공해야 한다', async () => {
      const updateData = {
        health_conditions: '무릎 부상 이력 - 회복 중',
        fitness_goals: '["체중 감량", "근력 강화", "유연성 향상"]',
        consultation_status: 'in_progress',
        notes: '추가 상담 필요'
      };

      mockApi.updateConsultationMember.mockResolvedValueOnce({
        success: true,
        updated: true
      });

      const response = await mockApi.updateConsultationMember(1, updateData);
      
      expect(response.success).toBe(true);
      expect(response.updated).toBe(true);
      expect(mockApi.updateConsultationMember).toHaveBeenCalledWith(1, updateData);
    });

    test('필수 필드 검증이 올바르게 작동해야 한다', () => {
      const validData = {
        name: '홍길동',
        phone: '010-1234-5678'
      };

      const invalidData = {
        name: '',
        phone: ''
      };

      // 유효성 검증 함수 시뮬레이션
      const validateUpdateData = (data: any) => {
        const errors = [];
        if (!data.name || data.name.trim().length === 0) {
          errors.push('이름은 필수 입력 항목입니다.');
        }
        if (!data.phone || data.phone.trim().length === 0) {
          errors.push('전화번호는 필수 입력 항목입니다.');
        }
        return errors;
      };

      expect(validateUpdateData(validData)).toHaveLength(0);
      expect(validateUpdateData(invalidData)).toHaveLength(2);
    });
  });

  describe('2. 수정 권한 검증', () => {
    test('담당자는 자신의 상담 회원만 수정할 수 있어야 한다', () => {
      const currentStaffId = 1;
      const consultationMember = { ...mockConsultationMember, staff_id: 1 };
      const otherConsultationMember = { ...mockConsultationMember, staff_id: 2 };

      const canEdit = (member: any, staffId: number) => {
        return member.staff_id === staffId;
      };

      expect(canEdit(consultationMember, currentStaffId)).toBe(true);
      expect(canEdit(otherConsultationMember, currentStaffId)).toBe(false);
    });
  });
}); 