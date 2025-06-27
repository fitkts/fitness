import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromotionModal from '../../../components/consultation/PromotionModal';
import { ConsultationMember } from '../../../types/consultation';
import { ToastProvider } from '../../../contexts/ToastContext';

// Mock window.api
const mockApi = {
  promoteConsultationMember: jest.fn()
};

// window 객체 모킹
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
});

// Mock alert
global.alert = jest.fn();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

const mockConsultationMember: ConsultationMember = {
  id: 1,
  name: '테스트 회원',
  phone: '010-1234-5678',
  email: 'test@example.com',
  gender: '남',
  birth_date: Math.floor(new Date('1990-01-01').getTime() / 1000),
  join_date: Math.floor(new Date('2025-01-01').getTime() / 1000),
  first_visit: Math.floor(new Date('2025-01-01').getTime() / 1000),
  health_conditions: '양호',
  fitness_goals: ['체중감량', '근력강화'],
  staff_id: 1,
  staff_name: '테스트 트레이너',
  consultation_status: 'completed',
  notes: '상담 완료',
  is_promoted: false,
  created_at: Math.floor(new Date('2025-01-01').getTime() / 1000),
  updated_at: Math.floor(new Date('2025-01-01').getTime() / 1000)
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  consultationMember: mockConsultationMember,
  onSuccess: jest.fn()
};

describe('PromotionModal - 완전 간소화된 승격 기능', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.promoteConsultationMember.mockResolvedValue({
      success: true,
      data: { memberId: 1, consultationMemberId: 1 }
    });
  });

  it('모달이 닫혀있을 때는 렌더링되지 않아야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
  });

  it('consultationMember가 null일 때는 렌더링되지 않아야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} consultationMember={null} />
      </TestWrapper>
    );

    expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
  });

  it('기본 요소들이 올바르게 렌더링되어야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    // 모달 제목과 설명
    expect(screen.getByText('정식 회원 승격')).toBeInTheDocument();
    expect(screen.getByText('상담회원을 정식회원으로 승격합니다')).toBeInTheDocument();
    
    // 상담 회원 정보
    expect(screen.getByText('테스트 회원')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('테스트 트레이너')).toBeInTheDocument();
    expect(screen.getByText('양호')).toBeInTheDocument();
    
    // 승격 메모 섹션
    expect(screen.getByText('승격 메모')).toBeInTheDocument();
    expect(screen.getByText('메모 (선택사항)')).toBeInTheDocument();
    
    // 버튼들
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('✨ 정식 회원으로 승격')).toBeInTheDocument();
  });

  it('승격 버튼이 항상 활성화되어야 한다 (날짜 요구사항 제거)', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    expect(promotionButton).not.toBeDisabled();
  });

  it('승격 메모를 입력할 수 있어야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const notesTextarea = screen.getByPlaceholderText('승격 관련 메모사항을 입력하세요...');
    
    fireEvent.change(notesTextarea, { target: { value: '테스트 메모' } });
    
    expect(notesTextarea).toHaveValue('테스트 메모');
  });

  it('승격 처리가 성공적으로 수행되어야 한다', async () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    fireEvent.click(promotionButton);

    await waitFor(() => {
      expect(mockApi.promoteConsultationMember).toHaveBeenCalledWith({
        consultationMemberId: 1,
        notes: '상담회원에서 정식회원으로 승격'
      });
    });

    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining('테스트 회원님이 정식 회원으로 승격되었습니다!')
    );
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('승격 메모가 있을 때 올바르게 전달되어야 한다', async () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const notesTextarea = screen.getByPlaceholderText('승격 관련 메모사항을 입력하세요...');
    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    fireEvent.change(notesTextarea, { target: { value: '테스트 메모' } });
    fireEvent.click(promotionButton);

    await waitFor(() => {
      expect(mockApi.promoteConsultationMember).toHaveBeenCalledWith({
        consultationMemberId: 1,
        notes: '테스트 메모'
      });
    });
  });

  it('승격 실패 시 에러 메시지가 표시되어야 한다', async () => {
    mockApi.promoteConsultationMember.mockResolvedValue({
      success: false,
      error: '승격 실패 테스트'
    });

    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    fireEvent.click(promotionButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('승격 실패: 승격 실패 테스트');
    });
  });

  it('안내 메시지가 표시되어야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('승격 후 안내')).toBeInTheDocument();
    expect(screen.getByText(/기본 정보로 정식 회원 등록됩니다/)).toBeInTheDocument();
    expect(screen.getByText(/회원권 및 결제 정보는 결제 관리에서 별도로 등록해주세요/)).toBeInTheDocument();
    expect(screen.getByText(/승격된 회원은 상담 목록에서 제거됩니다/)).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 모달이 닫혀야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('취소');
    
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('회원 정보가 없을 때 적절한 기본값이 표시되어야 한다', () => {
    const memberWithMissingInfo = {
      ...mockConsultationMember,
      phone: undefined,
      email: undefined,
      health_conditions: undefined,
      fitness_goals: undefined,
      staff_name: undefined
    };

    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} consultationMember={memberWithMissingInfo} />
      </TestWrapper>
    );

    expect(screen.getByText('미등록')).toBeInTheDocument(); // phone
    expect(screen.getByText('정보 없음')).toBeInTheDocument(); // health_conditions
    expect(screen.getByText('미지정')).toBeInTheDocument(); // staff_name
  });

  it('로딩 상태에서 버튼이 비활성화되고 로딩 메시지가 표시되어야 한다', async () => {
    // API 응답을 지연시켜 로딩 상태 테스트
    mockApi.promoteConsultationMember.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    fireEvent.click(promotionButton);

    // 로딩 상태 확인
    expect(screen.getByText('승격 처리 중...')).toBeInTheDocument();
    expect(promotionButton).toBeDisabled();

    // 처리 완료 대기
    await waitFor(() => {
      expect(mockApi.promoteConsultationMember).toHaveBeenCalled();
    });
  });
}); 