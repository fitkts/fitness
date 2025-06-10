import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationDetailModal from '../../components/consultation/ConsultationDetailModal';

// Mock API
const mockAPI = {
  getConsultationMemberById: jest.fn(),
  getAllMembershipTypes: jest.fn().mockResolvedValue({
    success: true,
    data: [
      { id: 1, name: '1개월 회원권', price: 100000, duration_months: 1 },
      { id: 2, name: '3개월 회원권', price: 280000, duration_months: 3 },
    ]
  }),
};

// @ts-ignore
global.window.api = mockAPI;

// Mock 회원 데이터
const completedMember = {
  id: 1,
  name: '김철수',
  phone: '010-1234-5678',
  email: 'test@example.com',
  gender: '남',
  birth_date: 946684800,
  first_visit: 1640995200,
  consultation_status: 'completed',
  staff_id: 1,
  staff_name: '트레이너김',
  notes: '상담 완료된 회원',
  health_conditions: '건강함',
  fitness_goals: '["체중감량", "근력증가"]',
  is_promoted: false,
  created_at: 1640995200,
  updated_at: 1640995200
};

const promotedMember = {
  ...completedMember,
  id: 2,
  name: '이영희',
  is_promoted: true,
  promoted_at: 1672531200,
  promoted_member_id: 100
};

const pendingMember = {
  ...completedMember,
  id: 3,
  name: '박지민',
  consultation_status: 'pending'
};

describe('ConsultationDetailModal 고급 기능', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    consultationMemberId: 1,
    onUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('상담 완료된 회원은 승격 버튼이 표시되어야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: completedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      // 디버깅을 위해 HTML 내용 출력
      console.log('HTML 내용:', document.body.innerHTML);
      expect(screen.getByText('상담 회원 상세 정보')).toBeInTheDocument();
    });

    // 승격 버튼 찾기
    await waitFor(() => {
      expect(screen.getByText('정식 회원 승격')).toBeInTheDocument();
    });
  });

  it('이미 승격된 회원은 승격 버튼이 표시되지 않아야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: promotedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('상담 회원 상세 정보')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
    });
  });

  it('상담 대기 중인 회원은 승격 버튼이 표시되지 않아야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: pendingMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('상담 회원 상세 정보')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
    });
  });

  it('모든 회원에게 정보 수정 버튼이 표시되어야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: completedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('정보 수정')).toBeInTheDocument();
    });
  });

  it('승격된 회원은 승격 정보가 표시되어야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: promotedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('승격 정보')).toBeInTheDocument();
      expect(screen.getByText('#100')).toBeInTheDocument();
      expect(screen.getByText('정식 회원으로 승격이 완료되었습니다.')).toBeInTheDocument();
    });
  });

  it('운동 목표가 태그 형태로 표시되어야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: completedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('체중감량')).toBeInTheDocument();
      expect(screen.getByText('근력증가')).toBeInTheDocument();
    });
  });

  it('상담 상태에 따른 적절한 배지가 표시되어야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: completedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      // 여러 "상담 완료" 텍스트가 있을 수 있으므로 getAllByText 사용
      const statusElements = screen.getAllByText('상담 완료');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  it('승격 버튼 클릭 시 승격 모달이 열려야 한다', async () => {
    mockAPI.getConsultationMemberById.mockResolvedValueOnce({
      success: true,
      data: completedMember
    });

    render(<ConsultationDetailModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('정식 회원 승격')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('정식 회원 승격'));

    // 승격 모달이 열리는지 확인 (PromotionModal의 헤더 텍스트 확인)
    await waitFor(() => {
      expect(screen.getByText('정식 회원 승격')).toBeInTheDocument();
      // PromotionModal이 열렸다면 모달 내부의 다른 텍스트도 확인
      expect(screen.getByText('상담 회원 정보')).toBeInTheDocument();
    });
  });
}); 